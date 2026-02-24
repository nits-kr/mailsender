<?php include "session.php";?>
<html>
<head>
<title>DATA MERGE PORTAL</title>
<script type="text/JavaScript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
<script type="text/JavaScript" src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.11.2/jquery-ui.min.js"></script>

<script type="text/javascript">
function get_data()
{
  //Get file names from textarea (one per line)
  var dataFiles = document.getElementById('file').value;  

  //Validate if file names are provided
  if ((dataFiles == '') || (dataFiles.trim() == ''))
  {
    document.getElementById('result').innerHTML = "<font color='red'>Please Provide File Names (one per line)..!</font>";
    document.getElementById('file').focus();
    return;
  }

  //Show processing message
  document.getElementById('result').innerHTML = "<font color='orange'>Processing... Please wait, this may take a while for large files!</font>";
  document.getElementById('filename').value = '';
  
  $.ajax({
          type: 'post',
          url: 'dataFileMerger.php',
          data: {dataFiles: dataFiles},
          dataType: 'json',
          success: function (response) {
              //jQuery automatically parses JSON when dataType is 'json'
              //But handle both string and object cases for safety
              if (typeof response === 'string') {
                  try {
                      response = JSON.parse(response);
                  } catch (e) {
                      document.getElementById('result').innerHTML = "<font color='red'>Error: Invalid response format from server.</font>";
                      document.getElementById('filename').value = '';
                      return;
                  }
              }
              
              if (response && response.status === 'success') {
                  //Display success message with details
                  var successMsg = "<font color='green'>Success! Files merged successfully.</font><br>";
                  successMsg += "<font color='blue'><b>Output File:</b> " + (response.output_file || 'N/A') + "</font><br>";
                  successMsg += "<font color='blue'><b>Files Processed:</b> " + (response.files_processed || 0) + "</font><br>";
                  successMsg += "<font color='blue'><b>Total Lines Processed:</b> " + (response.total_lines_processed || 0) + "</font><br>";
                  successMsg += "<font color='blue'><b>Total Emails Found:</b> " + (response.total_emails_found || 0) + "</font><br>";
                  successMsg += "<font color='blue'><b>Total Emails in Output:</b> " + (response.total_emails_in_output || 0) + "</font><br>";
                  if (response.note) {
                      successMsg += "<font color='orange'><i>" + response.note + "</i></font>";
                  }
                  
                  document.getElementById('result').innerHTML = successMsg;
                  document.getElementById('filename').value = response.output_file || '';
              } else {
                  //Display error message from server
                  var errorMsg = response && response.message ? response.message : 'Unknown error occurred.';
                  document.getElementById('result').innerHTML = "<font color='red'>Error: " + errorMsg + "</font>";
                  document.getElementById('filename').value = '';
              }
          },
          error: function (xhr, status, error) {
              //Handle AJAX errors
              var errorMsg = "<font color='red'>Error processing request.</font><br>";
              errorMsg += "<font color='red'>Status: " + status + "</font><br>";
              errorMsg += "<font color='red'>Error: " + error + "</font>";
              
              //Try to parse error response if it's JSON
              if (xhr.responseText) {
                  try {
                      var errorResponse = JSON.parse(xhr.responseText);
                      if (errorResponse.message) {
                          errorMsg = "<font color='red'>Error: " + errorResponse.message + "</font>";
                      }
                  } catch (e) {
                      //Not JSON, use raw response
                      errorMsg += "<font color='red'><br>Response: " + xhr.responseText.substring(0, 200) + "</font>";
                  }
              }
              
              document.getElementById('result').innerHTML = errorMsg;
              document.getElementById('filename').value = '';
          }
        });
}

function validdata(str) {
if (str=="")
    {
        document.getElementById("datafilevalid").innerHTML="";
        return;
    }
    
// Validate file names (check if each line is not empty after trim)
var lines = str.split('\n');
var validLines = 0;
var invalidLines = [];

for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (line !== '') {
        validLines++;
    } else if (i < lines.length - 1) {
        invalidLines.push(i + 1);
    }
}

if (validLines === 0) {
    document.getElementById("datafilevalid").innerHTML = "<font color='red'>✗ No valid file names found</font>";
    return;
}

if (invalidLines.length > 0) {
    document.getElementById("datafilevalid").innerHTML = "<img src='tick.png'/></img> <font color='orange'> " + validLines + " file(s) will be processed</font>";
} else {
    document.getElementById("datafilevalid").innerHTML = "<img src='tick.png'/></img> <font color='green'> " + validLines + " file(s) ready to merge</font>";
}
}
</script>
<style>
textarea{
    margin: 0px;
    height: 200px;
    width: 635px;
    font-family: monospace;
}
#filename {
    height: 150px;
}
.info-text {
    font-size: 12px;
    color: #666;
    margin-top: 5px;
}
</style>

</head>
<body>
<center>
    <h2>DATA MERGE PORTAL</h2>
    <hr>
    <form id='myform'>
    <div>
        <b>File Names (one per line):</b><br>
        <textarea id="file" name="file" placeholder='Enter file names, one per line&#10;Example:&#10;File1.txt&#10;File2.txt&#10;File3.txt' onInput="validdata(this.value)"></textarea>
        <div id="datafilevalid"></div>
        <div class="info-text">Note: Files should be present in /var/www/data/ directory</div>
    </div>
    <br>
    </form>
    <button onclick="get_data()"> MERGE FILES </button><br><br>
    <div id='result'></div><br><br>
    <b>Output File Name:</b><br>
    <textarea id='filename' placeholder='Merged output file name will appear here...'></textarea>        
</center>
</body>
</html>