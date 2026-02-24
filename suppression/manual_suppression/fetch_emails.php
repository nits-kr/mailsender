<?php
include "session.php";
// fetch_emails.php: AJAX endpoint to fetch emails for a given omid
$host = 'localhost';
$user = 'root';
$pass = 'dvfersefag243435';
$db_supp = 'suppression_v2';

if (!isset($_GET['omid']) || !is_numeric($_GET['omid'])) {
    echo 'Invalid request.';
    exit;
}
$omid = intval($_GET['omid']);

$supp_conn = new mysqli($host, $user, $pass, $db_supp);
if ($supp_conn->connect_error) {
    echo 'DB connection error.';
    exit;
}
$stmt = $supp_conn->prepare('SELECT email_id FROM manual_suppression_id WHERE omid = ? ORDER BY email_id');
$stmt->bind_param('i', $omid);
$stmt->execute();
$res = $stmt->get_result();
if ($res->num_rows === 0) {
    echo '<em>No emails found.</em>';
} else {
    echo '<ul style="margin:0; padding-left:0; list-style:none;">';
    while ($row = $res->fetch_assoc()) {
        $email = htmlspecialchars($row['email_id']);
        echo '<li style="display:flex;align-items:center;justify-content:space-between;padding:2px 0;">'
            . '<span>' . $email . '</span>'
            . '<button type="button" class="btn btn-sm btn-danger" style="padding:2px 12px;font-size:12px;" onclick="deleteSuppressionEmail(' . intval($omid) . ', \'' . addslashes($row['email_id']) . '\', this)">Delete</button>'
            . '</li>';
    }
    echo '</ul>';
}
$stmt->close();
$supp_conn->close();
