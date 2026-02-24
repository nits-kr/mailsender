<?php
date_default_timezone_set('US/Eastern');
include "/var/www/html/send_all/include.php";
include "/var/www/html/send_all/session.php";
ini_set("memory_limit","1520M");
$d=date('Y-m-d');
$ip =trim($_SERVER['HTTP_HOST']);
$http=trim($_SERVER['HTTP_HOST']."/send_all/index.php?tempp=");
$cred=explode("|",file_get_contents("http://aspserver2.info/httppasword.php?ip=$ip"));
$htuser=trim($cred[0]);
$htpasswd=trim($cred[1]);
$url=$http;
#######################variables###################################
$ip_pair=trim($_REQUEST['ip']);//fromemail
$mode = trim($_REQUEST['mode']);//mode
$sub = str_replace("'","''",$_REQUEST['sub']);
$sencode = trim($_REQUEST['sencode']);
$ofrom = str_replace("'","''",$_REQUEST['from']);
$fmencode= trim($_REQUEST['fmencode']);
$type = trim($_REQUEST['type']);
$sen_t=trim($_REQUEST['sen_t']);
$data = trim($_REQUEST['data']);
$limit = trim($_REQUEST['limit']);

$limit_to_send_val=trim($_REQUEST['ls']);
$ofrid=trim($_REQUEST['offer']);
$msid = trim($_REQUEST['msid']);
$domain = trim($_REQUEST['domain']);
$time_gap_to_send_val=trim($_REQUEST['sp']);
$times= trim($_REQUEST['times']);
$name=trim($_REQUEST['name']);
$mail_per=trim($_REQUEST['mail_per']);
$users=trim($_REQUEST['accs']);
$u=explode("\n",$users);
$emailtest = trim($_REQUEST['emails']);
$msg = str_replace("'","''",$_REQUEST['message']);
$textm = str_replace("'","''",$_REQUEST['textm']);
$mail_ch= trim($_REQUEST['mail_ch']);
$wait_time=$_REQUEST['wait'];
$charen= trim($_REQUEST['charen']);
$contend= trim($_REQUEST['contend']);
$mailer=$_SESSION['fname']." ".$_SESSION['lname'];
$inbp=trim($_REQUEST['inb']);
$tempspecif=trim($_REQUEST['tempspecif']);
$datafile="/var/www/data/$data";
$count=count($u);
if($ofrid=='') 
        {
                echo "Please insert you offerid";
                exit;
        }
if($domain=='') 
        {
                echo "Please insert Domain";
                exit;
        }    

$check=explode("_", $ofrid);
$df=explode("_",$data);  

###############################################test send#########################

if($mode=="test") {
	
	
}

################################# BULK SEND ##########################	
elseif($mode == "bulk")// Bulk mailing 
{
switch ($sen_t) {
case "manual":

echo "Please select auto mode mode";
break;


#################################bulk auto ###############################################
case "auto":

$a=mysql_fetch_array(mysql_query("select max(sno),status,reason from svml_sendgrid where `subject`like BINARY  '$sub' and `ip`like BINARY  '$ip_pair' and `from_val`like BINARY  '$ofrom' and `msg`like BINARY  '$msg' and `domain`like BINARY  '$domain' 
 and `bcc` like BINARY  '$msid' and `offer` like '$check[0]%' and `data` like '$df[0]%'"));
if(($a[status] == '0') || ($a[status] == ''))
{
$message = "your template is not approved";
echo "<script type='text/javascript'>alert('$message');</script>";


}
elseif($a[status] == '2')
{

$message = "your template is Disapproved";
echo "<script type='text/javascript'>alert('$message');</script>";
}
elseif($a[status] == '1')
{
mysql_query("insert into svml.svml_sendgrid (`ip`,`mode`,`subject`,`from_val`,`emails`,`type`,`msg`,`limits`,`offer`,`data`,`domain`,`sleep_time`,`limit_to_send`,`mailer`,`textm`,`times`,`date`,`timestamp`,`server`,`bcc`,`mutidomains`,`status`,`sleep`,
`sencode`, `fencode` ,`charen` , `contend` ,`head`,`pwd`,`tempname`,`oid`,`stype`)
values  ('$ip_pair','$mode','$sub','$ofrom','$emailtest','$type','$msg','$limit','$ofrid','$data','$domain','$time_gap_to_send_val','$limit_to_send_val','$mailer','$textm','$times','$d',now(),'$ip','$msid','$users','$a[status]','$wait_time',
'$sencode','$fmencode','$charen','$contend','$mail_ch','$mail_per','$name','$inbp','$count')");
//variable we can use server  ,script ,smode,remarks	    
      $status=0;     
      $iid=mysql_insert_id();
      $furl=$url.$iid;
      
foreach	 ($u as $line)
{	
$chunk = array_splice($in, 0, $dis_file);
$file=$data."_".rand(1,100000000);
$f = fopen("/var/www/data/$file", "w");
fputs($f, implode("", $chunk));
fclose($f);
chmod("/var/www/data/$file", 777); 
$wcf=count(file("/var/www/data/$file"));
exec($a);
mysql_query("insert into svml_ip_pool (svml_sendgrid_id,ip,status,temp1,temp2) values ('$iid','$line','Y','$file','$wcf')");
echo mysql_error();
}
/*echo "To Run In Screen Use Below Command<br>cd /var/www/html/send_all/<br>";
echo "php send_lu_new.php ".$iid; */

mysql_query("insert into multiple_temp (name,svml_sendgrid_id,status) values ('$tempspecif','$iid','1')");
echo mysql_error();
$sendd=mysql_insert_id();

echo "FOR SENDING WITH PHPMAILER USE";
echo "<br>";
echo "To Run In Screen Use Below Command<br>cd /var/www/html/send_all/<br>";
echo "php send_mul_phpm.php ".$sendd;

echo "<br>";
echo "<br>";
echo "<br>";

echo "FOR SENDING WITH SWIFTMAILER USE";
echo "<br>";
echo "To Run In Screen Use Below Command<br>cd /var/www/html/send_all/<br>";
echo "php send_mul_swfit.php ".$sendd; 


}  

break;

default:
echo "either select auto or manual sending type";
    
   }
   

}//bulk mode


mysql_close($link);
?>