<?php
include "include.php";
$type = trim($_REQUEST['type']);
$offer = trim($_REQUEST['offer']);
$oid = trim($_REQUEST['oid']);
$isp = trim($_REQUEST['isp']);

$type_array = explode(",",$type);
$type = implode("','",$type_array);

$oid_array = explode(",",$oid);
$oid = implode("','",$oid_array);

$isp_array = explode(",",$isp);
$ips = implode("','",$isp_array);
$return = "<input type='checkbox' id='timeframe_checkbox'>";
$return .= "<select class='timeframe' name='timeframe[]' id='timeframe' multiple='multiple' style='width: 75%' onchange='stepfive()'>";
$query = mysql_query("select time, count(emailid) cnt from (select SUBSTRING_INDEX(a.inserted_on,'-',2) time, a.emailid from `offer_module`.`tracking` a, `offer_module`.`offermaster` b where a.omid=b.sno and a.category in ('$type') and a.omid in ($offer) and a.oid in ('$oid') and a.emailid != 'NULL' and  SUBSTRING_INDEX(a.emailid,'@',-1) in ('$ips') group by 2 order by 1) test group by 1") or die (mysql_error()); 
while($fetch = mysql_fetch_array($query))
{
    $return .= "<option value='$fetch[time]|$fetch[cnt]' >$fetch[time] | $fetch[cnt]</option>";
}
$return .= "</select>";
echo $return;
mysql_close($conn);
?>