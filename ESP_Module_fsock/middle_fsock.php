<?php
include "include.php";
date_default_timezone_set('US/Eastern');
ini_set("memory_limit","-1");
$d=date('Y-m-d');
####################### Variables ###################################
$mailer = trim($_REQUEST['session_id']);
$from_email1=trim($_REQUEST['from_email']);
$sub1 = trim($_REQUEST['sub']);
$sencode = trim($_REQUEST['sencode']);
$ofrom1 = trim($_REQUEST['from']);
$fmencode= trim($_REQUEST['fmencode']);
$mode = trim($_REQUEST['mode']);
$datafile = "/var/www/data/".trim($_REQUEST['datafile']);
$msgid1 = trim($_REQUEST['msgid']);
$mailing_ip = trim($_REQUEST['mailing_ip']);
$emailtest = trim($_REQUEST['emails']);
$message_html1 = trim($_REQUEST['message_html']);
$message_plain1 = trim($_REQUEST['message_plain']);
$total_limit = trim($_REQUEST['total_limit']);
$send_limit = trim($_REQUEST['send_limit']);
$headers1 = trim($_REQUEST['headers']);
$offerId = trim($_REQUEST['offerId']);
$backend_page_test = __DIR__."/send_fsock.php";
$backend_page_bulk = __DIR__."/parallel_fsock.php";
$backend_directory = __DIR__;
$all_array = [];
$distict_array = [];
//Validating SMTP Detail
$lines = explode("\n",trim($mailing_ip));
foreach($lines as $line) {
    $lines = explode("|",trim($line));
    $all_array[] = $lines[0];
    $ip .= "'".$lines[0]."',";
}
$ip = rtrim($ip,",");
$smtp_cred_check = mysql_fetch_array(mysql_query("select group_concat(`mumara`.`assignedip`) from `svml`.`mumara` where `mumara`.`assignedip` in ($ip)"));
$fetched_array = explode(",",$smtp_cred_check[0]);
$distict_array = array_diff($all_array,$fetched_array);
if(!empty($distict_array)) {
    $return ="<pre>";
    foreach($distict_array as $notexistip) {
        $return .= "$notexistip <font color='red'> Not Exist </font><br>";
    }
    $return .= "</pre>";

    echo $return."|$total_limit";
    exit;
}
####################################################################

########################### Validations  ###########################
$count_email = 1-count(explode("\n",$emailtest));

if(!$mailing_ip){
    echo "<font color='red'>SMTP Details Missing..!</font>|$total_limit";
    exit;
}
if (trim($count_email) > 4 ) {
    echo "<font color='red'>Only 4 Test Id Allowed..!</font>|$total_limit";
    exit;
}
if (!$from_email1) {
    echo "<font color='red'>From Email Missing..!</font>|$total_limit";
    exit;
}
if (!$sub1) {
    echo "<font color='red'>Subject Line Missing..!</font>|$total_limit";
    exit;
}
if (!$ofrom1) {
    echo "<font color='red'>From Name Missing..!</font>|$total_limit";
    exit;
}
if ($mode == 'Bulk' && !$_REQUEST['datafile']) {
    echo "<font color='red'>Data File Missing..!</font>|$total_limit";
    exit;
}
if ($mode == 'Bulk' && count(file($datafile)) <= 0) {
    echo "<font color='red'>Data File Finished..!</font>|$total_limit";
    exit;
}
if ($mode == 'Bulk' && !$total_limit) {
    echo "<font color='red'>Total Count Missing..!</font>|$total_limit";
    exit;
}
if ($mode == 'Bulk' && !$send_limit) {
    echo "<font color='red'>Sent Count Missing..!</font>|$total_limit";
    exit;
}
if (!$msgid1) {
    echo "<font color='red'>Message Id Missing..!</font>|$total_limit";
    exit;
}
if( !$offerId) {
    echo "<font color='red'>Offer Id Missing..!</font>|$total_limit";
    exit;
}
####################################################################

########################### Subject/From Encoding ##################
switch ($sencode) {
    case 'ascii' : $sr=ascii2hex($sub1);$sub2 = "=?UTF-8?Q?".$sr."?=";break;
    case 'base64' : $sr=base64_encode($sub1);$sub2 = "=?UTF-8?B?".$sr."?=";break;
    default : $sub2 = $sub1;
}

