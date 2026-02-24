<?php
include "include.php";
$sno = trim($_REQUEST['sno']);
if(mysql_query("DELETE FROM `suppression_v2`.`offer_supp_queue` WHERE `sno` = '$sno'")) {
    echo "Deleted";
} else {
    echo "ERROR : ".mysql_error();
}
mysql_close($conn);
?>