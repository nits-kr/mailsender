<?php
error_reporting(0);
ini_set("memory_limit","1520M");
include "/var/www/html/interface_new/include.php";
include "/var/www/html/server_ip.php";
adi:
echo "\n";
echo "hiiii";
echo "\n";
$iid=$argv[1];
mysql_query("insert into screen_status (svml_id,isdata,output) values ('$iid','0','Script Starteds')");
$arr=mysql_fetch_array(mysql_query("select * from svml_sendgrid where sno='$iid'"));
$arr2=mysql_fetch_array(mysql_query("select count(1) from svml_ip_pool where svml_sendgrid_id ='$iid' and status in ('Y')"));
$mail_per=trim($arr['pwd']);
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
$send_mails= $arr['head'];
$mailer_id=$arr['script'];
$mode = 'test';
$m_id=$arr['script'];
$ip_add=$arr['server'];
//$head= $arr['head'];
$ip_pair=trim($arr['ip']);
$msid =$arr['bcc'];
$datafile="/var/www/data/$data";
$limit=$arr['limit_to_send'];
$sleep=$arr['sleep_time'];
$total = $arr['limits'];
$status=$arr['status'];
$wait_time=$arr['sleep'];
$intial_ip_count=trim($arr['stype']);
$count1=trim($arr2['0']);
####################################new mail after
$in_ip_cc=mysql_fetch_array(mysql_query("select count(1) from svml_ip_pool where svml_sendgrid_id ='$iid'"));
$in_ip_count=trim($in_ip_cc['0']);
$mail_per_ip=round($mail_per/$in_ip_count);
$new_mail_per=round($mail_per_ip*$count1);
$mail_total=$count1*$limit;
$final_mail_at=$new_mail_per/$mail_total;
$final_ceil=ceil($final_mail_at)*$mail_total;
$final_floor=floor($final_mail_at)*$mail_total;
$ceil_diff=$final_ceil-$mail_per;
$floor_diff=$mail_per-$final_floor;  
####################################new mail after
  
if($ceil_diff > $floor_diff)
{
$t1=$final_floor;
}
elseif($floor_diff > $ceil_diff)
{
$t1=$final_ceil;
}
elseif($floor_diff == $ceil_diff)
{
$t1=$final_floor;
}
echo "you will recieve mail on test ids after every $t1 mails";
mysql_query("insert into screen_status (svml_id,isdata,output) values ('$iid','0','you will recieve mail on test ids after every $t1 mails')");
echo "\n";
echo $total;
mysql_query("insert into screen_status (svml_id,isdata,output) values ('$iid','0','$total')");
if($status==0) 
{
               echo "Your Templete Is Being To Check..\n";
               mysql_query("insert into screen_status (svml_id,isdata,output) values ('$iid','0','Your Templete Is Being To Check..')");
               exit;
}
if($status==2) 
{
               echo "Your Templete Is Rejected..\n";
               mysql_query("insert into screen_status (svml_id,isdata,output) values ('$iid','0','Your Templete Is Rejected..')");
               exit;
}

