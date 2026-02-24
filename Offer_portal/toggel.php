<?php
include "include.php";
$id = $_REQUEST['id'];
$query = "UPDATE all_links SET Status = (CASE Status WHEN 1 THEN 0 ELSE 1 END) where sno=$id";
if(mysql_query($query))
{
    echo "<img src='tick.png' style='height: 15px;'/>";
}
else
{
    echo "<img src='wrong.png' style='height: 15px;'/>";
}
mysql_close($conn);
?>


