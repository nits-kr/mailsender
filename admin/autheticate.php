<?php
include "include.php";
$email = base64_decode(trim($_REQUEST['username']));
$password = base64_decode(trim($_REQUEST['password']));
$cred = "";
$ret= mysql_query("SELECT * FROM `login`.`users` WHERE email='$email' and password='$password'") or die (mysql_error());
$num=mysql_fetch_array($ret);
if($num>0)
{
  $cred = $num['id']."|".$email."|".$num['name']."|".$num['designation']."|".$password."|".$num['status'];
}
else
{
  $cred = "|||||";
}

echo $cred;

?>
