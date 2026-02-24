<?php

$main_ip = $_SERVER['HTTP_HOST'];
$ip = $_REQUEST['server_ip'];
$pass = $_REQUEST['server_pass'];
$update = $_REQUEST['update'];
$http = $_REQUEST['http'];
$php = $_REQUEST['php'];
$mysql = $_REQUEST['mysql'];
$ntpdate = $_REQUEST['ntpdate'];
$iptables = $_REQUEST['iptables'];
$alias = $_REQUEST['alias'];
$portal = $_REQUEST['portal'];
$cron = $_REQUEST['cron'];
$reboot = $_REQUEST['reboot'];
$service = $_REQUEST['restart'];

`echo "<pre>"  > /var/www/html/server_setup/sending_ip_setup/out.txt`;

// STORE IP IN SENDING IP TABLE
$link = mysqli_connect('localhost', 'root', 'dvfersefag243435') or die('Could not connect: ' . mysqli_error($link));
mysqli_select_db($link, 	'admin') or die('Could not select database');
$sql = "INSERT INTO `admin`.`sending_ip_list` (`ip`, `password`) VALUES ('$ip', '$pass') ON DUPLICATE KEY UPDATE password = VALUES(password)";
mysqli_query($link, $sql) or die("Insertion Failed:" . mysqli_error($link));
mysqli_close($link);

if($update == "install") 
{
	$data = '';
	`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
	`echo "---------------- UPDATING & UPGRADING ------------------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
	`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
	$data.= "sudo apt update -y && sudo apt upgrade -y ;echo '\nSUCESSFULLY UPGRADED\n'; sudo apt-get remove nano -y; echo '\nSUCESSFULLY REMOVED NANO\n';sudo apt-get install vim -y;echo '\nSUCESSFULLY VI INSTALLED\n'";
	// echo "sshpass -p '$pass' ssh -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null root@$ip '$data'";exit;
    echo $cmd = `sshpass -p "$pass" ssh -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null root@$ip "$data"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
   `echo "---------------------------------------------------------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
}

if($http == "install") 
{
	$data = '';
	`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
	`echo "-------------------- INSTALLING HTTPD -------------------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
	`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
	$data.= "sudo apt-get remove apache2 -y;sudo apt-get install apache2 -y;/etc/init.d/iptables stop;iptables -A INPUT -p tcp --dport 80 -m conntrack --ctstate NEW,ESTABLISHED -j ACCEPT;iptables -A OUTPUT -p tcp --sport 80 -m conntrack --ctstate ESTABLISHED -j ACCEPT;service httpd restart;service httpd status;sudo apt-get install wget unzip perl alien -y;echo '\nSUCESSFULLY HTTP INSTALLED'";
	// echo "sshpass -p '$pass' ssh -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null root@$ip '$data'";exit;
    echo $cmd = `sshpass -p "$pass" ssh -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null root@$ip "$data"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
   `echo "---------------------------------------------------------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
}
	
