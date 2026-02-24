<?php
session_start();

if (!isset($_SESSION['username'])) {
  header("Location:login.php?action=session+logged+out");
  die();
}
?>

<?php
$link = mysql_connect('localhost', 'root', 'dvfersefag243435') or die('Could not connect: ' . mysql_error());
mysql_select_db('svml') or die('Could not select database');

if ($_REQUEST['sno']) {
  $sno = $_REQUEST['sno'];
  $q = "SELECT 
        a.*,
        b.`name` as `mailer`
        FROM 
        `svml`.`screenmapper` a, 
        `login`.`users` b 
        WHERE 
        a.`mailer`=b.`email` AND
        a.`svml_id`='$sno'";
  $selectsno = mysql_fetch_array(mysql_query($q),MYSQL_ASSOC);
  $map = [
    '/var/www/html/interface/send_mul_phpm_new.php' => 'svml_sendgrid',
    '/var/www/html/interface_new/php_mailer_auto_send_v2.php' => 'svml_sendgrid',
    '/var/www/html/ESP_Module_fsock_send_smtp_auto/auto_send.php' => 'ESP_admin_data',
  ];
  $table = $map[$selectsno['interface']];

  if($table == 'svml_sendgrid'){
    echo "This is Sendgrid Template. Please check in Sendgrid Dashboard.";
    $query = mysql_fetch_array(mysql_query("SELECT `msg` FROM `svml`.`$table` WHERE `sno` = '$svml'"), MYSQL_ASSOC);
    echo $query['msg'];
  } else {
    $svml = $selectsno['svml_id'];
    $query = mysql_fetch_array(mysql_query("SELECT `body` FROM `svml`.`$table` WHERE `entity_id` = '$svml'"), MYSQL_ASSOC);
    $temp = json_decode(base64_decode($query['body']), true);
    echo $template = base64_decode($temp['message_html']);
  }
}
$sid = $_SESSION['id'];

?>