<?php
include "include.php";
$script_name= trim($_REQUEST['scriptname']);
$ip =trim($_SERVER['HTTP_HOST']);
$svml_id= trim($_REQUEST['svml_id']);
$svml2=explode("\n",$svml_id);
$svml=array_unique($svml2);
$inserted= trim($_REQUEST['inserted']);
$m_type= trim($_REQUEST['mailer']);





if(empty($script_name)) {
if($inserted=='0') {
echo "insert or select amy script name";
exit;	
}
foreach ($svml as $id)
{
	
mysql_query("insert into mul_temp (script_name,svml_sendgrid_sno,temp1) values ('$inserted','$id','$ip')");
echo $id;
echo "<br>";
}
echo "php /var/www/html/interface/$m_type $inserted";
}

else {

foreach ($svml as $id)
{
mysql_query("insert into mul_temp (script_name,svml_sendgrid_sno,temp1) values ('$script_name','$id','$ip')");
echo $id;
echo "<br>";
}
echo "php /var/www/html/interface/$m_type $script_name";
}



?>