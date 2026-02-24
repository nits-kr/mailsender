<?php 

error_reporting(0);
header("Access-Control-Allow-Origin: *");
date_default_timezone_set("EST");


session_start();   // session starts with the help of this function 

if(isset($_SESSION['username']))   // Checking whether the session is already there or not if 
                              // true then header redirect it to the home page directly 
 {
    header("Location:index.php"); 
 }

$result = $_REQUEST['action'];


$ip=$_SERVER['HTTP_HOST'];


if(isset($_POST['login']))
{
$password=base64_encode($_POST['password']);
$dec_password=$password;
$useremail=base64_encode($_POST['uemail']);

$cred=file_get_contents("http://173.249.50.153/admin/autheticate.php?username=".$useremail."&password=".$dec_password);

if($cred == "|||||")
{
header("location:login.php?action=Invalid+Details");
exit();
}
else
{
$extra="index.php";
   $credn=explode("|",$cred);

$status = trim($credn[5]);

  $_SESSION['id']=$credn[0];
   $_SESSION['username'] = $credn[1];
   $_SESSION['name'] = $credn[2];
   $_SESSION['designation'] = $credn[3];
   $_SESSION['password'] = $credn[4];
   $_SESSION['status'] = $credn[5];
   
$_SESSION['login']=$_POST['uemail'];
$_SESSION['name']=$credn[2];
$host=$_SERVER['HTTP_HOST'];

if($status == "1")
{
header("location:index.php");
exit();
}else { 
header("location:login.php?action=Blocked");
exit();
}

}

}




?>
