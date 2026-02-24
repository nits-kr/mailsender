<?php
####################### Initializing ###################################
date_default_timezone_set('US/Eastern');
ini_set("memory_limit","-1");
$d=date('Y-m-d');
include "include.php";
include_once __DIR__.'/fsock_functions.php';

####################### Request Variables ##################################
$entity_id = trim($argv[1]);
$emailJsonData = json_decode(trim($argv[2]), true);
############################################################################


####################### Fetching From Database #############################
$q = mysql_query("select `ESP_admin_data`.`body` from `svml`.`ESP_admin_data` where `ESP_admin_data`.`entity_id` = $entity_id") or die ("Mysql Error :".mysql_error());
$baseEncodedData = mysql_fetch_array($q,MYSQL_ASSOC);
$jsonData = base64_decode($baseEncodedData['body']);
$campJsonData = json_decode($jsonData, true);
############################################################################

####################### Unpacking Variables ###################################

$from_email = base64_decode(trim($campJsonData['from_email']));
$sub = base64_decode(trim($campJsonData['sub']));
$ofrom = base64_decode(trim($campJsonData['ofrom']));
$msgid = trim(base64_decode($campJsonData['msgid']));
$message_html = base64_decode(trim($campJsonData['message_html']));
@$message_plain = base64_decode(trim($campJsonData['message_plain']));
$mode = ($argv[3] == "Bulk Test") ? "Bulk Test" : trim($campJsonData['mode']);
@$mailing_ip = trim($campJsonData['mailing_ip']);
@$mailer = trim($campJsonData['mailer']);
@$offerId = base64_decode(trim($campJsonData['offerIdenc']));
$host = trim($campJsonData['host']);
$user = trim($campJsonData['user']);
$pass = trim($campJsonData['pass']);
$port = trim($campJsonData['port']);
$tls = trim($campJsonData['tls']);
@$returnPath = ($campJsonData['returnPath'] != null) ? trim($campJsonData['returnPath']) : $from_email ;
$custom_header = base64_decode(trim($campJsonData['headers']));
$from_domain_array = explode("@",$from_email);
$from_domain = trim($from_domain_array[1]);


############################################################################
// file_put_contents(__DIR__."/test.txt", print_r($returnPath."\n", true),FILE_APPEND);

####################### Replacing Headers ##################################

$body = NULL;
$body = str_replace("\n","\r\n",$body);
$body = str_replace("{{SubjectLine}}","$sub",$custom_header);                                 // subject replaced             {{SubjectLine}}
$body = str_replace("{{FromEmail}}","$from_email",$body);                                     // From email replaced          {{FromEmail}}
$body = str_replace("{{FromName}}","$ofrom",$body);                                           // From name replaced           {{FromName}} 
$body = str_replace("{{FromDomain}}","$from_domain",$body);                                   // From domain replaced         {{Fromdomain}} 
$body = str_replace("{{UnsubLink}}","$unsublink",$body);                                      // unsublink replaced           {{unsublink}} 
$body = str_replace("{{Domain}}","$domain",$body);                                            // Domain replaced              {{Domain}} 

//DYNAMIC Variables Match and  Replace
$match = array();
preg_match_all("/\[\[(.*?)\]\]/i", $body, $match);

$all_variable_array = $match[1];
foreach($all_variable_array as $function)
{
	$function_array = explode("(",$function);
	$functionName = trim($function_array[0]);
	@$argumnet = trim($function_array[1]);
	$return_data = $functionName($argumnet);
	$body = str_replace("[[$function]]",$return_data,$body);                                   // REPLACE ALL [[*]] type data
}

//Match and Replace Boundary
$matches = array();
preg_match("/boundary=(.*)/i", $body, $matches);                                                 //Case in capital b
preg_match("/Boundary=(.*)/i", $body, $matches);                                                 //Case in capital B
$boundary = str_replace('\'','',trim($matches['1']));
$boundary = str_replace('"','',trim($matches['1']));
$whole_body = str_replace("{{boundary}}",$boundary,$body);                                             // REPLACE {{boundary}} type data


