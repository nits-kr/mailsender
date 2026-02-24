<?php include "session.php";?>
<html>
<head>
<title>DATA SPLIT PORTAL</title>
<script type="text/JavaScript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
<script type="text/JavaScript" src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.11.2/jquery-ui.min.js"></script>

<script type="text/javascript">
function get_data()
{
  //File Name
  var file = document.getElementById('file').value;  
  //Take value of Repeat times
  var times = document.getElementById('times').value;

  if ((file == '') || (file == 0))
  {
    document.getElementById('result').innerHTML = "<font color='red'>Please Provide File Name..!</font>";
    document.getElementById('file').focus();
    return;
  }

  if ((times == '') || (times == 0))
  {
    document.getElementById('result').innerHTML = "<font color='red'>Please Provide Times To Split..!</font>";
    document.getElementById('times').focus();
    return;
  }
  document.getElementById('result').innerHTML = "<font color='orange'>Processing...!</font>";
  $.ajax({
          type: 'post',
          url: 'split_action.php',
          data: "file="+file+"&times="+times,
          success: function (data) {
              document.getElementById('filename').value = data;
              document.getElementById('result').innerHTML = "<font color='green'>Success...!</font>";
          }
        });
}

function validdata(str) {
if (str=="")
    {
        document.getElementById("datafilevalid").innerHTML="";
        return;
    }
var xmlhttp=new XMLHttpRequest();
xmlhttp.onreadystatechange=function()
    {
        if (this.readyState==4 && this.status==200)
        {
          if (this.responseText == "<img src='tick.png'/></img> <font color = 'green'> Verified</font>")
            {
              document.getElementById("datafilevalid").innerHTML=this.responseText;
            }
          else
            {
              document.getElementById("datafilevalid").innerHTML=this.responseText;
            }
        }
    }
xmlhttp.open("GET","../interface/validate_datafile.php?q="+str,true);
xmlhttp.send();
}
</script>
<style>
textarea{
    margin: 0px;
    height: 453px;
    width: 635px;
}
</style>

</head>
<body>
<center>
    <h2>DATA SPLIT PORTAL</h2>
    <hr>
    <form id='myform'>
    <div>File Name :- <input type="text" id="file" name="file" placeholder='Place Orignal File' onInput="validdata(this.value)">&nbsp<span id="datafilevalid" ></span></div><br>
    How Many Count? :- <input type="text" id="times" name="times" placeholder='Times' ><br><br>
    </form>
    <button onclick="get_data()"> SPLIT </button><br>
    <div id='result'></div><br><br>
    <textarea id='filename' placeholder='Filename Will Be Generated Here..!'></textarea>        
</center>
</body>
</html>