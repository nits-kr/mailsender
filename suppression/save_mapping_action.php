<?php
include "include.php";
$filename = htmlspecialchars(trim($_REQUEST['filename']));
$offerMasterId = htmlspecialchars(trim($_REQUEST['offer']));

$query = "INSERT INTO `suppression_v2`.`offer_supp_file_mapping` (`offer_master_id`,`filename`) VALUES ('$offerMasterId','$filename')";
if(mysql_query($query)) {
    echo "<font color='green'>Success..!!</font>";
} else {
    echo "<font color='red'>Error : </font>".mysql_error();
}
mysql_close($conn);
?>

