<?php
$data = base64_decode(trim($_REQUEST['filename']));
$file_array = explode("/",$data);
$filename = array_pop($file_array);
$result_to_show = base64_decode(trim($_REQUEST['result']));
$download_from_ip = ($_REQUEST['fromip']) ? base64_decode(trim($_REQUEST['fromip'])):'173.249.50.153';


// Data Directory
$data_direc = "/var/www/data";
if (!is_dir($data_direc)) 
{
    `sudo mkdir $data_direc`;
    `sudo chmod 0777 $data_direc`;
}

//Download File name
`wget -O /var/www/data/$filename http://$download_from_ip/Data_Download/buffer/$filename`;

//Changing Mode of file
`sudo chmod 0777 /var/www/data/$filename`;


//Check if File Successfully moved or not
if (file_exists($data_direc."/".$filename)) 
{
    echo $result_to_show;
}
else
{
    echo "File not Created..!";
}
?>