if($php == "install") 
{
	$data = '';
	`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
	`echo "-------------------- INSTALLING PHP ---------------------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
	`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
    $data.= "sudo apt-get purge php7.* -y;sudo apt-get autoclean -y;sudo apt-get autoremove -y;sudo apt update -y && sudo apt upgrade -y;cd /opt/;sudo apt install git dpkg-dev -y;git clone https://github.com/Karan06/php56-localrepo.git;cd /opt/php56-localrepo;dpkg-scanpackages . /dev/null | gzip -9c > Packages.gz;dpkg-scanpackages . /dev/null > Packages;chmod -R a+r /opt/php56-localrepo;echo 'deb [trusted=yes] file:/opt/php56-localrepo ./' | sudo tee /etc/apt/sources.list.d/php56-localrepo.list;sudo apt update -y && sudo apt upgrade -y;sudo apt install php5.6 php5.6-mcrypt php5.6-cli php5.6-gd php5.6-curl php5.6-mysql php5.6-ldap php5.6-zip php5.6-fileinfo php5.6-imap php5.6-xml php5.6-mbstring -y;service apache2 restart;cd /root;echo '\n PHP VERSION\n';php -v;service apache2 restart;echo '\n SUCESSFULLY PHP INSTALLED\n'";
	$cmd = `sshpass -p "$pass" ssh -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null root@$ip "$data"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
	`echo "---------------------------------------------------------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
	$data = '';
    $data = "sed -i 's/post_max_size = 8M/post_max_size = 200M/g' /etc/php/5.6/apache2/php.ini;sed -i 's/upload_max_filesize = 2M/upload_max_filesize = 200M/g' /etc/php/5.6/apache2/php.ini;sed -i 's/; max_input_vars = 1000/max_input_vars = 5000/g' /etc/php/5.6/apache2/php.ini;sed -i 's/max_execution_time = 30/max_execution_time = 600/g' /etc/php/5.6/apache2/php.ini;sed -i 's/max_input_time = 60/max_input_time = 600/g' /etc/php/5.6/apache2/php.ini;sed -i 's|;upload_tmp_dir =| upload_tmp_dir = /tmp|g' /etc/php/5.6/apache2/php.ini;service apache2 restart; echo '\nPHP configuration updated and Apache restarted\n';";
	// echo "sshpass -p '$pass' ssh -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null root@$ip \"$data\"";exit;
	$cmd = `sshpass -p "$pass" ssh -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null root@$ip "$data"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
	`echo "---------------------------------------------------------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;

}

if($mysql == "install") 
{
	$data = '';
	`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
	`echo "-------------------- INSTALLING MYSQL CLIENT ------------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
	`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
	$data.= "sudo apt-get remove --purge -y mysql-server mysql-client mysql-common mariadb-server mariadb-client; sudo apt-get autoremove -y; sudo apt-get autoclean -y; sudo apt update -y && sudo apt install -y mysql-server mysql-client; echo '\nMYSQL SERVER INSTALLED\n'; mysql --version; echo '\nMYSQL VERSION PRINTED\n';";
	$cmd = `sshpass -p "$pass" ssh -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null root@$ip "$data"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
	`echo "---------------------------------------------------------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
    // Add MySQL configuration commands here
	$data = '';
    $data = "sed -i '/^max_connections = 5000/d' /etc/mysql/mysql.conf.d/mysqld.cnf;
	sed -i '/^innodb_buffer_pool_size = 1024M/d' /etc/mysql/mysql.conf.d/mysqld.cnf;
	sed -i '/^sql_mode=\\\"NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION\\\"/d' /etc/mysql/mysql.conf.d/mysqld.cnf;
	sed -i '/^secure-file-priv = \\\"\\\"/d' /etc/mysql/mysql.conf.d/mysqld.cnf;
	echo 'max_connections = 5000' | sudo tee -a /etc/mysql/mysql.conf.d/mysqld.cnf;
    echo 'innodb_buffer_pool_size = 1024M' | sudo tee -a /etc/mysql/mysql.conf.d/mysqld.cnf;
    echo 'sql_mode=\\\"NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION\\\"' | sudo tee -a /etc/mysql/mysql.conf.d/mysqld.cnf;
    echo 'secure-file-priv = \\\"\\\"' | sudo tee -a /etc/mysql/mysql.conf.d/mysqld.cnf;
    service mysql restart; echo '\nMySQL configuration updated and MySQL restarted\n';";
    $cmd = `sshpass -p "$pass" ssh -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null root@$ip "$data"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
	`echo "---------------------------------------------------------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;

	// Run MySQL commands on the current server shell
	`mysql -u root -pdvfersefag243435 -e "DROP USER IF EXISTS 'sendingInterfaceUser'@'$ip';"`;
	`mysql -u root -pdvfersefag243435 -e "CREATE USER 'sendingInterfaceUser'@'$ip' IDENTIFIED BY 'dvfersefag243435';"`;
	`mysql -u root -pdvfersefag243435 -e "GRANT ALL PRIVILEGES ON *.* TO 'sendingInterfaceUser'@'$ip' WITH GRANT OPTION;"`;
	`mysql -u root -pdvfersefag243435 -e "FLUSH PRIVILEGES;"`;
	`echo "MySQL user 'sendingInterfaceUser' created for IP $ip\n" >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
	`echo "---------------------------------------------------------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
}

