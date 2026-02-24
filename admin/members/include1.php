
<?php
 error_reporting(0);
 header("Access-Control-Allow-Origin: *");

 date_default_timezone_set("EST");

 
session_start();

if(!isset($_SESSION['username'])) // If session is not set then redirect to Login Page
 {
    header("Location:../login.php?action=session+logged+out");
    die();
 }

// if (trim($_SESSION['username']) != 'vishal@visholmedia.com') {
//   header("Location:../login.php?action=session+logged+out");
//   die();
// } 

$sid= trim($_SESSION['id']) ; 

$connect = mysql_connect('localhost', 'root', 'dvfersefag243435') or die('Could not connect: ' . mysql_error());

?>
