<?php
ini_set("memory_limit","1520M");
include "/var/www/html/php_file_auto/include.php";
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


$count=0;
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
											
											
											$cmd="php /var/www/html/php_file_auto/maild_mumara_api.php $iid $toemails $linen";
											$res=exec($cmd);
											echo "$res\n";
											
											}
											
											sort($u);
											$unique = array_unique($u);
											 ################################# BULK SEND TO TEST IDS ##########################
												foreach($unique as $smtpip)
											{
											
											
											$toemails=base64_encode($emails);
											$cmd="php /var/www/html/php_file_auto/maild_mumara_api.php $iid $toemails $smtpip";
											$res=exec($cmd);
											echo "$res\n";
											 } 
											$end=count(file($datafile));
											$diff=$start-$end;
											echo "<br><br> No of ids in the file Before: <B>$start</B>  After: <B>$end</B> Difference is <b>$diff</b><br>";
													if($diff==0){echo "<blink> <b> Change the Mode of the File or Data file is finished </b></blink>";  }

$count = $count + $totallimit;
sleep($sleep);
}

  
  ?>