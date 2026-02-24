<?php
ini_set("memory_limit","-1");
include "include.php";
$filename_to_delete = $_REQUEST['filename'];
if($filename_to_delete == '')
{
    echo "Filename Needed..!";
    exit;
}
// Check Filename Present or not
$check = mysql_fetch_array(mysql_query("select filename as count from `emailmaster` where filename = '$filename_to_delete' limit 1"),MYSQL_ASSOC);
if($check == NULL)
{
    echo "Filename Not Present..! Please Change..!<br>";
    exit;
}
// Delete File Data
$sql = "DELETE FROM `emailmaster` WHERE filename = '$filename_to_delete'";
if (mysql_query($sql)) {
    echo "<font color=green>Data Deleted Successfully for $filename_to_delete..!</font><br>";
} else {
    mysql_error();
}

