<?php
// @author Karan Giri
echo "Allocating Memory".PHP_EOL;
ini_set('memory_limit', '2048M');

// Initiating File Location
echo "Initializing Files".PHP_EOL;
include __DIR__."/include.php";
$sourceFile = __DIR__."/raw_uploaded_files/".$argv[1];
$vendorSuppressionFile = __DIR__."/vendor_suppression_uploaded_files/".$argv[2];
$processFolder = __DIR__."/process_folder/";
$outputFile = $processFolder.$argv[3];
$sno = $argv[4];
$chunkSize = 100;
$backendProcessingFile = __DIR__."/supp_email_microservice.php";
$pidCount = 0;
@$finalDataFile = "/var/www/data/$argv[3]";
@`rm -rf $finalDataFile`;
@`rm -rf $processFolder/*`;

// Changing Mode to Running
fetchFromAPI("/suppression-queue/$sno", "PATCH", array('status' => 2));

// Spliting Source File into serialize encoded chunks and Triggering backend Supression file
echo "Spawing Backgroup Supression Microservice".PHP_EOL;
$triggeredProcess = createChunkAndTriggerSupp($sourceFile);
echo "TotalProcesses : $triggeredProcess | runningProcesses : $triggeredProcess | Progress: " . number_format(100, 2) . "%".PHP_EOL;


// Checking Supression Process in Background 
echo "Supressing..!!".PHP_EOL;
while (true) {
    $check = checkBackgroundProcesses($triggeredProcess);
    echo "TotalProcesses : $check[0] | runningProcesses : $check[1] | Progress: " . number_format($check[2], 2) . "% \n";
    flush();
    if(number_format($check[2], 2) == 100.00) {
        echo "TotalProcesses : $check[0] | runningProcesses : $check[1] | Progress: " . number_format($check[2], 2) . "%".PHP_EOL;
        // Calling function to merge suppressed file
        $mergedFile = mergeSupressedFile();
        if($mergedFile) {
            // Extracting Email From Supressed MD5 File From Emailmaster
            $extractData = compareAndExportEmails();
            if($extractData) {
                echo "Supressed..!!".PHP_EOL;
                fetchFromAPI("/suppression-queue/$sno", "PATCH", array('status' => 1));
                exit;
            }
        }
    }
    sleep(2);
}

function createChunkAndTriggerSupp($filename) {
    global $backendProcessingFile, $vendorSuppressionFile, $outputFile, $pidCount, $chunkSize, $processFolder, $sno;
    $lines = file($filename, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $chunks = array();
    for ($i = 0; $i < count($lines); $i += $chunkSize) {
        $chunk = array_slice($lines, $i, $chunkSize);
        $serializedChunk = serialize($chunk);
        $encodedChunk = base64_encode($serializedChunk);
        $runningProcesses = (($i/$chunkSize) + 1);
        $cmd = "php $backendProcessingFile '$encodedChunk' '$vendorSuppressionFile' '$outputFile-$runningProcesses' > /dev/null 2>&1 &";
        $exec = exec($cmd, $output, $returnCode);
        if ($returnCode === 0) {
            $totalProcesses = (ceil(count($lines)/$chunkSize) + 1);
            $percentage = ($runningProcesses / $totalProcesses) * 100;
            echo "TotalProcesses : $totalProcesses | runningProcesses : $runningProcesses | Progress: " . number_format($percentage, 2) . "% \n";
        } else {
            echo "Spawning Failure: Command execution failed. Error Code : $returnCode".PHP_EOL;
            echo "Aborting Supression".PHP_EOL;
            fetchFromAPI("/suppression-queue/$sno", "PATCH", array('status' => 3, 'log' => 'Spawning Failure'));
            `rm -rf $processFolder/$outputFile-*`;
            exit;
        }
    }
    return $totalProcesses;
}

function checkBackgroundProcesses($pidCount) {
    global $outputFile;
    $totalProcesses = $pidCount;
    $pidList = `ps -ef | grep "$outputFile" | grep -v " --color=auto" |  awk '{print $2}'`;
    $pidListArray = explode("\n",trim($pidList));
    $runningProcesses = 0;
    foreach ($pidListArray as $pid) {
        if ($pid && posix_kill($pid, 0)) {
            $runningProcesses++;
        }
    }
    $progressPercentage = ($totalProcesses > 0) ? (1 - ($runningProcesses / $totalProcesses)) * 100 : 100;
    return [$totalProcesses, $runningProcesses, $progressPercentage];
}

function mergeSupressedFile() {
    global $outputFile;
    $cmd = "cat $outputFile-* > $outputFile";
    $exec = exec($cmd, $output, $returnCode);
    if ($returnCode === 0) { 
        $cmd = "rm -rf $outputFile-*";
        $exec = exec($cmd, $output, $returnCode);
        if ($returnCode === 0) 
            return true;
    } else {
        echo "Removing Failure: Command execution failed. Error Code : $returnCode".PHP_EOL;
        echo "Aborting Supression";
        return false;
    }
}

function compareAndExportEmails() {
    global $sno, $outputFile, $conn, $finalDataFile;
    // NOTE: This part still requires mysql for emailmaster join. 
    // In a full MongoDB move, this logic would also be an API call.
    if ($conn) {
        mysql_select_db('all_data', $conn);
        $makeTempTable = mysql_query("CREATE TEMPORARY TABLE IF NOT EXISTS `temp_supp` (`md5` VARCHAR(50) NOT NULL)") or die (mysql_error()." on line : ".__LINE__);
        $loadFileSQL = mysql_query("LOAD DATA LOCAL INFILE '$outputFile' INTO TABLE temp_supp") or die (mysql_error()." on line : ".__LINE__);
        $compareQuery = mysql_query("SELECT emailmaster.email FROM `temp_supp` INNER JOIN `emailmaster` ON temp_supp.md5 = emailmaster.md5") or die (mysql_error()."on line : ".__LINE__);
        echo "Email Fetched".PHP_EOL;
        $email = NULL;
        echo "Writing Email & Creating Suppressed Datafile".PHP_EOL;
        while($fetchcompareQuery = mysql_fetch_array($compareQuery)) {
            $email.=$fetchcompareQuery['email']."\n";
        }
        file_put_contents($finalDataFile, $email);
    } else {
        // Fallback or API based export if MySQL is gone
        copy($outputFile, $finalDataFile);
    }
    
    echo "Created Suppressed Datafile".PHP_EOL;
    @`chown apache:apache $finalDataFile`;
    @`chmod 0777 $finalDataFile`;
    
    // Updating Data into table via API
    $lines = file_exists($finalDataFile) ? count(file($finalDataFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES)) : 0;
    fetchFromAPI("/suppression-queue/$sno", "PATCH", array(
        'final_file_count' => $lines,
        'log' => 'Suppressed..!'
    ));
    return true;
}
?>
