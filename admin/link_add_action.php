<?php
include "include.php";
date_default_timezone_set("EST");
$date = date("Y-m-d H:i:s");


session_start();

      if(!isset($_SESSION['username'])) // If session is not set then redirect to Login Page
       {
           header("Location:login.php?action=session+logged+out");  
       }

$sid = $_SESSION['id'];
$susername = $_SESSION['email'];

$offerdetailid = trim($_REQUEST["offerdetailid"]);
$offerid = trim($_REQUEST["offerid"]);
$linktype = trim($_REQUEST["linktype"]);
$domain = trim($_REQUEST["domain"]);
$domain = str_replace('http:','',$domain);
$domain = str_replace('https://','',$domain);
$domain = str_replace('/','',$domain);
$linktext = trim($_REQUEST["linktext"]);
$offlnk = trim($_REQUEST['offlnk']);
$onlink = trim($_REQUEST["onlink"]);
$mailer_id = trim($_REQUEST["mailer_id"]);

$check = "select * from `admin.`redirlink_2021` where offerid = '". trim($offerid) ."' or  linktext = '". trim($linktext) ."'";
mysql_query($check,$rds);
$found = mysql_affected_rows($rds);
        if ($found == 1)
        {
            $result = " <font color = 'red' ><b> Already Present  :<br> ". trim($offerid) ." &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <br>". trim($linktext)."</b></font>" ;
        }
        else
        {
                    $query = "INSERT INTO `admin`.`redirlink_2021` (`offerdetailid`,`offerid`, `linktype`, `domain`, `linktext`, `offlnk`,`onlink` ,  `mailer_id`) VALUES ('$offerdetailid', '$offerid', '$linktype', '$domain', '$linktext','$offlnk' ,'$onlink', '$mailer_id')";
                    $query2 = "INSERT INTO `admin`.`redirstatus_2021` (`offerdetailid`,`offerid`, `status`, `mailer`) VALUES ('$offerdetailid', '$offerid', '1', '$mailer_id')";

                    mysql_query($query2,$rds);
                    echo mysql_error($rds);

                    if(mysql_query($query,$rds)){
                            $result .=  "<br><br><b><font color='blue'> Offer Link Created Successfully </font><br><br><br>";
                            $result .= " <font color='black'> Pattern 1 </font> <br> <font color='red'> http://".$domain. $linktext."/{base_trk}</font> <br><br>";
                            $result .= " <font color='black'> Pattern 2 </font><br> <font color='red'>  http://".$domain. $linktext."/{hex_trk}</font> <br><br></b>";
                        }
                        else { 
                            $result =  "<font color = 'red' ><b> Link Not Created : <br><br> Already Present  <br>". trim($offerid) ." &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <br>". trim($linktext)."</b></font>";
                        }

        echo $result ;
        }

mysql_close($rds);


?>
