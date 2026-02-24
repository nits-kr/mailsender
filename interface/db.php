

<?php
ini_set("memory_limit","1520M");
/*include "/var/www/html/php_aws2/include.php";
$iid=$argv[1];
$arr=mysql_fetch_array(mysql_query("select * from svml_sendgrid where sno='$iid'"));
$users=$arr['mutidomains'];
$u=explode("\n",$users);
$emails =$arr['emails'];
$sub =  str_replace("''","'",$arr['subject']);
$ofrom =  str_replace("''","'",$arr['from_val']);
$msg =  str_replace("''","'",$arr['msg']);
  mysql_close($link);
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
*/
$u='5';
$limit='2';
$total='200';
$t1='20';
$testcount=$t1;
$count=0;
$send='0';
while($count < $total)
{
$c = $total - $count;
if ($c < $limit)
$limit = $c;
                                               
											$ipc=5;
											$totallimit=$ipc*$limit;
											//echo $totallimit;exit;
											/*$tto=array();
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
											$cmd="php /var/www/html/php_aws2/maild_mumara_lu.php $iid $toemails $linen >> /var/www/html/php_aws2/out/$ip_pair.$de &";
											$res=exec($cmd);
											sleep($wait_time);
											//echo "$res\n";
											
											}
											
											sort($u);
											$unique = array_unique($u);*/
											 ################################# BULK SEND TO TEST IDS ##########################
$count = $count + $totallimit;
echo "count value".$count;
echo "\n";	
if($testcount==$count)											 
{
$send=$send+1;			
echo "first test count value".$testcount;			
echo "\n";		 
$testcount=$testcount+$t1;

}
											 if($send=='1')
					 {
					 	
					 	      echo "\n";
					 			echo "SEND MAILS". $testcount;
					 			echo "\n";
												/*foreach($unique as $smtpip)
											{
											
											
											$toemails=base64_encode($emails);
											$cmd="php /var/www/html/php_aws2/maild_mumara_lu.php $iid $toemails $smtpip >> /var/www/html/php_aws2/out/$ip_pair &";
											$res=exec($cmd);
											//echo "$res\n";
											 } */
											$send=$send-1;	
											echo "VALUE OF SEND".$send;
					 			echo "\n";
											 }
											 
										
							
										/*	$end=count(file($datafile));
											$diff=$start-$end;
											echo "<br><br> No of ids in the file Before: <B>$start</B>  After: <B>$end</B> Difference is <b>$diff</b><br>";
													if($diff==0){echo "<blink> <b> Change the Mode of the File or Data file is finished </b></blink>";  }
*/

//sleep($sleep);
}

  
  ?>



