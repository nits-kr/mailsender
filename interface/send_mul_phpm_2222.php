<?php
ini_set("memory_limit","1520M");
include "/var/www/html/interface/include.php";
include "/var/www/html/server_ip.php";
$iid2=$argv[1];
$script_name_id=$iid2;
$script_svml_ids=mysql_fetch_array(mysql_query("select  GROUP_CONCAT(svml_sendgrid_sno SEPARATOR ',') as script_svml_ips from mul_temp where script_name='$iid2' and status='0' "));
$script_svml_ids2=trim($script_svml_ids['script_svml_ips']);
$initial_svml_ips=trim(str_replace(',',"','",$script_svml_ids2));
$initial_svml_ips_final="'".$initial_svml_ips."'";
adi:
$mul_temp=mysql_fetch_array(mysql_query("select * from mul_temp where script_name='$iid2' and status='0' order by sno asc limit 1"));
$iid=trim($mul_temp['svml_sendgrid_sno']);
$m_id2=mysql_fetch_array(mysql_query("select script from svml_sendgrid  where sno='$iid'"));
$m_id=trim($m_id2['0']);
$ip_a2=trim($mul_temp['temp1']);
if(empty($iid))
{
echo "template over";
mysql_query("insert into screen_status (svml_id,isdata,output) values ('$script_name_id','0','template over')");
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "http://$approval_server_ip/auto_script/ASP_bot_tl_notify_http.php?sno=$iid2&ip=$ip_a2&empid=$m_id&reason=Script_STOPPED");
curl_setopt($ch, CURLOPT_HEADER, 0);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$result=curl_exec($ch) ;
curl_close($ch);                                   
exit;
}
stemp:
unset($arr);
$arr=mysql_fetch_array(mysql_query("select * from svml_sendgrid where sno='$iid'"));
unset($arr2);
$arr2=mysql_fetch_array(mysql_query("select count(1) from svml_ip_pool where svml_sendgrid_id ='$iid' and status in ('Y')"));
$users=$arr['mutidomains'];
$uu=explode("\n",$users);
$unique = array_unique($uu);
$emails =$arr['emails'];
$sub =  str_replace("''","'",$arr['subject']);
$ofrom =  str_replace("''","'",$arr['from_val']);
$msg =  str_replace("''","'",$arr['msg']);
$offer = $arr['offer'];
$userid = $arr['username'];
$domain = $arr['domain'];
$type = $arr['type'];
$data = $arr['data'];
$mode = 'test';
$send_mails= trim($arr['head']);
$ip_pair=trim($arr['ip']);
$msid =$arr['bcc'];
$datafile="/var/www/data/$data";
$limit=$arr['limit_to_send'];
$ip_add=$arr['server'];
$mailer_id=$arr['script'];
$sleep=$arr['sleep_time'];
$total = $arr['limits'];
$status=$arr['status'];
$wait_time=$arr['sleep'];
$intial_ip_count=trim($arr['stype']);
if($status==0) 
{
               echo "Your Templete Is Being To Check..\n";
               mysql_query("insert into screen_status (svml_id,isdata,output) values ('$script_name_id','0','Your Templete Is Being To Check.')");
               exit;
}
if($status==2) 
{
               echo "Your Templete Is Rejected..\n";
               mysql_query("insert into screen_status (svml_id,isdata,output) values ('$script_name_id','0','Your Templete Is Rejected.')");
               exit;
}

