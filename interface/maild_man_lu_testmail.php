<?php
require_once "/var/www/html/interface/vendor/autoload.php";
require_once "/var/www/html/interface/PHPMailer/src/PHPMailer.php";
include "/var/www/html/server_ip.php";
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
ini_set("memory_limit","1520M");
include "/var/www/html/interface/include.php";
date_default_timezone_set("US/Eastern");
$date=date("Y-m-d H:i:s");
$iid=$argv[1];
$arr=mysql_fetch_array(mysql_query("select * from svml_sendgrid where sno='$iid'"));
$emails = base64_decode($argv[2]);
$element = str_replace("\n","','",$emails);
$sql = mysql_query("select emails from bounce_processor.bounce_id where emails in ('".$element."')");
while($get_bounce = mysql_fetch_array($sql))
{
$emails = str_replace("$get_bounce[0]","",$emails);
}
$ip_pair=trim($arr['ip']);
$mode = 'test';
$sub =  str_replace("''","'",$arr['subject']);
$ofrom =  str_replace("''","'",$arr['from_val']);
$msg =  str_replace("''","'",$arr['msg']);
$limit = $arr['limits'];
$offer = $arr['offer'];
$userid = $arr['username'];
$domain = $arr['domain'];
$type = $arr['type'];
$data = $arr['data'];
$ip_add=trim($arr['server']);
$head= $arr['head'];
$mailer_id= trim($arr['script']);
$ip_add=trim($arr['server']);
$configurationSet = trim($arr['remarks']);
$msid =$arr['bcc'];
$textm =str_replace("''","'",$arr['textm']);
$message_html=str_replace("{domain}",$domain,$msg);
$from = array();
$from[$ip_pair] = $ofrom; 
//$ipencoded=base64_encode($smtpip);
//$offerencoded=base64_encode($offer);
//$femailencoded=base64_encode($ip_pair);
$subencode=trim($arr['sencode']);
$fromencode=trim($arr['fencode']);
$charset=trim($arr['charen']);
$encoding=trim($arr['contend']);
$mailer=trim($arr['mailer']);
$inbl=trim($arr['oid']);
if($subencode=='ascii')
{
$r=ascii2hex($sub);
$sub2 = "=?UTF-8?Q?".$r."?=";
}
elseif($subencode=='base64')
{
$r=base64_encode($sub);
$sub2 = "=?UTF-8?B?".$r."?=";
}
elseif($subencode=='reset')
{
 $sub2=$sub;
}
if($fromencode=='ascii')
{
$r=ascii2hex($ofrom);
$ofrom2 = "=?UTF-8?Q?".$r."?=";
}
elseif($fromencode=='base64')
{
$r=base64_encode($ofrom);
$ofrom2 = "=?UTF-8?B?".$r."?=";
}
elseif($fromencode=='reset')
{
$ofrom2=$ofrom;
}
$info=array();
$sm=base64_decode(trim($argv[3]));
$smtp=unserialize($sm);
foreach($smtp as $smtpip)
{
$qq=mysql_fetch_array(mysql_query("select hostname,user,pass,port,tls from mumara where assignedip='$smtpip'"));
if (filter_var($smtpip, FILTER_VALIDATE_IP)) {
$info['type']='PMTA';
} else {
  $info['type']='NON-PMTA';
}
$server = $qq['hostname'];
$usr= $qq['user'];
$pass= $qq['pass'];
$port = $qq['port'];
$tls= $qq['tls'];
					$lines=explode("\n",$emails);
					$scn=0;
					$ecn=0;
					$cn=sizeof($lines);
				
					//$mail->AltBody = $message_html;
					foreach ($lines as $email)
					{
						
						$mail = new PHPMailer;
						try{
						$mail->Encoding =$encoding;
						$mail->CharSet = $charset;
                   $mail->XMailer = ' ';		
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
						{
							$mail->IsHTML(false);
							$mail->Body =$message_html4;
						}
						if($type == 'html')
						{
							$mail->IsHTML(true);
							$mail->Body =$message_html4;
						}
						if($type == 'mime') 
						{
							$mail->IsHTML(true);
							$mail->Body =$message_html4;
							$mail->AltBody = $textm;
						}

						$mail->isSMTP();            
                     
						$mail->Host = $server ;
				
						$mail->SMTPAuth = true;                          
	 
						$mail->Username =$usr;                 
						$mail->Password =$pass;                           
	
						if($tls == 'Yes')
						$mail->SMTPSecure = "tls";                           

						$mail->Port = $port;                                   
						$mail->From = $ip_pair;
						$mail->FromName = $ofrom2;
						$msiden=time().rand(1,100000);
	                $msidencoded=base64_encode($msiden); 
					 	$mail->MessageID = '<'.$msidencoded.'@' .$msid.'>';
						$msgid=$mail->MessageID;
	                $mail->isHTML(true);
						$mail->Subject = $sub2;
		             $mail->addAddress($email);
			          if(!$mail->send()) 
						  {
							echo "Mailer Error: " . $mail->ErrorInfo."\n";
						    $ecn=$ecn+1;
						} 
						else 
						{
							$scn=$scn+1;
						}
						}
						 catch (phpmailerException $e) {
                  echo $e->errorMessage(); //Pretty error messages from PHPMailer
			
					}
					catch (Exception $e) {
  echo $e->getMessage(); //Boring error messages from anything else!
}
$info[].=trim($email)."|".trim($msgid)."|".trim($smtpip);

	}// eo of foreach
echo "sent successfully to  ".$scn ."  Subscribers out of  ".$cn. "  Subscribers from ip:  ".$smtpip."   offerid:".   $offer." Error : ".$ecn;
echo "<\n>";
}

$info['ip']=$ip_add;
$info['sqlid']=$iid;
$info['id2']=trim($argv[4]);
$info['inb']=$inbl;
$info['mailer']=$mailer_id;
$url="http://$approval_server_ip/auto_script/test_email_data.php";
echo $da=json_encode(serialize($info));	
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POSTFIELDS, $da);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type:application/json'));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$result = curl_exec($ch);
//echo $result['0'];


function ascii2hex($ascii) {
  $hex = '';
  for ($i = 0; $i < strlen($ascii); $i++) {
    $byte = strtoupper(dechex(ord($ascii{$i})));
    $byte = "=".str_repeat('0', 2 - strlen($byte)).$byte;
    $hex.=$byte;
  }
  return $hex;
}

mysql_close($link);
curl_close($ch);

?>
