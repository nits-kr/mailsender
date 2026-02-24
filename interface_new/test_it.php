

<?php
ini_set("memory_limit","1520M");
include "/var/www/html/send_all/include.php";
$iid=$argv[1];
$mail_per=trim($argv[2]);
$arr=mysql_fetch_array(mysql_query("select * from svml_sendgrid where sno='$iid'"));
//$mail_per=trim($arr['pwd']);
$users=$arr['mutidomains'];
$u=explode("\n",$users);


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
$head= $arr['head'];
$ip_pair=trim($arr['ip']);
$msid =$arr['bcc'];
$datafile="/var/www/data/$data";
$limit=$arr['limit_to_send'];
$sleep=$arr['sleep_time'];
$total = $arr['limits'];
$status=$arr['status'];
$wait_time=$arr['sleep'];


echo $count=count($u);
echo "\n";
echo $mail_total=$count*$limit;
echo "\n";
echo $final_mail_at=$mail_per/$mail_total;
echo "\n";
echo $final_ceil=ceil($final_mail_at)*$mail_total;
echo "\n";
echo $final_floor=floor($final_mail_at)*$mail_total;
echo "\n";
echo $ceil_diff=$final_ceil-$mail_per;
echo "\n";
echo $floor_diff=$mail_per-$final_floor;  
echo "\n";           


if($ceil_diff > $floor_diff)
{
echo $t1=$final_floor;

}
elseif($floor_diff > $ceil_diff  )
{
echo $t1=$final_ceil;

}
elseif($floor_diff == $ceil_diff  )
{
echo $t1=$final_floor;

}
exit;
if($status==0) 
{
               echo "Your Templete Is Being To Check..\n";
               exit;
}
if($status==2) 
{
               echo "Your Templete Is Rejected..\n";
               exit;
}

$testcount=$t1;
$count=0;
$send=0;

   
while($count < $total)
{
$c = $total - $count;
if ($c < $limit)
$limit = $c;
                                               
											$ipc=sizeof($u);
											$totallimit=$ipc*$limit;
											//echo $totallimit;exit;
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
										        @$de=date('Y-m-d');	
											$cmd="php /var/www/html/send_all/maild_man_lu.php $iid $toemails $linen >> /var/www/html/send_all/out/$ip_pair.$de &";
											$res=exec($cmd);
											sleep($wait_time);
											//echo "$res\n";
											
											}
											
											sort($u);
											$unique = array_unique($u);
											 ################################# BULK SEND TO TEST IDS ##########################
                                    $count = $count + $totallimit;
                       
                                    if($testcount==$count)											 
                                         {
                                       $send=$send+1;			
                                       $testcount=$testcount+$t1;
                                          }
											if($send=='1')
			                   		{
			                   			
			                   			//print_r($unique);
                         /*          foreach($unique as $smtpip)
											{
												*/
												
									     	 $smtp=base64_encode(serialize($unique));
												$toemails=base64_encode($emails);
                                   $query=mysql_query("insert into auto_script_status (svml_id,status,log) values ('$iid','0','halt')");
											 $id2=mysql_insert_id();
											$cmd="php /var/www/html/send_all/maild_man_lu_testmail.php $iid $toemails $smtp $id2 >> /var/www/html/send_all/out/$ip_pair &";
											$res=exec($cmd);
				
											 //} 
											 
											 
											
											 sleep(3);
									
										     	 $stat=checkstatus($id2);
											
                                       if($stat=='2') {
								            echo $msg = "script is stopped";

                                        exit;					
												}
											
									          elseif($stat=='3') {
												
                                   header("Location: http://google.com");                         
                                    }											
										
												$send=$send-1;	
												}
										  	
					         
					                  
					                    //print_r($response);
											$end=count(file($datafile));
											$diff=$start-$end;
											echo "<br><br> No of ids in the file Before: <B>$start</B>  After: <B>$end</B> Difference is <b>$diff</b><br>";
													if($diff==0){echo "<blink> <b> Change the Mode of the File or Data file is finished </b></blink>";  }

sleep($sleep);

}


function checkstatus($status)

{


end:
$query=mysql_fetch_array(mysql_query("select * from auto_script_status where sno='$status'"));
echo $query['reason'];
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





  mysql_close($link);
  ?>



