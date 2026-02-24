<?php
date_default_timezone_set("EST");
include "include.php";
$type = trim($_REQUEST['type']);
$offer = trim($_REQUEST['offer']);
$oid = trim($_REQUEST['oid']);
$isp = trim($_REQUEST['isp']);
$tframe_orignal = trim($_REQUEST['tframe']);
$tframe = NULL;
$total_count = NULL;
$lines = explode(",",$tframe_orignal);
foreach ($lines as $line)
{
    $line_array = explode("|",$line);
    $tframe .= $line_array[0]."','";
    $total_count += $line_array[1];
}
$tframe = rtrim($tframe,"','");

$email = NULL;
$email_count = 0;

$type_array = explode(",",$type);
$type = implode("','",$type_array);

$oid_array = explode(",",$oid);
$oid = implode("','",$oid_array);

$isp_array = explode(",",$isp);
$ips = implode("','",$isp_array);


$filename = generatefile();
$filename_path = "/var/www/data/".trim($filename);


$sql = "select 
a.emailid
from 
`offer_module`.`tracking` a, 
`all_data`.`emailmaster` b
where 
a.emailid = b.email and 
b.status = 'A' and
a.category in ('$type') and
a.omid in ($offer) and 
a.oid in ('$oid') and 
a.emailid != 'NULL' and 
SUBSTRING_INDEX(a.emailid,'@',-1) in ('$ips') and 
SUBSTRING_INDEX(a.inserted_on,'-',2) in ('$tframe') 
group by 1";

$query = mysql_query($sql) or die (mysql_error()); 
while($fetch = mysql_fetch_array($query,MYSQL_NUM))
{
    $email.=$fetch[0]."\n";
    $email_count++; 
}
file_put_contents($filename_path, $email);
`chmod 0777 $filename_path`;

$return = "<br><table id='analysis' border=1>
            <tr>
                <th>FILENAME</th>
                <th>TOTAL COUNT</th>
                <th>AFTER SUPPRESS UNIQ</th>
            </tr>
            <tr>
                <td>$filename</td>
                <td>$total_count</td>
                <td>$email_count</td>
            </tr>
        </table>";
$return .= "<hr><input type='hidden' name='filename' id='filename' value='$filename'><input type='text' name='ip' id='ip'>&nbsp&nbsp&nbsp<button onclick='stepseven()'>TRANSFER DATA</button>";
echo $return;
mysql_close($conn);

function generatefile()
{
    return $filename = trim(md5(date("Y-m-d H:i:s").microtime().rand(1,10000)));
}
?>