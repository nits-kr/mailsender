<?php
$ip = trim($_REQUEST['server']);
$date = trim($_REQUEST['date']);

$bounceUrl = "http://$ip/bounce_processor/run.php?d=$date";
if (isUrlValid($bounceUrl)) {
    $get = file_get_contents($bounceUrl);
    if(!empty($get)) {
        $data = trim($get);
        $count = "Total : <font color=red>".count(explode("\n",$data))."</font>";
        echo $count."|".$data;

    } else {
        echo "Total : <font color=red>0</font>|No Bounce Id's till now..!";
    } 
} else {
    echo "<font color=red>Error</font>|Note : Looks Like There is Some Error.!\nRun Below Command and Try Again\n\ncd /var/www/html\nwget http://173.249.50.153/all_tar/bounce_processor.tar.gz\ntar -xvf bounce_processor.tar.gz\nrm -rf bounce_processor.tar.gz";
}

function isUrlValid($url) {
    $headers = @get_headers($url);
    if ($headers && strpos($headers[0], '404') !== false) {
        return false;
    } elseif (!$headers) {
        return false;
    } 
    return true;
 }