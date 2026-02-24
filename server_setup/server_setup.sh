echo "<br>";
echo "<font colour='red'> DELETETING PMTA</font><br>";
yum -y remove PowerMTA-4.0r6-201204021809.x86_64
rm -rf /var/lib/pmta
rm -rf /var/log/pmta
rm -rf /etc/pmta
rm -rf /var/lib/pmta
rm -rf /var/log/pmta
rm -rf /root/.bashrc
rm -rf /var/spool/cron/root
sed -i "s/User_Alias WWW=apache//g" /etc/sudoers
sed -i "s/WWW ALL=(ALL) NOPASSWD:ALL//g" /etc/sudoers
rm -rf /var/www/html/analysis
rm -rf /var/www/html/bounce*
rm -rf /var/www/html/small_server_report.tar.gz
rm -rf /var/www/html/smtp_tester
rm -rf /var/www/html/smtp_tester.tar.gz
echo "------------------------------------------------------------------<br>";
echo "<font colour='red'> INSTALLING PMTA </font>";
echo "<br>";

cd /opt/
yum -q install wget -y
wget -q http://13.58.74.46/pmta_rpm.tar.gz
tar -xvf pmta_rpm.tar.gz
cd PMTA\=CONFIG/
yum -q install perl -y
rpm -ivh  PowerMTA-4.0r6-201204021809.x86_64.rpm
echo "------------------------------------------------------------------<br>";
echo "<font colour='red'> GIVING OWNERSHIP</font>";

