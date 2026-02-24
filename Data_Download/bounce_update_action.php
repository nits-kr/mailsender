<?php
include "session.php";
ini_set("memory_limit","-1");
include "include.php";

$ids = trim($_REQUEST['ids']);
$ids_array = explode("\n",$ids);
$query = "update `all_data`.`emailmaster` set `emailmaster`.`status`= 'B' where email in ('";
$ids_link = implode("','",$ids_array);
$query .= $ids_link."')";

if(mysql_query($query)) {
    echo "<font color= green>TOTAL COUNT : ".count($ids_array)."<br>UPDATED COUNT : ".mysql_affected_rows()."</font>";
} else {
    echo "<font color= red> MYSQL_ERROR".mysql_error()."</font>";
}
mysql_close($conn);

