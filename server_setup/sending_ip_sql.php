<?php
$link = mysql_connect("localhost","root","dvfersefag243435") or die ("Error: ".mysql_error());
$main_ip = $_SERVER['HTTP_HOST'];
$ip = "100.42.184.166";//$_REQUEST['send_ip'];
$pass = "2FFP3RJ1KNx2pEWxz";//$_REQUEST['send_pass'];
$sql = $_REQUEST['sql'];
$assigned = $_REQUEST['assigned'];

echo "<pre>";
echo "--------------------------------------------------------------\n";
echo "-------------------- INSERTING CREDENTIAL ---------------------\n";
echo "--------------------------------------------------------------\n";
// Setting Assigned to 
`sed -i "s/replace_assigned/$assigned/g" /var/www/html/server_setup/sql_files/$sql`;

// Extracting ServerName
$server = `cat /var/www/html/server_setup/sql_files/$sql | awk -F "','" '{print $2}' | sort -r | uniq | tr -d '\n'`;

// Delete Existing Records
$data = "delete from svml.mumara where assignedip in ("; 
$data .= `cat /var/www/html/server_setup/sql_files/$sql | awk -F "','" '{print $6}' | sed '/^$/d' | sed "s/$/\',/g" | sed "s/^/\'/g" | tr -d "\n"`;
$data = rtrim($data,",");
$data .= ");";
mysql_query($data) or die (mysql_error());

echo "<pre>";
// Inserting Records
$data = `cat /var/www/html/server_setup/sql_files/$sql;`;
$data_array = explode("\n",$data);
foreach($data_array as $line) {
    mysql_query(trim($line));
}
echo "<br>CREDENTIALS INSERTED";

// Checking Records
$data = '';
$data = "select concat('SERVER: ',server,'--TOTAL IP: ',count(*)) record from svml.mumara where server='$server'";
$count = mysql_fetch_array(mysql_query($data));
echo "<br></br>".$count[0];
echo "</pre>";
mysql_close($link);
?>
