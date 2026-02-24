<?php
echo $total_count_datafile = count(file("/var/www/data/".$_REQUEST['id']))-1;
?>