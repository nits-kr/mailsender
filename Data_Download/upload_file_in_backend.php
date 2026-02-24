<?php
ini_set("memory_limit","-1");
include "include.php";
date_default_timezone_set("Asia/Kolkata");
$d = date("Y-m-d H:i:s");

$uploadedfilename = trim($argv[1]);
$Affliate = trim($argv[2]);

$sql = "LOAD DATA INFILE '$uploadedfilename'
        IGNORE INTO TABLE supp
        LINES TERMINATED BY '\n'
        (@md5, affliate, insert_on)
        SET md5 = TRIM(BOTH '\r' FROM @md5),
            affliate = '".$Affliate."',
            insert_on = now()";

if(mysql_query($sql))
{
    `rm -rf $uploadedfilename`;
    echo "Date : $d | Supp Data inserted Successfully For $Affliate<br>";
}
else
{
    echo "Date : $d | ".mysql_error()."<br>";
}
?>