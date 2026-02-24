1. Backup
-------------

* To take MYSQL dump :
--------------------------------------------------------
-> cd /var/www/html/all_tar/DB_back/
-> rm -rf *  
-> ll (all files needs to be deleted)

-> screen -xR ankit
-> cd /var/www/html/all_tar/DB_back/
    Note :  * Get back without cancel screen : ctrl + a + d 
            * Get back with cancel screen : ctrl + c + d

-> Run Below Commands
mysqldump -u root -pdvfersefag243435 admin > admin.sql
mysqldump -u root -pdvfersefag243435 all_data > all_data.sql
mysqldump -u root -pdvfersefag243435 imap_data_new > imap_data_new.sql
mysqldump -u root -pdvfersefag243435 login > login.sql
mysqldump -u root -pdvfersefag243435 offer_module > offer_module.sql
mysqldump -u root -pdvfersefag243435 sentora_complainer > sentora_complainer.sql
mysqldump -u root -pdvfersefag243435 suppression_v2 > suppression_v2.sql
mysqldump -u root -pdvfersefag243435 svml > svml.sql
mysqldump -u root -pdvfersefag243435 report > report.sql

ctrl A+D


-> cd /var/www/html/all_tar/DB_schema_back/
-> rm -rf * 
-> Run Below Commands
mysqldump -u root -pdvfersefag243435 --no-data admin > admin.sql
mysqldump -u root -pdvfersefag243435 --no-data all_data > all_data.sql
mysqldump -u root -pdvfersefag243435 --no-data imap_data_new > imap_data_new.sql
mysqldump -u root -pdvfersefag243435 --no-data login > login.sql
mysqldump -u root -pdvfersefag243435 --no-data offer_module > offer_module.sql
mysqldump -u root -pdvfersefag243435 --no-data sentora_complainer > sentora_complainer.sql
mysqldump -u root -pdvfersefag243435 --no-data suppression_v2 > suppression_v2.sql
mysqldump -u root -pdvfersefag243435 --no-data svml > svml.sql
mysqldump -u root -pdvfersefag243435 --no-data report > report.sql

-> Check all command properly ran or not inside screen

-> Once done, delete screen

-> ll (Check 7 files all_data.sql | login.sql | offer_module.sql | sentora_complainer.sql | svml.sql  | suppression_v2  )

*  To Entire backup :
--------------------------------------------------------

-> cd /var/www/html/
-> rm -rf all_html.tar.gz
-> tar cvfz all_html.tar.gz *


*  Download in your local
--------------------------------------------------------
-> http://173.249.50.153/all_html.tar.gz


--------------------------------------------------------------------------------------------------------------------------------------
2. Recovery
-----------
0. Login to new ip

1. Install http : 
    a. sudo apt update && sudo apt upgrade -y
    b. sudo apt-get remove nano -y
    c. sudo apt-get install apache2 -y
    d. service apache2 restart

2. Install PHP : 
    a. sudo apt-get purge php7.*
    b. sudo apt-get autoclean
    c. sudo apt-get autoremove -y
    d. sudo apt install software-properties-common ca-certificates lsb-release apt-transport-https -y
    e. LC_ALL=C.UTF-8 add-apt-repository ppa:ondrej/php 
    LC_ALL=C.UTF-8 add-apt-repository ppa:ondrej/apache2
    f. sudo apt update && sudo apt upgrade -y
    g. sudo apt install php5.6 php5.6-mcrypt php5.6-cli php5.6-gd php5.6-curl php5.6-mysql php5.6-ldap php5.6-zip php5.6-fileinfo php5.6-imap php5.6-xml php5.6-mbstring -y
    h. sudo update-alternatives --config php
            From list type number which represented for 5.6
                EG : 
                    root@wallstairs:~# sudo update-alternatives --config php
                    There are 3 choices for the alternative php (providing /usr/bin/php).

                    Selection    Path                  Priority   Status
                    ------------------------------------------------------------
                *   0            /usr/bin/php.default   100       auto mode
                    1            /usr/bin/php.default   100       manual mode
                    2            /usr/bin/php5.6        56        manual mode
                    3            /usr/bin/php8.3        83        manual mode

                    Press <enter> to keep the current choice[*], or type selection number: 2       
                    update-alternatives: using /usr/bin/php5.6 to provide /usr/bin/php (php) in manual mode
                    root@wallstairs:~# sudo update-alternatives --config php

    i. service apache2 restart

