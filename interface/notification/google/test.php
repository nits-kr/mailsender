<?php
require_once '../../vendor/autoload.php';

$client = new Google_Client();
$client->setApplicationName("Hangouts");
$client->setDeveloperKey("AIzaSyDDjPaR5P49lbLvnO4Q6ldqO4Y0FQMlO0s");

$service = new Google_Service_Hangout($client);
$optParams = array('filter' => 'free-ebooks');
$results = $service->volumes->listVolumes('Henry David Thoreau', $optParams);

foreach ($results as $item) {
  echo $item['volumeInfo']['title'], "<br /> \n";
}
?>
