<?php
include "include.php";
$date = date("Y-m-d H:i:s");
$server = $_REQUEST["server"];
$ipp = $_REQUEST["ip"];
$assign = $_REQUEST["assign"];
##ip server rdns
$ips = explode("\n",$ipp);
foreach($ips as $aip)
{
    $each_data = explode("|",$aip);
    $count = count($each_data);
    if($count == 6)
    {
        $ip = trim($each_data[0]);
        $host = trim($each_data[1]);
        $user = trim($each_data[2]);
        $pass = trim($each_data[3]);
        $port = trim($each_data[4]);
        $tls = trim($each_data[5]);

            $fetch_ip = mysql_fetch_array(mysql_query("select assignedip from svml  where assignedip ='".$ip."'",$rds),MYSQL_ASSOC);
            if($fetch_ip['assignedip'] == '')
            {
                mysql_query("insert into mumara (assignedip,server,hostname,user,pass,port,tls,accountname) values('$ip','$server','$host','$user','$pass','$port','$tls','$assign')",$rds);
                echo "<font color='green'>$ip</font> Credentials Inserted<br>";
            }
            else
            {
                mysql_query("update mumara set accountname = '".$assign."',hostname='".$host."',user='".$user."',pass='".$pass."', port='".$port."' ,tls = '".$tls."'  where assignedip ='".$ip."'",$rds);
                echo "<font color='green'>$ip</font> Credentials UPDATED<br>";
            }
        }
        else 
        {
            echo "<font color='red'>$ip</font> is not a valid ip..! Please recheck and insert again.<br>";
        }
}
mysql_close($rds);
?>
