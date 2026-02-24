<?php
error_reporting(1);
$main_ip = $_SERVER['HTTP_HOST'];
$configtext = trim($_REQUEST['configtext']);
$shredpoolip = trim($_REQUEST['shredpoolip']);
$server_ip = $_REQUEST['server_ip'];
$server_pass = $_REQUEST['server_pass'];
$host =$_REQUEST['host'];
$server =$_REQUEST['server'];
$port =$_REQUEST['port'];
$tls =$_REQUEST['tls'];

`rm -rf /var/www/html/server_setup/configs/"$server_ip"_config.txt`;
`rm -rf /var/www/html/server_setup/sql_files/"$server_ip"_sql.sql`;

if($shredpoolip != '' )
	{
		$mta .= "<virtual-mta sharedserver.pool> \n";
		$mta .= "smtp-source-host $shredpoolip \n";
		$mta .= "</virtual-mta>\n\n";
		
		$cloud .= "<virtual-mta-pool cloud.pool> \n";
		$cloud .= "virtual-mta sharedserver.pool \n";
		$cloud .= "</virtual-mta-pool> \n\n";
		
		$shareip = explode(" ",$shredpoolip);
		
	}

$lines = explode("\n",$configtext);
if($shredpoolip == '')
$shareip = explode(" ",$lines[0]);
foreach($lines as $line)
	{
		$line = trim($line);
		$exp = explode(" ",$line);
		$dom = explode(".",$exp[1]);
		$last = explode(".",$exp[0]);
		
		$mta .= "<virtual-mta server$last[2]$last[3].pool$last[2]$last[3]>\n";
		$mta .= "smtp-source-host $line \n";
		$mta .= "</virtual-mta>\n\n";
		
		$cloud .= "<virtual-mta-pool cloud$last[2]$last[3].pool$last[2]$last[3]>\n";
		$cloud .= "virtual-mta server$last[2]$last[3].pool$last[2]$last[3]\n";
		$cloud .= "</virtual-mta-pool>\n\n";
		
                $smtp_password = rand();
		$user .= "<smtp-user $dom[1]$last[2]$last[3]>\n";
		$user .= "password $smtp_password\n";
		$user .= "source {server$last[2]$last[3]}\n";
		$user .= "</smtp-user>\n";
		$user .= "<source {server$last[2]$last[3]}>\n";
		$user .= "default-virtual-mta cloud$last[2]$last[3].pool$last[2]$last[3]\n";
		$user .= "</source>\n\n";
		
		$list .= "smtp-listener $exp[0]:25\n";
		$list .= "smtp-listener $exp[0]:587\n";
		
		$cred .= "insert into \\`svml\\`.\\`mumara\\` (\\`hostname\\`,\\`server\\`,\\`pass\\`,\\`port\\`,\\`tls\\`,\\`assignedip\\`,\\`user\\`,\\`accountname\\`) values ('".$host."','".$server."','".$smtp_password."','".$port."','".$tls."','".$exp[0]."','"."$dom[1]$last[2]$last[3]"."','replace_assigned');\n";
		$showCred .= "$exp[0]|$host|$dom[1]$last[2]$last[3]|$smtp_password|$port|$tls\n";

	}

//=====================config generation=========================================


