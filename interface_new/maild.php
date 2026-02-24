<B><U>Results:</U></B><BR><BR>
<?php
include_once "../Swift-5.0.3/lib/swift_required.php";
ini_set("memory_limit","1520M");
$sub = $_REQUEST['sub'];
$ofrom = $_REQUEST['from'];
$msg = $_REQUEST['message'];
$limit = $_REQUEST['limit'];
$emails = $_REQUEST['emails'];
$offer = $_REQUEST['offer'];
$userid = $_REQUEST['userid'];
$domain = $_REQUEST['domain'];
$type = $_REQUEST['type'];
$data = $_REQUEST['data'];
$mode = $_REQUEST['mode'];
$head= $_REQUEST['head'];
$server = $_REQUEST['server'];
$usr= $_REQUEST['usr'];
$pass= $_REQUEST['pass'];
$port = $_REQUEST['port'];
$tls= $_REQUEST['tls'];
$ip_pair=trim($_REQUEST['ip']);
$d = @date("YmdHis");
$url="$offer#$id";
$url = base64_encode($url);
echo $msg;
$url="$offer#$id";
$url = base64_encode($url);
$message_html=str_replace("{domain}",$domain,$msg);
$message_html=str_replace("{url}",$url,$message_html);
$message_html=str_replace("{email}",$email,$message_html);
$message_html=str_replace("{name}",$name,$message_html);
$message_html=str_replace("{id}",$id,$message_html);
$from = array();
$from[$ip_pair] = $ofrom; 
$to = array($email => '');

### change for smtp setup
## SMTP2GO
$username = $usr;
$password = $pass;
if($tls == 'No')
$transport = Swift_SmtpTransport::newInstance($server, $port);
else
$transport = Swift_SmtpTransport::newInstance($server, $port, 'tls');
########
$transport->setUsername($username);
$transport->setPassword($password);
$swift = Swift_Mailer::newInstance($transport);
$swift->registerPlugin(new Swift_Plugins_AntiFloodPlugin(100));
//$swift->registerPlugin(new Swift_Plugins_AntiFloodPlugin(100, 30));
$message = new Swift_Message($sub);
$message->setFrom($from);
if($type == 'plain')
$message->setBody($message_html, 'text/plain');
if($type == 'html')
$message->setBody($message_html, 'text/html');
//$message->addPart($message_text, 'text/plain');
if($mode=='test')
{
	$lines=explode("\n",$emails);
	$st = date("Y-m-d G:i:s");
	foreach ($lines as $email)
	{
	$to = array($email => '');
	$message->setTo($to);
	$swift->send($message, $failures);
	}
echo "..........done";	
}
elseif($mode == "bulk") // Bulk mailing 
{
$count=0;
$datafile="/var/www/data/$data";
$fp = fopen($datafile,"r");
while(!feof($fp))
        {
               $buffer = fgets($fp, 4096);
               @list($email,$id,$isp)=explode("|",$buffer);
			   $email =trim($email);
               if($limit > 1)
                {
			$to = array($email => '');
			$message->setTo($to);
			$swift->send($message, $failures);

		  }
		$count++;
       if($count%$limit==0)
                { 
					if($limit > 1)
					{
						del_lines($data,$limit);
					}
					$lines=explode("\n",$emails);
					foreach ($lines as $email)
					{
						$to = array($email => '');
						$message->setTo($to);
						$swift->send($message, $failures);	
					}			
# exec ("wget -b -O /dev/null -o /dev/null 'http://aps-ui.com/sent.php?oid=$offer&c=$count'");
					break;   
                }
        }echo"............done";	
}
function del_lines($files,$X)
{
#       @chmod($files,0777);
	$files="/var/www/data/$files";
        $start=count(file($files));
        $lines = file($files);
        $first_line = $lines[0];
        $lines = array_slice($lines, $X);
		// Write to file
        $file = fopen($files, 'w');
        fwrite($file, implode('', $lines));
        fclose($file);
        $end=count(file($files));
        $diff=$start-$end;

        echo "<br><br> No of ids in the file Before: <B>$start</B>  After: <B>$end</B> Difference is <b>$diff</b><br>";
		if($diff==0){echo "<blink> <b> Change the Mode of the File or Data file is finished </b></blink>"; }
}

?>
