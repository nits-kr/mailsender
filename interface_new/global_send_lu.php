<?php
date_default_timezone_set('US/Eastern');
include "/var/www/html/php_aws2/include.php";
include "/var/www/html/php_aws2/session.php";
ini_set("memory_limit","1520M");
$http=trim($_SERVER['HTTP_HOST']."/php_aws2/index.php?tempp=");
$d=date('Y-m-d');
$ip =trim($_SERVER['HTTP_HOST']);
$cred=explode("|",file_get_contents("http://aspserver2.info/httppasword.php?ip=$ip"));
$htuser=trim($cred[0]);
$htpasswd=trim($cred[1]);
$url=$http;
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
$config = $_REQUEST['config'];
$emailtest = $_REQUEST['emails'];
$emailcount=count(explode("\n",$emailtest));
//$mailer=$_SESSION['sno']." ".$_SESSION['lname'];
$textm = str_replace("'","''",$_REQUEST['textm']);
$name=$_REQUEST['name'];
$wait_time=$_REQUEST['wait'];
$datafile="/var/www/data/$data";
$sencode = trim($_REQUEST['sencode']);
$fmencode= trim($_REQUEST['fmencode']);
$charen= trim($_REQUEST['charen']);
$contend= trim($_REQUEST['contend']);

$config = trim($_REQUEST['config']);



