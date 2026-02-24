<?php
require_once "/var/www/html/interface/vendor/autoload.php";
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
//      $emails = str_replace("$get_bounce[0]","",$emails);
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

$smtpip=$argv[3];
$qq=mysql_fetch_array(mysql_query("select hostname,user,pass,port,tls from mumara where assignedip='$smtpip'"));
$server = $qq['hostname'];
$usr= $qq['user'];
$pass= $qq['pass'];
$port = $qq['port'];
$tls= $qq['tls'];
$configurationSet = trim($arr['remarks']);
// $msid =$arr['bcc'];
$textm =str_replace("''","'",$arr['textm']);
$message_html=str_replace("{domain}",$domain,$msg);
$from = array();
$from[$ip_pair] = $ofrom; 
$ipencoded=base64_encode($smtpip);
$offerencoded=base64_encode($offer);
$femailencoded=base64_encode($ip_pair);
$subencode=trim($arr['sencode']);
$fromencode=trim($arr['fencode']);
$charset=trim($arr['charen']);
$encoding=trim($arr['contend']);
$charset_alt=trim($arr['charen_alt']);
$encoding_alt=trim($arr['contend_alt']);
$mailer=trim($arr['mailer']);
$xmailer = trim($arr['xmailer']);
$replyto = trim($arr['reply_to']);
$headers = base64_decode($arr['headers']);

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

if($mode=='test')
{
                $lines=explode("\n",$emails);
                $scn=0;
                $ecn=0;
                $cn=sizeof($lines);

                //$mail->AltBody = $message_html;
                foreach ($lines as $email)
                { 
                    $message_id = get_message_id($iid);
                    $datamsg = '';
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

                                $textm1 = str_replace("{email}",$email,$textm);
                                $textm2 = str_replace("{name}",$nameemailid,$textm1);
                                $textm3 = str_replace("{fromid}",$ip_pair,$textm2);
                                $textm4 = str_replace("{fromname}",$ofrom2,$textm3);
                                $textm5 = str_replace("{datetime}",$datetimeamail,$textm4);
                                $textm6 = str_replace("{date}",$dateofmail,$textm5);
                                $textm8 = str_replace("{msgid}",$message_id,$textm6);
                                $textm9 = str_replace("{domain}",$domain,$textm8);
 




// --------------------------- old tracking words --------------


                                $em=$offer."||".$email;
                                $ed=base64_encode($em);
                                $eg=strrev($ed);
                                $eh=base64_encode($eg);
                                $message_html2=str_replace("{unsl}",$eh,$message9);
                                $message_html3=str_replace("{ourl}",$eh,$message_html2);
                                $message_html4=str_replace("{oln}",$eh,$message_html3);
                                $message_html5=str_replace("((_track_))",md5($email),$message_html4);
                                if($type == 'plain')
                                        {
                                                $mail->IsHTML(false);
                                                $mail->Body =$message_html5;
                                        }
                                if($type == 'html')
                                        {
                                                $mail->IsHTML(true);
                                                $mail->Body =$message_html5;
                                        }
                                if($type == 'mime') 
                                        {
                                                $mail->IsHTML(true);
                                                $mail->Body =$message_html5;
                                                $mail->AltBody = $textm9;
                                        }




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




                                $mail->isSMTP();            
                                $mail->Host = $server ;
                                $mail->SMTPAuth = true;                          
                                $mail->Username =$usr;                 
                                $mail->Password =$pass;                           
                                if($tls == 'Yes')
                                $mail->SMTPSecure = "tls";                           
                                $mail->Port = $port;                                   
                                //$mail->From = $ip_pair;
                                //$mail->FromName = $ofrom2;
                                $mail->setFrom($ip_pair, $ofrom2);
                                if($replyto == '0')
                                {
                                        $mail->addReplyTo($replyto, $ofrom2);

                                }

                                $mail->MessageID = $message_id;
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
                                       $datamsg .= $message_id.",".$smtpip.",".$email."|"; 
                                        $scn=$scn+1;
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
                }
        $datalink = rtrim(trim($datamsg), '|');
   $testlink = "http://173.249.50.153/tokencheck.php?data=".base64_encode(urlencode(trim($datalink)));
                echo $r ="sent successfully to  ".$scn ."  Subscribers out of ".$cn. "  Subscribers from ip: ".$smtpip." offerid:".   $offer." Error : ".$ecn ;
                echo "<br>\n";
}

function ascii2hex($ascii) 
{
  $hex = '';
  for ($i = 0; $i < strlen($ascii); $i++) {
    $byte = strtoupper(dechex(ord($ascii{$i})));
    $byte = "=".str_repeat('0', 2 - strlen($byte)).$byte;
    $hex.=$byte;
  }
  return $hex;
}

mysql_close($link);
?>
