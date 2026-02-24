<?php
$filename_to_upload = trim($_REQUEST['filename_to_upload']);
$filename = trim($_REQUEST['filename']);
$mode = trim($_REQUEST['mode']);
$dir = __DIR__;
$command = "nohup php $dir/insert_data_action.php '$filename_to_upload' '$filename' '$mode' >> $dir/data_upload_out.txt 2>&1 &";
// echo htmlspecialchars($command) . "<br>";
`$command`;
`echo "DataFile Uploaded Successfully For $filename | $filename_to_upload..! Data will Inserted after Some time..!" >> $dir/data_upload_out.txt`;
echo "<font color=green>DataFile Uploaded Successfully For $filename | $filename_to_upload..! <br>Data will uploaded after Some time..! <br>Refresh After Some time</font>";
?>
 