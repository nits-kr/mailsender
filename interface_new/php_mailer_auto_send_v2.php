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

error_reporting(0);
ini_set("memory_limit", "1520M");
include "/var/www/html/interface_new/include.php";

$allowedTimeToWait = 900; // 15 Min to Wait

if($argv[1] == null) {
    printMessage("Script ID Not Provided..! Stopping..!");
    exit;
} else {
    $svmlId = trim($argv[1]);
    printMessage("Auto Sending Started with $svmlId..!");

    // Pulling Template
    $templateDetails = pullTemplateDetails($svmlId);
    
    // Approval Check
    printMessage("Checking Approval..!");
    checkApproval($templateDetails);

    // // Check For DataFile
    // printMessage("Checking DataFile..!");
    // checkDataFile($templateDetails);

    // Calling Main Handler Inbox Test and Bulk Sending Fuction
    $totalSendLimit = trim($templateDetails['limits']);
    $successSentCount = 0;
    while($successSentCount <= $totalSendLimit) {
        $successSentCount += mainHandler($svmlId);
        printMessage("--------------------------------------------------");
    }

    printMessage("Campaign Completed..! Stopping..!");
}
mysql_close($link);

/**
 * Main Handler Fucntion for Inbox Test and Bulk Sending.
 * @param mixed $svmlId
 * @return float|int
 */
function mainHandler($svmlId) {

    // Pulling Template
    $templateDetails = pullTemplateDetails($svmlId);

    // Triggering Test Email 
    printMessage("Getting Random Email & Ip For Testing..!");
    $testEmailAndIps = getRandomIpsAndEmails($templateDetails);
    // print_r($testEmailAndIps);

    // Sending Test Email
    printMessage("Sending Test Email..!");
    $sentMessageIDArray = sendTestEmail($svmlId, $testEmailAndIps);
    // print_r($sentMessageIDArray);
    
    // Checking Mail Sent Status
    printMessage("Checking Test Email Sent Status..!");
    if(!checkMailSentStatus($sentMessageIDArray)) {
        printMessage("Some Test Mail Failed To Sent..! Stopping Auto Script..!");
        exit;
    } else {
        printMessage('Test Email Sent SucessFully..!');
    }

    // Checking Test Mail Status.
    $inboxPercentage = $templateDetails['inbox_patt'];
    printMessage("Checking Inbox Status and Matching Percentage ..! GIVEN : $inboxPercentage%");
    if(!matchInboxPercentage($sentMessageIDArray,$inboxPercentage, $svmlId)) {
        printMessage("Inbox Percentage Not Matched..! Stopping Auto Script..!");
        exit;
    } else {
        printMessage('Inbox Percentage Matched..!');
    }

    // Sending Bulk Email.
    printMessage('Sending Bulk Email..!');
    $retestAfter = trim($templateDetails['retest_after']);
    $sleepTime = trim($templateDetails['sleep_time']);
    $sentCountBeforeRetest = 0;
    while($sentCountBeforeRetest < $retestAfter) {
        $sentCountBeforeRetest += sendBulkMails($templateDetails);
        // Sleeping Time As provided
        printMessage("Sleeping for $sleepTime sec as provided..!");
        sleep($sleepTime);
    }

    if($sentCountBeforeRetest >= $retestAfter) {
        return $sentCountBeforeRetest;
    }
}


/**
 * Utility function to print messages
 * @param mixed $karan
 * @return void
 */
function printMessage($karan) {
    echo $karan . "\n";
}

/**
 * Utility function to Pull Template
 * @param mixed $svmlId
 * @return array
 */
function pullTemplateDetails($svmlId) {
    $details = mysql_fetch_array(mysql_query("select * from `svml`.`svml_sendgrid` where `svml_sendgrid`.`sno`='$svmlId'"), MYSQL_ASSOC);
    return($details);
}

/**
 * Utility function to Check Template Approval
 * @param array $detail
 * @return void
 */
function checkApproval(array $detail) {
    $status = $detail['status'];
    if (($status == 0) || ($status == null)) {
        printMessage("Your Templete $detail[sno] Is Being To Check..!");
        exit;
    } else if ($status == 2) {
        printMessage("Your Templete $detail[sno] Is Rejected..!");
        exit;
    } else {
        printMessage("Your Templete $detail[sno] Is Approved..!");
    }
}

/**
 * Utility function to Check Template DataFile
 * @param mixed $detail
 * @return void
 */
function checkDataFile($detail) {
    $dataFile = "/var/www/data/$detail[data]";
    $dataFileCount = count(file($dataFile));
    $totalCount = $detail['limits'];
    if (!file_exists($dataFile)) {
        printMessage("Data file not found: $dataFile");
        exit;
    }
    if($dataFileCount < $totalCount) {
        printMessage("Data File is less then Expected count || Email Present in DataFile: $dataFileCount || Total Send Count : $totalCount");
        exit;
    } else {
        printMessage("Data File Seems Fine || Email Present in DataFile: $dataFileCount || Total Send Count : $totalCount");
    }
}

