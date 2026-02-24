<?php
/**
 * Telegram Notification Script
 * Sends campaign details (Campaign Name, Sent Time, From Email) in a formatted message to a Telegram group
 */

function sendTelegramMessage($botToken, $chatId, $message, $parseMode = 'HTML') {
    $url = "https://api.telegram.org/bot{$botToken}/sendMessage";

    $postFields = [
        'chat_id' => $chatId,
        'text' => $message,
        'parse_mode' => $parseMode,
        'disable_web_page_preview' => true
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);

    $result = curl_exec($ch);
    $curlErr = curl_error($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($curlErr) {
        return ['ok' => false, 'error' => $curlErr, 'http_code' => $httpCode];
    }

    $decoded = json_decode($result, true);
    if ($decoded === null && json_last_error() !== JSON_ERROR_NONE) {
        return ['ok' => false, 'error' => 'Invalid JSON response', 'raw' => $result, 'http_code' => $httpCode];
    }

    return $decoded;
}

// fucntion to create message and send
function sendNotification($svml_id, $response) {
    /* ==== CONFIGURATION ==== */
    $botToken    = '8168485545:AAFxhZiYeQpubqoEOJN3jipkLFL6-vzs6Yo';
    $groupChatId = '-4623439895';

    include 'include.php';
    $svml_details = mysql_fetch_array(mysql_query("SELECT a.*, b.body FROM `svml`.`screenmapper` a , `svml`.`ESP_admin_data` b WHERE a.svml_id = b.entity_id and a.svml_id = '$svml_id'"));

    $campaignName = $svml_details['screen_name'];
    $sentTime     = $svml_details['datetime'];
    $templateId   = $svml_details['svml_id'];
    $mailer       = $svml_details['mailer'];
    $rawBody   = json_decode(base64_decode($svml_details['body']), true);
    $from_email = base64_decode($rawBody['from_email']);

    /* ==== BUILD MESSAGE ==== */
    $message  = "<b>📢 Campaign Notification</b>\n";
    $message .= "<b>━━━━━━━━━━━━━━━━━━━━━━━━━</b>\n";
    $message .= "<b>📌 Campaign:</b> {$campaignName}\n";
    $message .= "<b>🆔 Template Id:</b> {$templateId}\n";
    $message .= "<b>⏰ Sent Time:</b> {$sentTime}\n";
    $message .= "<b>📧 From Email:</b> {$from_email}\n";
    $message .= "<b>📨 Mailer:</b> {$mailer}\n";
    $message .= "<b>📊 Status Message:</b> {$response}\n";
    $message .= "<b>━━━━━━━━━━━━━━━━━━━━━━━━━</b>\n";
    $message .= "✅ <i>Notification sent automatically by AutoMailer.</i>\n";
    // $message .= "👨‍💻 <i>Developed by Karan Giri | Lead Automation Developer</i>";


    /* ==== SEND MESSAGE ==== */
    $response = sendTelegramMessage($botToken, $groupChatId, $message, 'HTML');

    /* ==== RESPONSE HANDLING ==== */
    if (!isset($response['ok']) || !$response['ok']) {
        return "Telegram send failed: " . (isset($response['description']) ? $response['description'] : json_encode($response)) . PHP_EOL;
    } else {
        $messageId = isset($response['result']['message_id']) ? $response['result']['message_id'] : 'n/a';
        return "Telegram message sent successfully (Message ID: {$messageId})" . PHP_EOL;
    }
    mysql_close($sql);
}
?>
