<?php
include "include.php";
$offer_id = trim(base64_decode($_REQUEST['offer_id']));
$query = mysql_fetch_array(mysql_query("select category,count(1) cnt from tracking where oid='$offer_id'"));
$queryy = mysql_fetch_array(mysql_query("select category,count(distinct(emailid)) cnt from tracking where oid='$offer_id'"));
if(mysql_affected_rows() == 1)
{
    // echo "Total $query[0]:$query[1] | Unique $queryy[0]:$queryy[1]"; 
    echo "<table border =1 style='font-size: inherit'>";
    echo "<tr>";
    echo "<td></td>";
    echo "<td>TOTAL</td>";
    echo "<td>UNIQUE</td>";
    echo "</tr>";
    echo "<tr>";
    echo "<td>$query[0]</td>";
    echo "<td>$query[1]</td>";
    echo "<td>$queryy[1]</td>";
    echo "</tr>";
    echo "</table>";
}
else
echo "<img src='wrong.png' style='height: 15px;'/>";
mysql_close($conn);
?>


