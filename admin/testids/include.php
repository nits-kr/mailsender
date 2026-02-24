
<?php
 header("Access-Control-Allow-Origin: *");
 date_default_timezone_set("EST");

 
session_start();

if(!isset($_SESSION['username'])) // If session is not set then redirect to Login Page
 {
     header("Location:../login.php?action=session+logged+out");
die();
 }


 if (trim($_SESSION['designation']) != 'Admin') {

  header("Location:../login.php?action=session+logged+out");
  die();
} 

$sid= trim($_SESSION['id']) ; 



 
 $connect = mysql_connect("localhost", "root", "dvfersefag243435");  
 // Check connection
if ($connect -> connect_errno) {
  echo "Failed to connect to MySQL: " . $connect -> connect_error;
  exit();
}
mysql_select_db("admin") or die (mysql_error());
?>
