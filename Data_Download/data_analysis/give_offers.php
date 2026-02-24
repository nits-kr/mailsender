<?php
include "include.php";
$data = trim($_REQUEST['data']);
$data_array = explode(",",$data);
$data = implode("','",$data_array);
$return = "<input type='checkbox' id='offers_checkbox'>";
$return .= "<select class='offer' name='offer[]' id='offer' multiple='multiple' style='width: 75%' onchange='steptwo()'>";
$query = mysql_query("select b.sno,concat(LEFT(b.offer_name,20),'...') offer_name,b.Affiliate from `offer_module`.`tracking` a, `offer_module`.`offermaster` b where a.omid=b.sno and a.category in ('$data') group by 1,2,3") or die (mysql_error()); 
while($fetch = mysql_fetch_array($query))
{
    $return .= "<option value='$fetch[sno]'>$fetch[offer_name]|$fetch[Affiliate]</option>";
}
$return .= "</select>";
echo $return;
mysql_close($conn);
?>