############################################################################

####################### Sending Emails ####################################
$scn=0;
$ecn=0;
$cn=sizeof($emailJsonData);

foreach($emailJsonData as $email)
{
    $email = trim($email);
    if($email == NULL) {
        exit;
    }
    //------------------------------------------------- BODY ENCODING ----------------------------------------------------------------------------------------
    $msgid = trim(base64_decode($campJsonData['msgid']));
    $message_html=str_replace("((_track_))",md5($email),$message_html);
    $body = str_replace("{{HtmlContent}}","$message_html",$whole_body);                                         // html replaced              {{HtmlContent}}
    $body = str_replace("{{PlainContent}}","$message_plain",$body);                                       // plain replaced             {{PlainContent}}
    $body =str_replace("((_track_))",md5($email),$body);

    if(strstr($custom_header,"{{HtmlContent_base64}}"))
        {
                $base64hmtl = base64_encode($message_html);
                $body = str_replace("{{HtmlContent_base64}}","$base64hmtl",$body);                    // base 64 html replaced        {{HtmlContent_base64}}
        }

    if(strstr($custom_header,"{{PlainContent_base64}}"))
        {
                $base64plain = base64_encode($message_plain);
                $body = str_replace("{{PlainContent_base64}}","$base64plain",$body);                  // base 64 plain replaced        {{PlainContent_base64}}
        }
    if(strstr($custom_header,"{{HtmlContent_uue}}"))
        {
                $uuehtml = str_to_uue($message_html);
                $body = str_replace("{{HtmlContent_uue}}","$uuehtml",$body);                          // uuehtml replaced        {{HtmlContent_uue}}
        }
    if(strstr($custom_header,"{{PlainContent_uue}}"))
        {
                $uueplain = str_to_uue($message_plain);
                $body = str_replace("{{PlainContent_uue}}","$uueplain",$body);                        // uueplain replaced        {{PlainContent_uue}}
        }
    if(strstr($custom_header,"{{HtmlContent_qp}}"))
        {
                $qphtml = quoted_printable_encode($message_html);
                $body = str_replace("{{HtmlContent_qp}}","$qphtml",$body);                            // quoted-printable html replaced        {{HtmlContent_qp}}
        }
    if(strstr($custom_header,"{{PlainContent_qp}}"))
        {
                $qpplain = quoted_printable_encode($message_plain);
                $body = str_replace("{{PlainContent_qp}}","$qpplain",$body);                          // quoted-printable plain replaced        {{PlainContent_qp}}
        }
    $body = str_replace("{{ToEmail}}","$email",$body);    
    
    // ------------------------------------------------- Match and Replace Messageid----------------------------------------------------------------------------------------
    preg_match_all("/\[\[(.*?)\]\]/i", $msgid, $match);    
    $all_msid_variable_array = $match[1];
    foreach($all_msid_variable_array as $function)
    {
        $function_array = explode("(",$function);
        $functionName = trim($function_array[0]);
        @$argumnet = trim($function_array[1]);
        $return_data = $functionName($argumnet);
        $msgid = str_replace("[[$function]]",$return_data,$msgid);                                   // REPLACE ALL [[*]] type data
    }

    //{{Domain}}      replaced by $msid in MESSAGE ID
    $msgid = str_replace("{{Domain}}",$domain,$msgid);       
    $body = str_replace("{{MessageId}}",$msgid,$body);                                        // REPLACE {{MessageId}} type data

    $to_array = explode("@",$email);
    $to_name = trim($to_array[0]);
    $to_domain = trim($to_array[1]);

    $body = str_replace("{{ToName}}",$to_name,$body);
    $body = str_replace("{{ToDomain}}",$to_domain,$body);

    // Split header and body using the separator for DKIM
    $seperate = explode("==--==", $body);

    // Build headers from $seperate[0]
    $headers = "";
    $header_lines = explode("\n", $seperate[0]);
    foreach ($header_lines as $line) {
        $line = trim($line);
        if ($line !== "") {
            $headers .= $line . "\r\n";
        }
    }

    // Combine headers and body
    $body = $headers . "\r\n" . $seperate[1];
    
    // file_put_contents(__DIR__."/test.txt",print_r($body,true),FILE_APPEND);
    // exit;
    

    // ------------------------------------------------- Sending Script ----------------------------------------------------------------------------------------
    ########  MANDATORY FEILDS #######
    $smtp = fsockopen($host,$port,$errno,$errstr,500);
    fputs($smtp,"EHLO $returnPath\r\n");
    $line .= fgets($smtp, 1024);
    $line .= fgets($smtp, 1024);
    $line .= fgets($smtp, 1024);
    $line .= fgets($smtp, 1024);
    $line .= fgets($smtp, 1024);
    fputs($smtp,"AUTH LOGIN\r\n");
    $line .= fgets($smtp, 1024);
    $line .= fgets($smtp, 1024);
    $line .= fgets($smtp, 1024);
    fputs($smtp, base64_encode($user)."\r\n");
    $line .= fgets($smtp, 1024);
    fputs($smtp, base64_encode($pass)."\r\n");
    // $line .= fgets($smtp, 1024);
    // $line .= fgets($smtp, 1024);
    // $line .= fgets($smtp, 1024);
    fputs($smtp,"MAIL FROM: <$returnPath>\r\n");
    $line .= fgets($smtp, 1024);
    fputs($smtp,"RCPT TO: <$email>\r\n");
    $line .= fgets($smtp, 1024);
    fputs($smtp,"DATA\r\n");
    $line .= fgets($smtp, 1024);
    //###################################

    ### ------- playground --------   #####
    fputs($smtp,"$body\r\n");
    $line .= fgets($smtp, 1024);
    $line .= fgets($smtp, 1024);
    
    // ########  MANDATORY FEILDS #######
    fputs($smtp,".\r\n");
    $last_responsee = fgets($smtp, 1024);
    if(!strstr(trim($last_responsee),'250')) {
        // $line .= fgets($smtp, 1024);
        $last_response = fgets($smtp, 1024);
    } else {
        $last_response = $last_responsee;
    }
    $line .= $last_response;
    fputs($smtp, "QUIT\r\n");
    fclose($smtp);
    echo "<pre><div style='background:black;color:white;'>";
    echo $line;
    echo "</div></pre>";
    // file_put_contents(__DIR__."/test.txt",print_r($last_response,true),FILE_APPEND);
    if(strstr(trim($last_response),'250')) { $scn=$scn+1; } else { $ecn=$ecn+1; }
}
if($ecn > 0)
echo $r ="sent successfully to  ".$scn ."  Subscribers out of ".$cn. " Error : $ecn<br>\n" ;
else
echo $r ="sent successfully to  ".$scn ."  Subscribers out of ".$cn."<br>\n";
// mysql_query("insert into `svml`.`sending_log_fsock` (`mode`,`total_count`,`sucess_count`,`error_count`,`ip`,`offerid`,`error_log`,`mailer`,`logged_on`) values ('$mode','$cn','$scn','$ecn','$mailing_ip','$offerId','','$mailer',now())") or die ("MYSQL ERROR : ".mysql_error());

// Logging each email sent
$lines = explode("|",$mailing_ip);
$ip = $lines[0];
$log_query = "insert ignore into `report`.`sending_stats` (`mailer`,`template_id`,`interface`,`smtp`,`offer_id`,`domain`,`from`,`mode`,`sent`,`error`) values ('$mailer','$entity_id','FSOCK MANUAL INTERFACE','$ip','$offerId','$domain','$from_email','$mode','$scn','$ecn')";
mysql_query($log_query) or die(mysql_error());

mysql_close($sql);
?>
