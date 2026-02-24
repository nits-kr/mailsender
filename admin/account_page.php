<?php

error_reporting(0);

header("Access-Control-Allow-Origin: *");
date_default_timezone_set("EST");

include "/var/www/html/admin/include.php";
$mainip=$_SERVER['HTTP_HOST'];

/*session_start();

      if(!isset($_SESSION['username'])) // If session is not set then redirect to Login Page
       {
           header("Location:../login.php?action=session+logged+out");  
       }

$sid = $_SESSION['id'];
$susername = $_SESSION['email'];
$sfname = $_SESSION['name'];
$slname = $_SESSION['name'];
$spassword = $_SESSION['password'] ;*/

?>
<html>
<title>SERVER List</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">

<meta charset="utf-8">
<script type="text/javascript" language="javascript" src="https://code.jquery.com/jquery-3.5.1.js"></script>
<script type="text/javascript" language="javascript" src="https://cdn.datatables.net/1.10.24/js/jquery.dataTables.min.js"></script>
<script type="text/javascript" language="javascript" src="https://cdn.datatables.net/1.10.24/js/dataTables.bootstrap4.min.js"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.5.2/css/bootstrap.css" type="text/css" media="screen" title="default" />
<link rel="stylesheet" href="https://cdn.datatables.net/1.10.24/css/dataTables.bootstrap4.min.css" type="text/css" media="screen" title="default" />

<script src="http://code.jquery.com/ui/1.10.3/jquery-ui.js"></script>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />






<style>
html, body {margin: 15px; height: 100%; }


.mainbox{
    padding: 10px;
    height : auto;
    width: auto;
    margin-top: 1px;
    margin: -20px;
  
    text-align: center;
    -webkit-box-shadow: 3px 4px 23px -4px rgba(0,0,0,0.48);
    -moz-box-shadow: 3px 4px 23px -4px rgba(0,0,0,0.48);
    box-shadow: 3px 4px 23px -4px rgba(0,0,0,0.48);
}

.tablediv {
    padding: 10px;
    height : auto;
    width: auto;
    margin-top: 5px;
    margin: 30px;
}




.btn {
  border: none;
  border-radius: 12px;
  color: white;
  padding: 5px 14px;
  font-size: 13px;
  cursor: pointer;
 margin:5px;
}

