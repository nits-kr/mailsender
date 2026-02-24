<?php
date_default_timezone_set('Asia/Kolkata');
ini_set("memory_limit","-1");
$d=date('Y-m-d');
$mailing_ip = trim($_REQUEST['mailing_ip']);
$lines = explode("\n",trim($mailing_ip));
$table = "<center>";
foreach($lines as $line) {
    $smtpData = explode("|",trim($line));
    $account = str_replace("@","\@",trim($smtpData[0]));
    $current_dir = __DIR__.'/webhook_handler/data/'.$account;
    $table .= "<table border=1; style='border-collapse: collapse;width: 50%;'><tbody><tr><th colspan=2 align='center' style='background: cadetblue;'><strong>$smtpData[0]</strong></th>";
    $response = `wc -l $current_dir/*$d* | grep -v 'total' | sed 's|/var/www/html/ESP_Module/webhook_handler/data/$smtpData[0]/||g' | sed 's|-$d.txt||g'`;
    $multiData = explode("\n",$response);
    foreach($multiData as $singleData) {
        $correctData = explode(" ",trim($singleData));
        $table .= "<tr>";
        $table .= "<td align='center'>".strtoupper($correctData[1])."</td>";
        $table .= "<td align='center'>$correctData[0]</td>";
        $table .= "</tr>";
    }
    $table .= "</tbody></table><br>";
}
$table .= "<center>";
echo $table
?>
 