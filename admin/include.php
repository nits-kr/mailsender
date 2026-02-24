
<?php
$link = mysql_connect('localhost', 'root', 'dvfersefag243435') or die('Could not connect: ' . mysql_error());
mysql_select_db('svml') or die('Could not select database');
$rds = mysql_connect('localhost','root','dvfersefag243435') or mysql_error(); 
mysql_select_db('server', $rds);
$loginrds = mysql_connect('localhost','root','dvfersefag243435') or mysql_error();
mysql_select_db('login', $loginrds);

?>
