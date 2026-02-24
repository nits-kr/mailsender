<?php
// Database connection
$mysqli = new mysqli("localhost", "root", "dvfersefag243435", "all_data");

// Check connection
if ($mysqli->connect_error) {
    die("Connection failed: " . $mysqli->connect_error);
}

// Query execution
$query = "SHOW FULL PROCESSLIST";
$result = $mysqli->query($query);

if ($result) {
    echo "<table border='1'><tr><th>ID</th><th>User</th><th>Host</th><th>DB</th><th>Command</th><th>Time</th><th>State</th><th>Info</th></tr>";
    while ($row = $result->fetch_assoc()) {
        echo "<tr>";
        foreach ($row as $value) {
            echo "<td>" . htmlspecialchars($value) . "</td>";
        }
        echo "</tr>";
    }
    echo "</table>";
} else {
    echo "Error: " . $mysqli->error;
}

// Close connection
$mysqli->close();
?>