.success {background-color: #4CAF50;} /* Green */
.success:hover {background-color: #00cc00; color: white; font-weight:bold;  }

.info {background-color: #2196F3;} /* Blue */
.info:hover {background: #0b7dda; color: white; font-weight:bold; }

.warning {background-color: #ff9800;} /* Orange */
.warning:hover {background: #e68a00; color: white; font-weight:bold; }

.danger {background-color: #f44336;} /* Red */ 
.danger:hover {background: #da190b; color: white; font-weight:bold; }

.default {background-color: #e7e7e7; color: black;} /* Gray */ 
.default:hover {background: #ddd; color: white; font-weight:bold;  }


.fonter {
  font-size: 20px;
  font-weight: bold;
}

.red { color: #EB0B00;} /* red */ 
.green {color: #00E114;} /* green */ 
.orange {color: #FF770C;} /* orange */ 
.blue {color: #194EFF;} /* blue */ 







/* Overwrite default styles of hr */
hr {
  border: 1px solid #f1f1f1;
  margin-bottom: 25px;
}



/* The Modal (background) */
.modal {
  display: none; /* Hidden by default */
  position: fixed; /* Stay in place */
  z-index: 1; /* Sit on top */
  padding-top: 100px; /* Location of the box */
  left: 0;
  top: 0;
  width: 100%; /* Full width */
  height: 100%; /* Full height */
  overflow: auto; /* Enable scroll if needed */
  background-color: rgb(0,0,0); /* Fallback color */
  background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
}

/* Modal Content */
.modal-content {
  background-color: #fefefe;
  margin: auto;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
}

/* The Close Button */
.close {
  color: #aaaaaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: #000;
  text-decoration: none;
  cursor: pointer;
}

h1 {
    color: #4D4D4D;
    font-size: 28px;
    font-weight: bold;
    font-family: "Trebuchet MS",Arial,Helvetica,sans-serif;
    font-style: italic;
    text-shadow: 4px 3px 3px #b0b0b0;
    text-align: center;
}



div.dataTables_wrapper div.dataTables_filter label {
    font-weight: bold;
    white-space: nowrap;
    text-align: left;
    color: red;
}


.table thead th {
    vertical-align: bottom;
    border-bottom: 2px solid #dee2e6;
    text-align: center;
    background-color: #4100cc;
    color:white;
}
.table-bordered tbody td {
font-weight:bold;
    text-align: center;
}

.table-bordered tfoot th {
    border: 1px solid #dee2e6;
    background-color: #60d6ff;
    text-align: center;
    background-color: #4100cc;
    color:white;
}

.table-bordered tbody tr:hover {
          background-color: #eeff3f2b;
}



.resp-container {
    position: relative;

}

.resp-iframe {
    top: 0;
    left: 0;
    width: 100%;
    height: 500px;
    border: 0;
}

</style>


<script type="text/javascript" >
          function deldetails(sno) {
          var data = 'sno='+sno;
          var dataalert = 'Are you Sure You want to delete this server : '+sno;
          $("#delresult").html('<font color = "red" ><b> PLEASE WAIT ....! </b> </font>');
          alert(dataalert);
          $.ajax({
          type: "POST",
          url: 'server_delete.php',
          data: data,
          success: function(data) {
          $("#delresult").html(data);
          }
          });
          }

</script>




<script type="text/javascript" >
function addserver() {
  $("#delresult").html('<img align="center" src="../ajax-loader.gif" height=30 width=30> <font color = "red" ><b> PROCESSING... PLEASE WAIT..! </b> </font>');
    var data = $("#addaccount").serialize();
    $.ajax({
    type: "POST",
    url: 'server_insert_action.php',
    data: data,
    success: function(data) {
      $("#delresult").html(data);
    }
  });         
}
</script>
  

    

<script>

$(document).ready(function() {
   
/*
* Initialse DataTables, with no sorting on the 'details' column
*/
var oTable = $('#log').dataTable( {
"aoColumnDefs": [
{ "bSortable": false, "aTargets": [ 0 ] }
],
"aaSorting": [[6, 'desc']],
"sScrollY": "600",
"bScrollCollapse": true,
"bPaginate": false,
"bJQueryUI": true
});

setInterval(timestamp, 1000);
});

</script>

<script>
function timestamp() {
    $.ajax({
        url: 'http://173.249.50.153/admin/timestamp.php',
        success: function(data) {
            $('#timestamp').html(data);
        },
    });
}
// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];
</script>


<head></head>
<body>
<center>
<br>
<div class="mainbox ">
<div id="timestamp"></div>
<div  class="tablediv" >
<table border='1' id="log" class="table table-striped table-bordered" style="width:100%" >

        <thead> 
                <tr> 
                 <th> Main ip  </th>
                 <th> Total IPs </th>
                 <th> D4 </th>
                 <th> D3 </th>
                 <th> D2 </th>
                 <th> D1 </th>
                 <th> toDay </th>
                 <th> Failed </th>
                 <th> Action </th>
               </tr>
            </thead>

<?php


//if (trim($_SESSION['designation']) == 'Admin') 
//{
  $detail = mysql_query("SELECT mm.server, count(mm.assignedip) as count, 
  sum(d4.relayed) as d4, sum(d3.relayed) as d3, sum(d2.relayed) as d2, sum(d1.relayed) as d1, 
  sum(dss.relayed) as relayed, sum(dss.failed) as failed
FROM  svml.mumara mm
left outer join (select ip, relayed, failed, fordate from server_report.daily_server_stats where datediff(now(), forDate) = 0) dss on dss.ip = mm.assignedip
left outer join (select ip, relayed, failed, fordate from server_report.daily_server_stats where datediff(now(), forDate) = 1) d1 on d1.ip = mm.assignedip
left outer join (select ip, relayed, failed, fordate from server_report.daily_server_stats where datediff(now(), forDate) = 2) d2 on d2.ip = mm.assignedip
left outer join (select ip, relayed, failed, fordate from server_report.daily_server_stats where datediff(now(), forDate) = 3) d3 on d3.ip = mm.assignedip
left outer join (select ip, relayed, failed, fordate from server_report.daily_server_stats where datediff(now(), forDate) = 4) d4 on d4.ip = mm.assignedip
GROUP BY mm.server");

//} else 
/*{
  $detail = mysql_query("SELECT mm.server, count(mm.assignedip) as count, 
  sum(d4.relayed) as d4, sum(d3.relayed) as d3, sum(d2.relayed) as d2, sum(d1.relayed) as d1, 
  sum(dss.relayed) as relayed, sum(dss.failed) as failed
FROM  svml.mumara mm
left outer join (select ip, relayed, failed, fordate from server_report.daily_server_stats where datediff(now(), forDate) = 0) dss on dss.ip = mm.assignedip
left outer join (select ip, relayed, failed, fordate from server_report.daily_server_stats where datediff(now(), forDate) = 1) d1 on d1.ip = mm.assignedip
left outer join (select ip, relayed, failed, fordate from server_report.daily_server_stats where datediff(now(), forDate) = 2) d2 on d2.ip = mm.assignedip
left outer join (select ip, relayed, failed, fordate from server_report.daily_server_stats where datediff(now(), forDate) = 3) d3 on d3.ip = mm.assignedip
left outer join (select ip, relayed, failed, fordate from server_report.daily_server_stats where datediff(now(), forDate) = 4) d4 on d4.ip = mm.assignedip
GROUP BY mm.server");
  //$detail = mysql_query("SELECT server,COUNT(server) as count FROM  `svml`.`mumara` where `mumara`.`accountname` = $sid GROUP BY server");
}*/

while( $details = mysql_fetch_array($detail))
{  
  $main_ip = $details["server"];
  $ipscount = $details["count"];
  $d4 = $details["d4"];
  $d3 = $details["d3"];
  $d2 = $details["d2"];
  $d1 = $details["d1"];
  $relayed = $details["relayed"];
  $failed = $details["failed"];


  
  echo '<tr>';     

  echo "<td> ". $main_ip ."</td>";
  echo "<td> ". $ipscount ."</td>";
  echo "<td> ". $d4 ."</td>";
  echo "<td> ". $d3 ."</td>";
  echo "<td> ". $d2 ."</td>";
  echo "<td> ". $d1 ."</td>";
  echo "<td> ". $relayed ."</td>";
  echo "<td> ". $failed ."</td>";
  echo "<td>  <a class='btn success' href='http://$main_ip/report.php' target='_blank'><font color = 'white'>Report</font></a></td>";

  echo '</tr>';

}
mysql_close();
?>
</tbody>
<tfoot>
<th></th>
<th></th>
<th></th>
<th></th>
<th></th>
</tfoot>
</table>
</div>

<div class="resp-container">
</div>

</div>
</center>


</body>
</html>
