<?php
$main_ip = $_SERVER['HTTP_HOST'];
$ip = $_REQUEST['server_ip'];
$pass = $_REQUEST['server_pass'];
$action = $_REQUEST['Actionip'];
$dev = trim($_REQUEST['dev']);
$textarea = trim($_REQUEST['textarea']);
$http = $_REQUEST['http'];
$php = $_REQUEST['php'];
$ntpdate = $_REQUEST['ntpdate'];
$iptables = $_REQUEST['iptables'];
$pmta = $_REQUEST['pmta'];
$bounce = $_REQUEST['bounce'];
$portal = $_REQUEST['portal'];
$alias = $_REQUEST['alias'];
$cron = $_REQUEST['cron'];
$reboot = $_REQUEST['reboot'];
$service = $_REQUEST['restart'];

`echo "<pre>"  > /var/www/html/server_setup/out.txt`;

if($action == "Chekips") 
{
	$data = '';
	`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/out.txt`;
	`echo "-------------------- CHECKING IP's -------------------------\n"  >> /var/www/html/server_setup/out.txt`;
	`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/out.txt`;
	$data.= "/sbin/ip addr";
    $cmd = `sshpass -p "$pass" ssh -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null root@$ip "$data"  >> /var/www/html/server_setup/out.txt`;
   `echo "---------------------------------------------------------------\n"  >> /var/www/html/server_setup/out.txt`;
}

if($action == "Tunnel") 
{
	$data = '';
	`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/out.txt`;
	`echo "------------------------ TUNNEL IP's ---------------------------\n"  >> /var/www/html/server_setup/out.txt`;
	`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/out.txt`;
	$sip = explode("\n",$textarea);
	foreach ($sip as $line)
	{
		$line = trim($line);
		$data.= "/sbin/ip addr add ".$line."/32 dev ".$dev.";";
	}
	$data.= "ip a | grep -A 100000000 '$dev';";
	$cmd = `sshpass -p "$pass" ssh -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null root@$ip "$data"  >> /var/www/html/server_setup/out.txt`;
  `echo "---------------------------------------------------------------\n"  >> /var/www/html/server_setup/out.txt`;
}

if($action == "Detunnel") 
{
	$data = '';
	`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/out.txt`;
   `echo "------------------------ DETUNNEL IP's -------------------------\n"  >> /var/www/html/server_setup/out.txt`;
	`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/out.txt`;
	$sip = explode("\n",$textarea);
	foreach ($sip as $line)
	{
		$line = trim($line);
		$data.= "/sbin/ip addr d ".$line."/32 dev ".$dev.";";
	}
	$data.= "ip a | grep -A 100000000 '$dev';";
	$cmd = `sshpass -p "$pass" ssh -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null root@$ip "$data"  >> /var/www/html/server_setup/out.txt`;
   `echo "---------------------------------------------------------------\n"  >> /var/www/html/server_setup/out.txt`;
}

if($http == "install") 
{
	$data = '';
	`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/out.txt`;
	`echo "-------------------- INSTALLING HTTPD -------------------------\n"  >> /var/www/html/server_setup/out.txt`;
	`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/out.txt`;
	$data.= "yum -q remove httpd -y;yum -q install httpd -y;yum -q install wget -y;/etc/init.d/iptables stop;iptables -A INPUT -p tcp --dport 80 -m conntrack --ctstate NEW,ESTABLISHED -j ACCEPT;iptables -A OUTPUT -p tcp --sport 80 -m conntrack --ctstate ESTABLISHED -j ACCEPT;service httpd restart;service httpd status;echo '\nSUCESSFULLY HTTP INSTALLED'";
	// echo "sshpass -p '$pass' ssh -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null root@$ip '$data'";exit;
    echo $cmd = `sshpass -p "$pass" ssh -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null root@$ip "$data"  >> /var/www/html/server_setup/out.txt`;
   `echo "---------------------------------------------------------------\n"  >> /var/www/html/server_setup/out.txt`;
}
	
if($php == "install") 
{
	$data = '';
	`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/out.txt`;
	`echo "-------------------- INSTALLING PHP ---------------------------\n"  >> /var/www/html/server_setup/out.txt`;
	`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/out.txt`;
	$data.= "yum -q remove php-* -y;yum -q install https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm -y;yum -q install http://rpms.remirepo.net/enterprise/remi-release-7.rpm -y;yum -q install yum-utils -y;yum-config-manager --enable remi-php56 -q;yum -q install php php-mysql -y;service httpd restart;php -v;echo '\n SUCESSFULLY PHP INSTALLED'";
    $cmd = `sshpass -p "$pass" ssh -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null root@$ip "$data"  >> /var/www/html/server_setup/out.txt`;
   `echo "---------------------------------------------------------------\n"  >> /var/www/html/server_setup/out.txt`;
}

