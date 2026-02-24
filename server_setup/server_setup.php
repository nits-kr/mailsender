<?php
$ip = trim($_REQUEST['ip']);
$pass = trim($_REQUEST['pass']);
//echo $ip."<br>".$pass;

echo $cmd = "sshpass -p '".$pass."' ssh -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null root@".$ip." \"wget -O /var/www/html/server_setup.sh http://18.188.212.44/server_setup/server_setup.sh;chmod 0777 /var/www/html/server_setup.sh;sh /var/www/html/server_setup.sh > /var/www/html/server.html\"";

$exe = exec($cmd);

echo $file = file_get_contents("http://139.59.95.233/server.html")

?>