<?php
ini_set("memory_limit","-1");
include "include.php";
$filename_to_upload = $argv[1];
$filename = $argv[2];
$mode = $argv[3];
$dir = __DIR__;

// Helper function to yield chunks of lines from a file
function getFileChunks($filepath, $chunkSize = 10000) {
    $handle = fopen($filepath, "r");
    if (!$handle) return;

    $chunk = [];
    while (($line = fgets($handle)) !== false) {
        $chunk[] = trim($line);
        if (count($chunk) === $chunkSize) {
            yield $chunk;
            $chunk = [];
        }
    }
    if (count($chunk) > 0) {
        yield $chunk;
    }
    fclose($handle);
}

if($mode == 'Desktop')
{
    // Get File Data
    $filepath = __DIR__."/uploads/".$filename;
    // Get total email count
    $final_email_count = 0;
    $handle = fopen($filepath, "r");
    if ($handle) {
        while (fgets($handle) !== false) {
            $final_email_count++;
        }
        fclose($handle);
    }
    $scn = 0;
    $email_count = 0;

    foreach (getFileChunks($filepath, 10000) as $data_array) {
        $scn = 0;
        foreach ($data_array as $email) {
            $email = trim($email);
            if ($email === '') continue;
            $md5 = md5($email);
            $check_email = mysql_query("select email from `emailmaster` where email = '$email' limit 1") or die (mysql_error());
            $check_data = mysql_num_rows($check_email);
            if($check_data > 0) {
                $sql = "update `emailmaster` set `filename` ='$filename_to_upload' where email ='$email'";
            } else {
                $sql = "insert ignore into `emailmaster` (`email`,`md5`,`filename`,`status`,`create_date`) values ('$email','$md5','$filename_to_upload','A',now())";
            }
            mysql_query($sql) or die (mysql_error());
            $scn++;
        }
        $email_count += count($data_array);
        if($scn == 10000) {
            // echo "Total $scn/$email_count Data inserted Successfully for $filename_to_upload.\n ";
            file_put_contents("$dir/data_upload_out.txt", "Total $email_count/$final_email_count Data inserted Successfully for $filename_to_upload.\n", FILE_APPEND);
        }
        else {
            // echo "Error : Total $scn/$email_count Data inserted Successfully for $filename_to_upload.\n";
            file_put_contents("$dir/data_upload_out.txt", "Error : Total $email_count/$final_email_count Data inserted Successfully for $filename_to_upload.\n", FILE_APPEND);
        }
        
    }

    // Delete File 
    `rm -rf $filename`;

    if($email_count == $final_email_count){
        // echo "FINAL Total $scn/$email_count Data inserted Successfully for $filename_to_upload.\n";
        file_put_contents("$dir/data_upload_out.txt", "FINAL Total $email_count/$final_email_count  Data inserted Successfully for $filename_to_upload.\n", FILE_APPEND);

    }
    
}
else
{
    $filename = "/var/www/data/".$filename;
    $sql = "LOAD DATA INFILE '$filename'
            IGNORE INTO TABLE emailmaster
            LINES TERMINATED BY '\n'
            (@email, md5, filename, status, create_date)
            SET email = TRIM(BOTH '\r' FROM @email),
                md5 = md5(email),
                filename = '".$filename_to_upload."',
                status = 'A',
                create_date = now()";

            if(mysql_query($sql))
            {
                echo "Data inserted Successfully for $filename_to_upload";
            }
            else
            {
                echo "Error : ".mysql_error();
            }

}

?>