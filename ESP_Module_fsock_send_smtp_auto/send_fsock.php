<?php
####################### Initializing ###################################
date_default_timezone_set('US/Eastern');
ini_set("memory_limit","-1");
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(0);
$d=date('Y-m-d');
include "include.php";
include_once __DIR__.'/fsock_functions.php';

####################### Request Variables ##################################
$entity_id = trim($argv[1]);
$emailJsonData = json_decode(trim($argv[2]), true);
$smtpData = explode("|", trim($argv[4]));

############################################################################

####################### SMTP Credentials ################################
$countSMTP = count($smtpData);
$ip = $smtpData[0];
$smtp_cred = mysql_fetch_array(mysql_query("select * from `svml`.`mumara` where `mumara`.`assignedip` = '$ip'"), MYSQL_ASSOC);
$host = trim($smtp_cred['hostname']);
$user = trim($smtp_cred['user']);
$pass = trim($smtp_cred['pass']);
$port = trim($smtp_cred['port']);
$tls = trim($smtp_cred['tls']);
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
$custom_header = base64_decode(trim($campJsonData['headers']));
$from_domain_array = explode("@",$from_email);
$from_domain = trim($from_domain_array[1]);
$domain = trim(base64_decode($campJsonData['domainenc']));
$returnPath = ($countSMTP == 2) ? trim($smtpData[1]) : trim($from_email);
############################################################################
// file_put_contents(__DIR__."/test.txt", print_r($returnPath."\n", true),FILE_APPEND);

####################### Replacing Headers ##################################
$body = NULL;
$body = str_replace("\n","\r\n",$body);
$body = str_replace("{{SubjectLine}}","$sub",$custom_header);                                 // subject replaced             {{SubjectLine}}
$body = str_replace("{{FromEmail}}","$from_email",$body);                                     // From email replaced          {{FromEmail}}
$body = str_replace("{{FromName}}","$ofrom",$body);                                           // From name replaced           {{FromName}} 
$body = str_replace("{{FromDomain}}","$from_domain",$body);                                   // From domain replaced         {{Fromdomain}} 
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
    $returnPath = ($countSMTP == 2) ? trim($smtpData[1]) : trim($from_email);
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
    
    // ------------------------------------------------- Match and Replace Return Path ----------------------------------------------------------------------------------------
    preg_match_all("/\[\[(.*?)\]\]/i", $returnPath, $match);
    $all_returnPath_variable_array = $match[1];
    foreach($all_returnPath_variable_array as $function)
    {
        $function_array = explode("(",$function);
        $functionName = trim($function_array[0]);
        @$argumnet = trim($function_array[1]);
        $return_data = $functionName($argumnet);
        $returnPath = str_replace("[[$function]]",$return_data,$returnPath);                                   // REPLACE ALL [[*]] type data
    }
    // ------------------------------------------------- Sending Script ----------------------------------------------------------------------------------------
    $smtp = fsockopen($host, $port, $errno, $errstr, 500);
    if (!$smtp) {
        echo "Connection failed: $errstr ($errno)\n";
        exit;
    }

    // Read server banner
    $line = fgets($smtp, 1024);

    // Send EHLO
    fputs($smtp, "EHLO $returnPath\r\n");
    $line .= fgets($smtp, 1024);

    // AUTH LOGIN
    fputs($smtp, "AUTH LOGIN\r\n");
    $auth_response = fgets($smtp, 1024);
    $line .= $auth_response;

    // Send username
    fputs($smtp, base64_encode($user) . "\r\n");
    $user_response = fgets($smtp, 1024);
    $line .= $user_response;

    // Send password
    fputs($smtp, base64_encode($pass) . "\r\n");
    $pass_response = fgets($smtp, 1024);
    $line .= $pass_response;

    // Check if authentication succeeded (look for 235)
    if (strpos($pass_response, '235') === false) {
        echo "<pre><div style='background:black;color:white;'>";
        echo "SMTP Authentication failed:\n";
        echo $line;
        echo "</div></pre>";
        fclose($smtp);
        continue; // move to next email
    }

    // MAIL FROM
    fputs($smtp, "MAIL FROM: <$returnPath>\r\n");
    $line .= fgets($smtp, 1024);

    // RCPT TO
    fputs($smtp, "RCPT TO: <$email>\r\n");
    $line .= fgets($smtp, 1024);

    // DATA
    fputs($smtp, "DATA\r\n");
    $line .= fgets($smtp, 1024);

    // Send body (headers + blank line + body, all lines end with \r\n)
    fputs($smtp, "$body\r\n.\r\n");
    $last_response = fgets($smtp, 1024);
    $line .= $last_response;


    // QUIT
    fputs($smtp, "QUIT\r\n");
    fclose($smtp);
    echo $line;
    // file_put_contents(__DIR__."/test.txt",print_r($last_response,true),FILE_APPEND);
    if(strstr(trim($last_response),'250')) { $scn=$scn+1; } else { $ecn=$ecn+1; }

    // Capturing Record Incase of Auto Sending
    if($argv[5] == "record") {
        $sent_status = empty($ecn) ? 1 : 0;
        $modifiedMessageId = str_replace(">","",str_replace("<","",$msgid));
        $record = "insert ignore into `svml`.`auto_script_test_status` (`svml_sendgrid_id`,`ip`,`email`,`msgid`,`mode`,`sent_status`) values ('$entity_id','$ip','$email','$modifiedMessageId','$mode','$sent_status')";
        mysql_query($record) or die(mysql_error());
    }

}
if($ecn > 0)
echo $r ="sent successfully to  ".$scn ."  Subscribers out of ".$cn. " Error : $ecn\n" ;
else
echo $r ="sent successfully to  ".$scn ."  Subscribers out of ".$cn."\n";

// Logging each email sent
$log_query = "insert ignore into `report`.`sending_stats` (`mailer`,`template_id`,`interface`,`smtp`,`offer_id`,`domain`,`from`,`mode`,`sent`,`error`) values ('$mailer','$entity_id','FSOCK SEND SMTP AUTO','$ip','$offerId','$domain','$from_email','$mode','$scn','$ecn')";
mysql_query($log_query) or die(mysql_error());

mysql_close($sql);
?>