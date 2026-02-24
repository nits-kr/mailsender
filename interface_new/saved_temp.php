<?php
include "/var/www/html/send_all2/include.php";
$tempp=trim($_REQUEST['selectedOption']);
$http=trim($_SERVER['HTTP_HOST']."/interface_new/header.php?tempp=$tempp");
header("Location: http://$http");
?>
