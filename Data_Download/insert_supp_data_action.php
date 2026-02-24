<?php
$uploadedfilename = __DIR__."/uploads/".trim($_REQUEST['filename']);
$Affliate = trim($_REQUEST['affliate']);
$dir = __DIR__;
`php $dir/upload_file_in_backend.php '$uploadedfilename' '$Affliate' >> $dir/upload_out.txt &`;
echo "<font color=green>Supp DataFile Uploaded Successfully For $Affliate..! <br>Data will uploaded after Some time..! <br>Refresh After Some time</font>";
?>