if($ntpdate == "install") 
{
	$data = '';
	`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
	`echo "-------------------- INSTALLING NTPDATE -----------------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
	`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
	$data.= "rm -rf /etc/localtime 2>/dev/null; unlink /etc/localtime 2>/dev/null;ln -s /usr/share/zoneinfo/EST /etc/localtime;vzctl exec 1041 rm -rf /etc/localtime 2>/dev/null;vzctl exec 1041 unlink /etc/localtime 2>/dev/null;vzctl exec 1041 ln -s /usr/share/zoneinfo/EST /etc/localtime;yum -q install ntp -y;systemctl enable ntpdate;systemctl start ntpdate;systemctl enable ntpd;systemctl start ntpd;chkconfig ntpd on;ntpdate be.pool.ntp.org;hwclock --systohc;ntpstat;service ntpdate restart;date;echo '\n SUCCESSFULLY TIME SYNCED TO EST'";
    $cmd = `sshpass -p "$pass" ssh -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null root@$ip "$data"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
   `echo "---------------------------------------------------------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
}

if($iptables == "install") 
{
	$data = '';
	`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
	`echo "-------------------- FLUSHING IPTABLES -------------------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
	`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
	$data.= "service iptables stop;iptables -F;iptables -A INPUT -p tcp --dport 80 -m conntrack --ctstate NEW,ESTABLISHED -j ACCEPT;iptables -A OUTPUT -p tcp --sport 80 -m conntrack --ctstate ESTABLISHED -j ACCEPT;echo '\nPRESENT IPTABLES\n';iptables -S;echo '\n SUCESSFULLY IPTABLES FLUSHED' ";
    $cmd = `sshpass -p "$pass" ssh -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null root@$ip "$data"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
   `echo "---------------------------------------------------------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
}

if($alias == "install") 
{
	$data = '';
	`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
	`echo "----------------- INSTALLING ALIAS ----------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
	`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
	$data.= "sed -i '/^alias sql=/d;/^alias sqlroot=/d' /root/.bashrc && echo 'alias sql='\\''mysql -h 173.249.50.153 -u sendingInterfaceUser -pdvfersefag243435'\\''' >> /root/.bashrc && echo 'alias sqlroot='\\''mysql -u root -pdvfersefag243435'\\''' >> /root/.bashrc; sed -i '/^www-data ALL=(ALL) NOPASSWD:ALL/d' /etc/sudoers && echo 'www-data ALL=(ALL) NOPASSWD:ALL' | sudo cat - /etc/sudoers > /tmp/sudoers && sudo mv /tmp/sudoers /etc/sudoers;echo '\n SUCCESSFULLY MYSQL ALIAS ADDED'";
	$cmd = `sshpass -p "$pass" ssh -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null root@$ip "$data"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
	`echo "---------------------------------------------------------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
}

if($portal == "install") 
{
	$data = '';
	`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
	`echo "----------------- INSTALLING INTERFACES ----------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
	`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
	$data.= "cd /var/www/html/;rm -rf *;wget -q http://$main_ip/all_tar/all_html_sending_setup_final.tar.gz;tar -zxf all_html_sending_setup_final.tar.gz;chmod -R 0777 *;sed -i 's/SELINUX=enforcing/SELINUX=disabled/g' /etc/selinux/config;sed -n -i 's/SELINUXTYPE=targeted/#SELINUXTYPE=targeted/g' /etc/selinux/config;rm -rf /var/www/html/all_html_sending_setup_final.tar.gz;mkdir /var/www/data/;echo '\nALL INTERFACE SETUP SUCESSFULLY INSTALLED\n'";
	$cmd = `sshpass -p "$pass" ssh -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null root@$ip "$data"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
	`echo "---------------------------------------------------------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
	$data = '';
	$data = "find /var/www/html -type f -exec sed -i 's/157\.173\.122\.179/$ip/g' {} +; echo '\nINTERFACE CONFIGURED WITH NEW IP $ip\n';";
	$cmd = `sshpass -p "$pass" ssh -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null root@$ip "$data"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
   `echo "---------------------------------------------------------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
}