$count=0;
$send=0;
$testcount=0;
$totallimit=0;
$send_first_time=1;
echo "first time".$t1=mytestcount($iid);
mysql_query("insert into screen_status (svml_id,isdata,output) values ('$script_name_id','0','first time ".$t1."')");
echo "\n";
#########################################################################################################
while($count < $total)
{
$c = $total - $count;
if ($c < $limit)
$limit = $c;
unset($u);
$u=array();
unset($final_ip_count);
$ipss=mysql_query("select * from svml_ip_pool where svml_sendgrid_id='$iid' and status='Y'");
while($rrow=mysql_fetch_array($ipss))
 {
$u[].=trim($rrow['ip']);
 }
$final_ip_count=count($u);
if($final_ip_count=='0')
  {
$curent_ip=mysql_fetch_array(mysql_query("select  count(IF(status='D', 1, NULL)) 'DONE', count(IF(status in ('N','S'), 1, NULL)) 'SPAM', count(IF(status='H', 1, NULL)) 'HOLD' , count(1) as total FROM svml_ip_pool where svml_sendgrid_id='$iid'"));
if($curent_ip['2']==$curent_ip['3']) {   
goto add;     
        }

else {
echo "\n";
echo "LIMIT REACHED IP COUNT :  ".$curent_ip['0'] ."  SPAM IP COUNT :  ".$curent_ip['1']."  HOLD IP COUNT :  ".$curent_ip['2'];
$str="LIMIT REACHED IP COUNT :  ".$curent_ip['0'] ."  SPAM IP COUNT :  ".$curent_ip['1']."  HOLD IP COUNT :  ".$curent_ip['2'];
mysql_query("insert into screen_status (svml_id,isdata,output) values ('$script_name_id','0','$str')");

echo "\n";
echo "changing template";
mysql_query("insert into screen_status (svml_id,isdata,output) values ('$script_name_id','0','changing template')");

mysql_query("update mul_temp set status='1' where svml_sendgrid_sno='$iid' and script_name='$iid2'");
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "http://$approval_server_ip/auto_script/ASP_bot_tl_notify_http.php?sno=$iid&ip=$ip_add&empid=$mailer_id&reason=Template_changed");
curl_setopt($ch, CURLOPT_HEADER, 0);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$result=curl_exec($ch) ;
curl_close($ch);         
goto adi;                         
}
      }
#########################################################################################################
unset($send_ip_count);
$arr3=mysql_fetch_array(mysql_query("select count(1) from svml_ip_pool where svml_sendgrid_id ='$iid' and status in ('Y')"));




$send_ip_count=$arr3['0'];
echo "\n";
echo "initial ip count".$intial_ip_count;
mysql_query("insert into screen_status (svml_id,isdata,output) values ('$script_name_id','0','initial ip count ".$intial_ip_count."')");

echo "\n";
echo "send ip count".$send_ip_count;
mysql_query("insert into screen_status (svml_id,isdata,output) values ('$script_name_id','0','send ip count ".$send_ip_count."')");


if(($intial_ip_count>$send_ip_count)||($intial_ip_count<$send_ip_count )) {
mysql_query("update svml_sendgrid set stype='$send_ip_count' where sno='$iid'");
$intial_ip_count=$send_ip_count;
unset($sip);
$sip=array();
$spam_ip=mysql_query("select * from svml_ip_pool where svml_sendgrid_id='$iid' and status='N'");
while($row2=mysql_fetch_array($spam_ip)) { 
$sip[].=trim($row2['ip']);
 }
if(!empty($sip)) {
$spamips=count($sip);
 for($i=0;$i<$spamips; $i++) {
mysql_query("update svml_ip_pool set status='S' where svml_sendgrid_id='$iid' and ip='$sip[$i]'");
        }
                        }
$total_mail_left=mysql_fetch_array(mysql_query("select sum(ip_send_limit-ip_mail_sent) from svml_ip_pool where status in ('Y','H') and svml_sendgrid_id='$iid'"));              
$upd_svml_table=$total_mail_left['0'];
//mysql_query("update svml_sendgrid set limits='$upd_svml_table' where sno='$iid'");
mysql_query("update svml_sendgrid set limits='$upd_svml_table' sno in ( $initial_svml_ips_final )");
//mysql_query("update svml_sendgrid set limits='$upd_svml_table' where sno='$iid'");

echo "\n";
echo "test count no is".$t1=mytestcount($iid);
mysql_query("insert into screen_status (svml_id,isdata,output) values ('$script_name_id','0','test count no is ".$t1."')");

echo "\n";
$testcount=$t1;
$totallimit=0;
sleep(2);
        }