/**
 * Utility function to provide Random IP & Email to Send Test Email
 * @param mixed $details
 * @return array
 */
function getRandomIpsAndEmails($details) {
    // Logic
    // If IP > 3  -> Return Random 3
    // IF IP <= 3 -> Return All
    // IF Email > 2  -> Return Random 2
    // IF Email <= 2 -> Return All
    $emails = trim($details['emails']);
    $ips = trim($details['mutidomains']);

    $emailArray = explode(PHP_EOL,$emails);
    $ipsArray = explode(PHP_EOL,$ips);

    $emailCount = count($emailArray);
    $ipsCount = count($ipsArray);

    // Logic for IPs
    if ($ipsCount > 3) {
        // Shuffle the array and return the first 3 IPs
        shuffle($ipsArray);
        $ipsArray = array_slice($ipsArray, 0, 3);
    }
    
    // Logic for Emails
    if ($emailCount > 2) {
        // Shuffle the array and return the first 2 Emails
        shuffle($emailArray);
        $emailArray = array_slice($emailArray, 0, 2);
    }
    
    return array('ips' => $ipsArray, 'emails' => $emailArray);
}

/**
 * Utility function to send test email
 * @param mixed $svmlId
 * @param mixed $data
 * @return array
 */
function sendTestEmail($svmlId, $data) {
    $ips = $data['ips'];
    $emailEncoded = base64_encode(implode("\n",$data['emails']));
    $emailCount = count($data['emails']);
    // Initialize the success mail array
    $sentMessageID = [];
    foreach ($ips as $ip) {
        $cmd = "php ".__DIR__."/maild_man_lu_new.php '$svmlId' '$emailEncoded' '$ip' 'record'";
        echo exec($cmd)."\n";
        // Getting MesageID Array
        $messageIdFetch = mysql_query("select `email`,`msgid` from `svml`.`auto_script_test_status` where `svml_sendgrid_id` = $svmlId order by sno desc limit $emailCount");
        // Check if the query returns any results
        if ($messageIdFetch) {
            while($row = mysql_fetch_array($messageIdFetch,MYSQL_ASSOC)) {
                // If the email is not set in the success mail array, initialize it as an empty array
                if (!isset($sentMessageID[$row['email']])) {
                    $sentMessageID[$row['email']] = []; // Create an array for this email
                }
                // Push the msgid into the email array
                array_push($sentMessageID[$row['email']], $row['msgid']);
            }
        }
    }
    return $sentMessageID;
}

/**
 * Utility function to Check Sent Mail Status
 * @param mixed $inputArray
 * @return bool
 */
function checkMailSentStatus($inputArray) {
    // Loop through each email in the main array 
    $concat = null;
    foreach ($inputArray as $email => $innerArray) {
        $concat .= implode("','",$innerArray)."','";
    }
    $concat = rtrim($concat,"','");
    // Check for Not test Email Not sent 
    $checkQuery = mysql_num_rows(mysql_query("select sno from `svml`.`auto_script_test_status` where `msgid` in ('$concat') and sent_status = 0"));
    if($checkQuery > 0) {
        return false; 
    }
    return true;
}

/**
 * Utility function to Check Inbox Percentage and Regrigger Mechanism
 * @param mixed $inputArray
 * @param mixed $givenInboxPer
 * @return bool
 */
function matchInboxPercentage($inputArray, $givenInboxPer, $svmlId) {
    // Get total Sent Email
    global $allowedTimeToWait;
    global $svmlId;
    $totalSuccessSentMail = array_sum(array_map('count', $inputArray));
    $totalSuccessRecievedMail = 0;
    $inboxCount = 0;
    $spamCount = 0;
    $fetchedInboxPer = 0;
    printMessage("Total Mail Sent : $totalSuccessSentMail || Total Mail Recieved : $totalSuccessRecievedMail || INBOX : $inboxCount || SPAM : $spamCount || MAIL STATUS : ".giveMailStatus($inputArray)." || Inbox Percentage : $fetchedInboxPer%");
    $initialSecond = date('h:i:s');

    while($totalSuccessSentMail != $totalSuccessRecievedMail) {
        // Check response and update auto log table
        foreach ($inputArray as $email => $innerArray) {
            $result = implode("','",array_map(function($id) { return "<$id>";}, $innerArray));
            $checkStatusQuery = mysql_query("select `message_id`,`status` from `imap_data_new`.`$email` where `message_id` IN ('$result')");
            while($fetchResponse = mysql_fetch_array($checkStatusQuery,MYSQL_ASSOC)) {
                $modifiedMessageId = str_replace(">","",str_replace("<","",$fetchResponse['message_id']));
                mysql_query("UPDATE `svml`.`auto_script_test_status` SET `status` = '$fetchResponse[status]' WHERE `msgid` = '$modifiedMessageId' AND `status` IS NULL");
                
                // Incrementing variables
                if(mysql_affected_rows() > 0) {
                    $fetchResponse['status'] === "INBOX" ? $inboxCount++ : ($fetchResponse['status'] === "SPAM" ? $spamCount++ : null);
                    $totalSuccessRecievedMail += mysql_affected_rows();
                    $fetchedInboxPer = ($inboxCount / $totalSuccessSentMail) * 100;
                    $inputArray = modifyMsgIdArray($inputArray, $email,$modifiedMessageId);
                }
            }
        }
        printMessage("Total Mail Sent : $totalSuccessSentMail || Total Mail Recieved : $totalSuccessRecievedMail || INBOX : $inboxCount || SPAM : $spamCount || MAIL STATUS : ".giveMailStatus($inputArray)." || Inbox Percentage : $fetchedInboxPer%");
        sleep(5);

        // Retrigger Test Email if All Mail Not Fetched with in 10 Minute ~ 600 second
        $currentSecond = date("h:i:s");
        if(timeDifferenceInSeconds($initialSecond, $currentSecond) > $allowedTimeToWait) {
            printMessage("Exceed Wait Time..! Re-Triggering Test Email..!!");
            mainHandler($svmlId); // Call the mainHandler again
            return false;
        };
    }
    if ($totalSuccessSentMail == $totalSuccessRecievedMail && $fetchedInboxPer >= $givenInboxPer) {
        return true;
    } else {
        return false;
    }
}

