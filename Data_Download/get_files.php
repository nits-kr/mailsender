<?php
    include "include.php";
    $sql = mysql_query("select `filename`,count(1) as file_count from `emailmaster` where `status`='A' group by `filename`");
    while($fetch = mysql_fetch_array($sql,MYSQL_ASSOC))
    {
        echo "<font color=green>".$fetch['filename']."</font> | <font color=red>".$fetch['file_count']."</font>\n";
    }
    mysql_close($conn);
?>
