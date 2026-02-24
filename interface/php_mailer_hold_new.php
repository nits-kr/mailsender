<?php
 //print_r($_REQUEST);exit;
date_default_timezone_set('EST');
include "/var/www/html/interface/include.php";
include "/var/www/html/interface/session.php";
include "/var/www/html/server_ip.php";
include "/var/www/html/interface/send_approval_test.php";
ini_set("memory_limit","1520M");
$d=date('Y-m-d');
$ip =trim($_SERVER['HTTP_HOST']);
$http=trim($_SERVER['HTTP_HOST']."/interface/index.php?tempp=");
$cred1 ='97';
$cred2= '199';
$cred3= '182';
$cred4= '217';
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
$sen_t='manual';//trim($_REQUEST['sen_t']);
$data = trim($_REQUEST['data']);
$limit = trim($_REQUEST['limit']);
$limit_to_send_val=trim($_REQUEST['ls']);
$ofrid=trim($_REQUEST['offer']);
$msid = trim($_REQUEST['msid']);
$domain = trim($_REQUEST['domain']);
$time_gap_to_send_val=trim($_REQUEST['sp']);
$times= "1";trim($_REQUEST['times']);
$name=trim($_REQUEST['name']);
$mail_per=trim($_REQUEST['mail_per']);
$users=trim($_REQUEST['accs']);
$u=explode("\n",$users);
$emailtest = trim($_REQUEST['emails']);
$msg = str_replace("'","''",$_REQUEST['message']);
$msg_enc = base64_encode($msg);
$textm = str_replace("'","''",$_REQUEST['textm']);
$textm_enc = base64_encode($textm);
$mail_ch= "100";//trim($_REQUEST['mail_ch']);
$wait_time=$_REQUEST['wait'];
$charen= trim($_REQUEST['charen']);
$contend= trim($_REQUEST['contend']);
$charen_alt= trim($_REQUEST['charen_alt']);
$contend_alt= trim($_REQUEST['contend_alt']);
$mailer=$_SESSION['fname']." ".$_SESSION['lname'];
$mailer_id=trim($_SESSION['id']);
$usermailer=$_SESSION['fname']." ".$_SESSION['lname'];
$inbp=trim($_REQUEST['inb']);
$pattern = trim($_REQUEST['inbpatt']);
$reply_to = trim($_REQUEST['replyto']);
$xmailer = trim($_REQUEST['xmailer']);
$header = trim($_REQUEST['headers']);
$headers = base64_encode($header);
$reasons = trim($_REQUEST['reason']);
$reason = base64_encode($reasons);
$fbl_choice = "0";//rim($_REQUEST['fbl']);
$retest =  "0";//trim($_REQUEST['retest']);
$retest_after =  "0";//trim($_REQUEST['retest_after']);
$datafile="/var/www/data/$data";
$count=count($u);
$res_choice=trim($_REQUEST['res_choice']);
$relayp="100";//trim($_REQUEST['relayp']);
/*if($emailtest=='')
        {
                echo "Please insert Test Email Id";
                exit;
        }
*/

// Check Datafile Count
if (count(file($datafile)) <= 1) {
        echo "Data File Finished..!";
        exit;
} else {
        $in_link = `head -1 $datafile | awk -F "@" '{print $2}'`; 
       
}

if($relayp=='') 
        {
                echo "Please insert relay percent";
                exit;
        } 

if(empty($mail_ch))
{
 echo "Please insert no of ips for testing inbox ratio";
 exit;

}


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

