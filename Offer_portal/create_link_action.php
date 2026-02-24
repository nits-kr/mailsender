<?php
include "session.php";
include "include.php";
$domain = trim($_REQUEST['domain']);
$type = trim($_REQUEST['type']);
$own_offer_id = trim($_REQUEST['own_offer_id']);
$pattern = trim($_REQUEST['pattern']);
$main_link = trim($_REQUEST['main_link']);
$unsub_link = trim($_REQUEST['unsub_link']);
$open_link = trim($_REQUEST['open_link']);
$status = trim($_REQUEST['status']);
$omid = trim($_REQUEST['omid']);
$mailer_id = trim($_REQUEST['mailer_id']);
if(!$mailer_id) {
    echo "<font color=red> Mailer not found..! Try again after refresh </font>";exit;
}
$mailer_email = trim($_REQUEST['mailer_email']);
if(!$mailer_email) {
    echo "<font color=red> Mailer not found..! Try again after refresh </font>";exit;
}
$mailer_name = trim($_REQUEST['mailer_name']);
if(!$mailer_name) {
    echo "<font color=red> Mailer not found..! Try again after refresh </font>";exit;
}
$generated_link = $domain.$pattern."/((_track_))";


switch($type)
{
    case "Subscribe" :
        $main_link = $main_link;
    break;
    case "Unsubscribe" :
        $main_link = $unsub_link;
    break;
    default :
        $main_link = $open_link;
}

$query = "insert into all_links (`offer_master_id`,`domain`,`link_type`,`own_offerid`,`pattern`,`main_link`,`Status`,`generated_link`,`sender`,`sender_email`,`sender_name`) 
          values ('$omid','$domain','$type','$own_offer_id','$pattern','$main_link','$status','$generated_link','$mailer_id','$mailer_email','$mailer_name')";

if(mysql_query($query))
{
    echo "YOUR <font color=blue>$type</font> LINK : <font color=green style='font-size: small;'> $generated_link </font>";
}
else
{
    echo "<font color=red>Error : </font>".mysql_error();
}


?>