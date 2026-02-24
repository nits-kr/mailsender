<?php
// Database connection parameters
$host = 'localhost';
$dbname = 'sentora_complainer';
$username = 'root';
$password = 'dvfersefag243435';

// Create a connection
$conn = new mysqli($host, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
