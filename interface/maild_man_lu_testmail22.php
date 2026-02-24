<?php
require_once "/var/www/html/interface/vendor/autoload.php";
require_once "/var/www/html/interface/PHPMailer/src/PHPMailer.php";
include "/var/www/html/server_ip.php";
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
ini_set("memory_limit","1520M");
include "/var/www/html/interface/include.php";
include "/var/www/html/interface/get_messsage_id.php";
date_default_timezone_set("US/Eastern");
$date=date("Y-m-d H:i:s");
$iid=$argv[1];


$arr=mysql_fetch_array(mysql_query("select * from svml_sendgrid where sno='$iid'"));
$emails = base64_decode($argv[2]);
$element = str_replace("\n","','",$emails);
//$sql = mysql_query("select emails from bounce_processor.bounce_id where emails in ('".$element."')");
//while($get_bounce = mysql_fetch_array($sql))
//{
//	$emails = str_replace("$get_bounce[0]","",$emails);
//}
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
$head= $arr['head'];
$mailer_id= trim($arr['script']);
$ip_add=trim($arr['server']);
$configurationSet = trim($arr['remarks']);
$msid =$arr['bcc'];
$textm =str_replace("''","'",$arr['textm']);
$message_html=str_replace("{domain}",$domain,$msg);
$from = array();
$from[$ip_pair] = $ofrom; 
$subencode=trim($arr['sencode']);
$fromencode=trim($arr['fencode']);
$charset=trim($arr['charen']);
$encoding=trim($arr['contend']);
$charset_alt=trim($arr['charen_alt']);
$encoding_alt=trim($arr['contend_alt']);
$mailer=trim($arr['mailer']);
$xmailer = trim($arr['xmailer']);
$replyto = trim($arr['reply_to']);
$inbl=trim($arr['oid']);
$headers = base64_decode($arr['headers']);

