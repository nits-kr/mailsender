<?php
include "include.php";
date_default_timezone_set('US/Eastern');
ini_set("memory_limit","-1");
$d=date('Y-m-d');
// print_r($_REQUEST);exit;
####################### Variables ###################################
$from_email1=trim($_REQUEST['from_email']);
$sub1 = trim($_REQUEST['sub']);
$sencode = trim($_REQUEST['sencode']);
$ofrom1 = trim($_REQUEST['from']);
$fmencode= trim($_REQUEST['fmencode']);
$mode = trim($_REQUEST['mode']);
$datafile = trim($_REQUEST['datafile']);
$msgid1 = trim($_REQUEST['msgid']);
$mailing_ip = trim($_REQUEST['mailing_ip']);
$emailtest = trim($_REQUEST['emails']);
$message_html1 = trim($_REQUEST['message_html']);
$message_plain1 = trim($_REQUEST['message_plain']);
$total_limit = trim($_REQUEST['total_limit']);
$send_limit = trim($_REQUEST['send_limit']);
$headers1 = trim($_REQUEST['headers']);
$offerId = trim($_REQUEST['offerId']);
$backend_page_test = __DIR__."/send_fsock.php";
$backend_page_bulk = __DIR__."/parallel_fsock.php";
$backend_directory = __DIR__;
$all_array = [];
$distict_array = [];
//Validating SMTP Detail
$lines = explode("\n",trim($mailing_ip));
foreach($lines as $line) {
    $lines = explode("|",trim($line));
    $all_array[] = $lines[0];
    $ip .= "'".$lines[0]."',";
}
$ip = rtrim($ip,",");
$smtp_cred_check = mysql_fetch_array(mysql_query("select group_concat(`mumara`.`assignedip`) from `svml`.`mumara` where `mumara`.`assignedip` in ($ip)"));
$fetched_array = explode(",",$smtp_cred_check[0]);
$distict_array = array_diff($all_array,$fetched_array);
if(!empty($distict_array)) {
    $return ="<pre>";
    foreach($distict_array as $notexistip) {
        $return .= "$notexistip <font color='red'> Not Exist </font><br>";
    }
    $return .= "</pre>";

    echo $return;
    exit;
}
####################################################################

########################### Validations  ###########################
$count_email = count(explode("\n",$emailtest));
if(!$mailing_ip){
    echo "<font color='red'>SMTP Details Missing..!</font>";
    exit;
}
if (trim($count_email) > 4) {
    echo "<font color='red'>Only 4 Test Id Allowed..!</font>";
    exit;
}
if (!$from_email1) {
    echo "<font color='red'>From Email Missing..!</font>";
    exit;
}
if (!$sub1) {
    echo "<font color='red'>Subject Line Missing..!</font>";
    exit;
}
if (!$ofrom1) {
    echo "<font color='red'>From Name Missing..!</font>";
    exit;
}
if ($mode == 'Bulk' && !$_REQUEST['datafile']) {
    echo "<font color='red'>Data File Missing..!</font>";
    exit;
}
if ($mode == 'Bulk' && !$total_limit) {
    echo "<font color='red'>Total Count Missing..!</font>";
    exit;
}
if ($mode == 'Bulk' && !$send_limit) {
    echo "<font color='red'>Sent Count Missing..!</font>";
    exit;
}
if (!$msgid1) {
    echo "<font color='red'>Message Id Missing..!</font>";
    exit;
}
####################################################################

########################### Subject/From Encoding ##################
switch ($sencode) {
    case 'ascii' : $sr=ascii2hex($sub1);$sub2 = "=?UTF-8?Q?".$sr."?=";break;
    case 'base64' : $sr=base64_encode($sub1);$sub2 = "=?UTF-8?B?".$sr."?=";break;
    default : $sub2 = $sub1;
}

switch ($fmencode) {
    case 'ascii' : $fr=ascii2hex($ofrom1);$ofrom2 = "=?UTF-8?Q?".$fr."?=";break;
    case 'base64' : $fr=ascii2hex($ofrom1);$ofrom2 = "=?UTF-8?Q?".$fr."?=";break;
    default : $ofrom2=$ofrom1;
}
####################################################################

########################### Base64 Variables #######################
$from_email = base64_encode($from_email1);
$sub = base64_encode($sub2);
$ofrom = base64_encode($ofrom2);
$message_html = base64_encode($message_html1);
$message_plain = base64_encode($message_plain1);
$msgid = base64_encode($msgid1);
$headers = base64_encode($headers1);
$offerIdenc =  base64_encode($offerId);
####################################################################

################# MAIN LOGIC  TO SAVE TEMPLATE #####################

//Creating Campaign.
$getAllCamp = createJsonArray();

//Insert into Table
$oneCampencoded = base64_encode($getAllCamp);
mysql_query("insert into `svml`.`ESP_admin_data_repository` (`body`) values ('$oneCampencoded')") or die ("Mysql Error". mysql_error());
$last_entry = mysql_insert_id($sql);
echo "<b>Link : </b>".$_SERVER['HTTP_REFERER']."?c=".$last_entry;

########################### Functions ##############################
function createJsonArray() {
    global $from_email, $sub, $ofrom, $message_html, $charen, $contend, $type, $message_plain, $charen_alt, $contend_alt, $msgid, $replyto, $xmailer, $mailing_ip, $send_limit, $headers, $sencode, $fmencode, $mode, $datafile, $total_limit, $send_limit, $emailtest, $offerIdenc;
    $j_array = array();

    //Adding Basic Variable
    $j_array['from_email'] = $from_email;
    $j_array['sub'] = $sub;
    $j_array['ofrom'] = $ofrom;
    $j_array['message_html'] = $message_html;
    $j_array['message_plain'] = $message_plain;
    $j_array['msgid'] = $msgid;
    $j_array['headers'] = $headers;
    $j_array['smtp'] = $mailing_ip;
    $j_array['sencode'] = $sencode;
    $j_array['fmencode'] = $fmencode;
    $j_array['mode'] = $mode;
    $j_array['datafile'] = $datafile;
    $j_array['total_limit'] = $total_limit;
    $j_array['send_limit'] = $send_limit;
    $j_array['emailtest'] = $emailtest;
    $j_array['offerIdenc'] = $offerIdenc;

    //Creatin Json
    $jsonData = json_encode($j_array);
    return $jsonData;
}
#####################################################################


function ascii2hex($ascii) {
  $hex = '';
  for ($i = 0; $i < strlen($ascii); $i++) {
    $byte = strtoupper(dechex(ord($ascii{$i})));
    $byte = "=".str_repeat('0', 2 - strlen($byte)).$byte;
    $hex.=$byte;
  }
  return $hex;
}
########################### Functions ##############################
mysql_close($sql);
?>
