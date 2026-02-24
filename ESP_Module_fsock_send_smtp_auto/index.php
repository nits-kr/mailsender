<?php
if($_REQUEST['c']) {
  $id = trim($_REQUEST['c']);
  include "include.php";
  $s = mysql_query("select `body` from `svml`.`ESP_admin_data_repository` where `entity_id` = ".$id) or die ("Template Not Found : ". mysql_error());
  $data = mysql_fetch_array($s,MYSQL_ASSOC);
  $baseDecodedBody = base64_decode($data['body']);
  $jsonDecodedBody = json_decode($baseDecodedBody,true);
  // echo "<pre>";
  // print_r($jsonDecodedBody);exit;
  mysql_close($sql);
}
session_start();
if(!isset($_SESSION['username'])) // If session is not set then redirect to Login Page
{
	header("Location:../admin/login.php?action=Login+Required");
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
<script>
var intervalID;
function clickSend(){
    document.getElementById('karan').click();
}
function displayStart(){
    if(document.getElementById('interval').value === '') {
      alert("Provide Interval Time");
      return;
    } else {
      var timeInSec = document.getElementById('interval').value;
      var timeInMicroSec = (timeInSec * 1000);
      intervalID = setInterval(clickSend, timeInMicroSec); // 1000 = 1s
      document.getElementById('start').setAttribute('disabled', true);
    }
}
function displayStop(){
    clearInterval(intervalID);
    document.getElementById('start').removeAttribute('disabled')
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

<!------------------------------------------------------ Funtion For Auto Test Response :  ----------------------------------------------------------->
<script>
    var intervalId; // Store the interval ID globally
    var isIntervalRunning = false; // Flag to track if the interval is already running

    // Function to fetch email and message IDs
    function getTestResponse() {
        var rows = document.querySelectorAll('#responseTable tbody tr');
        var totalRows = rows.length;
        var completedRequests = 0; // To track completed requests

        rows.forEach(function(row) {
            var email = row.cells[0].textContent; // Email is in the first cell
            var messageId = row.cells[2].textContent; // Message ID is in the third cell

            // Send email and messageId to checkTestMessageResponse.php
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    // Handle the response from the PHP page
                    row.cells[5].innerHTML = this.responseText; // Update response
                    
                    // Increment the completed requests count
                    completedRequests++;

                    // Check if all responses have been received
                    if (completedRequests === totalRows) {
                        checkAllResponses(rows); // Check all responses
                    }
                }
            };

            // Prepare the request with the parameters
            xmlhttp.open("GET", "checkTestMessageResponse.php?email=" + encodeURIComponent(email) + "&messageId=" + encodeURIComponent(messageId), true);
            xmlhttp.send();
        });
    }

    // Function to check if all responses are SPAM or INBOX
    function checkAllResponses(rows) {
        var allProcessed = true;

        rows.forEach(function(row) {
            var responseText = row.cells[5].textContent; // Get the response text
            if (!responseText.includes("SPAM") && !responseText.includes("INBOX")) {
                allProcessed = false; // Found a response that is neither SPAM nor INBOX
            }
        });

        // Stop the interval if all responses are SPAM or INBOX
        if (allProcessed) {
            clearInterval(intervalId);
            isIntervalRunning = true; // Set the flag to false
            console.log("All responses are either SPAM or INBOX. Stopping interval.");
        }
    }

    // Function to start the interval for data fetching
    function startFetching() {
        if (!isIntervalRunning) { // Check if the interval is already running
            console.log("Table found. Starting to fetch data every 5 seconds.");
            intervalId = setInterval(getTestResponse, 5000);
            isIntervalRunning = true; // Set the flag to true
        }
    }

    // Function to check for the table
    function checkForTable() {
        var responseTable = document.getElementById('responseTable');

        if (responseTable && !isIntervalRunning) {
            startFetching(); // Start fetching if the table exists
        } else {
            console.log("Table Not found");
        }
    }

    // Set up a MutationObserver to detect when the table is added
    var observer;

    document.addEventListener('DOMContentLoaded', function() {
        observer = new MutationObserver(function(mutations) {
            var tableFound = false; // Flag to track if table is found

            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1 && node.id === 'responseTable') { // Check if the added node is the responseTable
                            tableFound = true; // Table has been found
                        }
                    });
                }
                
                // If table is found, restart fetching
                if (tableFound) {
                    if (isIntervalRunning) { // Clear the existing interval if it's running
                        clearInterval(intervalId);
                        isIntervalRunning = false; // Reset the flag
                    }
                    startFetching(); // Start fetching for the new table
                }
            });
        });

        // Start observing the document body for changes
        observer.observe(document.body, { childList: true, subtree: true });

        // Initial check in case the table is already present
        checkForTable();

    });
