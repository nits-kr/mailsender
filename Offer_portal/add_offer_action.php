<?php
include "include.php";
if($_REQUEST['update_id'] != '') {
    mysql_query("delete from `offer_module`.`offermaster` where `offermaster`.`sno` = $_REQUEST[update_id]");
}
$aff = trim($_REQUEST['aff']);
$offer_name = trim(str_replace("'","''",$_REQUEST['offer_name']));
$offer_id = trim($_REQUEST['offer_id']);
$payout = trim($_REQUEST['payout']);
$sub_url = trim($_REQUEST['sub_url']);
$unsub_url = trim($_REQUEST['unsub_url']);
$open_url = trim($_REQUEST['open_url']);
$opt_out_url = trim($_REQUEST['opt_out_url']);
$sensitive = trim($_REQUEST['sensitive']);
$from_name = trim(str_replace("'","''",$_REQUEST['from_name']));
$subject = trim(str_replace("'","''",$_REQUEST['subject']));
$restrictions = trim(str_replace("'","''",$_REQUEST['restrictions']));

$insert_query = mysql_query("insert into offermaster (`Affiliate`,`offer_name`,`offer_id`,`payout`,`sub_url`,`unsub_url`,`open_url`,`opt_out_url`,`sensitive`,`from_name`,`subject`,`restrictions`) 
                             values ('$aff','$offer_name','$offer_id','$payout','$sub_url','$unsub_url','$open_url','$opt_out_url','$sensitive','$from_name','$subject','$restrictions')");
if(mysql_affected_rows() == 1)
{
    echo "<font color=Green>Offer Added Successfully</font>";
}
else
{
    echo "<font color=red>Error :</font> Could Not Add ".mysql_error();
}

?>