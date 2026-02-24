<?php
include "include.php";
$msid = $_REQUEST['msid'];
$limit_to_send_val=$_REQUEST['ls'];
$time_gap_to_send_val=$_REQUEST['sp'];
//include('smtpconfig.php');
$ip = $_REQUEST['ip'];
$mode = $_REQUEST['mode'];
$sub = str_replace("'","''",$_REQUEST['sub']);
$from = str_replace("'","''",$_REQUEST['from']);
$emails = $_REQUEST['emails'];
$type = $_REQUEST['type'];
$msg = str_replace("'","''",$_REQUEST['message']);
$limit = $_REQUEST['limit'];
$offer = $_REQUEST['offer'];
$data =  $_REQUEST['data'];
$domain = $_REQUEST['domain'];
$head= $_REQUEST['head'];
$user = $_REQUEST['user'];
$pwd = $_REQUEST['pass'];
$ot=$_REQUEST['ot'];
$ct=$_REQUEST['ct'];
$name=$_REQUEST['name'];
$textm=$_REQUEST['textm'];
$mailer = $u_id;
$serverh = $_REQUEST['server'];
$usr= $_REQUEST['usr'];
$pass= $_REQUEST['pass'];
$port = $_REQUEST['port'];
$tls= $_REQUEST['tls'];
$server = $_REQUEST['servert'];
$accs=$_REQUEST['accs'];
$remarks = $_REQUEST['remarks'];
//echo "insert into svml.svml_sendgrid (`ip`,`mode`,`subject`,`from_val`,`emails`,`type`,`msg`,`limits`,`offer`,`data`,`domain`,`head`,`sleep_time`,`limit_to_send`,`pwd`,`username`,`mailer`,`tempname`,`textm`,`times`,`script`,`smode`,`date`,`timestamp`,`stype`,`oid`,`server`,`bcc`)  values ('$ip','$mode','$sub','$from','$emails','$type','$msg','$limit','$offer','$data','$serverh','$port','$time_gap_to_send_val','$limit_to_send_val','$pass','$usr','$mailer','$name','$textm','$times','$script','$smode','$date',now(),'$stype','$oid','$server','$bcc')";
//echo $server;exit;
$s=mysql_query("select tempname from svml.svml_sendgrid where tempname='$name'");
if($a=mysql_fetch_array($s))
{
echo "$name already present, Please choose another.";
}
else
{
mysql_query("insert into svml.svml_sendgrid (`ip`,`mode`,`subject`,`from_val`,`emails`,`type`,`msg`,`limits`,`offer`,`data`,`domain`,`head`,`sleep_time`,`limit_to_send`,`pwd`,`username`,`mailer`,`tempname`,`textm`,`times`,`script`,`smode`,`date`,`timestamp`,`stype`,`oid`,`server`,`bcc`,`mutidomains`,`remarks`)  
values ('$ip','$mode','$sub','$from','$emails','$type','$msg','$limit','$offer','$data','$domain','$port','$time_gap_to_send_val','$limit_to_send_val','$pass','$usr','$mailer','$name','$textm','$times','$script','$smode','$date',now(),'$stype','$oid','$server','$msid','$accs','$remarks')");

/*echo "insert into svml.svml_sendgrid (`ip`,`mode`,`subject`,`from_val`,`emails`,`type`,`msg`,`limits`,`offer`,`data`,`domain`,`head`,`sleep_time`,`limit_to_send`,`pwd`,`username`,`mailer`,`tempname`,`textm`,`times`,`script`,`smode`,`date`,`timestamp`,`stype`,`oid`,`server`,`bcc`,`mutidomains`,`remarks`)  
values ('$ip','$mode','$sub','$from','$emails','$type','$msg','$limit','$offer','$data','$domain','$port','$time_gap_to_send_val','$limit_to_send_val','$pass','$usr','$mailer','$name','$textm','$times','$script','$smode','$date',now(),'$stype','$oid','$server','$msid','$accs','$remarks')";
exit;*/
echo "Campaign Save Donee!!!<br>";
//echo "<font size='3'  color='red'>Script ID :[".mysql_insert_id()."]</font>";
mysql_close($link);
 }

?>