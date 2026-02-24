<?php
include_once "Swift-5.0.3/lib/swift_required.php";
ini_set("memory_limit","1520M");
ini_set("memory_limit","1520M");
include "/var/www/html/send_all/include.php";
date_default_timezone_set("US/Eastern");
$date=date('Y-m-d H:i:s');
$iid=$argv[1];
$arr=mysql_fetch_array(mysql_query("select * from svml_sendgrid where sno='$iid'"));
$smtpip=$argv[3];
$emails = base64_decode($argv[2]);

$element = str_replace("\n","','",$emails);
$sql = mysql_query("select emails from bounce_processor.bounce_id where emails in ('".$element."')");
while($get_bounce = mysql_fetch_array($sql))
{
        $emails = str_replace("$get_bounce[0]","",$emails);
}


$qq=mysql_fetch_array(mysql_query("select hostname,user,pass,port,tls from mumara where assignedip='$smtpip'"));
$sub = str_replace("''","'",$arr['subject']);
$ofrom = str_replace("''","'",$arr['from_val']);
$msg =str_replace("''","'",$arr['msg']);
$limit = $arr['limits'];

$offer = $arr['offer'];
$uns_id = $arr['unsub_id'];
$userid = $arr['username'];
$domain = $arr['domain'];
$type = $arr['type'];
$data = $arr['data'];
$mode = 'test';
$head= $arr['head'];
$server = $qq['hostname'];
$usr= $qq['user'];
$pass= $qq['pass'];
$port = $qq['port'];
$tls= $qq['tls'];
$configurationSet= $arr['remarks'];
$ip_pair=trim($arr['ip']);
$msid =$arr['bcc'];
$textm =str_replace("''","'",$arr['textm']);
$message_html=str_replace("{domain}",$domain,$msg);
$from = array();
$from[$ip_pair] = $ofrom; 
$ipencoded=base64_encode($smtpip);
$offerencoded=base64_encode($offer);
$femailencoded=base64_encode($ip_pair);
#$msiden=time() .'.'.$ip_pair;
$msiden=time();
$msidencoded=base64_encode($msiden);


/*
if($subencode=="ascii") {
$r=ascii2hex($sub);
 $sub2 = "=?UTF-8?Q?".$r."?=";
}
elseif($subencode=="base64") {
$r=base64_encode($sub);
 $sub2 = "=?UTF-8?B?".$r."?=";
}
elseif($subencode=="") {
 $sub2=$sub;
}



if($fromencode=="ascii") {
$r=ascii2hex($ofrom);
 $ofrom2 = "=?UTF-8?Q?".$r."?=";
}



elseif($fromencode=="base64") {
$r=base64_encode($ofrom);
 $ofrom2 = "=?UTF-8?B?".$r."?=";

	}

elseif($fromencode=="") {
 $ofrom2=$ofrom;

	}*/


 $charset=trim($arr['charen']);
 $encoding=trim($arr['contend']);
$mailer=trim($arr['mailer']);


$from = array();
$from[$ip_pair] = $ofrom; 
if($mode=='test')
{
	if($tls == 'No')
$transport = Swift_SmtpTransport::newInstance($server, $port);
else
$transport = Swift_SmtpTransport::newInstance($server, $port, 'tls');
########
$transport->setUsername($usr);
$transport->setPassword($pass);
$swift = Swift_Mailer::newInstance($transport);
$logger = new Swift_Plugins_Loggers_ArrayLogger();
$swift->registerPlugin(new Swift_Plugins_LoggerPlugin($logger));
$swift->registerPlugin(new Swift_Plugins_AntiFloodPlugin(100));
$message = new Swift_Message($sub);
$message->setFrom($from);



					$lines=explode("\n",$emails);
					$scn=0;
					$ecn=0;
					$cn=sizeof($lines);
			   foreach ($lines as $email)
			    {  
                   $em=$offer."||".$email;
                   $ed=base64_encode($em);
						$eg=strrev($ed);
						$eh=base64_encode($eg);
	
					   $offerm="OA||".$offer."||".$email;
					   $off=base64_encode($offerm);
				      $offl=strrev($off);
				      $offerlink=base64_encode($offl);
                 
                  $emd5=md5($email);
  					  $unsub_m="UN||".$offer."||".$emd5;
					  $uen=base64_encode($unsub_m);
					  $un_rev=strrev($uen);
					  $uns_aen=base64_encode($un_rev);
						
					   $message_html2=str_replace("{unsl}",$uns_aen,$message_html);	
				      $message_html3=str_replace("{ourl}",$eh,$message_html2);
				      $message_html4=str_replace("{oln}",$offerlink,$message_html3);

                   if($type == 'plain')
                   
                   $message->setBody($message_html4, 'text/plain');
                   if($type == 'html')
                   $message->setBody($message_html4, 'text/html');	
                   
                   
                   if ($type=='mime')
                   {
                  $message->setBody($message_html4, 'text/html');	
                  $message->addPart($textm , 'text/plain');	
                //  $message->setEncoder(Swift_Encoding::get7BitEncoding());
                   }
                   
if($encoding=='base64')
{
$message->setEncoder(Swift_DependencyContainer::getInstance()->lookup('mime.base64contentencoder'));
}
elseif($encoding=='7bit')
{
$message->setEncoder(Swift_Encoding::get7BitEncoding());
}
elseif($encoding=='8bit')
{
$message->setEncoder(Swift_Encoding::get8BitEncoding());
}

                   $to = array($email => '');
                   $message->setTo($to);
                
                    if(!empty($configurationSet)) {
                    $headers = $message->getHeaders();
                    $headers->addTextHeader('X-SES-CONFIGURATION-SET', $configurationSet); 
		             	
		            }
	      if(!$swift->send($message,$failures)) 
		               {
		                   $ecn=$ecn+1;
		               } 
		               else 
		               {
		                   $scn=$scn+1;
		               }
			}
//echo "Message has been sent successfully to $scn";
echo "Sent successfully to  $scn Subscribers out of  $cn Subscribers from ip:  $smtpip  offerid:  $offer";
}

?>

