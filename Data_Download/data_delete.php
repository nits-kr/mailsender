<?php 
include "session.php";
include "include.php";
?>
<html>
<head>
<title>Data Delete Portal</title>
</head>
<body>
<center>
    <h2>Data Delete Portal</h2>
    <hr>
    <!-- All Data -->
    
    <?php 
        $data = file_get_contents("/var/www/html/Data_Download/files.txt"); 
        $lines = explode("\n", trim($data));
        foreach ($lines as $line) {
            echo trim($line)."<br>";
        }
    ?>
    <hr><hr>
    <form id='myform' action="data_delete_action.php" method="POST">
    File Name To Delete :- <input type="text" id="filename" name="filename" placeholder='Name' required><br><br>
    <input type="submit" value="Delete File">    
</center>
</body>
</html>
<?php mysql_close($conn);?>