</script>
<!------------------------------------------------------ Funtion For Auto Test Response :  ----------------------------------------------------------->

<meta http-equiv="content-type" content="text/html; charset=ISO-8859-1" />
<link rel="stylesheet" href="../style.css" type="text/css" media="all">
<title>ESP SMTP</title>
</head>

<body id="root" style="margin: 0px; padding: 0px; font-family: Trebuchet MS,verdana;">


<fieldset style="border: 1px solid #000000; border: 2px dotted #000000; left:5px">
<legend></legend>
<form name="form1" id ="frm1">
  <input type='hidden' name='session_id' id ='session_id'  value="<?php echo $_SESSION['id']; ?>">
	<table width="100%" align="center" style="height: 100%;" cellpadding="10" cellspacing="0" border="2">
  <!-- ============ NAV ============== -->
	<tr>
	  <td style="background-color:#000033; color:#fff"><h2>FAST MAILER (ESP/SERVER)</h2></td>
		<td colspan="2" align="center" height="30" style="border:1px dotted #999">From Email Address<span style='float:right;margin:1%;'><a href='Example.html' target="_blank" ><img src="help.png" style="height:25px"></a></span><br>
		  <input style="border:1px dotted #999; font-weight:500" type="text" name="from_email" size="60" id="from_email" value="<?php echo base64_decode($jsonDecodedBody['from_email']);?>"/>
		</td>
	</tr>
	<tr>
    <!-- ============ LEFT COLUMN (MENU) ============== -->
    <td width="30%" valign="top" style=" border:1px solid #666;font-size:13.5px;padding:10px;line-height:28px;text-align:inherit;text-align:center;width: 322px;">
      <textarea name="mailing_ip" id="mailing_ip" style="margin: 0px; width: 569px; height: 310px;" 
      placeholder="ESP (SMTP)    : (IP|Return@Path)
