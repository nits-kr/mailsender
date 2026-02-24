<?php
include "include.php";
$offerMasterId = trim($_REQUEST['offer']);
$newFilename = trim($_REQUEST['newfilename']);
$filename = trim($_REQUEST['filename']);

// Check Filename Present in Data Folder
if(!file_exists("/var/www/data/$filename")) {
    echo "<font color='red'>Error : </font>Provided Data File is not Present.";
    exit;
}

// Check New Filename is Unique in Data folder
if(file_exists("/var/www/data/$newFilename")) {
    echo "<font color='red'>Error : </font>Provided New Data File is Already Present. Choose Different Name..!";
    exit;
}

// Check Filename have email, MD5 data
$check = file_get_contents("/var/www/data/$filename");
$line_count = substr_count($check, "\n");
$md5_pattern = '/\b[A-Fa-f0-9]{32}\b/';
if (!preg_match($md5_pattern, $check)) {
    echo "<font color='red'>Error : </font>No MD5 encoded characters found in the file.";
    exit;
}

// Move File to "raw_uploaded_files" folder
$cmd = "cat /var/www/data/$filename | awk -F ',' '{print $2}' > /var/www/html/suppression/raw_uploaded_files/$filename";
$exec = exec($cmd, $output, $returnCode);
if ($returnCode !== 0) {
    echo "<font color='red'>Error : </font>While Creating & Moving File";
    exit;
}

// Fetching Vendor suppression filename
$vendor_supp_filename = mysql_fetch_array(mysql_query("SELECT `filename` FROM `suppression_v2`.`offer_supp_file_mapping` WHERE `offer_master_id` = '$offerMasterId'"));

$command = "php ".__DIR__."/supp.php $filename $vendor_supp_filename[0] $newFilename";

$query = "INSERT INTO `suppression_v2`.`offer_supp_queue` (`offer_master_id`,`filename`, `new_filename`, `vendor_supp_filename`, `command`, `log`, `initial_file_count`) 
VALUES ('$offerMasterId','$filename','$newFilename','$vendor_supp_filename[0]','$command','Queued Successfully','$line_count')";

if(mysql_query($query)) {
    echo "<font color='green'>Success..!!</font>";
} else {
    echo "<font color='red'>Error : </font>".mysql_error();
}
mysql_close($conn);




