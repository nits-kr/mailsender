<?php
$d=$argv[1];
$e=base64_decode($d);

$f=strrev($e);
$g=base64_decode($f);
echo $g;

?>
