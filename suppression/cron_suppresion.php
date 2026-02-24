<?php
// Check for Running Cron Service
$pidList = `ps -ef | grep "php /var/www/html/suppression/supp.php" | grep -v " --color=auto" | grep -v "grep php /var/www/html/suppression/supp.php" | awk '{print $2}' | wc `;
if($pidList > 0) {
    exit;
}

include __DIR__."/include.php";
$query = "SELECT `offer_supp_queue`.`sno`, `offer_supp_queue`.`command` FROM `suppression_v2`.`offer_supp_queue` where status = 0 order by 1 limit 1";
$data = mysql_fetch_array(mysql_query($query)) or die (mysql_error());
$command = trim($data[1]);
$sno = trim($data[0]);
mysql_query("UPDATE `suppression_v2`.`offer_supp_queue` set `status`='2' WHERE `sno`=$sno");
$log_file = __DIR__."/logs/$data[sno].log";
$cmd = `$command $sno > $log_file &`;



