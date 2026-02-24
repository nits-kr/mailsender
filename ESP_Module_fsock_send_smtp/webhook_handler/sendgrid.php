<?php
date_default_timezone_set('Asia/Kolkata');
ini_set("memory_limit","-1");
$d=date('Y-m-d');
$data = file_get_contents("php://input");
$events = json_decode($data, true);
$account = base64_decode($_REQUEST['account']);
$current_dir = __DIR__.'/data/'.$account;
$webhookFolder = __DIR__.'/data/*';

//Creating Folder 
if (!file_exists($current_dir)) {
    mkdir($current_dir, 0777, true);
}
 
// file_put_contents($current_dir.'/filename.txt', print_r($events, true));

foreach ($events as $event) {
    file_put_contents($current_dir.'/'.$event['event'].'-'.$d.'.txt',$event['email']."\n",FILE_APPEND);
}
`sudo chmod -R 0777 $webhookFolder`;