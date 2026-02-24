<?php
####################### Initializing ###################################
date_default_timezone_set('US/Eastern');
ini_set("memory_limit","-1");
$d=date('Y-m-d');
$backend_page = __DIR__."/send_fsock.php";
$backend_directory = __DIR__;

$oneCamp = trim($argv[1]);
//Parallel For Data;
$emails = json_decode(trim($argv[2]));
$fromemail1 = trim($argv[3]);

foreach($emails as $email) {
    $email_array = array();array_push($email_array,$email); 
    $email = json_encode($email_array);
    `php $backend_page '$oneCamp' '$email' >> $backend_directory/out/$fromemail1 &`;
}

