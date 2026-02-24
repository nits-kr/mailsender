<?php
include "include.php";
$ipp = $_REQUEST["sno"];
mysql_query("delete from mumara  where sno ='".$ipp."'",$rds);
mysql_close($rds);
 header("Location: index.php");
die();
?>
