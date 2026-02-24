<?php

// API access key from Google API's Console
define( 'API_ACCESS_KEY', 'AAAAEmhlEEI:APA91bHrURiVmxLeVH3EbAKLboAB2xX0sxHleBtGDDNzIa5irvvza_1akOLQUVwdhli03usora5VFdvgWNuT0FhJxkfM349TS2PYrZTlj1T1vRyUV74FuyGG6U-CQXa9JiMB4Ud2_RDh' );


$registrationIds = array("e7lhGICSqI8:APA91bHWnvGMWqP46LvDd5LkHMWDSShqWYCH17-8MZ1TYKEdo4jRhuUW-e74CCVm7zaqn2WPHleMJu0aIVyPci-jsfGjPxGd5N9LxlL7VF2u4S5bSxIsbGjulK-B2MtMH--ZllP3ndlR");

// prep the bundle
$msg = array
(
	'message' 	=> 'here is a message. message',
	'title'		=> 'This is a title. title',
	'subtitle'	=> 'This is a subtitle. subtitle',
	'tickerText'	=> 'Ticker text here...Ticker text here...Ticker text here',
	'vibrate'	=> 1,
	'sound'		=> 1,
	'largeIcon'	=> 'large_icon',
	'smallIcon'	=> 'small_icon'
);

$fields = array
(
	'registration_ids' 	=> $registrationIds,
	'data'			=> $msg
);
 
$headers = array
(
	'Authorization: key=' . API_ACCESS_KEY,
	'Content-Type: application/json'
);
 
$ch = curl_init();
curl_setopt( $ch,CURLOPT_URL, 'https://fcm.googleapis.com/fcm/send' );
curl_setopt( $ch,CURLOPT_POST, true );
curl_setopt( $ch,CURLOPT_HTTPHEADER, $headers );
curl_setopt( $ch,CURLOPT_RETURNTRANSFER, true );
curl_setopt( $ch,CURLOPT_SSL_VERIFYPEER, false );
curl_setopt( $ch,CURLOPT_POSTFIELDS, json_encode( $fields ) );
$result = curl_exec($ch );
curl_close( $ch );

echo $result;
?>