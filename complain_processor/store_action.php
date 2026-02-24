<?php
include "include.php";

// Check if form is submitted
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $accountType = $_POST['accountType'];
    $inboxImapHost = $_POST['inboxImapHost'];
    $spamImapHost = $_POST['spamImapHost'];
    $email = $_POST['email'];
    $password = $_POST['password'];
    
    // Check if email already exists in the database
    $checkStmt = $conn->prepare("SELECT COUNT(*) FROM email_accounts WHERE email = ?");
    $checkStmt->bind_param("s", $email);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    $emailExists = $checkResult->fetch_row()[0] > 0;
    $checkStmt->close();

    if ($emailExists) {
        // Update existing record
        $updateStmt = $conn->prepare("UPDATE email_accounts SET accountType = ?, inboxImapHost = ?, spamImapHost = ?, password = ? WHERE email = ?");
        $updateStmt->bind_param("sssss", $accountType, $inboxImapHost, $spamImapHost, $password, $email);
        if ($updateStmt->execute()) {
            echo "Record updated successfully.";
        } else {
            echo "Error: " . $updateStmt->error;
        }
        $updateStmt->close();
    } else {
        // Insert new record
        $insertStmt = $conn->prepare("INSERT INTO email_accounts (`accountType`, `inboxImapHost`, `spamImapHost`, `email`, `password`) VALUES (?, ?, ?, ?, ?)");
        $insertStmt->bind_param("sssss", $accountType, $inboxImapHost, $spamImapHost, $email, $password);
        if ($insertStmt->execute()) {
            echo "Record inserted successfully.";
        } else {
            echo "Error: " . $insertStmt->error;
        }
        $insertStmt->close();
    }

    // // Prepare and bind statement
    // $stmt = $conn->prepare("INSERT INTO email_accounts (`accountType`, `inboxImapHost`, `spamImapHost`, `email`, `password`) VALUES (?, ?, ?, ?, ?)");
    // $stmt->bind_param("sssss", $accountType, $inboxImapHost, $spamImapHost, $email, $password);

    // if ($stmt->execute()) {
    //     echo "Record inserted successfully.";
    // } else {
    //     echo "Error: " . $stmt->error;
    // }

    // $stmt->close();
}

$conn->close();
