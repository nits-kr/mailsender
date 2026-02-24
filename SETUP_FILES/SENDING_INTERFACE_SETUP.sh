0. Login to new ip

1. Install http : 
    a. sudo apt update && sudo apt upgrade -y
    b. sudo apt-get remove nano -y
    c. sudo apt-get install apache2 -y
    d. service apache2 restart



2 Install PHP (With Local Repo) :
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
    p. echo 'Acquire::Languages "none";' | sudo tee /etc/apt/apt.conf.d/99disable-translations > /dev/null
    r. apt-cache policy php5.6
    s. sudo apt update && sudo apt upgrade -y
    t. sudo apt install php5.6 php5.6-mcrypt php5.6-cli php5.6-gd php5.6-curl php5.6-mysql php5.6-ldap php5.6-zip php5.6-fileinfo php5.6-imap php5.6-xml php5.6-mbstring -y
    u. service apache2 restart
    v. cd /root

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
sed -i 's/max_execution_time = 30/max_execution_time = 600/g' /etc/php/5.6/apache2/php.ini
sed -i 's/max_input_time = 60/max_input_time = 600/g' /etc/php/5.6/apache2/php.ini
sed -i 's|;upload_tmp_dir =| upload_tmp_dir = /tmp|g' /etc/php/5.6/apache2/php.ini 
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


Create User for all Tables of Main Server : 
---------------------------------------------------------------------------------------
# On (Main Server)
mysql -u root -pdvfersefag243435 -e "CREATE USER 'sendingInterfaceUser'@'157.173.122.179' IDENTIFIED BY 'dvfersefag243435';"
mysql -u root -pdvfersefag243435 -e "GRANT ALL PRIVILEGES ON *.* TO 'sendingInterfaceUser'@'157.173.122.179' WITH GRANT OPTION;"
mysql -u root -pdvfersefag243435 -e "FLUSH PRIVILEGES;"

# On (Main Server), edit /etc/mysql/mysql.conf.d/mysqld.cnf
# Change bind-address to allow remote connections:
sed -i 's/^bind-address\s*=.*/bind-address = 0.0.0.0/' /etc/mysql/mysql.conf.d/mysqld.cnf
service mysql restart

# From (New Server), test connection:
mysql -h 173.249.50.153 -u sendingInterfaceUser -pdvfersefag243435


Create sql alias for Main server : 
----------------------------------------------------------------------------------------
cd /root
vi .bashrc
press i

paste below after "alias mv='mv -i'"

alias sql='mysql -h 173.249.50.153 -u sendingInterfaceUser -pdvfersefag243435'
alias sqlroot='mysql -u root -pdvfersefag243435'

Press esc button
press : wq enter

source ~/.bashrc
sql -e "SHOW DATABASES;"


Get Interfaces from Main Server :
-----------------------------------------------------------------------------------------
on Sending Server :
wget http://173.249.50.153/all_html_sending_setup_final.tar.gz
tar xvfz all_html_sending_setup_final.tar.gz
rm -rf all_html_sending_setup_final.tar.gz
chmod -R 777 /var/www/html/

For IP replace :
------------------------------------------------------------------------------------
cd /var/www/html/
grep -rl "173.249.50.153" | grep -v "interface/out/" | sed "s|^|sed -i 's/173.249.50.153/PUT NEW IP/g' |g"
Eg : grep -rl "173.249.50.153" | grep -v "interface/out/" | grep -v ".sql" | sed "s|^|sed -i 's/173.249.50.153/157.173.122.179/g' |g"


Install Crontabs :
------------------------------------------------------------------------------------
crontab -e
press i
paste below :
*/3 * * * * /etc/init.d/apache2 restart
01 * * * * rm -rf /tmp/*
01 * * * * rm -rf /var/log/*/*-*
01 * * * * rm -rf /var/log/*-*
*/2 * * * * echo 1 > /proc/sys/vm/drop_caches
* * * * * sh /etc/dropChache.sh
* * * * * find /var/www/html/screenout -maxdepth 1 -type f ! -name 'auto_screen_cron.txt' ! \( -newermt 'yesterday' ! -newermt 'today' \) -print -delete
* * * * * /usr/bin/php /var/www/html/admin/auto_screen_runner.php
Press esc button
press : wq enter