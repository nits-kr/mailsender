<?php
error_reporting(0);
header("Access-Control-Allow-Origin: *");
date_default_timezone_set("EST");
 include "/var/www/html/admin/include.php";
$mainip=$_SERVER['HTTP_HOST'];

$date = date("Y-m-d H:i:s");
session_start();

      if(!isset($_SESSION['username'])) // If session is not set then redirect to Login Page
       {
           header("Location:login.php?action=session+logged+out");
       }

$sid = $_SESSION['id'];

$offerid = trim($_REQUEST["offerid"]);

if ($offerid != '') {
$offerid = trim($_REQUEST["offerid"]);
$domain = trim($_REQUEST["domain"]);
$domain = str_replace('http:','',$domain);
$domain = str_replace('https://','',$domain);
$domain = str_replace('/','',$domain);
$linktext = trim($_REQUEST["linktext"]);
$mailer_id = trim($_REQUEST["mailer_id"]);

                             $result .=  "<br><br><b><font color='#006137' size='4'> Link Created Successfully :</font><br><br><br>";
                             $result .= ' <font color="blue"> Pattern 1 </font> <br> <textarea style="font-size: 12px; line-height:1.9;width:100%;height:auto;color:red"> <img alt="" src="http://'.$domain. $linktext.'/OO/{base_trk}" style="width: 1px; height: 1px;" border="0"></textarea>  <br><br>';
                             $result .= ' <font color="blue"> Pattern 2 </font> <br> <textarea style="font-size: 12px; line-height:1.9;width:100%;height:auto;color:red"> <img alt="" src="http://'.$domain. $linktext.'/OO/{hex_trk}" style="width: 1px; height: 1px;"  border="0"></textarea>  <br><br>';

    }

?>










<html>


<head>
<title> Open tracking Generate</title>
<!-- Latest compiled and minified CSS -->
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">

<!-- Optional theme -->
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css" integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp" crossorigin="anonymous">

<!-- Latest compiled and minified JavaScript -->
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>




<style>
input[type=text], select, textarea {
    padding: 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    resize: vertical;
margin:2px;
width: -webkit-fill-available;
}
input[type=submit] {
    background-color: #04AA6D;
    color: white;
    padding: 12px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    float: center;
    font-weight: bold;
}


#main {
-webkit-box-shadow: 6px 3px 80px 9px rgba(102,102,102,0.37);
-moz-box-shadow: 6px 3px 80px 9px rgba(102,102,102,0.37);
box-shadow: 6px 3px 80px 9px rgba(102,102,102,0.37);
padding: 15px;
margin-top: 25px;
    margin-right: 225px;
    margin-bottom: 225px;
    margin-left: 225px;
}

td {
margin:5px;
padding:22px;
width:50%;
font-weight: bold;
text-align:center;
}

</style>
</head>

<body>

<center>
<div id='main'>
<br><h1><b> Open tracking Generate </b></h1><hr><br>

<form action='' method='POST'>
<table width='100%' > 
<tr>
					<td style='width:100%' colspan="2" rowspan="1">
                    <input name='mailer_id' type='hidden' value='<?php echo $sid; ?>' > 
                    <input name='linktext' type='text' style="width=80%" PLACEHOLDER='Link Pattern' value='<?php echo  $linktext; ?>' required>  </td>
				</tr>
				<tr>
					<td style='width:50%' ><br>
                    <input name='offerid' type='text' style="width=40%" PLACEHOLDER='Offer id' value='<?php echo $offerid; ?>' required> </td>
					<td style='width:50%' ><br>
                    <input name='domain' type='text'style="width=40%"  PLACEHOLDER='Domain' value='<?php echo $domain; ?>' required></td>
				</tr>    

                </table>
                <br><br>
<input name='submit' type='submit' >
</form>

<div>
    <p align='left'>  <?php echo $result; ?> </p>

</div>
</body>
</html>