switch ($fmencode) {
    case 'ascii' : $fr=ascii2hex($ofrom1);$ofrom2 = "=?UTF-8?Q?".$fr."?=";break;
    case 'base64' : $fr=ascii2hex($ofrom1);$ofrom2 = "=?UTF-8?Q?".$fr."?=";break;
    default : $ofrom2=$ofrom1;
}
####################################################################


########################### Base64 Variables #######################
$from_email = base64_encode($from_email1);
$sub = base64_encode($sub2);
$ofrom = base64_encode($ofrom2);
$message_html = base64_encode($message_html1);
$message_plain = base64_encode($message_plain1);
$msgid = base64_encode($msgid1);
$headers = base64_encode($headers1);
$offerIdenc =  base64_encode($offerId);
####################################################################



########################### Checking Mode and Sending ##############
if($mode == 'Test') {
    $count_email = count(explode("\n",$emailtest));
    if (trim($count_email) > 100) {
        echo "<font color='red'>Only 100 Test Id Allowed..!</font>|$total_limit";
        exit;
    }

    // //Delete Old Record and Keep 250
    // $limit = 250;                                   //Change according to you (this is best fit)
    // mysql_query("delete from `svml`.`ESP_admin_data` where `ESP_admin_data`.`entity_id` not in ( select `ESP_admin_data`.`entity_id` from ( select `ESP_admin_data`.`entity_id` from `svml`.`ESP_admin_data` order by `ESP_admin_data`.`entity_id` desc limit $limit ) esp )");


    // Getting Test Id's.
     $emailtestArray = json_encode(explode("\n",$emailtest));

    //Creating Campaign.
    $getAllCamp = createJsonArray();
    foreach($getAllCamp as $oneCamp) {
        //Insert into Table
        $oneCampencoded = base64_encode($oneCamp);
        mysql_query("insert into `svml`.`ESP_admin_data` (`body`) values ('$oneCampencoded')") or die ("Mysql Error". mysql_error());
        $last_entry = mysql_insert_id($sql);

        //Trigger Data to Backend Page
        $trigger .= `php $backend_page_test '$last_entry' '$emailtestArray'`;
    }
    echo $trigger."|$total_limit";

} else { //Bulk

    //Check Data file Present
    if(!file_exists("$datafile")) {
        echo "<font color='red'>Data File not Present..!</font>|$total_limit";
        exit;
    }

    // //Delete Old Record and Keep 250
    // $limit = 250;                                 //Change according to you (this is best fit)
    // mysql_query("delete from `svml`.`ESP_admin_data` where `ESP_admin_data`.`entity_id` not in ( select `ESP_admin_data`.`entity_id` from ( select `ESP_admin_data`.`entity_id` from `svml`.`ESP_admin_data` order by `ESP_admin_data`.`entity_id` desc limit $limit ) esp )");

    //Getting Data
    $data = provideData();
    $bulkCount = 0;
    if(!is_array($data)) {
        echo $data;
    } else {
        $trigger = null;
        //Trigger Data to Backend Page
        //Creating Campaign.
        $getAllCamp = createJsonArray();
        foreach($getAllCamp as $oneCamp) {
            //Insert into Table
            $oneCampencoded = base64_encode($oneCamp);
            mysql_query("insert into `svml`.`ESP_admin_data` (`body`) values ('$oneCampencoded')") or die ("Mysql Error". mysql_error());
            $last_entry = mysql_insert_id($sql);

            //----------------------------------------------------- Trigger For Test Data -----------------------------------------------------
            // Getting Test Id's.
            $emailtestArray = json_encode(explode("\n",$emailtest));
            `php $backend_page_test '$last_entry' '$emailtestArray' 'Bulk Test' >> $backend_directory/out/$from_email1 &`;

            //----------------------------------------------------- Trigger For Bulk Data -----------------------------------------------------
            // Trigger Data to Backend Page
            $dataJson = json_encode($data[$bulkCount]);
            `php $backend_page_bulk '$last_entry' '$dataJson' '$from_email1' >> $backend_directory/out/$from_email1 &`;
            $trigger += $send_limit;
            $bulkCount++;
        }
        // Data File Count 
        $dfile = file($datafile);
        $dfileCount = count($dfile);
        
        if ($emailtest == '') {
            $result = "Send SucessFully to $trigger Bulk Emails <br>Data File Count :".$dfileCount."<br>";

        } else {
            $result = "Send SucessFully to $trigger Bulk Emails and ".count(explode("\n",$emailtest))." Test Email. <br>Data File Count :".$dfileCount."<br>";
        }
        echo $result."|$total_limit";
    }
}
####################################################################

