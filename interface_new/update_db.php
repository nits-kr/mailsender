<?php
include "include.php";
$data = trim(base64_decode($_REQUEST['data']));
$res = explode("|",$data);
mysql_query("update svml.auto_script_status set auto_script_status.status = '".$res[2]."', auto_script_status.reason = '".$res[1]."' where auto_script_status.sno = '".$res[0]."'");

?>