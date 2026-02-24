<?php 
include "/var/www/html/admin/include.php"; 
$roleId = mysql_real_escape_string($_REQUEST['roleId']);
$empid = mysql_real_escape_string($_REQUEST['empid']);

$sql = "UPDATE login.role_mapped SET emp_id='$empid' WHERE sno='$roleId'";

$result = mysql_query($sql);

if ($result) {
    echo "Success: Record updated successfully.";
} else {
    echo "Error: " . mysql_error();
}

mysql_close($link);
mysql_close($rds);
mysql_close($loginrds);
?>