#########################################################################################################
echo "count".$testcount."and value of totallimit is ".$totallimit;
$karan = "count".$testcount."and value of totallimit is ".$totallimit;
mysql_query("insert into screen_status (svml_id,isdata,output) values ('$script_name_id','0','".$karan."')");

if(($testcount==$totallimit)||($send_first_time=='1'))                                                                   
 {
$send=1;
$testcount=$testcount+$t1;
unset($send_first_time);
}
if($send=='1')
{
add:

$inb_ip=mysql_query("select ip from svml_ip_pool where svml_sendgrid_id='$iid' and status in ('Y')  order  by  RAND() limit $send_mails");

$hold_ip=mysql_query("select ip from svml_ip_pool where svml_sendgrid_id='$iid' and status='H'");
$u1=array();
$u2=array();
while($row=mysql_fetch_array($inb_ip))
                                                             {
$u1[].=trim($row['ip']);
                         }
while($row2=mysql_fetch_array($hold_ip))
                                                       {
$u2[].=trim($row2['ip']);
                         }
unset($u3);                                                              
$u3=array_merge($u1,$u2); 
unset($u1);
unset($u2);
sort($u3);
$unique = array_unique($u3);
$smtp=base64_encode(serialize($unique));
$toemails=base64_encode($emails);
$query=mysql_query("insert into auto_script_status (svml_id,status,log,reason) values ('$iid','0','halt','sending test email data')");
$id2=mysql_insert_id();
$cmd="php /var/www/html/interface/maild_man_lu_testmail22.php $iid $toemails $smtp $id2 >> /var/www/html/interface/out/$ip_pair &";
$res=exec($cmd);
$send=0;
sleep(2);

$stat=checkstatus($id2);
if($stat=='2') {
mysql_query("insert into screen_status (svml_id,isdata,output) values ('$script_name_id','0','changing template')");

mysql_query("update mul_temp set status='1' where svml_sendgrid_sno='$iid' and script_name='$iid2'");
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "http://$approval_server_ip/auto_script/ASP_bot_tl_notify_http.php?sno=$iid&ip=$ip_add&empid=$mailer_id&reason=Template_changed");
curl_setopt($ch, CURLOPT_HEADER, 0);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$result=curl_exec($ch) ;
curl_close($ch);   
goto adi;
}
elseif($stat=='3') {
goto add;                   
 }


}


#########################################################################################################
$ip_ss=mysql_query("select * from svml_ip_pool where svml_sendgrid_id='$iid' and status='Y'");
unset($ipss_ip);
$ipss_ip=array();
while($rrow=mysql_fetch_array($ip_ss))
  {
$ipss_ip[].=trim($rrow['ip']);
 }

