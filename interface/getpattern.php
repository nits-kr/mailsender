<?php
$data = `/usr/bin/sudo grep 'case ' http_get_messsage_id.php | sed 's|^ *||g;s|* $||g;s|:||g' |sed 's|case|pattern|g'`;
$data = trim($data);

$dataa = explode("\n", $data);

foreach ($dataa as $pat)
{

$details = explode(' ',trim($pat));
$no = trim($details[1]);
$name = trim($details[0]);

  echo "<option value='". $no ."'>".$name." ".$no."</option>";
}
?>
