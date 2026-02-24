

<?php

date_default_timezone_set('America/Los_Angeles');


$date =date("Y-m-d H:i:s");
echo $currentDate = strtotime($date);
echo "\n";
echo $futureDate = $currentDate+(60*5);
 $formatDate = date("Y-m-d H:i:s", $futureDate);

for ($i=$currentDate; $i < $futureDate; $i++ )
{

echo $i;
echo "\n";
sleep(1);
}

?>
