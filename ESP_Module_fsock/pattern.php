<?php
session_start();
if(!isset($_SESSION['username'])) // If session is not set then redirect to Login Page
{
	header("Location:../admin/login.php?action=Login+Required");
}

try {
$conn = new PDO(
  sprintf(
    "mysql:host=localhost;dbname=%s;",
    'laravel'
  ),
  'root',
  'dvfersefag243435',
  array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES UTF8")
);
} catch (PDOException $e) {
    echo "There was a problem connecting. " . $e->getMessage();

die();
}


$resource = $conn->prepare("SELECT * FROM `patterns`");

$response = $resource->execute();

if ($response) {
  $patterns = $resource->fetchAll(PDO::FETCH_ASSOC);

} else {
 $patterns = [];
}

?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<head>

<style type="text/css">
.style1 {
	font-size: 12px;
	font-weight: bold;
}
.style2 {font-size: 10px; font-weight: bold; font-family: tahoma; text-align:center;}
</style>
<script language=javascript>
checked=false;
function checkedAll (frm1) {
	var aa= document.getElementById('frm1');
	 if (checked == false)
          {
           checked = true
          }
        else
          {
          checked = false
          }
	for (var i =0; i < aa.elements.length; i++)
	{
	 aa.elements[i].checked = checked;
	}
      }
</script>
<script language="JavaScript" type="text/JavaScript">
function MM_reloadPage(init) {  //reloads the window if Nav4 resized
  if (init==true) with (navigator) {if ((appName=="Netscape")&&(parseInt(appVersion)==4)) {
    document.MM_pgW=innerWidth; document.MM_pgH=innerHeight; onresize=MM_reloadPage; }}
  else if (innerWidth!=document.MM_pgW || innerHeight!=document.MM_pgH) location.reload();
}
MM_reloadPage(true);
//-->
</script>
<script src="scriptaculous.shrunk.js" type="text/javascript" charset="ISO-8859-1">
</script>
<script>
function displayHTML(form) {
  var inf = form.message_html.value + form.message_plain.value;
  win = window.open(", ", 'popup', 'toolbar = no, status = no, scrollbars = yes');
  win.document.write("" + inf + "");
}
</script>

<meta http-equiv="content-type" content="text/html; charset=ISO-8859-1" />
<link rel="stylesheet" href="../style.css" type="text/css" media="all">
<title>ESP SMTP</title>
</head>

<body id="root" style="margin: 0px; padding: 0px; font-family: Trebuchet MS,verdana;">


<fieldset style="border: 1px solid #000000; border: 2px dotted #000000; left:5px">
<legend></legend>
<form name="form1" id ="frm1">
	<table width="100%" align="center" style="height: 100%;" cellpadding="10" cellspacing="0" border="2">
  <!-- ============ NAV ============== -->
	<tr>
	  <td style="background-color:#000033; color:#fff"><h2>FAST MAILER (ESP/SERVER)</h2></td>
		<td colspan="2" align="center" height="30" style="border:1px dotted #999">From Email Address<span style='float:right;margin:1%;'><a href='Example.html' target="_blank" ><img src="help.png" style="height:25px"></a></span><br>
		  <input style="border:1px dotted #999; font-weight:500" type="text" name="from_email" size="60" id="from_email" />
		</td>
	</tr>
	<tr>
    <!-- ============ LEFT COLUMN (MENU) ============== -->
    <td width="30%" valign="top" style=" border:1px solid #666;font-size:13.5px;padding:10px;line-height:28px;text-align:inherit;text-align:center;width: 322px;">
      <textarea name="mailing_ip" id="mailing_ip" style="margin: 0px; width: 569px; height: 310px;" placeholder="ESP (SENDGRID): (Account Email Id|host|user|pass|port|tls)
ESP (ALIBABA) : (Account Email Id|host|user|pass|port|tls|Retrun@Path)
PMTA          : (Any Random Name|host|user|pass|port|tls)"></textarea>
      <br><br>RESULT:<br><br>
      <p>
        <div id='mailing1'> </div>
      </p>
    </td>
    <!-- ============ MIDDLE COLUMN (CONTENT) ============== -->

	  <td width="70%" valign="top" >
		  <div align="center" style="padding-top:10px; text-align:left">
        <table align="center" cellpadding="0" border="0" cellspacing="0" style="font-size:12px;">
          <tbody>
            <tr>
              <td align="left" style="padding-right:20px;"><strong>Pattern</strong></td>
              <td align="center">

                <select name="headers" id="headers">
                  <?php foreach ($patterns as $pattern): ?>
                    <option value="<?= $pattern['id'] ?>"><?= $pattern['name'] ?></option>