`echo "http-access $server_ip admin
postmaster admin@$server_ip
<domain $server_ip>
deliver-local-dsn yes
</domain>
# Settings for Backoff codes in SMTP reply

<smtp-pattern-list SMTPRESPONS>
        reply /421 PR(ct1)/ mode=backoff
        reply /^550 SC-001/ mode=backoff
        reply /420 Resources unavailable temporarily/ mode=backoff
        reply /^Resources unavailable temporarily/ mode=backoff
        reply /^421/ mode=backoff
        reply /^450/ mode=backoff
        reply /^try later/ mode=backoff
        reply /^553/ mode=backoff
        reply /^421/ mode=backoff
        reply /^550/ mode=backoff
        reply /^553/ mode=backoff
        reply /^550 SC-001/ mode=backoff
        reply /^421 4.7.0/ mode=backoff
        reply /^busy/ mode=backoff
        reply /^WSAECONNREFUSED/ mode=backoff
        reply /^WSAECONNRESET/ mode=backoff
        reply /^Connection attempt failed/ mode=backoff
</smtp-pattern-list>

############################################################################
# BEGIN: BACKOFF RULES
############################################################################

<smtp-pattern-list common-errors> 
        reply /generating high volumes of.* complaints from AOL/    mode=backoff 
        reply /Excessive unknown recipients - possible Open Relay/  mode=backoff 
        reply /^421 .* too many errors/                             mode=backoff 
        reply /blocked.*spamhaus/                                   mode=backoff 
        reply /451 Rejected/                                        mode=backoff 
</smtp-pattern-list>

<smtp-pattern-list blocking-errors>
        #
        # A QUEUE IN BACKOFF MODE WILL SEND MORE SLOWLY
        # To place a queue back into normal mode, a command similar
        # to one of the following will need to be run:
        # pmta set queue --mode=normal yahoo.com
        # or
        # pmta set queue --mode=normal yahoo.com/vmta1
        #
        # To use backoff mode, uncomment individual <domain> directives
        #
        #AOL Errors
        reply /421 .* SERVICE NOT AVAILABLE/ mode=backoff
        reply /generating high volumes of.* complaints from AOL/ mode=backoff
        reply /554 .*aol.com/ mode=backoff
        reply /421dynt1/ mode=backoff
        reply /HVU:B1/ mode=backoff
        reply /DNS:NR/ mode=backoff
        reply /RLY:NW/ mode=backoff
        reply /DYN:T1/ mode=backoff
        reply /RLY:BD/ mode=backoff
        reply /RLY:CH2/ mode=backoff
        #
        #Yahoo Errors
        reply /421 .* Please try again later/ mode=backoff
        reply /421 Message temporarily deferred/ mode=backoff
        reply /VS3-IP5 Excessive unknown recipients/ mode=backoff
        reply /VSS-IP Excessive unknown recipients/ mode=backoff
        #
        # The following 4 Yahoo errors may be very common
        # Using them may result in high use of backoff mode
        #
        reply /\[GL01\] Message from/ mode=backoff
        reply /\[TS01\] Messages from/ mode=backoff
        reply /\[TS02\] Messages from/ mode=backoff
        reply /\[TS03\] All messages from/ mode=backoff
        #
        #Hotmail Errors
        reply /exceeded the rate limit/ mode=backoff
        reply /exceeded the connection limit/ mode=backoff
        reply /Mail rejected by Windows Live Hotmail for policy reasons/ mode=backoff
        reply /mail.live.com\/mail\/troubleshooting.aspx/ mode=backoff
        #
        #Adelphia Errors
        reply /421 Message Rejected/ mode=backoff
        reply /Client host rejected/ mode=backoff
        reply /blocked using UCEProtect/ mode=backoff
        #
        #Road Runner Errors
        reply /Mail Refused/ mode=backoff
        reply /421 Exceeded allowable connection time/ mode=backoff
        reply /amIBlockedByRR/ mode=backoff
        reply /block-lookup/ mode=backoff
        reply /Too many concurrent connections from source IP/ mode=backoff
        #
        #General Errors
        reply /too many/ mode=backoff
        reply /Exceeded allowable connection time/ mode=backoff
        reply /Connection rate limit exceeded/ mode=backoff
        reply /refused your connection/ mode=backoff
        reply /try again later/ mode=backoff
        reply /try later/ mode=backoff
        reply /550 RBL/ mode=backoff
        reply /TDC internal RBL/ mode=backoff
        reply /connection refused/ mode=backoff
        reply /please see www.spamhaus.org/ mode=backoff
        reply /Message Rejected/ mode=backoff
        reply /Delivery report/ mode=backoff
        reply /refused by antispam/ mode=backoff
        reply /Service not available/ mode=backoff
        reply /currently blocked/ mode=backoff
        reply /locally blacklisted/ mode=backoff
        reply /not currently accepting mail from your ip/ mode=backoff
        reply /421.*closing connection/ mode=backoff
        reply /421.*Lost connection/ mode=backoff
        reply /476 connections from your host are denied/ mode=backoff
        reply /421 Connection cannot be established/ mode=backoff
        reply /421 temporary envelope failure/ mode=backoff
        reply /421 4.4.2 Timeout while waiting for command/ mode=backoff
        reply /450 Requested action aborted/ mode=backoff
        reply /550 Access denied/ mode=backoff
        reply /exceeded the rate limit/ mode=backoff
        reply /421rlynw/ mode=backoff
        reply /permanently deferred/ mode=backoff
        reply /\d+\.\d+\.\d+\.\d+ blocked/ mode=backoff
        reply /www\.spamcop\.net\/bl\.shtml/ mode=backoff
        reply /generating high volumes of.* complaints from AOL/    mode=backoff 
        reply /Excessive unknown recipients - possible Open Relay/  mode=backoff 
        reply /^421 .* too many errors/                             mode=backoff 
        reply /blocked.*spamhaus/                                   mode=backoff 
        reply /451 Rejected/                                        mode=backoff 
</smtp-pattern-list>

############################################################################
# END: BACKOFF RULES
############################################################################


############################################################################
# BEGIN: BOUNCE RULES
############################################################################

<bounce-category-patterns>
        /spam/ spam-related
        /junk mail/ spam-related
        /blacklist/ spam-related
        /blocked/ spam-related
        /\bU\.?C\.?E\.?\b/ spam-related
        /\bAdv(ertisements?)?\b/ spam-related
        /unsolicited/ spam-related
        /\b(open)?RBL\b/ spam-related
        /realtime blackhole/ spam-related
        /http:\/\/basic.wirehub.nl\/blackholes.html/ spam-related
        /\bvirus\b/ virus-related
        /message +content/ content-related
        /content +rejected/ content-related
        /quota/ quota-issues
        /limit exceeded/ quota-issues
        /mailbox +(is +)?full/ quota-issues
        /\bstorage\b/ quota-issues
        /(user|mailbox|recipient|rcpt|local part|address|account|mail drop|ad(d?)ressee) (has|has been|is)? *(currently|temporarily +)?(disabled|expired|inactive|not activated)/ inactive-mailbox
        /(conta|usu.rio) inativ(a|o)/ inactive-mailbox
        /Too many (bad|invalid|unknown|illegal|unavailable) (user|mailbox|recipient|rcpt|local part|address|account|mail drop|ad(d?)ressee)/ other
        /(No such|bad|invalid|unknown|illegal|unavailable) (local +)?(user|mailbox|recipient|rcpt|local part|address|account|mail drop|ad(d?)ressee)/ bad-mailbox
        /(user|mailbox|recipient|rcpt|local part|address|account|mail drop|ad(d?)ressee) +(\S+@\S+ +)?(not (a +)?valid|not known|not here|not found|does not exist|bad|invalid|unknown|illegal|unavailable)/ bad-mailbox
        /\S+@\S+ +(is +)?(not (a +)?valid|not known|not here|not found|does not exist|bad|invalid|unknown|illegal|unavailable)/ bad-mailbox
        /no mailbox here by that name/ bad-mailbox
        /my badrcptto list/ bad-mailbox
        /not our customer/ bad-mailbox
        /no longer (valid|available)/ bad-mailbox
        /have a \S+ account/ bad-mailbox
        /\brelay(ing)?/ relaying-issues
        /domain (retired|bad|invalid|unknown|illegal|unavailable)/ bad-domain
        /domain no longer in use/ bad-domain
        /domain (\S+ +)?(is +)?obsolete/ bad-domain
        /denied/ policy-related
        /prohibit/ policy-related
        /rejected/ policy-related
        /refused/ policy-related
        /allowed/ policy-related
        /banned/ policy-related
        /policy/ policy-related
        /suspicious activity/ policy-related
        /bad sequence/ protocol-errors
        /syntax error/ protocol-errors
        /\broute\b/ routing-errors
        /\bunroutable\b/ routing-errors
        /\bunrouteable\b/ routing-errors
        /^2.\d.\d/ success
        /^[45]\.1\.1/ bad-mailbox
        /^[45]\.1\.2/ bad-domain
        /^[45]\.3\.5/ bad-configuration
        /^[45]\.4\.1/ no-answer-from-host
        /^[45]\.4\.2/ bad-connection
        /^[45]\.4\.4/ routing-errors
        /^[45]\.4\.6/ routing-errors
        /^[45]\.4\.7/ message-expired
        /^[45]\.7\.1/ policy-related
        // other    # catch-all
</bounce-category-patterns>

############################################################################
# END: BOUNCE RULES
############################################################################

#
# Settings per source IP address (for incoming SMTP connections)
#" > /var/www/html/server_setup/configs/"$server_ip"_config.txt`; 