mv license /etc/pmta/
mkdir /etc/pmta/files /etc/pmta/log
pmta /etc/pmta/config
chmod 640 /etc/pmta/config
mkdir -p /var/spool/pmtaPickup/
mkdir -p /var/spool/pmtaPickup/Pickup
mkdir -p /var/spool/pmtaPicd /opt/
chown pmta:pmta /etc/pmta/config
chmod 640 /etc/pmta/config
mkdir -p /var/spool/pmtaPickup/
mkdir -p /var/spool/pmtaPickup/Pickup
mkdir -p /var/spool/pmtaPickup/BadMail
mkdir -p /var/spool/pmtaIncoming
chown pmta:pmta /var/spool/pmtaIncoming
chmod 755 /var/spool/pmtaIncoming
chown pmta:pmta /var/spool/pmtaPickup/*
mkdir -p /var/log/pmta
mkdir -p /var/log/pmtaAccRep
mkdir -p /var/log/pmtaErr
mkdir -p /var/log/pmtaErrRep
chown pmta:pmta  /var/log/pmta
chown pmta:pmta  /var/log/pmtaAccRep
chown pmta:pmta  /var/log/pmtaErr
chown pmta:pmta /var/log/pmtaErrRep
chmod 755 /var/log/pmta
chmod 755 /var/log/pmtaAccRep
chmod 755 /var/log/pmtaErr
chmod 755 /var/log/pmtaErrRep
mkdir -p /var/spool/pmtaIncoming
chown pmta:pmta /var/spool/pmtaIncoming
chmod 755 /var/spool/pmtaIncoming
chown pmta:pmta /var/spool/pmtaPickup/*
mkdir -p /var/log/pmta
mkdir -p /var/log/pmtaAccRep
mkdir -p /var/log/pmtaErr
mkdir -p /var/log/pmtaErrRep
chown pmta:pmta  /var/log/pmta
chown pmta:pmta  /var/log/pmtaAccRep
chown pmta:pmta  /var/log/pmtaErr
chown pmta:pmta /var/log/pmtaErrRep
chmod 755 /var/log/pmta
chmod 755 /var/log/pmtaAccRep
chmod 755 /var/log/pmtaErr
chmod 755 /var/log/pmtaErrRep

echo "<font colour='red'> PMTA INSTALLED</font>";
echo "------------------------------------------------------------------<br>";
echo "<font colour='red'> INSTALL HTTP AND PHP</font>";

yum -y -q install  httpd
yum -y -q install php php-mysql
/etc/init.d/iptables stop 
iptables -A INPUT -p tcp --dport 80 -m conntrack --ctstate NEW,ESTABLISHED -j ACCEPT
iptables -A OUTPUT -p tcp --sport 80 -m conntrack --ctstate ESTABLISHED -j ACCEPT
/etc/init.d/httpd restart 

echo "------------------------------------------------------------------<br>";
echo "<font colour='red'> Installing SMTP TESTER</font>";

cd /var/www/html/
wget -q http://151.80.26.128/aa_art/tar/smtp_tester.tar.gz
tar -xvf smtp_tester.tar.gz 

echo "------------------------------------------------------------------<br>";
echo "<font colour='red'> Setting ALIAS </font>";

echo "# Source global definitions" >> /root/.bashrc
echo "if [ -f /etc/bashrc ]; then" >> /root/.bashrc
echo "       . /etc/bashrc" >> /root/.bashrc
echo "fi" >> /root/.bashrc
echo "# User specific aliases and functions" >> /root/.bashrc
echo "alias checklist='sh /var/www/html/reports/checklist.sh'" >> /root/.bashrc
echo "alias everyhour='cat /var/www/html/every_hour.txt'" >> /root/.bashrc
echo "alias bounce='sh /var/www/html/reports/bounce.sh'" >> /root/.bashrc
echo "alias hourlystats='sh /var/www/html/reports/hourly.sh'" >> /root/.bashrc
echo "alias yeshourly='sh /var/www/html/reports/yeshourly.sh'" >> /root/.bashrc
echo "alias todhourly='sh /var/www/html/reports/todhourly.sh'" >> /root/.bashrc
echo "alias yesoffer='sh /var/www/html/reports/yesoffer.sh'" >> /root/.bashrc
echo "alias todoffer='sh /var/www/html/reports/offer.sh'" >> /root/.bashrc
echo "alias h='cd /var/www/html'" >> /root/.bashrc
echo "alias y='cd /var/www/html/yessuc'" >> /root/.bashrc
echo "alias r='cd /var/www/html/reports'" >> /root/.bashrc
echo "alias yespool='sh /var/www/html/reports/yespool.sh'" >> /root/.bashrc
echo "alias todpool='sh /var/www/html/reports/ip.sh'" >> /root/.bashrc
echo "alias tod='sh /var/www/html/reports/g.sh'" >> /root/.bashrc
echo "alias sum='sh /var/www/html/reports/queuesum.sh'" >> /root/.bashrc
echo "alias todrep='sh /var/www/html/reports/todall.sh'" >> /root/.bashrc
echo "alias todrepc='sh /var/www/html/reports/todcust.sh'" >> /root/.bashrc
echo "alias todipall='sh /var/www/html/reports/todallip.sh'" >> /root/.bashrc
echo "alias todipcus='sh /var/www/html/reports/todipcus.sh'" >> /root/.bashrc
echo "alias todemailall='sh /var/www/html/reports/todemailall.sh'" >> /root/.bashrc
echo "alias todemailcus='sh /var/www/html/reports/todemailcus.sh'" >> /root/.bashrc
echo "alias delallq='sh /var/www/html/reports/deleteallq.sh'" >> /root/.bashrc
echo "alias yesrep='sh /var/www/html/reports/yesall.sh'" >> /root/.bashrc
echo "alias yesrepc='sh /var/www/html/reports/yescust.sh'" >> /root/.bashrc
echo "alias yesipall='sh /var/www/html/reports/yesallip.sh'" >> /root/.bashrc
echo "alias yesipcus='sh /var/www/html/reports/yesipcus.sh'" >> /root/.bashrc
echo "alias yesemailall='sh /var/www/html/reports/yesemailall.sh'" >> /root/.bashrc
echo "alias yesemailcus='sh /var/www/html/reports/yesemailcus.sh'" >> /root/.bashrc
echo "alias stopp='service pmta stops'" >> /root/.bashrc
echo "alias startp='service pmta start'" >> /root/.bashrc
echo "alias restartp='service pmta restart'" >> /root/.bashrc
echo "alias showq='pmta show topqueues'" >> /root/.bashrc
echo "alias showallq='pmta show topqueues --maxitems=1000'" >> /root/.bashrc
echo "alias delq='sh /var/www/html/reports/deleteq.sh'" >> /root/.bashrc
echo "alias mlog='sh /var/www/html/reports/live.sh'" >> /root/.bashrc
echo "alias mlogec='sh /var/www/html/reports/liveec.sh'" >> /root/.bashrc
echo "alias mlogr='sh /var/www/html/reports/mlogr.sh'" >> /root/.bashrc
echo "alias mlogd='sh /var/www/html/reports/mlogd.sh'" >> /root/.bashrc
echo "alias delvips='sh /var/www/html/reports/delvips.sh'" >> /root/.bashrc
echo "alias delvipscnt='sh /var/www/html/reports/delvipscnt.sh'" >> /root/.bashrc
echo "alias config='vi /etc/pmta/config'" >> /root/.bashrc
echo "alias lasth='sh /var/www/html/reports/lasthour.sh'" >> /root/.bashrc
echo "alias lastm='sh /var/www/html/reports/lastminute.sh'" >> /root/.bashrc
echo "alias domainwisecount='sh /var/www/html/reports/domainwisecount.sh'" >> /root/.bashrc

echo "------------------------------------------------------------------<br>";
echo "<font colour='red'> INSTALLING PMTA BOUNCE PROCESSOR</font>";

cd /var/www/html
wget -q http://18.188.212.44/bounce_processor_pmta_server.tar.gz
tar -xvf bounce_processor_pmta_server.tar.gz
cd bounce_processor
sed -i "s/185.244.152.6/$1/g" run.php
chmod 0755 ../bounce_processor

echo "------------------------------------------------------------------<br>";
echo "<font colour='red'> INSTALLING PMTA REPORTING SYSTEM</font>";

cd /var/www/html/
rm -rf analysis/
rm -rf small_server_report.tar.gz
wget -q http://18.188.212.44/small_server_report.tar.gz
tar -xvf small_server_report.tar.gz
chmod 0755 analysis
chmod 0777 analysis/give_file.php
chmod 0777 analysis/tar_files
chmod 0755 /etc/pmta
chmod 0755 /etc/pmta/files
chmod 0777 /etc/pmta/files/*
sed -i 's/46.245.165.142/$1/g' analysis/*.php
sed -i 's/78.47.166.116/$1/g' analysis/*.php
rm -rf /var/www/html/analysis/tar_files/*
cd /var/www/html/

echo $'iUser_Alias WWW=apache\nWWW ALL=(ALL) NOPASSWD:ALL\n\E:wq!\n' | vi /etc/sudoers
sed -i "s/Defaults requiretty/Defaults \!requiretty/g"  /etc/sudoers
cd /var/db/sudo/
mkdir apache lectured
chmod 0700 *
chown root:root *

sed -i 's/SELINUX=enforcing/SELINUX=disabled/' /etc/selinux/config
sed -i 's/SELINUXTYPE=targeted/#SELINUXTYPE=targeted/' /etc/selinux/config

echo "------------------------------------------------------------------<br>";
echo "<font colour='red'> RESTARTING SERVICE</font>";

service httpd restart
service pmta restart
service crond restart
iptables -F

echo "------------------------------------------------------------------<br>";
echo "<font colour='red'> SYNCRONISING DATE</font>";

rm -rf /etc/localtime 2>/dev/null; unlink /etc/localtime 2>/dev/null
ln -s /usr/share/zoneinfo/EST /etc/localtime
vzctl exec 1041 rm -rf /etc/localtime 2>/dev/null
vzctl exec 1041 unlink /etc/localtime 2>/dev/null
vzctl exec 1041 ln -s /usr/share/zoneinfo/EST /etc/localtime
yum -y install ntp
systemctl enable ntpdate
systemctl start ntpdate
systemctl enable ntpd
systemctl start ntpd
chkconfig --list ntpd
chkconfig ntpd on
ntpdate be.pool.ntp.org
hwclock --systohc
ntpstat
ntpq -p

echo "------------------------------------------------------------------<br>";
echo "<font colour='red'> FOR BOUNCE SETUP</font>";

cd /var/www/html/
mkdir bounce
cd bounce 
wget -q http://18.188.212.44/bharat/404complaint/bounce.sh
sed -i 's/server2/$1/g' bounce.sh

echo "------------------------------------------------------------------<br>";
echo "<font colour='red'> SETTING CRONS</font>";
echo \\\"01 * * * * rm -rf /tmp/*\\\" >> /var/spool/cron/root
echo \\\"01 * * * * rm -rf /var/log/httpd/*\\\" >> /var/spool/cron/root
echo \\\"*/1 * * * * /etc/init.d/iptables start\\\" >> /var/spool/cron/root 
echo \\\"*/5 * * * * chmod 0777 /etc/pmta/files/*.csv\\\" >> /var/spool/cron/root 
echo \\\"*/20 * * * * echo 1 > /proc/sys/vm/drop_caches\\\" >> /var/spool/cron/root 
echo \\\"*/15 * * * * php /var/www/html/bounce_processor/pmta_acc_bounce.php\\\" >> /var/spool/cron/root 
echo \\\"*/10 * * * * sh /var/www/html/bounce/bounce.sh\\\" >> /var/spool/cron/root 
