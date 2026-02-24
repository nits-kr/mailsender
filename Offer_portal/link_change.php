<?php
include "include.php";
$id = trim($_REQUEST['id']);
$link = trim(base64_decode($_REQUEST['link']));
$query = "UPDATE all_links SET main_link = '$link' where sno='$id'";
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


