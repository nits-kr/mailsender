<?php
include "../include.php";
$id = $_REQUEST['id'];

echo "<div align=\"center\"><h3>SHOWING IP WISE REPORT FOR TEMPLATE ID <font style='color: red;'> ".$id." </font></h3></div><hr><br>";
echo "<table align = 'center' border = '1' style = 'border-collapse: collapse;'>
    <thead>
        <tr>
            <th>IP</th>
            <th>STATUS</th>
            <th>FILE NAME</th>
            <th>PER IP LIMIT</th>
            <th>SENT COUNT</th>
            <th>UPDATE TIME</th>
        </tr>
    </thead>
    </tbody>";
$query = mysql_query("select svml_ip_pool.ip,svml_ip_pool.status,  svml_ip_pool.data, svml_ip_pool.last_update_time,  svml_ip_pool.ip_send_limit,            svml_ip_pool.ip_mail_sent from svml_ip_pool where svml_ip_pool.svml_sendgrid_id ='".$id."'");
while($get = mysql_fetch_array($query))
{
/*    $count = `wc -l /var/www/data/$get[3];`;
    $count1 = str_replace("/var/www/data/$get[3]","",$count);*/
    echo "<tr>
        <td align = 'center'>$get[0]</td>
        <td align = 'center'>$get[1]</td>
        <td align = 'center'>$get[2]</td>
        <td align = 'center'>$get[4]</td>
         <td align = 'center'>$get[5]</td>
        <td align = 'center'>$get[3]</td>
    </tr>";
}

?>