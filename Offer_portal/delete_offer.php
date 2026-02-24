<?php 
include "session.php";
include "include.php";
$id = $_REQUEST['id'];
$row = mysql_query("delete from `offer_module`.`offermaster` where `offermaster`.`sno` = $id");
mysql_close($conn);
header("Location:http://173.249.50.153/Offer_portal/all_offer_link_create.php");
?>