`echo "#---------------------------------------------------------------------------" >> /var/www/html/server_setup/configs/"$server_ip"_config.txt`;
`echo "#-------------------------- VIRTUAL MTA ------------------------------------" >> /var/www/html/server_setup/configs/"$server_ip"_config.txt`;
`echo "#---------------------------------------------------------------------------" >> /var/www/html/server_setup/configs/"$server_ip"_config.txt`;
`echo "$mta" >> /var/www/html/server_setup/configs/"$server_ip"_config.txt`;

`echo "#---------------------------------------------------------------------------" >> /var/www/html/server_setup/configs/"$server_ip"_config.txt`;
`echo "#------------------------ VIRTUAL MTA POOL ---------------------------------" >> /var/www/html/server_setup/configs/"$server_ip"_config.txt`;
`echo "#---------------------------------------------------------------------------" >> /var/www/html/server_setup/configs/"$server_ip"_config.txt`;
`echo "$cloud" >> /var/www/html/server_setup/configs/"$server_ip"_config.txt`;

`echo "#---------------------------------------------------------------------------" >> /var/www/html/server_setup/configs/"$server_ip"_config.txt`;
`echo "#---------------------------- SMTP USER ------------------------------------" >> /var/www/html/server_setup/configs/"$server_ip"_config.txt`;
`echo "#---------------------------------------------------------------------------" >> /var/www/html/server_setup/configs/"$server_ip"_config.txt`;
`echo "$user" >> /var/www/html/server_setup/configs/"$server_ip"_config.txt`;