if($pmta == "install") 
{
	$data = '';
	`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/out.txt`;
	`echo "-------------------- INSTALLING PMTA ---------------------------\n"  >> /var/www/html/server_setup/out.txt`;
	`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/out.txt`;
	$data.= "service postfix stop;yum -q remove PowerMTA-4.0r8-201209102127.x86_64 -y;rm -rf /var/lib/pmta;rm -rf /var/log/pmta;rm -rf /etc/pmta;rm -rf /var/lib/pmta;rm -rf /var/log/pmta;rm -rf /var/spool/pmta*;rm -rf /opt/pmta;cd /opt/;wget -q http://$main_ip/all_tar/pmta_setup_setup.tar.gz;tar -zxf pmta_setup_setup.tar.gz;sh setup.sh;rm -rf /opt/pmta_setup_setup.tar.gz;echo '\n SUCESSFULLY PMTA INSTALLED'";
    $cmd = `sshpass -p "$pass" ssh -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null root@$ip "$data"  >> /var/www/html/server_setup/out.txt`;
   `echo "---------------------------------------------------------------\n"  >> /var/www/html/server_setup/out.txt`;
}

if($ntpdate == "install") 
{
	$data = '';
	`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/out.txt`;
	`echo "-------------------- INSTALLING NTPDATE -----------------------\n"  >> /var/www/html/server_setup/out.txt`;
	`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/out.txt`;
	$data.= "rm -rf /etc/localtime 2>/dev/null; unlink /etc/localtime 2>/dev/null;ln -s /usr/share/zoneinfo/EST /etc/localtime;vzctl exec 1041 rm -rf /etc/localtime 2>/dev/null;vzctl exec 1041 unlink /etc/localtime 2>/dev/null;vzctl exec 1041 ln -s /usr/share/zoneinfo/EST /etc/localtime;yum -q install ntp -y;systemctl enable ntpdate;systemctl start ntpdate;systemctl enable ntpd;systemctl start ntpd;chkconfig ntpd on;ntpdate be.pool.ntp.org;hwclock --systohc;ntpstat;service ntpdate restart;date;echo '\n SUCCESSFULLY TIME SYNCED TO EST'";
    $cmd = `sshpass -p "$pass" ssh -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null root@$ip "$data"  >> /var/www/html/server_setup/out.txt`;
   `echo "---------------------------------------------------------------\n"  >> /var/www/html/server_setup/out.txt`;
}

if($iptables == "install") 
{
	$data = '';
	`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/out.txt`;
	`echo "-------------------- FLUSHING IPTABLES -------------------------\n"  >> /var/www/html/server_setup/out.txt`;
	`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/out.txt`;
	$data.= "service iptables stop;iptables -F;iptables -A INPUT -p tcp --dport 80 -m conntrack --ctstate NEW,ESTABLISHED -j ACCEPT;iptables -A OUTPUT -p tcp --sport 80 -m conntrack --ctstate ESTABLISHED -j ACCEPT;echo '\nPRESENT IPTABLES\n';iptables -S;echo '\n SUCESSFULLY IPTABLES FLUSHED' ";
    $cmd = `sshpass -p "$pass" ssh -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null root@$ip "$data"  >> /var/www/html/server_setup/out.txt`;
   `echo "---------------------------------------------------------------\n"  >> /var/www/html/server_setup/out.txt`;
}

if($bounce == "install") 
{
	$data = '';
	`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/out.txt`;
	`echo "----------------- INSTALLING BOUNCE PROCESSOR ----------------\n"  >> /var/www/html/server_setup/out.txt`;
	`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/out.txt`;
	$data.= "cd /var/www/html/;rm -rf bounce_processor.tar.gz bounce_processor/;wget -q http://$main_ip/all_tar/bounce_processor.tar.gz;tar -xvf bounce_processor.tar.gz;chmod 0755 bounce_processor;chmod -R 0777 bounce_processor;rm -rf /var/www/html/bounce_processor.tar.gz;echo '\nBOUNCE PROCESSOR SUCESSFULLY INSTALLED'";
    $cmd = `sshpass -p "$pass" ssh -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null root@$ip "$data"  >> /var/www/html/server_setup/out.txt`;
   `echo "---------------------------------------------------------------\n"  >> /var/www/html/server_setup/out.txt`;
}

