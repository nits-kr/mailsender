<?php
// remove_suppression_email.php: Remove a suppression email for a given offer
header('Content-Type: application/json');

$host = 'localhost';
$user = 'root';
$pass = 'dvfersefag243435';
$db_supp = 'suppression_v2';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Invalid request method.']);
    exit;
}

$omid = isset($_POST['omid']) ? intval($_POST['omid']) : 0;
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
if ($omid <= 0 || !$email) {
    echo json_encode(['success' => false, 'error' => 'Invalid parameters.']);
    exit;
}

$conn = new mysqli($host, $user, $pass, $db_supp);
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'error' => 'DB connection failed.']);
    exit;
}

$stmt = $conn->prepare('DELETE FROM manual_suppression_id WHERE omid = ? AND email_id = ?');
$stmt->bind_param('is', $omid, $email);
$stmt->execute();
if ($stmt->affected_rows > 0) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => 'Email not found or already removed.']);
}
$stmt->close();
$conn->close();
