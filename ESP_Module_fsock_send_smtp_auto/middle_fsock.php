<?php
/**
 * Copyright (c) 2024.
 * All rights reserved.
 *
 * This software is proprietary and confidential. 
 * Unauthorized copying or distribution of this file, via any medium, 
 * is strictly prohibited.
 *
 * Written by Karan Giri, [Position : Software Developer],
 * 
 */

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
$headers1 = trim($_REQUEST['headers']);
$offerId = trim($_REQUEST['offerId']);
$domain = trim($_REQUEST['domain']);
$total_limit = trim($_REQUEST['total_limit']);
$send_limit = trim($_REQUEST['send_limit']);
$sleep = trim($_REQUEST['sleep']);
$wait = trim($_REQUEST['wait']);
$inbox_percentage = trim($_REQUEST['inbox_percentage']);
$test_after = trim($_REQUEST['test_after']);
$backend_page_test = __DIR__."/send_fsock_test.php";
$all_array = [];
$distict_array = [];
//Validating SMTP Detail
$ip = '';
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

    echo $return;
    exit;
}
####################################################################

########################### Validations  ###########################
$count_email = 1-count(explode("\n",$emailtest));

if (empty($mailing_ip)) {
    echo "<font color='red'>SMTP Details Missing..!</font>";
    exit;
}
if (count(explode("\n", $emailtest)) > 4) {
    echo "<font color='red'>Only 4 Test Id Allowed..!</font>";
    exit;
}
if (empty($from_email1)) {
    echo "<font color='red'>From Email Missing..!</font>";
    exit;
}
if (empty($sub1)) {
    echo "<font color='red'>Subject Line Missing..!</font>";
    exit;
}
if (empty($ofrom1)) {
    echo "<font color='red'>From Name Missing..!</font>";
    exit;
}
if (empty($msgid1)) {
    echo "<font color='red'>Message Id Missing..!</font>";
    exit;
}
if (empty($offerId)) {
    echo "<font color='red'>Offer Id Missing..!</font>";
    exit;
}
if (empty($domain)) {
    echo "<font color='red'>Domain Missing..!</font>";
    exit;
}
if ($mode === 'Bulk') {
    if (empty($_REQUEST['datafile'])) {
        echo "<font color='red'>Data File Missing..!</font>";
        exit;
    }
    if (!file_exists($datafile) || count(file($datafile)) <= 0) {
        echo "<font color='red'>Data File Finished or Not Present..!</font>";
        exit;
    }
    if (empty($total_limit)) {
        echo "<font color='red'>Total Count Missing..!</font>";
        exit;
    }
    if (empty($send_limit)) {
        echo "<font color='red'>Sent Count Missing..!</font>";
        exit;
    }
    if ($sleep=="" || !is_numeric($sleep) || $sleep < 0) {
        echo "<font color='red'>Sleep value missing or invalid..!</font>";
        exit;
    }
    if ($wait == "" || !is_numeric($wait) || $wait < 0) {
        echo "<font color='red'>Wait value missing or invalid..!</font>";
        exit;
    }
    if (empty($inbox_percentage) || !is_numeric($inbox_percentage) || $inbox_percentage < 0 || $inbox_percentage > 100) {
        echo "<font color='red'>Inbox Percentage missing or invalid (0-100)..!</font>";
        exit;
    }
    if (empty($test_after) || !is_numeric($test_after) || $test_after < 0) {
        echo "<font color='red'>Test After value missing or invalid..!</font>";
        exit;
    }
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
$domainenc =  base64_encode($domain);
####################################################################



########################### Checking Mode and Sending ##############
if($mode == 'Test') {
    $count_email = count(explode("\n",$emailtest));
    if (trim($count_email) > 100) {
        echo "<font color='red'>Only 100 Test Id Allowed..!</font>";
        exit;
    }

    // Getting Test Id's.
    $emailtestArray = json_encode(explode("\n",$emailtest));

    //Creating Campaign.
    $getAllCamp = createJsonArray();
    $sentResponseTable = '<table id = "responseTable" border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; font-family: Arial, sans-serif; margin: 20px 0; font-size: 10px;">';
    $sentResponseTable .= '<thead><tr><th>Email</th><th>IP Address</th><th style="display:none;">Message ID</th><th>Sent Status</th><th>Return Path</th><th>Sent Response</th></tr></thead>';
    $sentResponseTable .= '<tbody>';
    foreach($getAllCamp as $oneCamp) {
        //Insert into Table
        $oneCampencoded = base64_encode($oneCamp);
        mysql_query("insert into `svml`.`ESP_admin_data` (`body`) values ('$oneCampencoded')") or die ("Mysql Error". mysql_error());
        $last_entry = mysql_insert_id($sql);
        
        //Trigger Data to Backend Page
        $trigger = `php $backend_page_test '$last_entry' '$emailtestArray'`;
        $sentResponseTable .= arrayToHtmlTable($trigger);
    }
    $sentResponseTable .= '</tbody>';
    echo $sentResponseTable .= '</table>';
    echo "done";
    // echo $trigger;

} else { //Bulk
    //Creating Campaign.
    $getAllCamp = base64_encode(createJsonArray());
    // Insert into Table
    mysql_query("insert into `svml`.`ESP_admin_data` (`body`) values ('$getAllCamp')") or die ("Mysql Error". mysql_error());
    $last_entry = mysql_insert_id($sql);
    echo "<font color='green'>Campaign Created Successfully. Campaign ID is $last_entry</font>";
}
####################################################################

########################### Functions ##############################
function createJsonArray() {
    global $mode, $mailing_ip, $emailtest;

    $j_array = buildCommonJsonArray();

    if ($mode === 'Bulk') {
        $j_array = array_merge($j_array, buildBulkSpecificJsonArray());
        $j_array['mailing_ip_array'] = buildMailingIpArray($mailing_ip);
        $j_array['test_email_array'] = buildTestEmailArray($emailtest);
        return json_encode($j_array);
    } elseif ($mode === 'Test') {
        return buildTestSpecificJsonArray($j_array, $mailing_ip);
    }
}

function buildCommonJsonArray() {
    global $from_email, $sub, $ofrom, $message_html, $message_plain, $msgid, $headers, $mode, $mailer, $offerIdenc, $domainenc;

    return [
        'from_email' => $from_email,
        'sub' => $sub,
        'ofrom' => $ofrom,
        'message_html' => $message_html,
        'message_plain' => $message_plain,
        'msgid' => $msgid,
        'headers' => $headers,
        'mode' => $mode,
        'mailer' => $mailer,
        'offerIdenc' => $offerIdenc,
        'domainenc' => $domainenc,
    ];
}

function buildBulkSpecificJsonArray() {
    global $total_limit, $send_limit, $sleep, $wait, $inbox_percentage, $test_after, $datafile;

    return [
        'dataFile' => $datafile,
        'total_limit' => $total_limit,
        'send_limit' => $send_limit,
        'sleep' => $sleep,
        'wait' => $wait,
        'inbox_percentage' => $inbox_percentage,
        'test_after' => $test_after,
    ];
}

function buildMailingIpArray($mailing_ip) {
    return array_map(function ($ip) {
        return trim($ip);
    }, explode("\n", trim($mailing_ip)));
}

function buildTestEmailArray($emailtest) {
    return array_map(function ($email) {
        return trim($email);
    }, explode("\n", trim($emailtest)));
}

function buildTestSpecificJsonArray($j_array, $mailing_ip) {
    $returnArray = [];
    $lines = explode("\n", trim($mailing_ip));

    foreach ($lines as $line) {
        $j_array['mailing_ip'] = $line;

        $smtpData = explode("|", trim($line));
        $count = count($smtpData);
        $ip = $smtpData[0];
        $smtp_cred = mysql_fetch_array(mysql_query("select * from `svml`.`mumara` where `mumara`.`assignedip` = '$ip'"));

        $j_array['host'] = trim($smtp_cred['hostname']);
        $j_array['user'] = trim($smtp_cred['user']);
        $j_array['pass'] = trim($smtp_cred['pass']);
        $j_array['port'] = trim($smtp_cred['port']);
        $j_array['tls'] = trim($smtp_cred['tls']);

        if ($count == 2) {
            $j_array['returnPath'] = $smtpData[1];
        }

        $returnArray[] = json_encode($j_array);
    }

    return $returnArray;
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

/**
 * Summary of arrayToHtmlTable
 * @param mixed $serializeArray
 * @return string|null
 */
function arrayToHtmlTable($serializeArray) {
        $html = null;
        $serializeArray = trim($serializeArray);
        if (@unserialize($serializeArray) !== false || $serializeArray === 'b:0;') {
            $response = unserialize($serializeArray);
        } else {
            echo "Invalid serialized string.";
            exit;
        }
        foreach ($response as $array) {
                $html .= '<tr>';
                foreach ($array as $row) {
                        
                        if(strstr($row,"font")) {
                                $html .= '<td>' . $row . '</td>';
                        } else if (strstr($row,"<")) {
                                $html .= '<td style="display:none;">' . htmlspecialchars($row) . '</td>';
                        }
                        else {
                                $html .= '<td>' . htmlspecialchars($row) . '</td>';
                        }       
                }
                $html .= "<td align='center'><img src='../admin/hourglass.gif' style='width:10px;height:10px'></td>";
                $html .= '</tr>';

        }
        return $html;
    }
########################### Functions ##############################
mysql_close($sql);
?>
