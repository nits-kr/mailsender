<?php
include "include.php";
$type = trim($_REQUEST['type']);
$offer = trim($_REQUEST['offer']);
$oid = trim($_REQUEST['oid']);

$type_array = explode(",",$type);
$type = implode("','",$type_array);
$oid_array = explode(",",$oid);
$oid = implode("','",$oid_array);
$return = "<input type='checkbox' id='isp_checkbox'>";
$return .= "<select class='isp' name='isp[]' id='isp' multiple='multiple' style='width: 75%' onchange='stepfour()'>";
$query = mysql_query("select SUBSTRING_INDEX(a.emailid,'@',-1) isp ,count(distinct(emailid)) cnt from `offer_module`.`tracking` a, `offer_module`.`offermaster` b where a.omid=b.sno and a.category in ('$type') and a.omid in ($offer) and a.oid in ('$oid') and a.emailid != 'NULL' group by 1") or die (mysql_error()); 
while($fetch = mysql_fetch_array($query))
{
    $return .= "<option value='$fetch[isp]'>$fetch[isp] | $fetch[cnt]</option>";
}
$return .= "</select>";
echo $return;
mysql_close($conn);
?>