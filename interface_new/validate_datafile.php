<?php
$datafile = $_GET['q'];
$fullpathdata = "/var/www/data/".$datafile;
$check = file_exists($fullpathdata);

if($check == '1')
{
$total_count_datafile = count(file($fullpathdata));
echo "<img src='tick.png'/></img> <b> ".$total_count_datafile."</b>";
}
else{
echo "<img src='cross.png'/></img>";
}
?>
