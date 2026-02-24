<?php

// Include the database connection file
include "include.php";

// Get the sno from the request
$sno = $_POST['sno'];

// Prepare the delete statement
$stmt = $conn->prepare("DELETE FROM email_accounts WHERE sno = ?");
$stmt->bind_param("i", $sno);

// Execute the delete statement
if ($stmt->execute()) {
    echo "Row deleted successfully.";
} else {
    echo "Error deleting row: " . $stmt->error;
}

// Close the statement and database connection
$stmt->close();
$conn->close();

?>