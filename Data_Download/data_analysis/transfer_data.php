<?php
$ip = trim($_REQUEST['ip']);
$filename = trim($_REQUEST['filename']);
$result = "FILE TRANSFERED TO $ip SUCCESSFULLY";

//Copy File Name To Buffer Folder
`cp /var/www/data/$filename /var/www/html/Data_Download/buffer`;
    
//Check for Setup in remote ip
if(!UR_exists("http://$ip/Data_download_module/get_files.php"))
{
    echo "Setup Not Done..!";
}


//Ping To ip for Download
echo $ping_request = file_get_contents("http://$ip/Data_download_module/get_files.php?filename=".base64_encode($filename)."&result=".base64_encode($result));

//Delete buffer files in /var/www/html/Data_Download/buffer
`rm -rf /var/www/html/Data_Download/buffer/*`;

$ping_request = trim($ping_request); 
if ($ping_request == "FILE TRANSFERED TO $ip SUCCESSFULLY") {
    // Delete the original file after successful transfer
    `rm -f /var/www/data/$filename`;
}
function UR_exists($url)
{
    $headers=get_headers($url);
    return stripos($headers[0],"200 OK")?true:false;
 }
?>