########################### Functions ##############################
function createJsonArray() {
    global $from_email, $sub, $ofrom, $message_html, $charen, $contend, $type, $message_plain, $charen_alt, $contend_alt, $msgid, $replyto, $xmailer, $mailing_ip, $send_limit, $headers, $mode, $mailer, $offerIdenc;
    $j_array = array();
    $returnArray = array();
    $lines = explode("\n",trim($mailing_ip));
    foreach($lines as $line) {
        //Adding Basic Variable
        $j_array['from_email'] = $from_email;
        $j_array['sub'] = $sub;
        $j_array['ofrom'] = $ofrom;
        $j_array['message_html'] = $message_html;
        $j_array['message_plain'] = $message_plain;
        $j_array['msgid'] = $msgid;
        $j_array['headers'] = $headers;
        $j_array['mode'] = $mode;
        $j_array['mailing_ip'] = $line;
        $j_array['mailer'] = $mailer;
        $j_array['offerIdenc'] = $offerIdenc;
        


        //Adding SMTP Variable
        $smtpData = explode("|",trim($line));
        $count = count($smtpData);
        $ip = $smtpData[0];
        $smtp_cred = mysql_fetch_array(mysql_query("select * from `svml`.`mumara` where `mumara`.`assignedip` = '$ip'"));      
        $j_array['host'] = trim($smtp_cred['hostname']);
        $j_array['user'] = trim($smtp_cred['user']);
        $j_array['pass'] = trim($smtp_cred['pass']);
        $j_array['port'] = trim($smtp_cred['port']);
        $j_array['tls'] = trim($smtp_cred['tls']);
        if($count == 2) {
            $j_array['returnPath'] = $smtpData[1];
        }

        //Creatin Json
        $jsonData = json_encode($j_array);
        array_push($returnArray,$jsonData);
    }
    return $returnArray;
#####################################################################
}

function provideData() {
    global $datafile, $total_limit, $send_limit, $mailing_ip;
    $countOfSMTP = count(explode("\n",$mailing_ip));
    $totalChunkNeed = ($countOfSMTP*$send_limit);
    $linesnew = file($datafile);

    //Checking For Limit
    if(($total_limit < 1) || ($totalChunkNeed > $total_limit)) {
        return "<strong>Data file count: ".count($linesnew)."<br>Total Limit Reached</strong><br>Total Limit atleast should have $totalChunkNeed count to send mail.|$total_limit";
    }

    //Checking For Enough File.
    if(count($linesnew) < $send_limit){
        return "<strong>Data file $datafile count: ".count($linesnew)."<br>Data file Finished</strong><br> <strong>|$total_limit";
    }

    //Cutting Data From File
    $req_emails = array_slice($linesnew,0,$totalChunkNeed);
    $del = array_slice($linesnew,$totalChunkNeed);
    $file = fopen($datafile, 'w');
    fwrite($file, implode('', $del));
    fclose($file);

    //Chunking Data
    $returnDataArray = array_chunk($req_emails,$send_limit);
    $total_limit = ($total_limit-$totalChunkNeed);

    return $returnDataArray;
}

function ascii2hex($ascii) {
  $hex = '';
  for ($i = 0; $i < strlen($ascii); $i++) {
    $byte = strtoupper(dechex(ord($ascii{$i})));
    $byte = "=".str_repeat('0', 2 - strlen($byte)).$byte;
    $hex.=$byte;
  }
  return $hex;
}
########################### Functions ##############################
mysql_close($sql);
?>
