<?php
$main_ip = $_SERVER['HTTP_HOST'];
$ip = $_REQUEST['server_ip'];
$pass = $_REQUEST['server_pass'];

`echo "<pre>"  > /var/www/html/server_setup/sending_ip_setup/out.txt`;

// STORE IP IN SENDING IP TABLE
$link = mysqli_connect('localhost', 'root', 'dvfersefag243435') or die('Could not connect: ' . mysqli_error($link));
mysqli_select_db($link, 	'admin') or die('Could not select database');
$sql = "DELETE FROM `admin`.`sending_ip_list` WHERE `ip` = '$ip'";
mysqli_query($link, $sql) or die("Insertion Failed:" . mysqli_error($link));
mysqli_close($link);

$data = '';
`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
`echo "----------------- REMOVING INTERFACES ----------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
$data.= "cd /var/www/html/;rm -rf *;echo '\nALL INTERFACE REMOVED SUCESSFULLY INSTALLED\n'";
$cmd = `sshpass -p "$pass" ssh -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null root@$ip "$data"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;

$data = '';
$data = '';
`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
`echo "-------------------- REMOVING MYSQL CLIENT ------------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
// Run MySQL commands on the current server shell
`mysql -u root -pdvfersefag243435 -e "DROP USER IF EXISTS 'sendingInterfaceUser'@'$ip';"`;
`echo "MySQL user removed for $ip from MAIN SERVER\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;

`echo "</pre>"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
echo $out = `cat /var/www/html/server_setup/sending_ip_setup/out.txt`;