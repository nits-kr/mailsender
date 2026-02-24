
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<script src="jquery.js"></script>
<link rel="stylesheet" type="text/css" href="css.css" media="all">
<link href="select2.css" rel="stylesheet"/>
<script type="text/javascript" >
			$(function() {
$("form#myf").submit(function() {
$('#result').text('Processing...');
var mailer = encodeURIComponent($('#mailer').val());	
var scriptname = encodeURIComponent($('#scriptname').val());	
var svml_id= encodeURIComponent($('#svml_id').val());	
var inserted= encodeURIComponent($('#inserted').val());	
if(svml_id=='')
{
$('#result').text('Please insert scriptid');
$('#svml_id').focus();
//alert("Please Insert Account Name");
}
else if(mailer=='')
{
$('#result').text('Please insert mailer type');
$('#mailer').focus();
//alert("Please Insert Account Name");
}

else
{
		$.ajax({
			type: "POST",
			url: "add_temp.php",
			data: "scriptname="+scriptname+"&svml_id="+svml_id+"&inserted="+inserted+"&mailer="+mailer,
			success: function(data){
            $('#result').html(data);

}
		});
		}
return false;
	});
});
</script>
</head>
<body>
<img id="top" src="top.png" alt="">
<div id="form_container">
		<form id="myf" class="appnitro"  method="post">
		<div class="form_description">
			<h2>INSERT TEMP IDS</h2>
			<p></p>
		</div>						
			<ul >
		<li id="li_1" >
		<select id="mailer" name="mailer" class="element text medium">
	<option >select Mailer </option>
<option value="send_mul_phpm_2222.php">PHPMAILER</option>
<option value="send_mul_swift_2222.php">SWIFTMAILER</option>
<option value="send_mul_smtpgo_2222.php">PHPMAILER_2</option>
</select>
</li>			
			
		<br>	
			
		<li id="li_1" >
		<select id="inserted" name="inserted" class="element text medium">
		<option value="0">select script name</option>
<?php
$link = mysql_connect('localhost', 'root', 'dvfersefag243435') or die('Could not connect: ' . mysql_error()); 
mysql_select_db('svml') or die('Could not select database');
$query=mysql_query("SELECT distinct(script_name) FROM mul_temp");
while($row=mysql_fetch_array($query)){
echo "<option value='".$row['script_name']."'>".$row['script_name']."</option>";
}
?>
</select>
</li>
<br>	
	<li id="li_1" >
		<label >Script_Name</label>

		<div>
			<input id="scriptname" name="scriptname" class="element text medium" type="text" maxlength="255"/> 
			
			
		</div>
		</li>
		<li id="li_1" >
		
		<label >Svml_Ids</label>
		<div>
			<textarea id="svml_id" name="svml_id" class="element text medium" ></textarea>
		</div>
		</li>
					<input id="saveForm" class="button_text" type="submit" name="submit" value="Submit" />
			</ul>
			<div class="result" id="result" style="margin-top:20px; color:#FF0000; font-weight:600"></div>	
		</form>	
		</div>
</body>
</html>