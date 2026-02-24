<?php
include "session.php";
// handle_suppression_form.php: Backend handler for Complainer Suppression form
$host = 'localhost';
$user = 'root';
$pass = 'dvfersefag243435';
$db_supp = 'suppression_v2';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Invalid request method.']);
    exit;
}

$offer_id = isset($_POST['offer_id']) ? intval($_POST['offer_id']) : 0;
$emails = isset($_POST['emails']) ? trim($_POST['emails']) : '';

if ($offer_id <= 0) {
    echo json_encode(['success' => false, 'error' => 'Please select an offer.']);
    exit;
}
if (empty($emails)) {
    echo json_encode(['success' => false, 'error' => 'Please enter at least one email.']);
    exit;
}

$email_arr = preg_split('/[\r\n,]+/', $emails);
$valid_emails = array();
foreach ($email_arr as $email) {
    $email = trim($email);
    if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $valid_emails[] = $email;
    }
}
if (empty($valid_emails)) {
    echo json_encode(['success' => false, 'error' => 'No valid email addresses found.']);
    exit;
}

$supp_conn = new mysqli($host, $user, $pass, $db_supp);
if ($supp_conn->connect_error) {
    echo json_encode(['success' => false, 'error' => 'Suppression DB Connection failed.']);
    exit;
}

$stmt = $supp_conn->prepare('INSERT INTO manual_suppression_id (omid, email_id) VALUES (?, ?)');
foreach ($valid_emails as $em) {
    $stmt->bind_param('is', $offer_id, $em);
    $stmt->execute();
}
$stmt->close();
$supp_conn->close();

echo json_encode(['success' => true, 'message' => 'Emails added successfully!']);
