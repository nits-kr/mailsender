<?php
include "include.php";
$type = trim($_REQUEST['type']);
$offer = trim($_REQUEST['offer']);
$type_array = explode(",",$type);
$type = implode("','",$type_array);
$return = "<input type='checkbox' id='offerid_checkbox'>";
$return .= "<select class='offerid' name='offerid[]' id='offerid' multiple='multiple' style='width: 75%' onchange='stepthree()'>";
$query = mysql_query("select a.oid from `offer_module`.`tracking` a, `offer_module`.`offermaster` b where a.omid=b.sno and a.category in ('$type') and a.omid in ($offer) group by 1") or die (mysql_error()); 
while($fetch = mysql_fetch_array($query))
{
    $return .= "<option value='$fetch[oid]'>$fetch[oid]</option>";
}
$return .= "</select>";
echo $return;
mysql_close($conn);
?>