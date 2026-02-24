<?php
date_default_timezone_set("EST");
$filename = trim($_REQUEST['file']);
$fileFullPath = "/var/www/data/$filename";
// Check File name : 
if(file_exists($fileFullPath))
{
    $times = trim($_REQUEST['times']);
    $display = NULL;
    //Split Processor
    `split -l $times $fileFullPath $fileFullPath-`;
    `sudo chmod 0777 $fileFullPath-*`;
    $return = explode("\n",`wc -l $fileFullPath-* | awk '{print $2,$1}'`);
    array_pop($return);
    array_pop($return);
    foreach($return as $line)
    {
        $ele = explode(" ",$line);
        //$display .= str_replace("/var/www/data/","",$ele[0])." || Final Count: $ele[1]\n";
        $display .= str_replace("/var/www/data/","",$ele[0])."\n";
    }

    if($display != NULL) {
        echo $display;
        // Remoe Orignal File
        `rm -rf $fileFullPath`;
    } else {
        echo "Some Thing Went wrong while splitting";
    }
} else {
    echo "File Not Exixt.";
}



?>