if($portal == "install") 
{
	$data = '';
	`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/out.txt`;
	`echo "----------------- INSTALLING PMTA WEB PORTAL ----------------\n"  >> /var/www/html/server_setup/out.txt`;
	`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/out.txt`;
	$data.= "cd /var/www/html/;rm -rf reportly.*;wget -q http://$main_ip/all_tar/report.tar.gz;tar -zxf report.tar.gz;chmod 0777 report.php;chmod 0755 /etc/pmta;chmod 0755 /etc/pmta/files;chmod 0777 /etc/pmta/files/*;echo $'iUser_Alias WWW=apache\nWWW ALL=(ALL) NOPASSWD:ALL\n\E:wq!\n' | vi /etc/sudoers;sed -i 's/Defaults requiretty/Defaults \!requiretty/g'  /etc/sudoers;sed -i 's/SELINUX=enforcing/SELINUX=disabled/g' /etc/selinux/config;sed -n -i 's/SELINUXTYPE=targeted/#SELINUXTYPE=targeted/g' /etc/selinux/config;rm -rf /var/www/html/report.tar.gz;echo '\nPMTA WEB PORTAL SUCESSFULLY INSTALLED\n\nACTIVATED AFTER REBOOT \n\n PLEASE CHECK ON LINK BELOW\nhttp://".$ip."/reportly.php'";
	$cmd = `sshpass -p "$pass" ssh -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null root@$ip "$data"  >> /var/www/html/server_setup/out.txt`;
   `echo "---------------------------------------------------------------\n"  >> /var/www/html/server_setup/out.txt`;
}

if($cron == "install") 
{
	$data = '';
	`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/out.txt`;
	`echo "-------------------- INSTALLING CRONTABS ---------------------------\n"  >> /var/www/html/server_setup/out.txt`;
	`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/out.txt`;
	$data.= "rm -rf /var/spool/cron/root;echo \\\"01 * * * * rm -rf /tmp/*\\\" >> /var/spool/cron/root;echo \\\"01 * * * * rm -rf /var/log/httpd/*\\\" >> /var/spool/cron/root;echo \\\"*/5 * * * * chmod 0777 /etc/pmta/files/*.csv\\\" >> /var/spool/cron/root ;echo \\\"*/20 * * * * echo 1 > /proc/sys/vm/drop_caches\\\" >> /var/spool/cron/root ;echo \\\"*/10 * * * * php /var/www/html/bounce_processor/ping_main_server.php\\\" >> /var/spool/cron/root ;echo '\n CRONTABS ARE : \n';crontab -l;echo '\nRESTARTING CRONTAB\n';service crond restart;echo '\n CRONTAB SUCESSFULLY INSTALLED'";
    $cmd = `sshpass -p "$pass" ssh -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null root@$ip "$data"  >> /var/www/html/server_setup/out.txt`;
   `echo "---------------------------------------------------------------\n"  >> /var/www/html/server_setup/out.txt`;
}

if($reboot == "reboot") 
{
	$data = '';
	`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/out.txt`;
	`echo "-------------------- REBOOTING SERVER ------------------------\n"  >> /var/www/html/server_setup/out.txt`;
	`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/out.txt`;
	$data.= "reboot";
    $cmd = `sshpass -p "$pass" ssh -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null root@$ip "$data"  >> /var/www/html/server_setup/out.txt`;
	`echo "\nNOTE: Please Tunnel IP's Again\nOtherwise PMTA Will Fails\non Startup\nSERVER REBOOTED SUCESSFULLY\n"  >> /var/www/html/server_setup/out.txt`;
	`echo "---------------------------------------------------------------\n"  >> /var/www/html/server_setup/out.txt`;
}

if($service == "restart") 
{
	$data = '';
	`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/out.txt`;
	`echo "-------------------- RESTARTING SERVER ------------------------\n"  >> /var/www/html/server_setup/out.txt`;
	`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/out.txt`;
	$data.= "echo '\n RESTARTING HTTP';service httpd restart;service httpd status;echo '\n RESTARTING CRONTAB';service crond restart;service crond status;echo '\n RESTARTING PMTA';service postfix stop;service pmta restart;echo '\n';pmtad --debug;echo '\n SYNCRONISING DATE\n';service ntpdate restart;date";
    $cmd = `sshpass -p "$pass" ssh -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null root@$ip "$data"  >> /var/www/html/server_setup/out.txt`;
   `echo "---------------------------------------------------------------\n"  >> /var/www/html/server_setup/out.txt`;
}

`echo "</pre>"  >> /var/www/html/server_setup/out.txt`;
echo $out = `cat /var/www/html/server_setup/out.txt`;





?>
