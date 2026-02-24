<?php
include "include.php";

// Check if form is submitted
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $sno = $_POST['sno'];
    
    // Pull all rows matched with sno value from complain table
    $stmt = $conn->prepare("SELECT * FROM email_accounts WHERE sno = ?");
    $stmt->bind_param("i", $sno);

    if ($stmt->execute()) {
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        echo json_encode($row);
    } else {
        echo "Error: " . $stmt->error;
    }
}
$conn->close();
