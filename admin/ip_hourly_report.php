<?php

error_reporting(0);

header("Access-Control-Allow-Origin: *");
date_default_timezone_set("EST");

include "/var/www/html/admin/include.php";
$mainip=$_SERVER['HTTP_HOST'];

session_start();

$sid = $_SESSION['id'];
$susername = $_SESSION['email'];
$sfname = $_SESSION['name'];
$slname = $_SESSION['name'];
$spassword = $_SESSION['password'] ;

?>
<html>
<title>IP Hourly Report</title>
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
  font-size: 10px;
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





  

    

<script>

$(document).ready(function() {
   
/*
* Initialse DataTables, with no sorting on the 'details' column
*/
var oTable = $('#log').dataTable( {
"aoColumnDefs": [
{ "bSortable": false, "aTargets": [ 0 ] }
],
"aaSorting": [[0, 'desc']],
"sScrollY": "1200",
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


<head>


</head>
<body>


<?php
    error_reporting(0);
    header("Access-Control-Allow-Origin: *");
    date_default_timezone_set("EST");
    $d = $_REQUEST['date'];
    $var =$_REQUEST['find'];


    if($d == '')
    {
    $d = date('Y-m-d');
    }

    echo "<center><br><font color='red' size='5'><b> ";

    if($var == '')
    {
    echo $d ;
    }
    else {
    echo $d." [ <font color='black' size='5'>".$name."</font> ]" ;
    }
    echo "</font><br><br>";
?>
<form action="" method="post">
<input type='date' name="date" value='<?php echo $d ; ?>'> &nbsp;&nbsp;&nbsp;
<input type='submit' style="background:#4CAF50;padding:4px 12px;border-radius:4px;border:none;color:#fff;font-size:15px;font-weight:600" >
</form>


<center>
<br>
<div class="mainbox ">
<div class="panel-heading">
        <center><h2><font style="font-family: 'Lucida Console', Courier, monospace;">IP HOURLY REPORT</font></h2></center>
    </div>
<div id="timestamp"></div>
<div  class="tablediv" >


<table border='1' id="log" class="table table-striped table-bordered" style="width:200%">

        <thead> 
                <tr> 
                 <th> Server  </th>
                 <th> IP </th>
                 <th> H0 </th>
                 <th> H1 </th>
                 <th> H2 </th>
                 <th> H3 </th>
                 <th> H4 </th>
                 <th> H5 </th>
                 <th> H6 </th>
                 <th> H7 </th>
                 <th> H8 </th>
                 <th> H9 </th>
                 <th> H10 </th>
                 <th> H11 </th>
                 <th> H12 </th>
                 <th> H13 </th>
                 <th> H14 </th>
                 <th> H15 </th>
                 <th> H16 </th>
                 <th> H17 </th>
                 <th> H18 </th>
                 <th> H19 </th>
                 <th> H20 </th>
                 <th> H21 </th>
                 <th> H22 </th>
                 <th> H23 </th>
               </tr>
            </thead>

<?php



  $detail = mysql_query("select server, ip,
  sum(IF(hour = 0, count, 0)) as h0,
  sum(IF(hour = 1, count, 0)) as h1,
  sum(IF(hour = 2, count, 0)) as h2,
  sum(IF(hour = 3, count, 0)) as h3,
  sum(IF(hour = 4, count, 0)) as h4,
  sum(IF(hour = 5, count, 0)) as h5,
  sum(IF(hour = 6, count, 0)) as h6,
  sum(IF(hour = 7, count, 0)) as h7,
  sum(IF(hour = 8, count, 0)) as h8,
  sum(IF(hour = 9, count, 0)) as h9,
  sum(IF(hour = 10, count, 0)) as h10,
  sum(IF(hour = 11, count, 0)) as h11,
  sum(IF(hour = 12, count, 0)) as h12,
  sum(IF(hour = 13, count, 0)) as h13,
  sum(IF(hour = 14, count, 0)) as h14,
  sum(IF(hour = 15, count, 0)) as h15,
  sum(IF(hour = 16, count, 0)) as h16,
  sum(IF(hour = 17, count, 0)) as h17,
  sum(IF(hour = 18, count, 0)) as h18,
  sum(IF(hour = 19, count, 0)) as h19,
  sum(IF(hour = 20, count, 0)) as h20,
  sum(IF(hour = 21, count, 0)) as h21,
  sum(IF(hour = 22, count, 0)) as h22,
  sum(IF(hour = 23, count, 0)) as h23
from(
SELECT mu.server, sl.ip, HOUR(sl.logged_on) AS hour, SUM(sl.sucess_count) count
FROM svml.sending_log sl, svml.mumara mu
where sl.ip = mu.assignedip
and datediff('$d', date(sl.logged_on)) = 0
GROUP BY mu.server, ip, HOUR(sl.logged_on) order by 1, 2) a
group by server, ip");

while( $details = mysql_fetch_array($detail))
{  
  $server = $details["server"];
  $ip = $details["ip"];
  $h0 = $details["h0"];
  $h1 = $details["h1"];
  $h2 = $details["h2"];
  $h3 = $details["h3"];
  $h4 = $details["h4"];
  $h5 = $details["h5"];
  $h6 = $details["h6"];
  $h7 = $details["h7"];
  $h8 = $details["h8"];
  $h9 = $details["h9"];
  $h10 = $details["h10"];
  $h11 = $details["h11"];
  $h12 = $details["h12"];
  $h13 = $details["h13"];
  $h14 = $details["h14"];
  $h15 = $details["h15"];
  $h16 = $details["h16"];
  $h17 = $details["h17"];
  $h18 = $details["h18"];
  $h19 = $details["h19"];
  $h20 = $details["h20"];
  $h21 = $details["h21"];
  $h22 = $details["h22"];
  $h23 = $details["h23"];



  
  echo '<tr>';     

  echo "<td> ". $server ."</td>";
  echo "<td> ". $ip ."</td>";
  echo "<td> ". $h0 ."</td>";
  echo "<td> ". $h1 ."</td>";
  echo "<td> ". $h2 ."</td>";
  echo "<td> ". $h3 ."</td>";
  echo "<td> ". $h4 ."</td>";
  echo "<td> ". $h5 ."</td>";
  echo "<td> ". $h6 ."</td>";
  echo "<td> ". $h7 ."</td>";
  echo "<td> ". $h8 ."</td>";
  echo "<td> ". $h9 ."</td>";
  echo "<td> ". $h10 ."</td>";
  echo "<td> ". $h11 ."</td>";
  echo "<td> ". $h12 ."</td>";
  echo "<td> ". $h13 ."</td>";
  echo "<td> ". $h14 ."</td>";
  echo "<td> ". $h15 ."</td>";
  echo "<td> ". $h16 ."</td>";
  echo "<td> ". $h17 ."</td>";
  echo "<td> ". $h18 ."</td>";
  echo "<td> ". $h19 ."</td>";
  echo "<td> ". $h20 ."</td>";
  echo "<td> ". $h21 ."</td>";
  echo "<td> ". $h22 ."</td>";
  echo "<td> ". $h23 ."</td>";
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
