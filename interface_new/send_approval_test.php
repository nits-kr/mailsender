<?php
function sendApprovalEmail($iid, $unique, $ip_pair) {
    $d=date('Y-m-d');
    $sql = mysql_query("select group_concat(approval_email.email SEPARATOR '\n') email from approval.approval_email");
    $fetch = mysql_fetch_array($sql, MYSQL_ASSOC);
    $email = $fetch['email'];
    if($email != NULL)
    {
        foreach($unique as $smtpip) {
                $toemails=base64_encode($email);
                $cmd="php /var/www/html/interface_new/maild_man_lu_new.php '$iid' '$toemails' '$smtpip'  >> /var/www/html/interface_new/out/".$ip_pair."_".$d." &";
                $output = '';
                $return_var = 0;
                exec($cmd, $output, $return_var);
                if ($return_var === 0) {
                    echo "Approval email sent successfully for $smtpip<br>";
                } else {
                    echo "Error sending approval email for $smtpip<br>";
                }
            } 
    }
}

?>