if($mode=="test") 
{
        

        if(($sen_t=='manual')||($sen_t=='auto')) 
        {
                mysql_query("insert into svml.svml_sendgrid (`ip`,`mode`,`subject`,`from_val`,`emails`,`type`,`msg`,`limits`,`offer`,`data`,`domain`,`sleep_time`,`limit_to_send`,`mailer`,`username`,`textm`,`times`,`date`,`timestamp`,`server`,`bcc`,`mutidomains`,`status`,`sleep`,
                `sencode`, `fencode` ,`charen` , `contend` ,`head`,`pwd`,`tempname`,`oid`,`stype`,`script`,`smode`,`relay_per`,`charen_alt`,`contend_alt`,`reply_to`,`xmailer`,`inbpatt`,`headers`,`reason`,`fbl`,`retest`,`retest_after`)
                values  ('$ip_pair','$mode','$sub','$ofrom','$emailtest','$type','$msg','$limit','$ofrid','$data','$domain','$time_gap_to_send_val','$limit_to_send_val','$mailer_id','$usermailer','$textm','$times','$d',now(),'$ip','$msid','$users','1','$wait_time',
                '$sencode','$fmencode','$charen','$contend','$mail_ch','$mail_per','$name','$inbp','$count','$mailer_id','$res_choice','$relayp','$charen_alt','$contend_alt','$reply_to','$xmailer','$pattern','$headers','$reason','$fbl_choice','$retest','$retest_after')") or die (mysql_error());
                //variable we can use smode,remarks
                echo $iid=mysql_insert_id();
                echo "<br>";

                foreach($u as $line)
                        {
                                $toemails=base64_encode($emailtest);
                                $cmd="php /var/www/html/interface/maild_man_lu_new.php '$iid' '$toemails' '$line'";
                                $result = exec($cmd);
                                echo $result."<br>";
                        }
                echo "done";  
        }
}

