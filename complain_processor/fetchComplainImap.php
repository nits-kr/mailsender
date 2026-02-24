<?php

date_default_timezone_set('Asia/Kolkata');
include "include.php";

$email = isset($_REQUEST["email"]) ? $_REQUEST["email"] : $argv[1];
$email = trim($email);

// Query to fetch emails from the database
$sql = "SELECT * FROM email_accounts where email = '$email'";
$result = $conn->query($sql);
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        // Define email credentials and IMAP server details
        $inboxImapHost = $row['inboxImapHost'];
        $spamImapHost = $row['spamImapHost'];
        $password = $row['password'];
        $accountType = $row['accountType'];
    }
}

switch ($accountType) {
    case 'yahoo_fbl':
        fetchYahooFbl($email, $password, $inboxImapHost, $spamImapHost);
        break;
    // case 'sentora':
    //     fetchSentoraFbl($email, $password, $inboxImapHost, $spamImapHost);
    //     break;
    default:
        echo "Invalid account type.";
        break;
}

// Function to fetch emails from Yahoo FBL
function fetchYahooFbl ($email, $password, $inboxImapHost, $spamImapHost) {

    // Blank Arayy
    $allEmail = [];
    $inboxEmailCount = 0;
    $spamEmailCount = 0;

    // INBOX CONNECTION
    $connection = imap_open($inboxImapHost, $email, $password);
    if (!$connection) {
        echo "Failed to connect to Inbox IMAP server $email: " . imap_last_error();
        exit;
    }

    // Fetch emails from the INBOX
    $emails = imap_search($connection, 'FROM "feedback@arf.mail.yahoo.com"', SE_UID); // Fetch emails from specific sender
    if (!$emails) {
        echo "No INBOX emails found : $email.\n";
    } else {
        $inboxEmailCount = count($emails);
        echo "Found $inboxEmailCount INBOX emails : $email.\n";
        $emailsToModify = [];
        foreach ($emails as $emailNumber) {
            $sectionBody = 2;
            $body = imap_fetchbody($connection, $emailNumber, $sectionBody,SE_UID);
            preg_match('/Original-Rcpt-To: (.+)/', $body, $matches);
            if (isset($matches[1])) {
                $allEmail[] = $matches[1];
            } 
            // Add email to the list to move and delete
            $emailsToModify[] = $emailNumber;
        }

        // // Move all emails to the captured_complain folder in one call
        // $capturedComplainFolder = "captured_complain"; // Replace with the actual folder name
        // imap_mail_move($connection, implode(',', $emailsToModify), $capturedComplainFolder, SE_UID);

        // Delete all emails from the original folder in one call
        imap_delete($connection, implode(',', $emailsToModify), SE_UID);

        // Expunge to permanently delete the emails marked for deletion
        imap_expunge($connection);
        
    }
    // Close the IMAP connection
    imap_close($connection);

    // SPAM CONNECTION
    $connection = imap_open($spamImapHost, $email, $password);
    if (!$connection) {
        echo "Failed to connect to Spam IMAP server $email: " . imap_last_error();
        exit;
    }

    // Fetch emails from the INBOX
    $emails = imap_search($connection, 'FROM "feedback@arf.mail.yahoo.com"', SE_UID); // Fetch emails from specific sender
    if (!$emails) {
        echo "No SPAM emails found : $email.\n";
    } else {
        $spamEmailCount = count($emails);
        echo "Found $spamEmailCount SPAM emails : $email.\n";
        $emailsToModify = [];
        foreach ($emails as $emailNumber) {
            $sectionBody = 2;
            $body = imap_fetchbody($connection, $emailNumber, $sectionBody,SE_UID);
            preg_match('/Original-Rcpt-To: (.+)/', $body, $matches);
            if (isset($matches[1])) {
                $allEmail[] = $matches[1];
            } 
            // Add email to the list to move and delete
            $emailsToModify[] = $emailNumber;
        }

        // // Move all emails to the captured_complain folder in one call
        // $capturedComplainFolder = "captured_complain"; // Replace with the actual folder name
        // imap_mail_move($connection, implode(',', $emailsToModify), $capturedComplainFolder, SE_UID);

        // Delete all emails from the original folder in one call
        imap_delete($connection, implode(',', $emailsToModify), SE_UID);

        // Expunge to permanently delete the emails marked for deletion
        imap_expunge($connection);
    }
    // Close the IMAP connection
    imap_close($connection);


    //Generate the file path
    $date = date("Y-m-d"); // Get the current date
    $dt = date( "Y-m-d H:i:s"); // Get the current date
    $filePath = __DIR__."/fetched_complains/$email"."_"."$date.txt";

    // Write the contents of $allEmail[] to the file
    echo $fileContent = implode("\n", $allEmail); // Convert the array to a string with each element on a new line
    file_put_contents($filePath, $fileContent, FILE_APPEND);

    // Check if the file was successfully written
    if (file_exists($filePath)) {
        echo "File created successfully: $email | date: $dt  | InboxEmails: $inboxEmailCount | SpamEmails: $spamEmailCount";
    } else {
        echo "Failed to created File: $email | date: $dt | InboxEmails: $inboxEmailCount | SpamEmails: $spamEmailCount";
    }
}

// Function to fetch emails from Sentora FBL
function fetchSentoraFbl ($email, $password, $inboxImapHost, $spamImapHost) {

    $inboxImapHost = "{".$inboxImapHost.":143/imap}INBOX"; // IMAP connection string
    $spamImapHost = "{".$spamImapHost.":143/imap}SPAM"; // IMAP connection string

    // Connect to the IMAP server
    $connection = imap_open($inboxImapHost, $email, $password);

    if (!$connection) {
        die("Failed to connect to IMAP server: " . imap_last_error());
    }

    // Fetch emails from the INBOX
    $emails = imap_search($connection, 'ALL'); // Fetch all emails

    if (!$emails) {
        echo "No emails found.\n";
    } else {
        echo "Found " . count($emails) . " emails.\n";

        // Loop through each email
        foreach ($emails as $emailNumber) {
            // Fetch the email header and body
            $header = imap_headerinfo($connection, $emailNumber);
            $body = imap_fetchbody($connection, $emailNumber, 1);

            // Display email details
            echo "==========================================\n";
            echo "Subject: " . $header->subject . "\n";
            echo "From: " . $header->fromaddress . "\n";
            echo "Date: " . $header->date . "\n";
            echo "==========================================\n";
            echo "Body:\n" . $body . "\n\n";
        }
    }
}
?>