/**
 * Summary of giveMailStatus
 * @param mixed $inputArray
 * @return string
 */
function giveMailStatus($inputArray) {
    $outputArray = array();
    foreach ($inputArray as $email => $messages) {
        $count = count($messages);
        $outputArray[] = $email . " " . $count;
    }
    $outputString = implode(" | ", $outputArray);
    return $outputString;
}

function modifyMsgIdArray($inputArray, $email, $resposeMsgid) {
    // Find and remove it from the specific sub-array
    if(($key = array_search($resposeMsgid, $inputArray[$email])) !== false) {
        unset($inputArray[$email][$key]);
    }

    // Reindex the array to remove gaps in keys
    $inputArray[$email] = array_values($inputArray[$email]);
    return $inputArray;
}

/**
 * Summary of sendBulkMails
 * @param mixed $templateDetails
 * @return float|int
 */
function sendBulkMails($templateDetails) {
    global $svmlId;
    $loopCount = 0;
    $triggerCount = 0;
    $d = date('Y-m-d');
    $datafile = "/var/www/data/".trim($templateDetails['data']);
    $fromEmail = trim($templateDetails['ip']);
    $total_limit = trim($templateDetails['limits']);
    $send_limit = trim($templateDetails['limit_to_send']);
    $waitTime = trim($templateDetails['sleep']);
    $mailing_ip = trim($templateDetails['mutidomains']);
    $ipsArray = explode("\n",$mailing_ip);

    // Get Cummulative Data
    $getData = provideData($datafile, $total_limit, $send_limit, $mailing_ip);
    foreach($ipsArray as $ip) {
        $emailEncoded = base64_encode(implode("\n",$getData[$loopCount]));
        $cmd = "php ".__DIR__."/maild_man_lu_new.php '$svmlId' '$emailEncoded' '$ip' >> ".__DIR__."/out/" . $fromEmail . "_" . $d . " &";
        exec($cmd);
        $loopCount++;
        $triggerCount += $send_limit;

        // Data File Count 
        $dfileCount = count(file($datafile));
        printMessage("Send SucessFully to $send_limit Bulk Emails || IP : $ip || Remaining Data File Count : $dfileCount");

        // Wait For Provided Wait time
        printMessage("Waiting for $waitTime sec as provided..!");
        sleep($waitTime);
    }

    return $triggerCount;
}

/**
 * Utility function to Manupulate DataFile & Provide Data to Send Bulk Email
 * @return array|string
 */
function provideData($datafile, $total_limit, $send_limit, $mailing_ip) {
    $countOfSMTP = count(explode("\n",$mailing_ip));
    $totalChunkNeed = ($countOfSMTP*$send_limit);
    $linesnew = file($datafile);

    //Checking For Limit
    if(($total_limit < 1) || ($totalChunkNeed > $total_limit)) {
        printMessage("Data file count: ".count($linesnew)."\nTotal Limit Reached\nTotal Limit atleast should have $totalChunkNeed count to send mail.| $total_limit");
        exit;
    }

    //Checking For Enough File.
    if(count($linesnew) < $send_limit){
        printMessage("Data file $datafile count: ".count($linesnew)."\nData file Finished\n | $total_limit");
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

/**
 * Utility function to Provide Time Difference in Seconds
 * @param mixed $time1
 * @param mixed $time2
 * @return int
 */
function timeDifferenceInSeconds($time1, $time2) {
    // Convert the time strings to DateTime objects
    $datetime1 = DateTime::createFromFormat('H:i:s', $time1);
    $datetime2 = DateTime::createFromFormat('H:i:s', $time2);
    
    // Calculate the difference
    $interval = $datetime1->diff($datetime2);
    
    // Convert the difference to seconds
    return ($interval->h * 3600) + ($interval->i * 60) + $interval->s;
}