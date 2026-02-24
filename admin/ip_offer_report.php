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
<title>IP Offer Report</title>
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
        <center><h2><font style="font-family: 'Lucida Console', Courier, monospace;">IP Offer Report</font></h2></center>
    </div>



<table border='1' id="log" class="table table-striped table-bordered" style="width:200%">

        <thead> 
                <tr> 
                <th> SENDER  </th>
                 <th> Server </th>
                 <th> IP </th>
                 <th> OFFER NAME </th>
                 <th> OFFER ID </th>
                 <th> SEND COUNT </th>
               </tr>
            </thead>

<?php



$detail = mysql_query("SELECT sender_name, mu.server, sl.ip, om.offer_name, group_concat(distinct sl.offerid) offer_id, SUM(sl.sucess_count) count
FROM svml.sending_log sl, svml.mumara mu, offer_module.all_links alnk, offer_module.offermaster om
where sl.ip = mu.assignedip
and datediff('$d', date(sl.logged_on)) = 0
and sl.mode = 'bulk'
and alnk.own_offerid=sl.offerid
and alnk.offer_master_id = om.sno
and alnk.own_offerid = sl.offerid
GROUP BY sender_name, mu.server, ip, om.offer_name");

while( $details = mysql_fetch_array($detail))
{  
  $sender_name = $details["sender_name"];
  $server = $details["server"];
  $ip = $details["ip"];
  $offer_name = $details["offer_name"];
  $offer_id = $details["offer_id"];
  $count = $details["count"];


  
  echo '<tr>';     

  echo "<td> ". $sender_name ."</td>";
  echo "<td> ". $server ."</td>";
  echo "<td> ". $ip ."</td>";
  echo "<td> ". $offer_name ."</td>";
  echo "<td> ". $offer_id ."</td>";
  echo "<td> ". $count ."</td>";
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
