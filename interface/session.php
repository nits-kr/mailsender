<?php
session_start();
if(!$_SESSION['id'])
{
$_SESSION['err']="Login required!";
header("Location:../admin/login.php");
}
else
{
$username = $_SESSION['username'];
$password = $_SESSION['password'];
$fname= $_SESSION['fname'];
$lname= $_SESSION['lname'];
 }
?>