################################# BULK SEND ##########################
elseif($mode == "bulk")// Bulk mailing 
{
    switch ($sen_t) 
    {
        case "manual":
        if($limit>7000) 
        {
                $message = "your sending mode is manual and your limit is more than 20 please change";
                echo "<script type='text/javascript'>alert('$message');</script>";
                exit;
        }
      
        $karan = mysql_query("select sno,status,reason from svml_sendgrid where `msg`like BINARY  '$msg' order by sno desc limit 1") or die (mysql_error());
        $a=mysql_fetch_array($karan); 
        // print_r($a);  
        if($a['status'] == '1')
        {
                mysql_query("insert into svml.svml_sendgrid (`ip`,`mode`,`subject`,`from_val`,`emails`,`type`,`msg`,`limits`,`offer`,`data`,`domain`,`sleep_time`,`limit_to_send`,`mailer`,`username`,`textm`,`times`,`date`,`timestamp`,`server`,`bcc`,`mutidomains`,`status`,`sleep`,
                `sencode`, `fencode` ,`charen` , `contend` ,`head`,`pwd`,`tempname`,`oid`,`stype`,`script`,`smode`,`relay_per`,`charen_alt`,`contend_alt`,`reply_to`,`xmailer`,`inbpatt`,`headers`,`reason`,`fbl`,`retest`,`retest_after`)
                values  ('$ip_pair','$mode','$sub','$ofrom','$emailtest','$type','$msg','$limit','$ofrid','$data','$domain','$time_gap_to_send_val','$limit_to_send_val','$mailer_id','$usermailer','$textm','$times','$d',now(),'$ip','$msid','$users','1','$wait_time',
                '$sencode','$fmencode','$charen','$contend','$mail_ch','$mail_per','$name','$inbp','$count','$mailer_id','$res_choice','$relayp','$charen_alt','$contend_alt','$reply_to','$xmailer','$pattern','$headers','$reason','$fbl_choice','$retest','$retest_after')");

                mysql_error();
                //variable we can use server ,tempname ,script ,smode,remarks
                $iid=mysql_insert_id();                                   
                $furl=$url.$iid;
                mysql_query("update svml_sendgrid set in_link='$in_link' where sno='$iid'");
            
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
                        $cmd="php /var/www/html/interface/maild_man_lu_new.php '$iid'  '$toemails' '$linen' >> /var/www/html/interface/out/".$ip_pair."_".$d." &";
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
                                                $cmd="php /var/www/html/interface/maild_man_lu_new.php '$iid' '$toemails' '$smtpip'  >> /var/www/html/interface/out/".$ip_pair."_".$d." &";
                                                exec($cmd);
                                        } 
                        }
                $end=count(file($datafile));
                $diff=$start-$end;
                echo "<br>$iid<br>No of ids in the file Before: <B>$start</B>  After: <B>$end</B> Difference is <b>$diff</b><br>";
                if($diff==0){echo "<blink> <b> Change the Mode of the File or Data file is finished </b></blink>";}
        }                        
            
        elseif($a['status'] == '2')
        {        
            echo "<font color='red'> Your Templete is Rejected Contact Offer's Team </font> <br>";    
        }

        elseif($a['status'] == '0')
        {        
            echo "<font color='Blue'> Submit your Approval ID :  $a[sno]</font> <br>";    
        }     
                    
        else 
        {
                mysql_query("insert into svml.svml_sendgrid (`ip`,`mode`,`subject`,`from_val`,`emails`,`type`,`msg`,`limits`,`offer`,`data`,`domain`,`sleep_time`,`limit_to_send`,`mailer`,`username`,`textm`,`times`,`date`,`timestamp`,`server`,`bcc`,`mutidomains`,`status`,`sleep`,
                `sencode`, `fencode` ,`charen` , `contend` ,`head`,`pwd`,`tempname`,`oid`,`stype`,`script`,`smode`,`relay_per`,`charen_alt`,`contend_alt`,`reply_to`,`xmailer`,`inbpatt`,`headers`,`reason`,`fbl`,`retest`,`retest_after`)
                values  ('$ip_pair','$mode','$sub','$ofrom','$emailtest','$type','$msg','$limit','$ofrid','$data','$domain','$time_gap_to_send_val','$limit_to_send_val','$mailer_id','$usermailer','$textm','$times','$d',now(),'$ip','$msid','$users','0','$wait_time',
                '$sencode','$fmencode','$charen','$contend','$mail_ch','$mail_per','$name','$inbp','$count','$mailer_id','$res_choice','$relayp','$charen_alt','$contend_alt','$reply_to','$xmailer','$pattern','$headers','$reason','$fbl_choice','$retest','$retest_after')");
                //variable we can use server ,tempname ,script ,smode,remarks
                $iid=mysql_insert_id();
                $de=date('Y-m-d H:i:s');
                $status=1;
                // Send Test Email to Approval Id's
                echo sendApprovalEmail($iid, $u, $ip_pair);
                echo "<font color='Blue'> Submit your Approval ID :  $iid</font> <br>";    
                mysql_close($link);
        }
        break;

        #################################bulk auto ###############################################
        case "auto":
        $check_q = mysql_query("select sno,status,reason from svml_sendgrid where `subject`like BINARY  '$sub' and `ip`like BINARY  '$ip_pair' and `from_val`like BINARY  '$ofrom' and `msg`like BINARY  '$msg' and `domain` like BINARY  '$domain' and `bcc` like BINARY  '$msid' and `offer` like '$check[0]%' and `data` like '$df[0]%' and `limits` like BINARY '$limit' and `limit_to_send` like BINARY '$limit_to_send_val' and `sleep_time` like BINARY '$time_gap_to_send_val' and `sleep` like BINARY '$wait_time' and `mode` = 'bulk' order by sno desc limit 1 ") or die (mysql_error());
        $a=mysql_fetch_array($check_q);

        if($a["status"] == '1') 
        {    
            echo "<font color='green'> Your Templete is approved You can run script </font> <br>";
            echo "Svml Id : ".$a["sno"];

        }  
        elseif($a["status"] == '2')
        {        
            echo "<font color='red'> Your Templete is Rejected Contact Offer's Team </font> <br>";
            echo "Svml Id : ".$a["sno"];
        }          

        elseif($a["status"] == '0')
        {
            echo "<font size='3' color='blue'> Send for Approval With ID=</font><font size='3' color='red'>".$a[0]."</font>.<br>";
            echo "<font size='3' color='blue'>Kindly Wait or Contact Offer's Team.</font>";
        }

        elseif($a["status"]==NULL)
        {
                ################## check html match ###################
                $msg_q = mysql_query("select * from svml_sendgrid  where `msg` like BINARY  '$msg' and status = 1 order by sno desc limit 1");
                if($msg_row = mysql_fetch_array($msg_q))
                        {
                                mysql_query("insert into svml.svml_sendgrid (`ip`,`mode`,`subject`,`from_val`,`emails`,`type`,`msg`,`limits`,`offer`,`data`,`domain`,`sleep_time`,`limit_to_send`,`mailer`,`username`,`textm`,`times`,`date`,`timestamp`,`server`,`bcc`,`mutidomains`,`status`,`sleep`,`sencode`, `fencode` ,`charen` , `contend` ,`head`,`pwd`,`tempname`,`oid`,`stype`,`script`,`smode`,`relay_per`,`charen_alt`,`contend_alt`,`reply_to`,`xmailer`,`inbpatt`,`headers`,`reason`,`fbl`,`retest`,`retest_after`)
                                values  ('$ip_pair','$mode','$sub','$ofrom','$emailtest','$type','$msg','$limit','$ofrid','$data','$domain','$time_gap_to_send_val','$limit_to_send_val','$mailer_id','$usermailer','$textm','$times','$d',now(),'$ip','$msid','$users','1','$wait_time',
                                '$sencode','$fmencode','$charen','$contend','$mail_ch','$mail_per','$name','$inbp','$count','$mailer_id','$res_choice','$relayp','$charen_alt','$contend_alt','$reply_to','$xmailer','$pattern','$headers','$reason','$fbl_choice','$retest','$retest_after')");
                                //variable we can use smode,remarks
                                echo $iid=mysql_insert_id();
                                $whatchanged = array();

                                if($sub != $msg_row['subject'])
                                {
                                array_push($whatchanged, 'sub');
                                echo "Subject Line changed </br>";
                                }

                                if($ofrom != $msg_row['from_val'])
                                {
                                array_push($whatchanged, 'from_name');
                                echo "From Name changed</br>";
                                }
                        
                                if($ip_pair != $msg_row['ip'])
                                {
                                array_push($whatchanged, 'from_email');
                                echo "From Email changed</br>";
                                }
                        
                                if($msid != $msg_row['bcc'])
                                {
                                array_push($whatchanged, 'msgid');
                                echo "Msg id  changed</br>";
                                }

                                if($domain != $msg_row['domain'])
                                {
                                array_push($whatchanged, 'domain');
                                echo "Domain  changed</br>";
                                }
                                $wch = implode(",",$whatchanged);
                                $wch_sno = $wch."|".$msg_row[sno]."|".$msg_row[server]; 
                                $de=date('Y-m-d H:i:s');
                                $status=0;
                                mysql_close($link);
                        }
                        else
                        {
                        ###########################Insert Into Table#####################
                        mysql_query("insert into svml.svml_sendgrid (`ip`,`mode`,`subject`,`from_val`,`emails`,`type`,`msg`,`limits`,`offer`,`data`,`domain`,`sleep_time`,`limit_to_send`,`mailer`,`username`,`textm`,`times`,`date`,`timestamp`,`server`,`bcc`,`mutidomains`,`status`,`sleep`,
                        `sencode`, `fencode` ,`charen` , `contend` ,`head`,`pwd`,`tempname`,`oid`,`stype`,`script`,`smode`,`relay_per`,`charen_alt`,`contend_alt`,`reply_to`,`xmailer`,`inbpatt`,`headers`,`reason`,`fbl`,`retest`,`retest_after`)
                        values  ('$ip_pair','$mode','$sub','$ofrom','$emailtest','$type','$msg','$limit','$ofrid','$data','$domain','$time_gap_to_send_val','$limit_to_send_val','$mailer_id','$usermailer','$textm','$times','$d',now(),'$ip','$msid','$users','0','$wait_time',
                        '$sencode','$fmencode','$charen','$contend','$mail_ch','$mail_per','$name','$inbp','$count','$mailer_id','$res_choice','$relayp','$charen_alt','$contend_alt','$reply_to','$xmailer','$pattern','$headers','$reason','$fbl_choice','$retest','$retest_after')");
                        $iid=mysql_insert_id();
                        $de=date('Y-m-d H:i:s');
                        $status=0;
                        // Send Test Email to Approval Id's
                        echo sendApprovalEmail($iid, $u, $ip_pair);
                        echo "<font size='3' color='blue'> Send for Approval With ID=</font><font size='3' color='red'>".$iid."</font>.<br>";
                        echo "<font size='3' color='blue'>Kindly Wait or Contact Offer's Team.</font>";
                        mysql_close($link);
            }
        }

        $in = count(file($datafile));
        $dis_file=round($limit/$count);
        include "/var/www/html/interface/include.php";
        if(($mode == "bulk") && ($a[status] == '1'))// Bulk mailing 
                {
                        foreach  ($u as $line)
                        {
                                $ipcombo = explode("|",$line);
                                $onlyip = trim($ipcombo[0]); 
                                @$retpth = trim($ipcombo[1]); 
                                mysql_query("insert into svml_ip_pool (svml_sendgrid_id,ip,status,data,ip_send_limit,temp1,temp2) values ('$a[sno]','$onlyip','Y','$data','$dis_file','$in','$retpth')");
                                echo mysql_error();
                        }
                        echo "<br>To Run In Screen Use Below Command<br> <font color='red'>cd /var/www/html/interface/<br>";
                        echo "php send_mul_phpm_new.php ".$a['sno']; 
                        echo "</font>";
                }  
        break;
        default:
        echo "either select auto or manual sending type";
    }
}//bulk mode
mysql_close($link);
?>
