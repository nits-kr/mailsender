<?php
include "../include.php";
$get = trim(base64_decode($_REQUEST['request']));
//Removing email id
$get_array = explode("/",$get);
$md5_email = trim(array_pop($get_array));
$pattern = implode("/",$get_array);

// echo  "select * from all_links where pattern='$pattern'";exit;

$directory = __DIR__;

$fetch = mysql_fetch_array(mysql_query("select * from all_links where pattern='$pattern'"),MYSQL_ASSOC);
$offer_master_id = trim($fetch['offer_master_id']);
$link_type = trim($fetch['link_type']);
$own_offerid = trim($fetch['own_offerid']);

if($fetch['Status'] == 1)
{
    //ALL TRACKING LOGIC WILL BE WRITTEN IN TRACKING.PHP
    `php $directory/tracking.php '$offer_master_id' '$link_type' '$own_offerid' '$md5_email' >> $directory/out.txt &`;
    //file_put_contents(__DIR__."/redirect/redirected_data.txt",print_r($fetch, true),FILE_APPEND);

    //REDIRECTION
    echo $fetch['main_link'];
}
else
{
    echo getrandomlink();
}
mysql_close($conn);


function getrandomlink()
{
    $link_array = array("https://www.youtube.com/","https://www.google.com/","https://yahoo.com/","https://www.bing.com/","https://www.washingtonpost.com/","https://www.usatoday.com/");
    $random_keys=array_rand($link_array);
    return trim($link_array[$random_keys]);
}
?>