foreach($ipss_ip as $linen)
{
$mul_ip=mysql_fetch_array(mysql_query("select * from svml_ip_pool where svml_sendgrid_id='$iid' and ip='$linen'"));
$start = count(file($datafile));
if($start=='0')
{
echo "file empty check file";
mysql_query("insert into screen_status (svml_id,isdata,output) values ('$script_name_id','0','file empty check file')");

exit;
}
$ip_send_limit=$mul_ip['ip_send_limit'];
$ip_mail_sen=$mul_ip['ip_mail_sent'];
 if($ip_send_limit==$ip_mail_sen)
{
mysql_query("update svml_ip_pool set status='D' where svml_sendgrid_id='$iid' and ip='$linen'");
echo "send limit is over for $linen";
mysql_query("insert into screen_status (svml_id,isdata,output) values ('$script_name_id','0','send limit is over for $linen')");

}
else
 {
$linesnew = file($datafile);
$linenew = array_slice($linesnew,0,$limit);
$del = array_slice($linesnew, $limit);
$file = fopen($datafile, 'w');
fwrite($file, implode('', $del));
fclose($file);
$ems=$linenew;
$ids = implode("",$ems);
$idss=rtrim($ids,"\n");
$toemails=base64_encode($idss);
@$de=date('Y-m-d');
$cmd="php /var/www/html/interface/maild_man_lu.php $iid $toemails $linen >> /var/www/html/interface/out/$ip_pair.$de &";
$res=exec($cmd);
$addd=$ip_mail_sen+$limit;
mysql_query("update svml_ip_pool set ip_mail_sent='$addd' where svml_sendgrid_id='$iid' and ip='$linen'");
sleep($wait_time);
$totallimit=$totallimit+$limit;
echo "totallimit".$totallimit;
mysql_query("insert into screen_status (svml_id,isdata,output) values ('$script_name_id','0','totallimit ".$totallimit."')");


}
$end=count(file($datafile));
$diff=$start-$end;
echo "No of ids in the file Before  <B>$start</B>  After: <B>$end</B> Difference is <b>$diff  from temp id $iid";
mysql_query("insert into screen_status (svml_id,isdata,output) values ('$script_name_id','1','$start|$end|$diff')");

echo "\n";
if($diff==0)
{
    echo "<blink> <b> Change the Mode of the File or Data file is finished </b></blink>";  
    mysql_query("insert into screen_status (svml_id,isdata,output) values ('$script_name_id','0','<b> Change the Mode of the File or Data file is finished </b>')");

}
                                                                                 }
sleep($sleep);
}   


################################# BULK SEND TO TEST IDS ##########################


function checkstatus($status)
{global $script_name_id;
end:
$query=mysql_fetch_array(mysql_query("select * from auto_script_status where sno='$status'"));
echo $query['reason'];
mysql_query("insert into screen_status (svml_id,isdata,output) values ('$script_name_id','0','".$query['reason']."')");

echo "\n";
if($query['status']=="0") {
echo "#";
sleep(1);
goto end; 
                }
elseif($query['status']=='2') {
return 2;
        }
elseif($query['status']=='3') {
return 3;
                }
}


function mytestcount($id_count)
{
unset($totallimit);
$arr3=mysql_fetch_array(mysql_query("select count(1) from svml_ip_pool where svml_sendgrid_id ='$id_count' and status in ('Y')"));
$arr4=mysql_fetch_array(mysql_query("select * from svml_sendgrid where sno='$id_count'"));
/*$mail_total=$count1*$limit4;
$final_mail_at=$mail_per/$mail_total;
$final_ceil=ceil($final_mail_at)*$mail_total;
$final_floor=floor($final_mail_at)*$mail_total;
$ceil_diff=$final_ceil-$mail_per;
$floor_diff=$mail_per-$final_floor;  */
$intial_ip_count1=trim($arr4['stype']);
$count1=trim($arr3['0']);
$limit4=trim($arr4['limit_to_send']);
$mail_per=trim($arr4['pwd']);

$in_ip_cc=mysql_fetch_array(mysql_query("select count(1) from svml_ip_pool where svml_sendgrid_id ='$id_count'"));
$in_ip_count=trim($in_ip_cc['0']);
$mail_per_ip=round($mail_per/$in_ip_count);
$new_mail_per=round($mail_per_ip*$count1);
$mail_total=$count1*$limit4;
$final_mail_at=$new_mail_per/$mail_total;
$final_ceil=ceil($final_mail_at)*$mail_total;
$final_floor=floor($final_mail_at)*$mail_total;
$ceil_diff=$final_ceil-$mail_per;
$floor_diff=$mail_per-$final_floor;  
if($ceil_diff > $floor_diff)
{
return $t1=$final_floor;
}
elseif($floor_diff > $ceil_diff)
{
return $t1=$final_ceil;
}
elseif($floor_diff == $ceil_diff)
{
return $t1=$final_floor;
}
}

mysql_close($link);
  ?>

