<?php


session_start();

      if(!isset($_SESSION['username'])) // If session is not set then redirect to Login Page
       {
           header("Location:login.php?action=session+logged+out");  
       }

$sid = $_SESSION['id'];


include "include.php";
date_default_timezone_set("EST");

$date = date("Y-m-d H:i:s");
$affiliate = trim($_REQUEST["affiliate"]);
$offerid = trim($_REQUEST["offerid"]);
$payout = trim($_REQUEST["payout"]);
$offername = trim($_REQUEST["offername"]);
$lastsuppdate = trim($_REQUEST["lastsuppdate"]);
$netepc = trim($_REQUEST['cap']);
$expdate  = trim($_REQUEST['expdate']);
$offerlink  = trim($_REQUEST['offerlink']);
$unslink = trim($_REQUEST["unslink"]);
$prelink = trim($_REQUEST["prelink"]);
$trtype = trim($_REQUEST["trtype"]);
$suppstatus = trim($_REQUEST["suppstatus"]);
$sub_lines = base64_encode(trim($_REQUEST["sub_lines"]));
$from_names = base64_encode(trim($_REQUEST['from_names']));
$comments  = base64_encode(trim($_REQUEST['comments']));
$srt  = trim($_REQUEST['srt']);
$sensitivity  = trim($_REQUEST['sensitivity']);



$check = "select * from `admin`.`offermaster` where offerid = '". trim($offerid) ."' or  affiliate = '". trim($affiliate) ."'";
mysql_query($check,$rds);
$found = mysql_affected_rows($rds);
if ($found == 1)
{
    $result = " Affiliate : ". trim($affiliate) ."<br> Offer Id : ". trim($offerid) ."<br> Offer already Added";
}
else
{


   $query = "INSERT INTO `admin`.`offermaster` (`leaddesc`,`affiliate`, `offerid`, `payout`, `offername`, `lastsuppdate`,`netepc` ,  `expdate`, `offerlink`, `unslink`, `prelink`, `trtype`, `suppstatus` ,`sub_lines`, `from_names`, `comments` ,`srt`, `sensitivity`,`status`) VALUES ('0', '$affiliate', '$offerid', '$payout', '$offername', '$lastsuppdate','$netepc' ,'$expdate', '$offerlink', '$unslink', '$prelink', '$trtype', '$suppstatus' ,'$sub_lines', '$from_names', '$comments' ,'$srt', '$sensitivity', '$suppstatus' )";


   if(mysql_query($query,$rds))
        $result =  "Offer Inserted Successfully";
    else
        $result =  "Offer Not Added. ".mysql_error($rds);
}

echo "<font color = 'red' ><b>". $result ."</b></font>";

mysql_close($rds);

?>
