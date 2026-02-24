<?php
include "include.php";
$omid = trim($_REQUEST['omid']);
$vendor_file = mysql_fetch_array(mysql_query("SELECT `filename` FROM `suppression_v2`.`offer_supp_file_mapping` WHERE `offer_master_id` = '$omid'"));
if(mysql_query("DELETE FROM `suppression_v2`.`offer_supp_file_mapping` WHERE `offer_master_id` = '$omid'")) {
    `rm -rf /var/www/html/suppression/vendor_suppression_uploaded_files/$vendor_file[0]`;
    echo "Deleted";
} else {
    echo "ERROR : ".mysql_error();
}
mysql_close($conn);
?>