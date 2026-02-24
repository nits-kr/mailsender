<?php
include "include.php";
if (isset($_GET['email']) && isset($_GET['messageId'])) {
    $email = htmlspecialchars($_GET['email']);
    $messageId = $_GET['messageId'];
    echo checkEmailStatus($email, $messageId); 
} else {
    // Handle the case where parameters are not set
    echo "<font color='red'>Error: Missing email or message ID</font>";
}
mysql_close($link);

/**
 * Summary of checkEmailStatus
 * @param mixed $email
 * @param mixed $messageId
 * @return bool|string
 */
function checkEmailStatus($email, $messageId) {
    // echo "select `$email`.`status` from `imap_data_new`.`$email` where `$email`.`message_id` = '$messageId'";
    $fetch = mysql_fetch_array(mysql_query("select `$email`.`status` from `imap_data_new`.`$email` where `$email`.`message_id` = '$messageId'"),MYSQL_ASSOC);
    if($fetch) {
        mysql_query("UPDATE `svml`.`auto_script_test_status` SET `status` = '$fetch[status]' WHERE `msgid` = '$messageId' AND `status` IS NULL");
        if($fetch['status'] == 'SPAM') {
            return "<font color='red'> SPAM</font>";
        } else {
            return "<font color='green'> INBOX</font>";
        }

    } else {
        return "<img src='../admin/hourglass.gif' style='width:10px;height:10px'> STILL CHECKING..!";
    }
}
?>