$testcount=$t1;
$count=0;
$send=0;
$totallimit=0;
  
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

                                                                 echo "\n";
                                                                               echo "final".$final_ip_count=count($u);
                                                                               mysql_query("insert into screen_status (svml_id,isdata,output) values ('$iid','0','Final $final_ip_count')");
                                                                               echo "\n";

                                                                                                 if($final_ip_count=='0') {


                                                                            $curent_ip=mysql_fetch_array(mysql_query("select  count(IF(status='D', 1, NULL)) 'DONE', count(IF(status in ('N','S'), 1, NULL)) 'SPAM', count(IF(status='H', 1, NULL)) 'HOLD'  , count(1) as total  FROM svml_ip_pool where svml_sendgrid_id='$iid'"));
                                                                if($curent_ip['2']==$curent_ip['3']) {   

                                                                                                                                goto add;     

                                                                                                                                        }
                                                                                                                                        else {   
   
   
   
                                                                                                echo "\n";
                                      echo "LIMIT REACHED IP COUNT :  ".$curent_ip['0'] ."  SPAM IP COUNT :  ".$curent_ip['1']."  HOLD IP COUNT :  ".$curent_ip['2'];
                                      $out_xxyyzz = "LIMIT REACHED IP COUNT :  ".$curent_ip['0'] ."  SPAM IP COUNT :  ".$curent_ip['1']."  HOLD IP COUNT :  ".$curent_ip['2'];
                                       mysql_query("insert into screen_status (svml_id,isdata,output) values ('$iid','0','$out_xxyyzz')");
                                      echo "\n";
                                      echo "script is stopped";
                                       mysql_query("insert into screen_status (svml_id,isdata,output) values ('$iid','0','script is stopped')");
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "http://$approval_server_ip/auto_script/ASP_bot_tl_notify_http.php?sno=$iid&ip=$ip_add&empid=$m_id&reason=Script_Stopped");
curl_setopt($ch, CURLOPT_HEADER, 0);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$result=curl_exec($ch) ;
curl_close($ch);   
                                                                                                exit;
                                                                                                  
                                                                                                        }
                                                                                                  
                                                                                                  }
                                                                                                  

                                                                                                unset($send_ip_count);
                                                                                                        $arr3=mysql_fetch_array(mysql_query("select count(1) from svml_ip_pool where svml_sendgrid_id ='$iid' and status in ('Y')"));

                                                                                                        $send_ip_count=$arr3['0'];

                                                                                                  
                                                                                                        if(($intial_ip_count>$send_ip_count )||($intial_ip_count<$send_ip_count )) {
                                                                                                  
                                                                                                        // $final_sc_ip=mysql_fetch_array(mysql_query("select count(1) from svml_ip_pool where svml_sendgrid_id='$iid' and status in ('Y')"));
                                                                                                         //$final_script_ips=trim($final_sc_ip['0']);
                                                                                                         mysql_query("update svml_sendgrid set stype='$send_ip_count' where sno='$iid'");
                                                                                                          unset($sip);
                                                                                                         $spam_ip=mysql_query("select * from svml_ip_pool where svml_sendgrid_id='$iid' and status='N'");
                                                                                                         while($row2=mysql_fetch_array($spam_ip)) { 
                                                                                                         $sip[].=trim($row2['ip']);
                                                                                                              }
                                                                                                        if(!empty($sip)) {
                                                                                                                echo "\n";
                                                                                                                 
                                                                                                                 $spamips=count($sip);
                                                                                                                 echo "no of spam ips". $spamips;
                                                                                                                 mysql_query("insert into screen_status (svml_id,isdata,output) values ('$iid','0','no of spam ips $spamips')");
                                                                                                                 echo "\n";
                                                                                                                  for($i=0;$i<$spamips; $i++) {

                                                                                                                                                mysql_query("update svml_ip_pool set status='S' where svml_sendgrid_id='$iid' and ip='$sip[$i]'");
                                                                                                                                                       }
                                                                                                                                                
                                                         

                                                                                                        }
                                                                                                  
             $total_mail_left=mysql_fetch_array(mysql_query("select sum(ip_send_limit-ip_mail_sent) from svml_ip_pool where status in ('Y','H') and svml_sendgrid_id='$iid'"));                                                                                                               
                           $upd_svml_table=$total_mail_left['0'];

                        mysql_query("update svml_sendgrid set limits='$upd_svml_table' where sno='$iid'");
                                                                                                                                                 goto adi;
                             

                                                                        }
                                    foreach($u as $linen)
                                                                                        {
                                                                                         
                                                                                        $mul_ip=mysql_fetch_array(mysql_query("select * from svml_ip_pool where svml_sendgrid_id='$iid' and ip='$linen'"));
                                                                                        $start = count(file($datafile));
                                                                                        if($start=='0')
                                                                                        {
                                                                                                                echo "file empty check file";
                                                                                                                mysql_query("insert into screen_status (svml_id,isdata,output) values ('$iid','0','file empty check file')");
                                                                                                                exit;

                                                                                        }
                                                                                        $ip_send_limit=$mul_ip['ip_send_limit'];
                                                                                        $ip_mail_sen=$mul_ip['ip_mail_sent'];

                                                                                        if($ip_send_limit==$ip_mail_sen)
                                                                                        {
                                                                                        mysql_query("update svml_ip_pool set status='D' where svml_sendgrid_id='$iid' and ip='$linen'");
                                                                                        echo "send limit is over for $linen";
                                                                                        mysql_query("insert into screen_status (svml_id,isdata,output) values ('$iid','0','send limit is over for $linen')");
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
                                                                                        $cmd="php /var/www/html/interface_new/maild_man_lu.php $iid $toemails $linen >> /var/www/html/interface_new/out/$ip_pair.$de &";
                                                                                        $res=exec($cmd);
                                                                                        $addd=$ip_mail_sen+$limit;
                                                                                        mysql_query("update svml_ip_pool set ip_mail_sent='$addd' where svml_sendgrid_id='$iid' and ip='$linen'");
                                                                                   sleep($wait_time);
                                                                                        echo $totallimit=$totallimit+$limit;
                                                                                        mysql_query("insert into screen_status (svml_id,isdata,output) values ('$iid','0','$totallimit')");
                                                                                        echo "\n";
                                                                                        $end=count(file($datafile));
                                                                                        $diff=$start-$end;
                                                                                        echo "<br><br> No of ids in the file Before $linen : <B>$start</B>  After: <B>$end</B> Difference is <b>$diff</b>";
                                                                                        mysql_query("insert into screen_status (svml_id,isdata,output) values ('$iid','1','$start|$end|$diff')");
                                                                                        echo "\n";
                                                                                   if($diff==0){echo "<blink> <b> Change the Mode of the File or Data file is finished </b></blink>";
                                                                                   mysql_query("insert into screen_status (svml_id,isdata,output) values ('$iid','0','Change the Mode of the File or Data file is finished')");  }
                                                                                        }


                                                                                        }


                                                                                         ################################# BULK SEND TO TEST IDS ##########################
                                    $count =  $totallimit;
                       
                                   if($testcount==$count)                                                                                      
                                         {
                                       $send=1;
                                       $testcount=$testcount+$t1;
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
                                                                                        $cmd="php /var/www/html/interface_new/maild_man_lu_testmail22.php $iid $toemails $smtp $id2 >> /var/www/html/interface_new/out/$ip_pair &";
                                                                                        $res=exec($cmd);
                                                                                        $send=0;


                                         sleep(2);


                                                                                     $stat=checkstatus($id2);

                                     if($stat=='2') {
                                     //$ress=file_get_contents("http://aspserver2.info/auto_script/ASP_bot_tl_notify_http.php?sno=$iid&ip=$ip_add&empid=$mailer_id&reason=script_stopped");
                                                                            echo $msg = "script is stopped";
                                                                            mysql_query("insert into screen_status (svml_id,isdata,output) values ('$iid','0','script is stopped')");
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "http://$approval_server_ip/auto_script/ASP_bot_tl_notify_http.php?sno=$iid&ip=$ip_add&empid=$m_id&reason=Script_Stopped");
curl_setopt($ch, CURLOPT_HEADER, 0);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$result=curl_exec($ch) ;
curl_close($ch);   
                                        exit;
                                                                                                }

                                                                                          if($stat=='3') {
                                                                            goto add;
                                                                                                }
                                                                                  



}


sleep($sleep);

}


function checkstatus($status)

{

end:
$query=mysql_fetch_array(mysql_query("select * from auto_script_status where sno='$status'"));
echo $query_reason = $query['reason'];
mysql_query("insert into screen_status (svml_id,isdata,output) values ('".$query['svml_id']."','0','".$query['reason']."')");
echo "\n";
if($query['status']=="0") {
echo "#";
// mysql_query("insert into screen_status (svml_id,isdata,output) values ('".$query['svml_id']."','0','#')");
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
mysql_close($link);
  ?>


