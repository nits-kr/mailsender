<?php
date_default_timezone_set('US/Eastern');
include "/var/www/html/interface_new/include.php";
include "/var/www/html/interface_new/session.php";
include "/var/www/html/server_ip.php";
ini_set("memory_limit","1520M");
$d=date('Y-m-d');
$ip =trim($_SERVER['HTTP_HOST']);
$http=trim($_SERVER['HTTP_HOST']."/interface/index.php?tempp=");
$cred=explode("|",file_get_contents("http://$approval_server_ip/httppasword.php?ip=$ip"));
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
$mailer_id=trim($_SESSION['id']);
$datafile="/var/www/data/$data";
$inbp=trim($_REQUEST['inb']);
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
if(($sen_t=='manual')||($sen_t=='auto')) 
{

mysql_query("insert into svml.svml_sendgrid (`ip`,`mode`,`subject`,`from_val`,`emails`,`type`,`msg`,`limits`,`offer`,`data`,`domain`,`sleep_time`,`limit_to_send`,`mailer`,`textm`,`times`,`date`,`timestamp`,`server`,`bcc`,`mutidomains`,`status`,`sleep`,
`sencode`, `fencode` ,`charen` , `contend` ,`head`,`pwd`,`tempname`,`oid`,`stype`,`script`)
values  ('$ip_pair','$mode','$sub','$ofrom','$emailtest','$type','$msg','$limit','$ofrid','$data','$domain','$time_gap_to_send_val','$limit_to_send_val','$mailer','$textm','$times','$d',now(),'$ip','$msid','$users','0','$wait_time',
'$sencode','$fmencode','$charen','$contend','$mail_ch','$mail_per','$name','$inbp','$count','$mailer_id')");
//variable we can use server  ,script ,smode,stype,remarks
$iid=mysql_insert_id();
foreach($u as $line)
                  	{
						$toemails=base64_encode($emailtest);
                   $cmd="php /var/www/html/interface_new/maild_man_lu_swift.php $iid $toemails $line";
						$result = exec($cmd);
						echo $result."<br>";
						}
						echo "done";  
						}
}

