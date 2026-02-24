<?php
date_default_timezone_set("America/New_york");



$id=$argv[1];
include "include.php";
$arr=mysql_fetch_array(mysql_query("select * from svml_sendgrid where sno=$id"));
$total = $arr['limits'];
$limit=$arr['limit_to_send'];
$sleep=$arr['sleep_time'];
$data = $arr['data'];
$minsl=60/$sleep;
$datafile="/var/www/data/$data";
$_REQUEST['sub']=$arr['subject'];
$_REQUEST['from']=$arr['from_val'];
$_REQUEST['message']=$arr['msg'];
$_REQUEST['limit']=$arr['limits'];
$_REQUEST['emails']=$arr['emails'];
$_REQUEST['offer']=$arr['offer'];
$_REQUEST['userid']=$arr['username'];
$_REQUEST['domain']=$arr['domain'];
$_REQUEST['type']=$arr['type'];
$_REQUEST['data']=$arr['data'];
$_REQUEST['head']=$arr['head'];
$_REQUEST['ip']=$arr['ip'];
$users=$arr['mutidomains'];
$u=explode("\n",$users);
$size=sizeof($u);
$perip=floor($total/$size);
$perhour=floor($perip/$limit);
$mailcount=floor($perhour/$sleep);
$_REQUEST['limit']=$mailcount;
$times=floor($perip/$mailcount);
//$perminutemail=$perminute*$sleep;

$ip =$arr['server'];
$count=0;
while($count < $total)
	{
			$c = $total - $count;
			if ($c < $mailcount)
				$mailcount = $c;
			
			$start  = date_create();
			foreach($u as $smtpip)
				{
					$smtpip=trim($smtpip);
					if($count < $total) 
						{	
							$c = $total - $count;
							if ($c < $mailcount)
								$mailcount = $c;
							
							$qq=mysql_fetch_array(mysql_query("select hostname,user,pass,port,tls from mumara where assignedip='$smtpip'"));
							$_REQUEST['server']=$qq[0];
							$_REQUEST['usr']=$qq[1];
							$_REQUEST['pass']=$qq[2];
							$_REQUEST['port']=$qq[3];
							$_REQUEST['tls']=$qq[4];
							
							
							$_REQUEST['mode']='test';

$lines = file($datafile);
$line = array_slice($lines,0,$mailcount);
$ids = implode("",$line);
$ids=rtrim($ids, "\n");
$_REQUEST['emails']=$ids;
//print_r($_REQUEST);
//$ids = str_replace("\n","",$ids);
$del = array_slice($lines, $mailcount);
$file = fopen($datafile, 'w');
fwrite($file, implode('', $del));
fclose($file);
$serv = "http://$ip/smtp_auto/maild.php";
$query = http_build_query($_REQUEST);
$url = "$serv?$query";
//echo $url."\n";
$cmd='curl "'.$url.'" >> out/ip2 &';
echo $cmd."\n";
//exec("curl '$url' >> out/ip2 &");


							$count = $count + $mailcount;
						}
				}
			$end 	= date_create(); 
			$diff  	= date_diff( $start, $end );
			$diff_m=$diff->m;
			
	if($diff_m<$minsl)
				{
					$slt=$minsl-$diff_m;
					$slps=$slt*60;
					sleep($slps);
					
				}
	}
?>