//newelements
$res_choice=trim($arr['smode']);
$relayper=trim($arr['relay_per']);


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
	if (filter_var($smtpip, FILTER_VALIDATE_IP)) 
	{
	$type1='PMTA';
	} else 
	{
	//$info['type']='NON-PMTA';
	$type1='NON-PMTA';
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
                $message_id = get_message_id($iid);
		$mail = new PHPMailer;
			try
				{
					$mail->Encoding =$encoding;
					$mail->CharSet = $charset;
					$mail->AltEncoding =$encoding_alt;
					$mail->AltCharSet = $charset_alt;
                                          

 if($xmailer == '0')
                                {
                                        $mail->XMailer = $xmailer;
                                }




 // --------------------------- new tracking words --------------

                               $newem=$offer."|".$email;
                               $newembase = base64_encode($newem);
                               $newemhex = bin2hex($newem);
                               
                                $message_htmlnew1 = str_replace("{base_trk}",$newembase,$message_html);
                                $message_htmlnew = str_replace("{hex_trk}",$newemhex,$message_htmlnew1);






// ----------------------------  heder changes -------------------------------------

                                  $names = explode('@', $email);
                                  $nameemailid = trim($names[1]);
                                  $nameemailid = str_replace('.','',$nameemailid);
                                  $nameemailid = str_replace('-','',$nameemailid);
                                  $nameemailid = str_replace('_','',$nameemailid);
                                  $nameid = preg_replace('/[0-9]+/', '', $nameemailid);
                                  $datetimeamail = date(DATE_RFC2822);
                                  $dateofmail = date("d-m-Y");


                                $message1 = str_replace("{email}",$email,$message_htmlnew);
                                $message2 = str_replace("{name}",$nameemailid,$message1);
                                $message3 = str_replace("{fromid}",$ip_pair,$message2);
                                $message4 = str_replace("{fromname}",$ofrom2,$message3);
                                $message5 = str_replace("{datetime}",$datetimeamail,$message4);
                                $message6 = str_replace("{date}",$dateofmail,$message5);
                                $message8 = str_replace("{msgid}",$message_id,$message6);
                                $message9 = str_replace("{domain}",$domain,$message8);
 

// --------------------------- old tracking words --------------


					$em=$offer."||".$email;
					$ed=base64_encode($em);
					$eg=strrev($ed);
					$eh=base64_encode($eg);
					$message_html2=str_replace("{unsl}",$eh,$message9);	
					$message_html3=str_replace("{ourl}",$eh,$message_html2);
					$message_html4=str_replace("{oln}",$eh,$message_html3);
					



				if($headers != '')
                                        {
                                $header1 = str_replace("{email}",$email,$headers);
                                $header2 = str_replace("{name}",$nameemailid,$header1);
                                $header3 = str_replace("{fromid}",$ip_pair,$header2);
                                $header4 = str_replace("{fromname}",$ofrom2,$header3);
                                $header5 = str_replace("{datetime}",$datetimeamail,$header4);
                                $header6 = str_replace("{date}",$dateofmail,$header5);
                                $header8 = str_replace("{msgid}",$message_id,$header6);
                                $header9 = str_replace("{domain}",$domain,$header8);
                                              $h = explode("\n",$header9);
                                             print_r($h);
                                              foreach ($h as $line)
                                                {
                                                 $mail->addCustomHeader(trim($line));
                                                }
                                           }



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
					$mail->setFrom($ip_pair, $ofrom2);

                                  if($replyto == '0')
                                {
                                        $mail->addReplyTo($replyto, $ofrom2);

                                }

					$mail->MessageID = $message_id;
					$msgid=$mail->MessageID;
					$mail->isHTML(true);
					$mail->Subject = $sub2;
					$mail->addAddress($email);
					
					if(!$mail->send()) 
						{
							echo "Mailer Error: " . $mail->ErrorInfo."\n";
							$ecn=$ecn+1;
							$query=mysql_query("insert into auto_script.testemail_log (sending_ip,email_id,msgid,smtp_ip,svml_sendgrid_id,temp2,temp3,temp4,mailer_id,status) values  ('$ip_add','$email','$msgid','$smtpip','$iid','$argv[4]','$inbl','$type1','$mailer_id','E')");
							mysql_query("update svml.auto_script_status set  reason='error in sending' where sno='$argv[4]'");
							if(!empty($error = mysql_error() ) )
								{
									$err_3=mysql_real_escape_string($error);
									mysql_query("update svml.auto_script_status set  reason='$err_3' where sno='$argv[4]'");
									sleep(1);
									mysql_query("update svml.auto_script_status set status='2' where sno='$argv[4]'");
								}
						} 
					else 
						{
							$scn=$scn+1;
							$query=mysql_query("insert into auto_script.testemail_log (sending_ip,email_id,msgid,smtp_ip,svml_sendgrid_id,temp2,temp3,temp4,mailer_id,status) values  ('$ip_add','$email','$msgid','$smtpip','$iid','$argv[4]','$inbl','$type1','$mailer_id','relay')");
							if(!empty($error = mysql_error() ) )
								{
									$err_3=mysql_real_escape_string($error);
									mysql_query("update svml.auto_script_status set  reason='$err_3' where sno='$argv[4]'");
									sleep(1);
									mysql_query("update svml.auto_script_status set status='2' where sno='$argv[4]'");
								}
						}
				}
				
				catch (phpmailerException $e) 
					{
						echo $e->errorMessage(); //Pretty error messages from PHPMailer
					}

				catch (Exception $e) 
					{
						echo $e->getMessage(); //Boring error messages from anything else!
					}

	}// eo of foreach

	echo "sent successfully to  ".$scn ."  Subscribers out of  ".$cn. "  Subscribers from ip:  ".$smtpip."   offerid:".   $offer." Error : ".$ecn;
	echo "<\n>";
}

sleep(2);
$url="http://173.249.50.153/automailer/log_imap_pool.php";
$info['id']=$iid;
$info['id2']=$argv[4];
$da=json_encode($info);	
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POSTFIELDS, $da);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type:application/json'));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$result = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
if($code=='401')
{
	mysql_query("update svml.auto_script_status set status='2', reason='401 http authentication issue'  where sno='$argv[4]'");
}
if($code=='403')
{
	mysql_query("update svml.auto_script_status set status='2', reason='403 unauthorized http authentication'  where sno='$argv[4]'");
}
if($code=='404')
{
	mysql_query("update svml.auto_script_status set status='2', reason='404 file not  found error (trylog_pmta_new.php)'  where sno='$argv[4]'");
}
if($result=="DCE") 
{
	mysql_query("update svml.auto_script_status set status='2', reason='database connection error'  where sno='$argv[4]'");
}

curl_close($ch);

function ascii2hex($ascii) 
{
	$hex = '';
	for ($i = 0; $i < strlen($ascii); $i++) 
	{
		$byte = strtoupper(dechex(ord($ascii{$i})));
		$byte = "=".str_repeat('0', 2 - strlen($byte)).$byte;
		$hex.=$byte;
	}
	return $hex;
}
mysql_close($link);

?>