2.5 Install PHP (With Local Repo) :
    a. sudo apt-get purge php7.*
    b. sudo apt-get autoclean
    c. sudo apt-get autoremove -y
    d. sudo apt update && sudo apt upgrade -y
    e. cd /opt/
    f. sudo apt install git dpkg-dev -y
    g. git clone https://github.com/Karan06/php56-localrepo.git
    h. cd /opt/php56-localrepo
    i. dpkg-scanpackages . /dev/null | gzip -9c > Packages.gz
    j. dpkg-scanpackages . /dev/null > Packages
    k. chmod -R a+r /opt/php56-localrepo
    l. echo "deb [trusted=yes] file:/opt/php56-localrepo ./" | sudo tee /etc/apt/sources.list.d/php56-localrepo.list
    m. sudo apt update && sudo apt upgrade -y
    n. sudo apt install php5.6 php5.6-mcrypt php5.6-cli php5.6-gd php5.6-curl php5.6-mysql php5.6-ldap php5.6-zip php5.6-fileinfo php5.6-imap php5.6-xml php5.6-mbstring -y
    o. service apache2 restart
    p. cd /root



3 . Install Mysql : https://www.letscloud.io/community/how-to-install-mysql-57-on-ubuntu-2004
    a. sudo apt update
    b. sudo apt install wget -y
    c. wget https://dev.mysql.com/get/mysql-apt-config_0.8.12-1_all.deb
    d. sudo dpkg -i mysql-apt-config_0.8.12-1_all.deb
       Follow the Screen shots in above link 
    
    e. sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys B7B3B788A8D3785C
    e. sudo apt-get update
    f. sudo apt-cache policy mysql-server

    g. sudo apt install -f mysql-client=5.7* mysql-community-server=5.7* mysql-server=5.7* -y
    h. sudo mysql_secure_installation
        



Mysql Password : dvfersefag243435

login Mysql : mysql -u root -pdvfersefag243435  or sql

4. Install Screen 
--------------------------------------------
sudo apt-get install -y screen sshpass

To unzip all file : 
----------------------
mkdir /var/www/data;
chmod 0777 /var/www/data/
cd /var/www/html/
rm -rf index.html
wget http://173.249.50.153/all_html.tar.gz
tar -xvf all_html.tar.gz

Create databases: 
-------------------------------
mysql -u root -pdvfersefag243435 + enter
create database all_data;
create database login;
create database offer_module;
create database svml;
create database suppression_v2;
create database sentora_complainer;
create database admin;
create database imap_data_new;
exit;

To upload dump into db : 
--------------------------------
cd /var/www/html/all_tar/DB_back/
mysql -pdvfersefag243435 all_data < all_data.sql;
mysql -pdvfersefag243435 login < login.sql;
mysql -pdvfersefag243435 offer_module < offer_module.sql;
mysql -pdvfersefag243435 svml < svml.sql;
mysql -pdvfersefag243435 suppression_v2 < suppression_v2.sql;
mysql -pdvfersefag243435 sentora_complainer < sentora_complainer.sql;
mysql -pdvfersefag243435 admin < admin.sql
mysql -pdvfersefag243435 imap_data_new < imap_data_new.sql


To upload dump into db if you need new : 
--------------------------------
cd /var/www/html/all_tar/DB_schema_back/
mysql -pdvfersefag243435 all_data < all_data.sql;
mysql -pdvfersefag243435 login < login.sql;
mysql -pdvfersefag243435 offer_module < offer_module.sql;
mysql -pdvfersefag243435 svml < svml.sql;
mysql -pdvfersefag243435 suppression_v2 < suppression_v2.sql;
mysql -pdvfersefag243435 sentora_complainer < sentora_complainer.sql;
mysql -pdvfersefag243435 admin < admin.sql
mysql -pdvfersefag243435 imap_data_new < imap_data_new.sql


For IP replace :
------------------------------------------------------------------------------------
cd /var/www/html/

grep -rl "173.249.50.153" | grep -v "interface/out/" | sed "s|^|sed -i 's/173.249.50.153/PUT NEW IP/g' |g"

Eg : grep -rl "173.249.50.153" | grep -v "interface/out/" | grep -v ".sql" | sed "s|^|sed -i 's/173.249.50.153/100.42.184.166/g' |g"

For DB Password replace if changed: 
------------------------------------------------------------------------------------
cd /var/www/html/

grep -rl "dvfersefag243435" | sed "s|^|sed -i 's/dvfersefag243435/PUT YOUR NEW PASSWORD/g' |g"

Eg : grep -rl "dvfersefag243435" | sed "s|^|sed -i 's/dvfersefag243435/dvfersefag243435/g' |g"


Move Crontabs: 
-------------------------------------------------------------------------------------
crontab -e
press i
paste below 

01 * * * * rm -rf /tmp/*
01 * * * * rm -rf /var/log/*/*-*
01 * * * * rm -rf /var/log/*-*
*/2 * * * * echo 1 > /proc/sys/vm/drop_caches
* * * * * sh /etc/dropChache.sh
*/3 * * * * php /var/www/html/Data_Download/get_files.php > /var/www/html/Data_Download/files.txt
* * * * * php /var/www/html/suppression/cron_suppresion.php
30 19,11 * * * php /var/www/html/complain_processor/autoComplainFetcher.php >> /var/www/html/complain_processor/fetchLog.txt


Press esc button
Press : wq enter
crontab -l (command need to visible)


