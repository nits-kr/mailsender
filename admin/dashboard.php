<?php
session_start();

      if(!isset($_SESSION['username'])) // If session is not set then redirect to Login Page
       {
           header("Location:login.php?action=session+logged+out");  
     die();
       } 

header("location:index.php");

?>