`echo "
<source 0/0>
        jobid-header Message-ID
        process-x-job yes
        hide-message-source yes
        allow-unencrypted-plain-auth yes
        hide-message-source yes
        always-allow-relaying yes   # allow feeding
        add-received-header no
        process-x-virtual-mta yes   # allow selection of a virtual MTA
        max-message-size unlimited  # 0 implies no cap, in bytes
        smtp-service yes            # allow SMTP service
        require-auth true
        add-message-id-header yes
</source>" >> /var/www/html/server_setup/configs/"$server_ip"_config.txt`;

`echo "$list" >> /var/www/html/server_setup/configs/"$server_ip"_config.txt`;

`echo "$cred" >> /var/www/html/server_setup/sql_files/"$server_ip"_sql.sql`;



`echo " 
# DKIM SELECTORS START

# DKIM SELECTORS END 



                        #
# {gmImprinter} is a special queue used for imprinting Goodmail tokens.
#
<domain {gmImprinter}>
        max-events-recorded 150
#       log-messages yes
#       log-data no             # extremely verbose, for debugging only
        retry-after 15s
</domain>

<domain *>
       max-smtp-out    2                             # max. connections *per domain*
       bounce-after    4d                            # 4 days, 12 hours
       retry-after     10m                           # 10 minutes
       max-msg-per-connection 500
       dk-sign yes
       dkim-sign yes
       dkim-identity sender-or-from
       dkim-identity-fallback @lemon-cake.biz
#      log-commands    yes
       backoff-to-normal-after 2h
       backoff-to-normal-after-delivery true
       backoff-retry-after 30m
       backoff-max-msg-rate    10/m
       bounce-upon-no-mx yes
       smtp-pattern-list SMTPRESPONS
       use-starttls  yes
       require-starttls no
</domain>

#
# Port used for HTTP management interface
#
#http-mgmt-port 8080
#http-access 127.0.0.1 admin
#http-access 0/0 admin

#
# IP addresses allowed to access the HTTP management interface, one
# per line
#


#
# Synchronize I/O to disk after receiving the message.  'false' yields
# higher performance, but the message may be lost if the system crashes
# before it can write the data to disk.
#
sync-msg-create false

#
# Synchronize I/O to disk after updating the message (e.g., to mark recipients
# handled).  'false' yields higher performance, but if the system crashes
# before it can write the data to disk, some recipients may receive multiple
# copies of a message.
#
run-as-root yes
sync-msg-update false

#
# Logging file
#
log-file /etc/pmta/log/pmta.log # logrotate is used for rotation
log-auto-rotation true
log-rotate 10                 # number of files; 0 disables rotation

#
# Accounting file(s)
#
<acct-file /etc/pmta/files/acct.csv>
#    move-to /opt/myapp/pmta-acct   # configure as fit for your application
record-fields delivery *,envId,jobId,bounceCat
move-interval 5m
delete-after 7d
max-size 50M
user-string from
</acct-file>

# transient errors (soft bounces)
<acct-file /etc/pmta/files/diag.csv>
move-interval 1d
delete-after 7d
records t
</acct-file>

#
# Spool directories
#
spool /var/spool/pmta

#<spool /var/spool/pmta>
#    deliver-only no
#</spool>
# EOF

host-name $shareip[0]
total-max-smtp-in 1000" >> /var/www/html/server_setup/configs/"$server_ip"_config.txt`;

//=========================Config generated================================

`echo "<pre>"  > /var/www/html/server_setup/out.txt`;
`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/out.txt`;
`echo "----------- CONFIG GENERATED AND SETUP IN SERVER -------------\n"  >> /var/www/html/server_setup/out.txt`;
`echo "--------------------------------------------------------------\n"  >> /var/www/html/server_setup/out.txt`;
$data = "cd /etc/pmta/;wget -O config http://$main_ip/server_setup/configs/".$server_ip."_config.txt;echo '\n CONFIG GENERATED';echo '\nRESTARTING PMTA\n';service pmta restart;echo '\nPMTA DEBUG';pmtad --debug";
$cmd = `sshpass -p "$server_pass" ssh -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null root@$server_ip "$data"  >> /var/www/html/server_setup/out.txt`;
file_put_contents("/var/www/html/server_setup/out.txt","\n\n Please update in ESP_ADMIN POrtal\n--------------------------------------------------------------\n".$showCred, FILE_APPEND);
`echo "</pre>"  >> /var/www/html/server_setup/out.txt`;

echo $out = `cat /var/www/html/server_setup/out.txt`;
?>