Add Apache alias user in Sudo file :
--------------------------------------------------------------------------------------
visudo
press i
paste below 
    www-data ALL=(ALL) NOPASSWD:ALL
Press esc button
press : wq enter
reboot

Increase PHP memory limit : 
--------------------------------------------------------------------------------------
sed -i 's/post_max_size = 8M/post_max_size = 200M/g' /etc/php/5.6/apache2/php.ini
sed -i 's/upload_max_filesize = 2M/upload_max_filesize = 200M/g' /etc/php/5.6/apache2/php.ini
sed -i 's/; max_input_vars = 1000/max_input_vars = 5000/g' /etc/php/5.6/apache2/php.ini
sed -i 's|;upload_tmp_dir =|upload_tmp_dir = /tmp|' /etc/php/5.6/apache2/php.ini
service apache2 restart


Increase MYSQL connection limit : 
--------------------------------------------------------------------------------------
vi /etc/mysql/mysql.conf.d/mysqld.cnf
press i
paste at very last

max_connections = 5000
innodb_buffer_pool_size = 1024M
sql_mode="NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION"
secure-file-priv = ""

Press esc button
press : wq enter
service mysql restart


Create sql alias : 
----------------------------------------------------------------------------------------
cd /root
vi .bashrc
press i

paste below after "alias mv='mv -i'"

alias sql='mysql -u root -pdvfersefag243435'
Press esc button
press : wq enter

terminate connection and reconnect.


Update Ip in Tar files
-----------------------------------------------------------------------------------------
cd /var/www/html/all_tar/

1. tar -xvf 404.tar.gz
   sed -i 's/173.249.50.153/100.42.184.166/g' 404.php
   rm -rf 404.tar.gz
   tar cvfz 404.tar.gz *.php
   rm -rf *.php

2. tar -xvf pmta_setup_setup.tar.gz
   sed -i 's/173.249.50.153/100.42.184.166/g' setup.sh
   rm -rf pmta_setup_setup.tar.gz
   tar cvfz pmta_setup_setup.tar.gz setup.sh
   rm -rf setup.sh

3. tar -xvf pmta_setup_ubuntu.tar.gz
   sed -i 's/173.249.50.153/100.42.184.166/g' setup_pmta_ubuntu.sh
   rm -rf pmta_setup_ubuntu.tar.gz
   tar cvfz pmta_setup_ubuntu.tar.gz setup_pmta_ubuntu.sh
   rm -rf setup_pmta_ubuntu.sh

---------------------------------------------------------------------------
Commands For Install sentora (OS - Centos 8 "cat /etc/os-release") in New IP
---------------------------------------------------------------------------

LOGIN TO YOUR DOMAIN IP

sudo apt-get update;
sudo apt-get upgrade;
cd
sudo apt-get install wget -y
wget sentora.org/install
chmod +x install
./install

After reboot run below commands

sed -i 's/dnssec-enable yes;/#dnssec-enable yes;/g' /etc/bind/named.conf

service mysql restart
service mysql status

service apache2 restart
service apache2 status

service postfix restart
service postfix status

service dovecot restart
service dovecot status

service named restart
service named status

service proftpd restart
service proftpd status

service atd restart
service atd status

cd /var/sentora/
chmod -R 0777 hostdata/
cd /etc/php/7.4/apache2
vi php.ini
press i to get into insert mode & copy below line and paste
   SP_SKIP_OLD_PHP_CHECK=1
press esc : wq
cd
cat passwords.txt

crontab -e
press i
paste below 
* * * * * sed -i 's/404.html/404.php/' /etc/sentora/configs/apache/httpd-vhosts.conf
Press esc button
Press : wq enter
crontab -l (command need to visible)


-------------------------------------------------------------
Commands After for Host domain for 4O4 REDIRECTION
-------------------------------------------------------------

cd /var/sentora/hostdata/zadmin/public_html/
ll
cd {YOUR DOMAIN}
cd _errorpages
ll
rm -rf *
wget http://100.42.184.166/all_tar/404.tar.gz
tar -xvf 404.tar.gz 
rm -rf 404.tar.gz
chmod 0777 *
cp 404.php /etc/zpanel/panel/etc/static/errorpages/
chmod 0777 /etc/zpanel/panel/etc/static/errorpages/404.php

sed -i 's/403.html/403.php/' /etc/sentora/configs/apache/httpd-vhosts.conf
sed -i 's/404.html/404.php/' /etc/sentora/configs/apache/httpd-vhosts.conf
sed -i 's/500.html/500.php/' /etc/sentora/configs/apache/httpd-vhosts.conf
sed -i 's/510.html/510.php/' /etc/sentora/configs/apache/httpd-vhosts.conf


service mysql restart
service apache2 restart
service postfix restart
service dovecot restart
service named restart
service proftpd restart
service atd restart
_____________________________________________________________________________


LOGIN Details : 

Link : http://173.249.50.153/admin/login.php
user : ankitanand@unixleymedia.com
pass : admin1234