<?php endforeach; ?>

        </select>

              </td>
            </tr>
            <tr>
              <td>&nbsp</td>
            </tr>
            <tr>
              <td align="left" style="padding-right:20px;"><strong>Subject</strong></td>
              <td align="center" style="padding-bottom:10px;"><input type="text" name="sub" id="sub2" size="63">
                <br>
                <div>
                  <input type="radio" name="sencode" value="ascii"> UTF8-Q
                  <input type="radio" name="sencode" value="base64"> UTF8-B
                  <input type="radio" name="sencode" value="reset" checked> RESET
                </div>
              </td>
            </tr>
            <tr>
              <td align="left" style="padding-right:20px;"><strong>From</strong></td>
              <td align="center" style="padding-bottom:10px;"><input type="text" name="from" id="from2" size="63">
                <br>
                <div>
                  <input type="radio" name="fmencode" value="ascii"> UTF8-Q
                  <input type="radio" name="fmencode" value="base64"> UTF8-B
                  <input type="radio" name="fmencode" value="reset" checked> RESET
                </div>
              </td>
            </tr>
            <tr>
              <td align="left" style="padding-right:20px;"><strong>Test Email</strong></td>
              <td align="center"><textarea name="emails" cols="0" rows="0" style="width:445px; height:110px;" id="emails" placeholder="Put Test Email Id here (Max 4 Allowed)"></textarea></td>
            </tr>
            <tr>
              <td>&nbsp</td>
            </tr>
            <tr>
              <td align="left" style="padding-right:20px;"><strong>Send Mode</strong></td>
              <td align="center" style="padding-right:10px;">
                <input type="radio" name="mode" value="Test" checked> <strong>Test</strong>
                <input type="radio" name="mode" value="Bulk" > <strong>Bulk</strong>
              </td>
            </tr>
            <tr>
              <td>&nbsp</td>
            </tr>
            <tr>
              <td align="left" style="padding-right:20px;"><strong>Preview</strong></td>
              <td align="center" style="padding-right:10px;">
                <input class="btn-primary" type="button" value=" Preview Template" onClick="displayHTML(this.form)">
              </td>
            </tr>
            <tr>
              <td>&nbsp</td>
            </tr>
            <tr>
              <td align="left" style="padding-right:20px;"><strong>Body</strong></td>
              <td >

                <textarea style="width:445px; height:300px;" name="message_html" cols="55" rows="25" placeholder="Put HTML here"></textarea><br>
                </br></br>
                <textarea style="width:445px; height:71px;" name="message_plain" cols="55" rows="25" placeholder="Put Plain here"></textarea><br>
                <br>
              </td>
            </tr>
            <tr>
              <td>&nbsp</td>
            </tr>
            <tr>
              <td colspan="2">
                <table align="center" cellpadding="0" border="0" cellspacing="0" style="font-size:12px;width: 100%;">
                  <tbody>
                    <tr>
                      <td align="left"><strong>Datafile&nbsp:</strong></td>
                      <td align="left"><input type="text" name="datafile" id="datafile" size="28" placeholder="Put DataFile Name" style="width: -webkit-fill-available;"></td>
                      <td>&nbsp</td>
                      <td align="right"><strong>MsgId&nbsp:</strong></td>
                      <td align="right"><input type="text" name="msgid" id="msgid" size="30" placeholder="Put Message ID Name" style="width: -webkit-fill-available;"></td>
                    </tr>
                    <tr>
                      <td colspan="4">&nbsp</td>
                    </tr>

                    <tr>
                      <td align="left"><strong>Total&nbsp:</strong></td>
                      <td align="left"><input type="text" name="total_limit" id="total_limit" size="28" placeholder="Put Total Sending Limit" style="width: -webkit-fill-available;"></td>
                      <td>&nbsp</td>
                      <td align="right"><strong>Limit&nbsp:</strong></td>
                      <td align="right"><input type="text" name="send_limit" id="send_limit" size="30" placeholder="Put One Click limit" style="width: -webkit-fill-available;"></td>
                    </tr>

                  </tbody>
                </table>
              </td>
            </tr>
            <tr>
              <td colspan="2" align="center" style="padding-top:10px; padding-bottom:10px;">
                <div  align="center" style=" width:148px; height:18px; z-index:1 ; background-color: #0479C0; border: 1px none #000000;display:none;" id='loadingreport123'>
                  <div align="center" class="style2"><font color="#FFFFFF"><strong><font size="2">Sending ... </font></strong></font></div>
                </div>
              </td>
            </tr>
            <tr>
                <td align="center" colspan="2">
                  <input type="button" name="button" value="Send" onClick="new Ajax.Updater('mailing1', 'middle_fsock.php', {asynchronous:true, evalScripts:true, method:'post', onComplete:function(request){var a = request.responseText.split('|');document.getElementById('mailing1').innerHTML = a[0];document.getElementById('total_limit').value = a[1];new Effect.Fade('loadingreport123');}, onLoading:function(request){new Element.show('loadingreport123')}, parameters:Form.serialize(this.form)})">&nbsp;&nbsp;&nbsp;&nbsp;
                  <!-- <input type="button" name="button" value="Stats" onClick="new Ajax.Updater('mailing1', 'Stats.php', {asynchronous:true, evalScripts:true, method:'post', onComplete:function(request){new Effect.Appear('mailing1');new Effect.Fade('loadingreport123');}, onLoading:function(request){new Element.show('loadingreport123')}, parameters:Form.serialize(this.form)})">&nbsp;&nbsp;&nbsp;&nbsp;
                  <input type="button" name="button" value="Webhook" onClick="new Ajax.Updater('mailing1', 'Webhook.php', {asynchronous:true, evalScripts:true, method:'post', onComplete:function(request){new Effect.Appear('mailing1');new Effect.Fade('loadingreport123');}, onLoading:function(request){new Element.show('loadingreport123')}, parameters:Form.serialize(this.form)})">&nbsp;&nbsp;&nbsp;&nbsp; -->
              </tr>
		      </tbody>
        </table>
      </div>
    </td>
</table>
</form>
</fieldset>
</body>
</html>
