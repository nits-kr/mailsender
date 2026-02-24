<?php
include "/var/www/html/send_all2/include.php";
$tempp=trim($_REQUEST['tempp']);
$http=trim($_SERVER['HTTP_HOST']."/interface/backendtest.php?tempp=$tempp");
header("Location: http://$http");
exit;
?>
