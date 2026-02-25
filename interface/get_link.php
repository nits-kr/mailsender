<?php
date_default_timezone_set('US/Eastern');
include "/var/www/html/interface/include.php";
include "/var/www/html/interface/session.php";
ini_set("memory_limit","1520M");
$http=trim($_SERVER['HTTP_HOST']."/php_all/index.php?tempp=");
$d=date('Y-m-d');
$ip =trim($_SERVER['HTTP_HOST']);
//$cred=explode("|",file_get_contents("http://aspserver2.info/httppasword.php?ip=$ip"));
//$htuser=trim($cred[0]);
//$htpasswd=trim($cred[1]);
//print_r($cred);exit;
$users=$_REQUEST['accs'];
$msid = $_REQUEST['msid'];
$u=explode("\n",$users);
$mailer=trim($_SESSION['fname'])." ".trim($_SESSION['lname']);
################################# Offerid Validate ##########################
$limit_to_send_val=$_REQUEST['ls'];
$time_gap_to_send_val=$_REQUEST['sp'];
$sub = str_replace("'","''",$_REQUEST['sub']);
$ofrom = str_replace("'","''",$_REQUEST['from']);
$msg = trim(str_replace("'","''",$_REQUEST['message']));
$limit = $_REQUEST['limit'];
$emails = $_REQUEST['emails'];
$offer = $_REQUEST['offer'];
$userid = $_REQUEST['userid'];
$domain = $_REQUEST['domain'];
$type = $_REQUEST['type'];
$data = $_REQUEST['data'];
$mode = $_REQUEST['mode'];
$head= $_REQUEST['head'];
$server = $_REQUEST['server'];
$usr= $_REQUEST['usr'];
$pass= $_REQUEST['pass'];
$port = $_REQUEST['port'];
$tls= $_REQUEST['tls'];
$ip_pair=trim($_REQUEST['ip']);
$ofro= $_REQUEST['ip'];
$remarks = $_REQUEST['remarks'];
$emailtest = $_REQUEST['emails'];
$emailcount=count(explode("\n",$emailtest));
//$mailer=$_SESSION['sno']." ".$_SESSION['lname'];
$textm = str_replace("'","''",$_REQUEST['textm']);
$name=$_REQUEST['name'];
$wait_time=$_REQUEST['wait'];
$datafile="/var/www/data/$data";

 #########################TEST SEND###################################
 if($mode=='test') 
{
	 echo "Please change the mode to Bulk";
}
 else
{

/*echo "select in_link from svml_sendgrid where status='1' and 
 `subject`like BINARY '$sub' and 
 `ip` like BINARY  '$ip_pair' and 
 `from_val`like BINARY  '$ofrom' and 
 `msg`like BINARY  '$msg' and 
 `domain`like BINARY  '$domain' and 
 `remarks`like BINARY  '$remarks' and 
 `bcc` like BINARY  '$msid' and 
 `offer` like '$check[0]%' and 
 `data` like '$df[0]%' ";
*/
      
// Search for Campaign Link via API
$searchParams = array(
    'subject' => $sub,
    'ip' => $ip_pair,
    'domain' => $domain,
    'offer' => $offer
);

$res = fetchFromAPI("/campaign-link-search", "POST", $searchParams);

if(!empty($res['in_link'])) {
    echo $res['in_link'];
}

else {
	echo "Either your temp is disapproved / otherwise change the template /and send again for approval";
}
}
mysql_close($link);

?>
