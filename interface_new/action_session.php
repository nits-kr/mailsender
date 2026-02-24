<?php
include "/var/www/html/server_ip.php";
session_start();
$username=$_REQUEST['username'];
$password=$_REQUEST['password'];
//$cred=file_get_contents("http://$main_server_ip/autheticate.php?username=".$username."&password=".$password);
$cred="1|admin@admin.com|Admin||admin123|";
if($cred == "||||||||||")
{
header("Location:login_form.php?result=Not a valid Login Detail");
}
else
{
   $credn=explode("|",$cred);
   $_SESSION['id']=$credn[0];
   $_SESSION['username'] = $credn[1];
   $_SESSION['fname'] = $credn[2];
   $_SESSION['lname'] = $credn[3];
   $_SESSION['password'] = $credn[4];
	header("Location:welcome.php");
}
?>
