<?php
date_default_timezone_set("America/New_york");



$id=$argv[1];
include "include.php";
$arr=mysql_fetch_array(mysql_query("select * from svml_sendgrid where sno=$id"));
$total = $arr['limits'];
$limit=$arr['limit_to_send'];
$sleep=$arr['sleep_time'];

$minsl=60/$sleep;

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
$_REQUEST['mode']=$arr['mode'];
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
			foreach($u as $line)
				{
					if($count < $total) 
						{	
							$c = $total - $count;
							if ($c < $mailcount)
								$mailcount = $c;
							
							$qq=mysql_fetch_array(mysql_query("select hostname,user,pass,port,tls from mumara where assignedip='$line'"));
							$_REQUEST['server']=$qq[0];
							$_REQUEST['usr']=$qq[1];
							$_REQUEST['pass']=$qq[2];
							$_REQUEST['port']=$qq[3];
							$_REQUEST['tls']=$qq[4];
							$a=$_REQUEST['limit']."...";
$a.=$_REQUEST['emails']."..."; 
$a.=$_REQUEST['offer']."...";
$a.=$_REQUEST['userid']."...";
$a.=$_REQUEST['domain']."...";
$a.=$_REQUEST['type']."...";
$a.=$_REQUEST['data']."...";
$a.=$_REQUEST['mode']."...";
$a.=$_REQUEST['head']."...";
$a.=$_REQUEST['ip']."...";
$a.=$_REQUEST['server']."...";
$a.=$_REQUEST['usr']."...";
$a.=$_REQUEST['pass']."...";
$a.=$_REQUEST['port']."...";
$a.=$_REQUEST['tls']."...";
$a.=$_REQUEST['sub']."...";
$a.=$_REQUEST['from']."\n";
							echo "$a";
							//print_r($_REQUEST);
						/*	$query = http_build_query($_REQUEST);
							
							$url = "http://$ip/smtp_auto/maild.php";
							$ch = curl_init();
							curl_setopt($ch,CURLOPT_URL, $url);
							//curl_setopt($ch,CURLOPT_POST, count($query));
							curl_setopt($ch,CURLOPT_POSTFIELDS, $query);
							$result = curl_exec($ch);
							
							curl_close($ch);*/
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
					//sleep($slps);
					
				}
	}
?>
