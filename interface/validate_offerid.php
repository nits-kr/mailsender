<?php
date_default_timezone_set('US/Eastern');
include "/var/www/html/interface/include.php";
include "/var/www/html/interface/session.php";
include "/var/www/html/server_ip.php";
ini_set("memory_limit","1520M");
$d=date('Y-m-d');
$ip =trim($_SERVER['HTTP_HOST']);
$offer_id = trim($_GET['q']);
$arr=mysql_fetch_array(mysql_query("select * from `offer_module`.`all_links` where `own_offerid`='$offer_id'"));
$response = trim($arr['own_offerid']);
if($response == $offer_id)
echo "<img src='tick.png'/></img>";
else
echo "<img src='cross.png'/></img>";

?>
