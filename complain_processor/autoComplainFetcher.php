<?php
include "include.php"; // Database connection file

$stmt = $conn->prepare("SELECT email FROM email_accounts where accountType = 'yahoo_fbl'");

if ($stmt->execute()) {
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        echo $email = $row['email'];
        echo "\n";
        exec("php /var/www/html/complain_processor/fetchComplainImap.php '$email' >> /var/www/html/complain_processor/fetchLog.txt");
        echo "\n--------------------------------------------------------------------------------------------------\n";
    }
    
} else {
    echo "Error: " . $stmt->error;
}

$conn->close();