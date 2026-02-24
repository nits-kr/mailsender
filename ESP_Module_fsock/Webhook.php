<?php
date_default_timezone_set('US/Eastern');
ini_set("memory_limit","-1");
$d=date('Y-m-d');
$mailing_ip = trim($_REQUEST['mailing_ip']);
$lines = explode("\n",trim($mailing_ip));
foreach($lines as $line) {

    $smtpData = explode("|",trim($line));
    $account = base64_encode(trim($smtpData[0]));

    switch (trim($smtpData[1])) {
        case "smtp.sendgrid.net" : echo $_SERVER["HTTP_REFERER"]."/webhook_handler/sendgrid.php?account=$account<br>";
    }
}
?> 