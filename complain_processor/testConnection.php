<?php
// IMAP server details
$hostname = '{imap.mail.yahoo.com:993/imap/ssl}';
$username = 'unixleymedia@yahoo.com'; // Replace with your Yahoo email
$password = 'wigfnddtoyldrdje'; // Replace with your Yahoo email password

// Try to connect to the IMAP server
$inbox = imap_open($hostname, $username, $password) or die('Cannot connect to Yahoo: ' . imap_last_error());

// Get all folders
$folders = imap_list($inbox, $hostname, '*');

if ($folders === false) {
    echo "Failed to retrieve folders: " . imap_last_error();
} else {
    echo "Folders in your Yahoo account:<br>";
    foreach ($folders as $folder) {
        echo $folder . "<br>";
    }
}

// Close the connection
imap_close($inbox);
?>