################################# BULK SEND ##########################	
elseif($mode == "bulk")// Bulk mailing 
{
switch ($sen_t) {
case "manual":

if($limit>20) {
$message = "your sending mode is manual and your limit is more than 20 please change";
echo "<script type='text/javascript'>alert('$message');</script>";
exit;
	
	}
$a=mysql_fetch_array(mysql_query("select max(sno),status,reason from svml_sendgrid where `msg`like BINARY  '$msg' and status='1'"));   	
if($a['status'] == '1')
 {		
mysql_query("insert into svml.svml_sendgrid (`ip`,`mode`,`subject`,`from_val`,`emails`,`type`,`msg`,`limits`,`offer`,`data`,`domain`,`sleep_time`,`limit_to_send`,`mailer`,`textm`,`times`,`date`,`timestamp`,`server`,`bcc`,`mutidomains`,`status`,`sleep`,
`sencode`, `fencode` ,`charen` , `contend` ,`head`,`pwd`,`tempname`,`oid`,`stype`,`script`)
values  ('$ip_pair','$mode','$sub','$ofrom','$emailtest','$type','$msg','$limit','$ofrid','$data','$domain','$time_gap_to_send_val','$limit_to_send_val','$mailer','$textm','$times','$d',now(),'$ip','$msid','$users','1','$wait_time',
'$sencode','$fmencode','$charen','$contend','$mail_ch','$mail_per','$name','$inbp','$count','$mailer_id')");
//variable we can use server ,tempname ,script ,smode,stype,oid,remarks
$iid=mysql_insert_id();					  
$furl=$url.$iid;
mysql_query("update svml_sendgrid set in_link='$furl' where sno='$iid'");
     
						                $ipc=sizeof($u);
											$totallimit=$ipc*$limit;
                                   $tto=array();
											$start = count(file($datafile));
											$linesnew = file($datafile);
											$linenew = array_slice($linesnew,0,$totallimit);
											$del = array_slice($linesnew, $totallimit);
											$file = fopen($datafile, 'w');
											fwrite($file, implode('', $del));
											fclose($file);
											$chunks=array_chunk($linenew,$limit);
											
											for($i=0;$i<$ipc;$i++) 
											{
										   $linen=$u[$i];
											$ems=$chunks[$i];
											$ids = implode("",$ems);
											$idss=rtrim($ids,"\n");
											$toemails=base64_encode($idss);
											$cmd="php /var/www/html/interface_new/maild_man_lu_swift.php '$iid' '$toemails' '$linen' >> /var/www/html/interface_new/out/$ip_pair &";	
											exec($cmd);
											}
											sort($u);
											$unique = array_unique($u);
											 ################################# BULK SEND TO TEST IDS ##########################
											if($emailtest!='')
											 {
											 foreach($unique as $smtpip)
											{
											$toemails=base64_encode($emailtest);
											$cmd="php /var/www/html/interface_new/maild_man_lu_swift.php $iid $toemails $smtpip  >> /var/www/html/interface_new/out/$ip_pair &";
											exec($cmd);
											 } 
											 	}
											$end=count(file($datafile));
											$diff=$start-$end;
											echo "<br>No of ids in the file Before: <B>$start</B>  After: <B>$end</B> Difference is <b>$diff</b><br>";
													if($diff==0){echo "<blink> <b> Change the Mode of the File or Data file is finished </b></blink>";  
											  }
					
  }                        
     
     
     
     
    elseif($a['status'] == '2')
      {        
      echo "<font color='red'> Your Templete is Rejected Contact Offer's Team </font> <br>";
      
      }     
      
      
           
else {
mysql_query("insert into svml.svml_sendgrid (`ip`,`mode`,`subject`,`from_val`,`emails`,`type`,`msg`,`limits`,`offer`,`data`,`domain`,`sleep_time`,`limit_to_send`,`mailer`,`textm`,`times`,`date`,`timestamp`,`server`,`bcc`,`mutidomains`,`status`,`sleep`,
`sencode`, `fencode` ,`charen` , `contend` ,`head`,`pwd`,`tempname`,`oid`,`stype`,`script`)
values  ('$ip_pair','$mode','$sub','$ofrom','$emailtest','$type','$msg','$limit','$ofrid','$data','$domain','$time_gap_to_send_val','$limit_to_send_val','$mailer','$textm','$times','$d',now(),'$ip','$msid','$users','0','$wait_time',
'$sencode','$fmencode','$charen','$contend','$mail_ch','$mail_per','$name','$inbp','$count','$mailer_id')");
//variable we can use server ,tempname ,script ,smode,stype,oid,remarks
$iid=mysql_insert_id();
$furl=$url.$iid;
mysql_query("update svml_sendgrid set in_link='$furl' where sno='$iid'");
$status=0;
$data_creation="$ip'|'$ip_pair'|'$sub'|'$ofrom'|'$ofrid'|'$mailer'|'$data'|'$domain'|'$config'|'$msid'|'$status'|'$iid'|'http://$htuser:$htpasswd@".$ip."/offer_approval/show_info.php?id=".$iid;
$data_creation2=base64_encode($data_creation);
`echo $data_creation2 >> /var/www/html/offer_approval/approve_bulk_$d.txt`;
echo "<font size='3' color='red'>[".$iid."]</font><br>";
echo "<font color='orange'>Your Templete has been sent for approval wait for the approval..</font><br>";
		}	
break;



#################################bulk auto ###############################################
case "auto":

$a=mysql_fetch_array(mysql_query("select max(sno),status,reason from svml_sendgrid where `subject`like BINARY  '$sub' and `ip`like BINARY  '$ip_pair' and `from_val`like BINARY  '$ofrom' and `msg`like BINARY  '$msg' and `domain`like BINARY  '$domain' 
 and `bcc` like BINARY  '$msid' and `offer` like '$check[0]%' and `data` like '$df[0]%'"));
if(($a[status] == '1') || ($a[status] == '2'))
{
mysql_query("insert into svml.svml_sendgrid (`ip`,`mode`,`subject`,`from_val`,`emails`,`type`,`msg`,`limits`,`offer`,`data`,`domain`,`sleep_time`,`limit_to_send`,`mailer`,`textm`,`times`,`date`,`timestamp`,`server`,`bcc`,`mutidomains`,`status`,`sleep`,
`sencode`, `fencode` ,`charen` , `contend` ,`head`,`pwd`,`tempname`,`oid`,`stype`,`script`)
values  ('$ip_pair','$mode','$sub','$ofrom','$emailtest','$type','$msg','$limit','$ofrid','$data','$domain','$time_gap_to_send_val','$limit_to_send_val','$mailer','$textm','$times','$d',now(),'$ip','$msid','$users','$a[status]','$wait_time',
'$sencode','$fmencode','$charen','$contend','$mail_ch','$mail_per','$name','$inbp','$count','$mailer_id')");
//variable we can use server  ,script ,smode,stype,oid,remarks	    
      $status=0;     
      $iid=mysql_insert_id();
      $furl=$url.$iid;
     
      echo "<font size='3' color='red'>[".$iid."]</font><br>";
      if(($a[status] == '1')) 
      {    
       mysql_query("update svml_sendgrid set in_link='$furl' where sno='$iid'");    
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
mysql_query("insert into svml.svml_sendgrid (`ip`,`mode`,`subject`,`from_val`,`emails`,`type`,`msg`,`limits`,`offer`,`data`,`domain`,`sleep_time`,`limit_to_send`,`mailer`,`textm`,`times`,`date`,`timestamp`,`server`,`bcc`,`mutidomains`,`status`,`sleep`,
`sencode`, `fencode` ,`charen` , `contend` ,`head`,`pwd`,`tempname`,`oid`,`stype`,`script`)
values  ('$ip_pair','$mode','$sub','$ofrom','$emailtest','$type','$msg','$limit','$ofrid','$data','$domain','$time_gap_to_send_val','$limit_to_send_val','$mailer','$textm','$times','$d',now(),'$ip','$msid','$users','$a[status]','$wait_time',
'$sencode','$fmencode','$charen','$contend','$mail_ch','$mail_per','$name','$inbp','$count','$mailer_id')");
//variable we can use server  ,script ,smode,stype,oid,remarks	
					
					$iid=mysql_insert_id();
			
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
echo "To Run In Screen Use Below Command<br>cd /var/www/html/interface_new/<br>";
echo "php send_swift_lu.php ".$iid;
}  

break;

default:
echo "either select auto or manual sending type";
    
   }
   

}//bulk mode


mysql_close($link);
?>