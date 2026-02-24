<?php
session_start();
if(!isset($_SESSION['username'])) {
      header("Location:../admin/login.php?action=session+logged+out");  
      die();
} 

$sid=$_SESSION['id']; 
?>

