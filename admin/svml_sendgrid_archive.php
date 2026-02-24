<?php
include "include.php";
date_default_timezone_set("Asia/Kolkata");
echo "------*********************".date("Y-m-d h:i:s a")."************(************----------\n";
echo "-----Need to take backup into archive table and delete from svml_sendgrid table--------\n";
echo "------***********************************************************************----------\n";
mysql_select_db('svml') or die('Could not select database');

echo "Archiving : \n";
mysql_query("Insert into svml_sendgrid_arch(sno, ip, mode, subject, from_val, emails, type, limits, offer, data, domain,
head, pwd, sleep_time, limit_to_send, username, mailer, server, tempname, textm, times, script,
smode, date, timestamp, lastsuccesstime, remarks, stype, oid, bcc, mutidomains, status, 
approved_by, reason, sleep, in_link, sencode, fencode, charen, contend, charen_alt, contend_alt, 
headers, inbox_patt, reply_to, xmailer, inbpatt, relay_per, fbl, retest, retest_after, screen_name)
select sno, ip, mode, subject, from_val, emails, type, limits, offer, data, domain,
head, pwd, sleep_time, limit_to_send, username, mailer, server, tempname, textm, times, script,
smode, date, timestamp, lastsuccesstime, remarks, stype, oid, bcc, mutidomains, status, 
approved_by, reason, sleep, in_link, sencode, fencode, charen, contend, charen_alt, contend_alt, 
headers, inbox_patt, reply_to, xmailer, inbpatt, relay_per, fbl, retest, retest_after, screen_name
from svml_sendgrid
where datediff(now(), date) > 2") or die (mysql_error());
echo "Archived Count: ".mysql_affected_rows()."\n";


echo "Deleting : \n";
mysql_query("delete from svml_sendgrid where datediff(now(), date) > 2") or die (mysql_error());
echo "Records deleted : ".mysql_affected_rows()."\n";


mysql_close($link);
mysql_close($rds);
mysql_close($loginrds);
echo "------***********************************************************************----------\n";
