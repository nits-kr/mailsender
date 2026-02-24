<?php
$url = 'https://fcm.googleapis.com/fcm/send';
$device_id = "e7lhGICSqI8:APA91bHWnvGMWqP46LvDd5LkHMWDSShqWYCH17-8MZ1TYKEdo4jRhuUW-e74CCVm7zaqn2WPHleMJu0aIVyPci-jsfGjPxGd5N9LxlL7VF2u4S5bSxIsbGjulK-B2MtMH--ZllP3ndlR";
$api_key = "AAAAEmhlEEI:APA91bHrURiVmxLeVH3EbAKLboAB2xX0sxHleBtGDDNzIa5irvvza_1akOLQUVwdhli03usora5VFdvgWNuT0FhJxkfM349TS2PYrZTlj1T1vRyUV74FuyGG6U-CQXa9JiMB4Ud2_RDh";
$message = "hey";

    /*api_key available in:
    Firebase Console -> Project Settings -> CLOUD MESSAGING -> Server key*/    
                
    $fields = array (
        'registration_ids' => array (
                $device_id
        ),
        'data' => array (
                "message" => $message
        )
    );

    //header includes Content type and api key
    $headers = array(
        'Content-Type:application/json',
        'Authorization:key='.$api_key
    );
                
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($fields));
    $result = curl_exec($ch);
    if ($result === FALSE) {
        die('FCM Send Error: ' . curl_error($ch));
    }
    echo $result;
    curl_close($ch);
?>