<?php
session_start();

      if(!isset($_SESSION['username'])) // If session is not set then redirect to Login Page
       {
           header("Location:../admin/login.php?action=session+logged+out");  
     die();
       } 
       $sid=$_SESSION['id']; 
?>

