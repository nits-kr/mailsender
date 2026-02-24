<?php

if(isset($_REQUEST['submit'])){

$ips = trim($_REQUEST['ips']);

$ipss = explode("\n",$ips);
$ipcount = count($ipss);


$totaldata = trim($_REQUEST['totaldata']);
$totaltime = trim($_REQUEST['totaltime']);
$waittime = trim($_REQUEST['waittime']);
$limimttosend =  trim($_REQUEST['limimttosend']);



 $second = ($totaltime * 60 * 60);
 $ipsend = ($totaldata / $ipcount);
 $mainst = ($second / $ipsend);

 $lsend = ($mainst * $limimttosend);


 $wt = ($ipcount * $waittime);

 $maini= ($lsend - $wt); 
   
$main = "<font color='red' size='5'> SLEEP TIME  :  ".$maini ."<font>";

}

?>
<html>


<head>
<title> sleep time calculator</title>
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
margin: 125px
}

td {
margin:5px;
padding:5px;
width:50%;
font-weight: bold;
text-align:center;
}

</style>
</head>

<body>

<center>
<div id='main'>
<br><h1><b>SLEEP TIME CALCULATOR</b></h1><hr><br>

<form action='' method='post'>
<table width='300px' > <tr><td rowspan="3">
<textarea name='ips' style='margin-top: 2px; margin-bottom: 2px; height: 326px;'  placeholder='PUT IPS HERE...' required><?php echo $ips; ?></textarea>  </td> <td> 
<input name='totaldata' type='text' placeholder='TOTAL DATA' value="<?php echo $totaldata; ?>"  required> </td> <td>
<input name='totaltime' type='text' PLACEHOLDER='TOTAL TIME (in hours)' value='<?php echo $totaltime; ?>' required>     </td> </tr> <tr>  <td>
 <select name="waittime" id="tls" style="width:100%" > <option value="0" selected>WAIT TIME</option> <option value="0">0</option><option value="1">1</option>  <option value="2">2</option><option value="3">3</option></select>     </td>  <td>
<input name='limimttosend' type='text' Placeholder='Limit To Send' value='<?php echo $limimttosend; ?>' />  </td> <td> </tr> <tr> <td colspan="2">
<input name='submit' type='submit' > </td> </tr>   <tr>  <td colspan="3"> <?php echo $main ;?>  </td> </tr> </table>
</form>
</body>
</html>
