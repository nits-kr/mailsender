<?php
$back = $_SERVER['HTTP_REFERER'];
include "include.php";
$aff = $_REQUEST['aff'];
mysql_query("delete from `all_data`.`supp` where affliate='$aff'");
$affect = mysql_affected_rows();
header("Location:$back");
?>