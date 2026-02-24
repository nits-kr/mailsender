<?php
include "../include.php";
$omid = trim($argv[1]);
$category = trim($argv[2]);
$oid = trim($argv[3]);
$md5 = trim($argv[4]);
// print_r($argv);

if($md5 == '' || $md5 == '((_track_))')
{
    mysql_query("insert into offer_module.tracking (`emailid`,`omid`,`category`,`oid`) values ('NULL','$omid','$category','$oid')") or die ("Error :".mysql_error()."\n");
}
else
{
    $email_array = mysql_fetch_array(mysql_query("select email from all_data.emailmaster where md5='$md5'"));
    $email = $email_array['email'];
    if($email == '')
    {
        mysql_query("insert into offer_module.tracking (`emailid`,`omid`,`category`,`oid`) values ('NULL','$omid','$category','$oid')") or die ("Error :".mysql_error()."\n");
    }
    else
    {
        mysql_query("insert into offer_module.tracking (`emailid`,`omid`,`category`,`oid`) values ('$email','$omid','$category','$oid')") or die ("Error :".mysql_error()."\n");
    }
}
mysql_close($conn);
?>