if($cron == "install") 
{
	$data = '';
	`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
	`echo "-------------------- INSTALLING CRONTABS ---------------------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
	`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
	$data.= "rm -rf /var/spool/cron/crontabs/root;echo \\\"*/3 * * * * /etc/init.d/apache2 restart\\\" >> /var/spool/cron/crontabs/root;echo \\\"01 * * * * rm -rf /tmp/*\\\" >> /var/spool/cron/crontabs/root;echo \\\"01 * * * * rm -rf /var/log/*/*-*\\\" >> /var/spool/cron/crontabs/root;echo \\\"01 * * * * rm -rf /var/log/*-*\\\" >> /var/spool/cron/crontabs/root;echo \\\"*/2 * * * * echo 1 > /proc/sys/vm/drop_caches\\\" >> /var/spool/cron/crontabs/root;echo \\\"* * * * * sh /etc/dropChache.sh\\\" >> /var/spool/cron/crontabs/root;echo \\\"0 2 * * * find /var/www/html/screenout -maxdepth 1 -type f ! -name 'auto_screen_cron.txt' -mtime +7 -print -delete\\\" >> /var/spool/cron/crontabs/root;echo \\\"* * * * * /usr/bin/php /var/www/html/admin/auto_screen_runner.php\\\" >> /var/spool/cron/crontabs/root;echo '\n CRONTABS ARE : \n';chown root:crontab /var/spool/cron/crontabs/root;chmod 600 /var/spool/cron/crontabs/root;crontab -l;echo '\nRESTARTING CRONTAB\n';service crond restart;echo '\n CRONTAB SUCESSFULLY INSTALLED'";
	$cmd = `sshpass -p "$pass" ssh -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null root@$ip "$data"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
   `echo "---------------------------------------------------------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
}

if($reboot == "reboot") 
{
	$data = '';
	`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
	`echo "-------------------- REBOOTING SERVER ------------------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
	`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
	$data.= "reboot";
    $cmd = `sshpass -p "$pass" ssh -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null root@$ip "$data"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
	`echo "\nNOTE: Please Tunnel IP's Again\nOtherwise PMTA Will Fails\non Startup\nSERVER REBOOTED SUCESSFULLY\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
	`echo "---------------------------------------------------------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
}

if($service == "restart") 
{
	$data = '';
	`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
	`echo "-------------------- RESTARTING SERVER ------------------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
	`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
	$data.= "echo '\n RESTARTING HTTP';service apache2 restart;service apache2 status;echo '\n RESTARTING CRONTAB';service cron restart;service cron status;echo '\n RESTARTING PMTA';service postfix stop;service pmta restart;echo '\n';pmtad --debug;echo '\n SYNCRONISING DATE\n';service ntpdate restart;date";
    $cmd = `sshpass -p "$pass" ssh -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null root@$ip "$data"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
   `echo "---------------------------------------------------------------\n"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
}

`echo "</pre>"  >> /var/www/html/server_setup/sending_ip_setup/out.txt`;
echo $out = `cat /var/www/html/server_setup/sending_ip_setup/out.txt`;
?>
