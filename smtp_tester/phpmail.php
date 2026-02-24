<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;
require 'vendor/autoload.php';

$server = $_REQUEST['server'];
$usr= $_REQUEST['usr'];
$pass= $_REQUEST['pass'];
$port = $_REQUEST['port'];
$tls= $_REQUEST['tls'];
$ip_pair=trim($_REQUEST['ip']);
$ofrom = $_REQUEST['from'];
$emails = $_REQUEST['emails'];
$ids = explode("\n",$emails);
$sub = $_REQUEST['sub'];
$message = $_REQUEST['message'];
// Instantiation and passing `true` enables exceptions
$mail = new PHPMailer(true);

try {
    //Server settings
    $mail->SMTPDebug = 2;                                                  // Enable verbose debug output
    $mail->isSMTP();                                                             // Send using SMTP
    $mail->Host       = $server ;                                           // Set the SMTP server to send through
    $mail->SMTPAuth   = true;                                             // Enable SMTP authentication
    $mail->Username   = $usr;                                            // SMTP username
    $mail->Password   = $pass;                                          // SMTP password
    if($tls == 'No')
	{
		$mail->SMTPSecure = false;
		$mail->SMTPAutoTLS = false;
	}
    else
	{
    		$mail->SMTPSecure = $tls ;                                          // Enable TLS encryption; `PHPMailer::ENCRYPTION_SMTPS` also accepted
     	}
    $mail->Port       =  $port ;                                             // TCP port to connect to

    //Recipients
    $mail->setFrom($ip_pair, $ofrom);
    foreach($ids as $id)
    {
    	$mail->addAddress($id);                  // Add a recipient
	}
	   $mail->addReplyTo($ip_pair, $ofrom);

    // Content
    $mail->isHTML(true);                                                                             // Set email format to HTML
    $mail->Subject = $sub;
    $mail->Body    = $message;

    $mail->send();
    echo 'Message has been sent';
} catch (Exception $e) {
    echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
}
?>