$ofrid=trim($_REQUEST['offer']);
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

 #########################TEST SEND###################################
 if(($mode=='test') && ($emailcount > 4))
{
	   echo "<center>NOT ALLOWED TO SEND MAILS<br><font size='2' color='red'> ATLEAST 1 EMAIL'Ids AND ATMOST 4 EMAIL'Ids </font></center>";
	   exit;
}
 elseif(($mode=='test') && ($emailcount <= 4))
{
	    

mysql_query("insert into svml.svml_sendgrid (`ip`,`mode`,`subject`,`from_val`,`emails`,`type`,`msg`,`limits`,`offer`,`data`,`domain`,`head`,`sleep_time`,`limit_to_send`,`pwd`,`username`,`mailer`,`textm`,`times`,`script`,`smode`,`date`,`timestamp`,`stype`,`oid`,`server`,`bcc`,`mutidomains`,`remarks`,`status`,`sleep`,`sencode`, `fencode` ,`charen` , `contend` )
values 
('$ip_pair','$mode','$sub','$ofrom','$emails','$type','$msg','$limit','$ofrid','$data','$domain','$port','$time_gap_to_send_val','$limit_to_send_val','$pass','$usr','$mailer','$textm','$times','$script','$smode','$date',now(),'$stype','$oid','$server','$msid','$users','$config','0','$wait_time','$sencode','$fmencode','$charen','$contend')");
$iid=mysql_insert_id();
    $furl=$url.$iid;
    
    mysql_query("update svml_sendgrid set in_link='$furl' where sno='$iid'");
     
		foreach($u as $line)
		{
				$toemails=base64_encode($emailtest);
                                 //echo "php /var/www/html/php_aws2/maild_mumara_lu.php '$iid' '$toemails' '$line'";
				 $cmd="php /var/www/html/php_aws2/maild_mumara_lu.php $iid $toemails $line";	 
				$result = exec($cmd);
				echo $result."<br>";
		}
       echo "done"; 
       exit; 
 } 


 ################################# BULK SEND ##########################	
$check=explode("_", $ofrid);
$df=explode("_",$data);       
$a=mysql_fetch_array(mysql_query("select max(sno),status,reason from svml_sendgrid where `subject`like BINARY  '$sub' and `ip`like BINARY  '$ip_pair' and `from_val`like BINARY  '$ofrom' and `msg`like BINARY  '$msg' and `domain`like BINARY  '$domain' and `remarks`like BINARY  '$config' and `bcc` like BINARY  '$msid' and `offer` like '$check[0]%' and `data` like '$df[0]%'"));
//echo "select max(sno),status,reason from svml_sendgrid where `subject`='$sub' and `ip`='$ip_pair' and `from_val`='$ofrom' and `msg`='$msg' and `domain`='$domain' and `remarks`='$config' and `bcc`='$msid' and `offer` like BINARY  '$check[0]%' and `data` like BINARY  '$df[0]%'";
//print_r($a);exit;
//echo $a[status];exit;

if(($a[status] == '1') || ($a[status] == '2'))
{
	   //echo " previously present and status".$a[status]." inside 1 or 2";
		mysql_query("insert into svml.svml_sendgrid (`ip`,`mode`,`subject`,`from_val`,`emails`,`type`,`msg`,`limits`,`offer`,`data`,`domain`,`head`,`sleep_time`,`limit_to_send`,`pwd`,`username`,`mailer`,`tempname`,`textm`,`times`,`script`,`smode`,`date`,`timestamp`,`stype`,`oid`,`server`,`bcc`,`mutidomains`,`remarks`,`status`,`reason`,`sleep`,`sencode`, `fencode` ,`charen` , `contend` )
		values 
		('$ip_pair','$mode','$sub','$ofrom','$emails','$type','$msg','$limit','$ofrid','$data','$domain','$port','$time_gap_to_send_val','$limit_to_send_val','$pass','$usr','$mailer','$name','$textm','$times','$script','$smode','$date',now(),'$stype','$oid','$server','$msid','$users','$config','$a[status]','$a[reason]','$wait_time','$sencode','$fmencode','$charen','$contend')");
	    $status=0;     
      $iid=mysql_insert_id();
      $furl=$url.$iid;
      mysql_query("update svml_sendgrid set in_link='$furl' where sno='$iid'");
      echo "<font size='3' color='red'>[".$iid."]</font><br>";
      if(($a[status] == '1')) 
      {        
      echo "<font color='green'> Your Templete is approved You can run script </font> <br>";
      }  
      if(($a[status] == '2')) 
      {        
      echo "<font color='red'> Your Templete is Rejected Contact Offer's Team </font> <br>";
      }          
}

elseif($a[status] == '0')
{
	   echo "<font size='3' color='blue'> Your Templete is Already Sent for Approval With ID=</font><font size='3' color='red'>".$a[0]."</font>.<br>";
		echo "<font size='3' color='blue'>Kindly Wait or Contact Offer's Team.</font>";
		
}
else 
{
	   $s=mysql_query("select tempname from svml.svml_sendgrid where tempname='$name'");
		if($a=mysql_fetch_array($s))
		{
		echo "<font size='3' color='red'>$name Already Present, Please Choose Another Name.</font><br>";
		exit;
		}
		else 
		       {
	            //echo " previously not present and status".$a[status]." newdata";
					mysql_query("insert into svml.svml_sendgrid (`ip`,`mode`,`subject`,`from_val`,`emails`,`type`,`msg`,`limits`,`offer`,`data`,`domain`,`head`,`sleep_time`,`limit_to_send`,`pwd`,`username`,`mailer`,`tempname`,`textm`,`times`,`script`,`smode`,`date`,`timestamp`,`stype`,`oid`,`server`,`bcc`,`mutidomains`,`remarks`,`status`,`sleep`,`sencode`, `fencode` ,`charen` , `contend` )
					values 
					('$ip_pair','$mode','$sub','$ofrom','$emails','$type','$msg','$limit','$ofrid','$data','$domain','$port','$time_gap_to_send_val','$limit_to_send_val','$pass','$usr','$mailer','$name','$textm','$times','$script','$smode','$date',now(),'$stype','$oid','$server','$msid','$users','$config','0','$wait_time','$sencode','$fmencode','$charen','$contend')");
					$iid=mysql_insert_id();
					$furl=$url.$iid;
					mysql_query("update svml_sendgrid set in_link='$furl' where sno='$iid'");
					$status=0;
					$data_creation="$ip'|'$ip_pair'|'$sub'|'$ofrom'|'$ofrid'|'$mailer'|'$data'|'$domain'|'$config'|'$msid'|'$status'|'$iid'|'http://".$htuser.":".$htpasswd."@".$ip."/offer_approval/show_info.php?id=".$iid;
					$data_creation2=base64_encode($data_creation);
					`echo $data_creation2 >> /var/www/html/offer_approval/approve_bulk_$d.txt`;
					echo "<font size='3' color='red'>[".$iid."]</font><br>";
					echo "<b>Campaign saved</b><br>";
					echo "<font color='orange'>Your Templete has been sent for approval..</font><br>";
					}
}

 if(($mode == "bulk") && ($a[status] != '0'))// Bulk mailing 
{
    
    echo "To Run In Screen Use Below Command<br>cd /var/www/html/php_aws2/<br>";
    echo "php send_lu.php ".$iid;
  }                  
mysql_close($link);

?>
