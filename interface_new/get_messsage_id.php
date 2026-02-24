<?php

function get_message_id($svml)
{
    date_default_timezone_set("EST");
    include "/var/www/html/interface_new/include.php";
    $number = mysql_fetch_array(mysql_query("select inbpatt,bcc from svml.svml_sendgrid where sno='$svml'"));
    $inb_num = $number['inbpatt'];
    $msid = $number['bcc'];
    $url = "http://75.119.149.20/interface/http_get_messsage_id.php?inbno=".$inb_num."&msgdom=".$msid ;
   $data  = file_get_contents($url);
    $data = trim($data);
 return $data;

}
?>
