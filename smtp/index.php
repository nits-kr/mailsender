<?php
session_start();

      if(!isset($_SESSION['username'])) // If session is not set then redirect to Login Page
       {
           header("Location:../admin/login.php?action=session+logged+out");  
     die();
       } 

       $sid=$_SESSION['id']; 


?>


<?php
include "include.php";

?>
<html>
<head>
<title> IP Insert </title>


<stylv="refresh" content="30">
<meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
<script type="text/javascript" language="javascript" src="https://code.jquery.com/jquery-3.5.1.js"></script>
<script type="text/javascript" language="javascript" src="https://cdn.datatables.net/1.10.24/js/jquery.dataTables.min.js"></script>
<script type="text/javascript" language="javascript" src="https://cdn.datatables.net/1.10.24/js/dataTables.bootstrap4.min.js"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.5.2/css/bootstrap.css" type="text/css" media="screen" title="default" />
<link rel="stylesheet" href="https://cdn.datatables.net/1.10.24/css/dataTables.bootstrap4.min.css" type="text/css" media="screen" title="default" />
<meta name="viewport" content="width=device-width, initial-scale=1">

<script src="http://code.jquery.com/ui/1.10.3/jquery-ui.js"></script>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />



<style>
table.dataTable.display tbody td  {
    font-weight: bold;
    font-size: large;
}
table.dataTable.display thead th  {
    font-weight: bold;
    font-size: large;
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
    background-color: #60D6FF;
   text-align:center;
}

.table tbody td {
    text-align: center;
font-weight:bold;
}


.mainbox {
padding: 10px;
width: 95%;
margin-top: 5px;
margin: 30px;
-webkit-box-shadow: 2px 4px 7px 1px rgba(0,0,0,0.48);
    -moz-box-shadow: 2px 4px 7px 1px rgba(0,0,0,0.48);
    box-shadow: 2px 4px 7px 1px rgba(0,0,0,0.48);
}

.select2-container, .select2-drop{
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    width: 400px;
}

.select2-search, .select2-search input {
    width: 350px;
font-size: 18px;
}


.select2-results .select2-result-label {
    padding: 3px 7px 4px;
    margin: 0;
    cursor: pointer;
    min-height: 1em;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    font-size: initial;
}




.btn {
  border: none;
  border-radius: 12px;
  color: white;
  padding: 5px 14px;
  font-size: 17px;
  cursor: pointer;
}

.success {background-color: #4CAF50;} /* Green */
.success:hover {background-color: #00cc00; color: white;  }

.info {background-color: #2196F3;} /* Blue */
.info:hover {background: #0b7dda;}

.warning {background-color: #ff9800;} /* Orange */
.warning:hover {background: #e68a00;}

.danger {background-color: #f44336;} /* Red */ 
.danger:hover {background: #da190b; color: white;}

.default {background-color: #e7e7e7; color: black;} /* Gray */ 
.default:hover {background: #ddd;}


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






</style>




<script>

        $(document).ready(function() {
        /*
        * Initialse DataTables, with no sorting on the 'details' column
        */
                var oTable = $('#example').dataTable( {
                        "aoColumnDefs": [
                        { "bSortable": false, "aTargets": [ 0 ] }
                        ],
                        "sScrollY": "600",
                        "bScrollCollapse": true,
                        "bPaginate": false,
                        "bJQueryUI": true
                        });    
                });

</script>




<script>
$(document).ready(function() {
 $("#server").select2();  
     
});
</script>
     


</head>
<body>
<center>
</center>
<div id="mainbox" class="mainbox">
<div><center><h3>SMTP DETAILS</h3></center></div>
<hr>
<div align='center'>

<?php 
//  if ($_SESSION['designation'] == 'Admin' ) {
  // print_r($_SESSION);
?>

 <table border=0>
<form name="ip" methode="post" action="ip_insert_action.php">
<tr>
    <td>   </td>
    <td>
            <input id='server' name="server" type='text' placeholder='SERVER NAME'  value='' required>
            <br>
    </td>   
</tr>
<tr>   
        <td>   </td>
            <td> <br>
                        <select name='assign' id='assign'  style="width: 28%;" required>                    
                          <?php
                            if ($_SESSION['designation'] == 'Admin' ) {
                              $detail = mysql_query("select * from `login`.`users`",$rds);
                              while( $details = mysql_fetch_array($detail))
                              {  
                                echo '<option value="'.$details['id'].'"> '.$details['name'].' </option>';
                              }
                            } else {
                                echo '<option value="'.$_SESSION['id'].'"> '.$_SESSION['name'].' </option>';
                            }
                          ?>
                          </select>
                        <br>
          </td>  
</tr>
<tr>
    <td></td>
    <td><br><textarea type="text" name="ip" id ='ip' cols="90" rows="10" placeholder='IP|HOSTNAME|USER|PASS|PORT|TLS' required></textarea></td>
</tr>
<tr>
      <td></td>
      <td align='center' > <br> <input class='btn info' type="Submit" Value="Insert" /></td>
</tr>
</table>
</div>
<br>
<hr>

<?php 
//} 
?>

<table cellpadding="0" cellspacing="0"  border="1" class="table table-striped table-bordered"  id="example" >
        <thead> 
                <tr> 
                        <th> Sno </th>
                        <th> Assign to </th>
                        <th> SERVER </th>
                        <th> IP </th>
                        <th> HOSTNAME </th>
                        <th> USER </th>
                        <th> PASS </th>
                        <th> PORT </th>
                        <th> TLS </th>
                        <?php  if ($_SESSION['designation'] == 'Admin' ) { ?>
                          <th> ACTION </th>
                        <?php } ?>
                </tr>
            </thead>




<?php




if (trim($_SESSION['designation']) == 'Admin') {
  $detail = mysql_query("select t2.sno,t2.hostname,t2.server,t2.user,t2.pass,t2.port,t2.tls,t2.assignedip,t2.accountname,t1.name from `login`.`users` t1, `svml`.`mumara` t2  where t1.id = t2.accountname",$rds);
} else {
  $detail = mysql_query("select t2.sno,t2.hostname,t2.server,t2.user,t2.pass,t2.port,t2.tls,t2.assignedip,t2.accountname,t1.name from `login`.`users` t1, `svml`.`mumara` t2  where t1.id = t2.accountname and t1.id = '$sid'",$rds);
}


while( $details = mysql_fetch_array($detail))


{  
  $sno = $details[sno];
  $server = $details[server];
  $ip = $details['assignedip'];
  $hostname = $details[hostname];
  $user = $details['user'];
  $pass = $details['pass'];
  $port = $details['port'];
  $tls = $details['tls'];
  $accountname = $details['name'];

  echo '<tr>';     
  echo "<td> ". $sno ."</td>";
  echo "<td> ". $accountname ."</td>";
  echo "<td> ". $server ."</td>";
  echo "<td> ". $ip ."</td>";
  echo "<td> ". $hostname."</td>";
  echo "<td> ". $user ."</td>";
  echo "<td> ". $pass ."</td>";
  echo "<td> ". $port ."</td>";
  echo "<td> ". $tls ."</td>";
  if ($_SESSION['designation'] == 'Admin' ) { 
    echo "<td> <a href='delete.php?sno=".$sno."' class='btn danger' >DELETE</a></td>";
  }
  echo '</tr>';
}




?>

</tbody>
</table>
</div>
</body>
</html>