Note : You can use all functions in Return Path"><?php echo $jsonDecodedBody['smtp'];?></textarea>
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
              <td align="left" style="padding-right:20px;"><strong>Headers</strong></td>
              <td align="center"><textarea name="headers" cols="0" rows="0" style="width:445px; height:110px;" id="headers" placeholder="Put Headers Here..!"><?php echo base64_decode($jsonDecodedBody['headers']);?></textarea></td>
            </tr>
            <tr>
              <td>&nbsp</td>
            </tr>
            <tr>
              <td align="left" style="padding-right:20px;"><strong>Subject</strong></td>
              <td align="center" style="padding-bottom:10px;"><input type="text" name="sub" id="sub2" size="63" value="<?php echo base64_decode($jsonDecodedBody['sub']);?>">
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
              <td align="center" style="padding-bottom:10px;"><input type="text" name="from" id="from2" size="63" value="<?php echo base64_decode($jsonDecodedBody['ofrom']);?>" >
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
              <td align="center"><textarea name="emails" cols="0" rows="0" style="width:445px; height:110px;" id="emails" placeholder="Put Test Email Id here (Max 100 Allowed)"><?php echo $jsonDecodedBody['emailtest'];?></textarea></td>
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
                
                <textarea style="width:445px; height:300px;" name="message_html" cols="55" rows="25" placeholder="Put HTML here"><?php echo base64_decode($jsonDecodedBody['message_html']);?></textarea><br>
                </br></br>
                <textarea style="width:445px; height:71px;" name="message_plain" cols="55" rows="25" placeholder="Put Plain here"><?php echo base64_decode($jsonDecodedBody['message_plain']);?></textarea><br>
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
                      <td align="left"><strong>Offer Id &nbsp:</strong></td>
                      <td align="left"><input type="text" name="offerId" id="offerId" size="28" placeholder="Put Offer Id" style="width: -webkit-fill-available;" value="<?php echo base64_decode($jsonDecodedBody['offerIdenc']);?>"></td>
                      <td>&nbsp</td>
                      <td align="right"><strong>Domain &nbsp:</strong></td>
                      <td align="right"><input type="text" name="domain" id="domain" size="30" placeholder="Put Domain Name" style="width: -webkit-fill-available;" value="<?php echo base64_decode($jsonDecodedBody['domainenc']);?>  "></td>
                    </tr>
                    <tr>
                      <td colspan="4">&nbsp</td>
                    </tr>
                    <tr>
                      <td align="left"><strong>Datafile&nbsp:</strong></td>
                      <td align="left"><input type="text" name="datafile" id="datafile" size="28" placeholder="Put DataFile Name" style="width: -webkit-fill-available;" value="<?php echo $jsonDecodedBody['datafile'];?>"></td>
                      <td>&nbsp</td>
                      <td align="right"><strong>MsgId&nbsp:</strong></td>
                      <td align="right"><input type="text" name="msgid" id="msgid" size="30" placeholder="Put Message ID Name" style="width: -webkit-fill-available;" value="<?php echo base64_decode($jsonDecodedBody['msgid']);?>"></td>
                    </tr>
                    <tr>
                      <td colspan="4">&nbsp</td>
                    </tr>
                    <tr>
                      <td align="left"><strong>Total&nbsp:</strong></td>
                      <td align="left"><input type="text" name="total_limit" id="total_limit" size="28" placeholder="Put Total Sending Limit" style="width: -webkit-fill-available;" value="<?php echo $jsonDecodedBody['total_limit'];?>"></td>
                      <td>&nbsp</td>
                      <td align="right"><strong>Limit&nbsp:</strong></td>
                      <td align="right"><input type="text" name="send_limit" id="send_limit" size="30" placeholder="Put One Click limit" style="width: -webkit-fill-available;" value="<?php echo $jsonDecodedBody['send_limit'];?>"></td>
                    </tr>
                    <tr>
                      <td colspan="4">&nbsp</td>
                    </tr>
                    <tr>
                      <td align="left"><strong>Sleep&nbsp:</strong></td>
                      <td align="left"><input type="text" name="sleep" id="sleep" size="28" placeholder="Put Sleep Time" style="width: -webkit-fill-available;" value="<?php echo $jsonDecodedBody['sleep'];?>"></td>
                      <td>&nbsp</td>
                      <td align="right"><strong>Wait&nbsp:</strong></td>
                      <td align="right"><input type="text" name="wait" id="wait" size="30" placeholder="Put Wait Time" style="width: -webkit-fill-available;" value="<?php echo $jsonDecodedBody['wait'];?>"></td>
                    </tr>
                    <tr>
                      <td colspan="4">&nbsp</td>
                    </tr>
                    <tr>
                      <td align="left"><strong>Inbox% &nbsp:</strong></td>
                      <td align="left"><input type="text" name="inbox_percentage" id="inbox_percentage" size="28" placeholder="Put Inbox Percentage" style="width: -webkit-fill-available;" value="<?php echo $jsonDecodedBody['inbox_percentage'];?>"></td>
                      <td>&nbsp</td>
                      <td align="right"><strong>Test After&nbsp:</strong></td>
                      <td align="right"><input type="text" name="test_after" id="test_after" size="30" placeholder="Put Test After" style="width: -webkit-fill-available;" value="<?php echo $jsonDecodedBody['test_after'];?>"></td>
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
                    <input
                      id="karan"
                      type="button"
                      name="button"
                      value="Send"
                      onClick="new Ajax.Updater(
                        'mailing1',
                        'middle_fsock.php',
                        {
                          asynchronous: true,
                          evalScripts: true,
                          method: 'post',
                          onComplete: function(request) {
                            var a = request.responseText.split('|');
                            document.getElementById('mailing1').innerHTML = a[0];
                            if (request.responseText != '')
                              <!-- document.getElementById('total_limit').value = a[1]; -->
                            new Effect.Fade('loadingreport123');
                          },
                          onLoading: function(request) {
                            new Element.show('loadingreport123');
                          },
                          parameters: Form.serialize(this.form)
                        }
                      )"
                    />
                  <input type="button" name="button" value="Get Link" onClick="new Ajax.Updater('mailing1', 'get_link_fsock.php', {asynchronous:true, evalScripts:true, method:'post', onComplete:function(request){new Effect.Fade('loadingreport123');}, onLoading:function(request){new Element.show('loadingreport123')}, parameters:Form.serialize(this.form)})">&nbsp;&nbsp;&nbsp;&nbsp;
            </tr>
		      </tbody>
        </table>
        <br></center>  
        <details style='width: revert;'>
          <summary role="button" class="btn-primary mt-4" style="background:#269abc;border-radius:4px;height: auto;width: 50%;text-align: center;margin: auto;padding: 5px;"  ><b><font>Space Sending</font></b></summary><br>
              <table style="background:#269abc;border-radius:4px;height: auto;width: 50%;text-align: center;margin: auto;padding: 5px;">
                  <tr> 
                      <td> <input type="number" name="interval" id="interval"  title="Interval Time" placeholder="Interval Time" value="<?php echo $row['interval_time']; ?>"> </td> 
                      <td align="right" ><input id="start" class="btn-primary mr-2" style="padding:6px 12px;border-radius:4px" type="button" value=" Start " onClick="displayStart(this.form)"> </td>
                      <td align="left" ><input id="stop" class="btn-primary ml-2 bg-danger border-danger" style="padding:6px 12px;border-radius:4px" type="button" value=" Stop " onClick="displayStop(this.form)"> </td>
                  </tr> 
              </table>
          </details>
      </div>
    </td>
</table>
</form>
</fieldset>
</body>
</html>



