<?php

include "include.php";
date_default_timezone_set("EST");

$date = date("Y-m-d H:i:s");


session_start();

      if(!isset($_SESSION['username'])) // If session is not set then redirect to Login Page
       {
           header("Location:login.php?action=session+logged+out");  
       }

$sid = $_SESSION['id'];
$susername = $_SESSION['email'];



$oid = $_REQUEST['oid'];
$action =  $_REQUEST['action'];


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
    background-color: #fff;
    padding: 10px;
    height: auto;
    width: auto;
    margin-top: 1px;
    margin: 10px;
    text-align: center;
    -webkit-box-shadow: 3px 4px 23px -4px rgb(0 0 0 / 48%);
    -moz-box-shadow: 3px 4px 23px -4px rgba(0,0,0,0.48);
    box-shadow: 3px 4px 23px -4px rgb(0 0 0 / 48%);
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
    color: white;
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

label {
    display: inline-block;
    font-weight: bold;
    margin-bottom: 0.5rem;
}



.col-md-6 {
    -ms-flex: 0 0 50%;
    flex: 0 0 50%;
    max-width: 50%;
    padding-left: 50px;
    padding-right: 50px;
}

.col-md-12 {
    -ms-flex: 0 0 100%;
    flex: 0 0 100%;
    max-width: 100%;
    padding-left: 50px;
    padding-right: 50px;
}

.col-sm-12 {
text-align:left;
}




html, body {
    margin: 15px;
    height: 100%;
    background-color: #d7d7d7;
}

.text {
  position: relative;
  width: 100%;
  height: auto;
  word-wrap: break-word;
  white-space: pre-wrap
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
                           // alert(server);
                             $.ajax({
                              type: "POST",
                              url: 'server_insert_action.php',
                              data: data,
                              success: function(data) {
           $("#delresult").html(data);
          //  $("#display").load("server_insert2.php #display");                             

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
        "aaSorting": [[5, 'desc']],
                  "sScrollY": "600",
                "bScrollCollapse": true,
                "bPaginate": false,
                "bJQueryUI": true,
                "fnFooterCallback": function ( nRow, aaData, iStart, iEnd, aiDisplay ) {
/*
* Calculate the total market share for all browsers in this table (ie inc. outside
* the pagination)
*/

/* Calculate the market share for browsers on this page */
var counti = 0;
var countR = 0;
var countD = 0;
var countF = 0;
for ( var i=iStart ; i<iEnd ; i++ )
{
counti += aaData[ aiDisplay[i] ][1]*1;
countR += aaData[ aiDisplay[i] ][2]*1;
countD += aaData[ aiDisplay[i] ][3]*1;
countF += aaData[ aiDisplay[i] ][4]*1;

}

/* Modify the footer row to match what we want */
var nCells = nRow.getElementsByTagName('th');
nCells[1].innerHTML = counti ;
nCells[2].innerHTML = countR ;
nCells[3].innerHTML = countD ;
nCells[4].innerHTML = countF ;

}



    });    
} );

</script>

<script>

// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal 
btn.onclick = function() {
  modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}
</script>


<script type="text/javascript" >
			   function addlink() {
			   	$("#delresult").html('<img align="center" src="hourglass.gif" height=30 width=30> <font color = "red" ><b> PROCESSING... PLEASE WAIT..! </b> </font>');
			    var data = $("#addaccount").serialize();
			   // alert(server);
			     $.ajax({
			      type: "POST",
			      url: 'link_add_action.php',
			      data: data,
			      success: function(data) {
           $("#delresult").html(data);	     
			      }
			    });         
			}
</script>




<head></head>
<body>
<center>
<br>
<div class="mainbox ">


<?php  

if ($action   != '') { 


$detail = mysql_fetch_array(mysql_query("select * from `admin`.`offermaster` where offermasterid =  '". trim($oid) ."'",$rds));



?>


                                <details>
                <summary> <b>GENERATE LINK </b></summary>       <br><br>
                                <form id='addaccount' role="form" class="form-horizontal"  action="javascript:addlink();"> 
                        <div class="row">
                      
                                                            <div class="col-md-6 col-sm-12">
                                                                                <div class="form-group">
                                                                                        <label>Offer Id</label>
                                                                                            <input type="hidden" value='<?php echo $oid; ?>' class="form-control" name='offerdetailid'  > 
                                                                                                <input type="hidden" value='<?php echo $sid; ?>' class="form-control" name='mailer_id'  >  
                                                                                                <input type="text" class="form-control" name='offerid' id="offeridvalid" autocomplete="off" required>
                                                                                </div>
                                                                        </div>
                                                                        <div class="col-md-6 col-sm-12">
                                                                                <div class="form-group">
                                                                                        <label>Domain</label>
                                                                                        <input type="text" class="form-control" name='domain' autocomplete="off" required>
                                                                                </div>
                                                                        </div>

                                                                        <div class="col-md-12 col-sm-12">
                                                                                <div class="form-group">
                                                                                        <label>Link Patterns</label>
                                                                                        <input type="text" class="form-control" name='linktext' autocomplete="off" required>
                                                                                </div>
                                                                        </div>
                                                                        <div class="col-md-6 col-sm-12">
                                                                            <div class="form-group">
                                                                                        <label>OFF Link</label>
                                                                                        <input type="text" class="form-control" name='offlnk' autocomplete="off" required>
                                                                                </div>
                                                                        </div>
                                                                    <div class="col-md-6 col-sm-12">
                                                                                <div class="form-group">
                                                                                        <label>ON Link</label>
                                                                                        <input type="text" class="form-control" name='onlink' autocomplete="off" value='<?php  echo $detail['offerlink']; ?>' required>                                                                                </div>
                                    </div>


                                                                        <div class="col-md-6 col-sm-12">
                                                                                <div class="form-group">
                                                                                        <label>Link Type</label>
                                                                                        <select class=" form-control col-12" data-style="btn-outline-primary" data-size="3" tabindex="-98"  name="linktype"  autocomplete="off" required>
                                                                                                <option value="offlink" selected>Offer Link</option>
                                                                                                <option value="unlink">Unsub Link</option>
                                                                                        </select>
                                                                                </div>
                                                                        </div>


                                                                        <div class="col-md-6 col-sm-12">
                                                                                <div class="form-group">
                                                                                        <label>&nbsp;</label>
                                                                                              <div class="btn-list">
                                                                                                  <input type="submit" value='GENERATE' style="margin-top:" name='generatelink' class="btn btn-success btn-lg btn-block" >
                                                                                               </div>
                                                                                </div>
                                                                          </div>
                                                                        <form>
                                                                            


                                                                        <br>
                                                                        <div class="col-md-12 col-sm-12">
                                                                        <div style="margin-left: 60px;margin-right:50px;padding:5px;text-align: left;" class="text delresult" id="delresult" style="margin:10px;padding:5px;"> </div>
                                                                        <br>
                                                                        </div>

                                                                        </details>

                                                </div>
                                </div>

                        </div>

            </div>

 <div class="mainbox ">
<div class="main-container">
<div class="pd-ltr-20">
                        <div class="card-box mb-30">
                                <h2 class="h4 pd-20"> Offer Details </h2>
                                <br><hr><br>
                                <div class="row" style="padding-left: 15%;padding-right: 15%;">
                      <div class="col-md-3 col-sm-12">
                                          <div class="form-group">
                                                  <h5>Offer Name</h5>
                                           </div>
                                        </div>
                                       <div class="col-md-9 col-sm-12">
                                              <div class="form-group">
                                                  <b><p><font color='blue'><?php  echo $detail['offername']; ?></font></p></b>
                                          </div>
                                  </div>

<div class="col-md-3 col-sm-12">
                                                <div class="form-group">
                                                    <hr>
                                                        <h5>Offer Link</h5>
                                                </div>
                                                </div>
                                                <div class="col-md-9 col-sm-12">
                                                <div class="form-group">
                                                <hr>
                                                        <b><font color='red'><?php  echo $detail['offerlink']; ?></font></b>

                                                </div>
                                                </div>





                                                <div class="col-md-3 col-sm-12">
                                                <div class="form-group">
                                                <hr>
                                                        <h5>Unsub Link</h5>
                                                        
                                                </div>
                                                </div>
                                                <div class="col-md-9 col-sm-12">
                                                <div class="form-group">
                                                <hr>
                                                <b><font color='red' ><?php  echo $detail['unslink']; ?></font></b>

                                                </div>
                                                </div>





                                                <div class="col-md-3 col-sm-12">
                                                <div class="form-group">
                                                <hr>
                                                        <h5>Subject lines</h5>
                                                </div>
                                                </div>
                                                <div class="col-md-9 col-sm-12">
                                                <div class="form-group">
                                                <hr>
                                                <p  ><?php echo  str_replace("\n",'<br>',base64_decode($detail['sub_lines'])) ; ?></p>
                                                </div>
                                                </div>


                                                <div class="col-md-3 col-sm-12">
                                                <div class="form-group">
                                                <hr>
                                                        <h5>From Names</h5>
                                                </div>
                                                </div>
                                                <div class="col-md-9 col-sm-12">
                                                <div class="form-group">
                                                <hr>
                                                 <p><?php  echo  str_replace("\n",'<br>',base64_decode($detail['from_names'])) ; ?></p>
                                                </div>
                                                </div>



                                                <div class="col-md-3 col-sm-12">
                                                <div class="form-group">
                                                <hr>
                                                        <h5>Comments</h5>
                                                </div>
                                                </div>
                                                <div class="col-md-9 col-sm-12">
                                                <div class="form-group">
                                                <hr>
                                                <font color='red' ><?php  echo str_replace("\n",'<br>',base64_decode($detail['comments']))  ?></font>

                                                </div>
                                                </div>




                                  </div>
         </div>


                        </div>
         </div>
        </div>


</div>



<?php
}
?>





<br
<hr> 
<?php

if ($action  == '') { 
    ?>


<div  class="tablediv" >
    <table border='1' id="log" class="table table-striped table-bordered" style="width:100%" >
    
            <thead style="    vertical-align: bottom;   border-bottom: 2px solid #dee2e6;    text-align: center;    background-color: #4100cc;    color: white; " > 
                                                                    <tr>
                                                                    <td class="table-plus datatable-nosort" >Sno</td>
                                                                    <td>Offer ID</td>
                                                                    <td>NAME</td>
                                                                    <td>Offer Name</td>
                                                                    <td>Catagery</td>
                                                                    <td>Type</td>
                                                                    <td>Affiliate</td>
                                                                    <td>Sensitivity</td>
                                                                    <td>Payout</td>
                                                                    <td class="datatable-nosort" >Action</td>
                                                                    </tr>
                </thead>
    <tbody>
    
    
    
    <?php
    
        $detail = mysql_query("select * from `admin`.`offermaster` ",$rds);
    
    
        $tabledatabody='';
        define("1","Yes");
        define("2","NO");
        
        while( $details = mysql_fetch_array($detail))
        {  
        
                if ($details['sensitivity'] == '1') {
                        $sensitivity= 'Yes';
                }else  {
                        $sensitivity= 'No';
                }
        
        $tabledatabody .= '<tr>';     
        $tabledatabody .= '<td class="table-plus" >'.$details['offermasterid'].'</td>';      
        $tabledatabody .= '<td class="font-16">'.$details['offerid'].'</td>'; 
        $tabledatabody .= '<td>'.$details['srt'].'</td>';     
        $tabledatabody .= '<td>'.$details['offername'].'</td>'; 
        $tabledatabody .= '<td>'.$details['trtype'].'</td>';     
        $tabledatabody .= '<td>'.$details['netepc'].'</td>'; 
        $tabledatabody .= '<td>'.$details['affiliate'].'</td>';   
        $tabledatabody .= '<td>'.$sensitivity.'</td>';  
        $tabledatabody .= '<td>'.$details['payout'].'</td>';  
        $tabledatabody .= "<td> <form action='' method='post'> <div class='btn-list'> <input type='hidden' name='oid' value='".$details['offermasterid']."' > <input type='submit'  style='width: 80%;color: #fff;background-color: #593bffdb;border-color: #9285ff;margin: 1px;font-size: 12px;' class='btn btn-success btn-lg btn-block' name='action' value='Create Link' > </div> </form>   </td>";  
        $tabledatabody .= '</tr>';  
            }
    
           echo  $tabledatabody ; 
    ?>
    
                                                    </tbody>
                                                    </table>
    </div>

<?php 
  } 
  ?>



<div class="resp-container">
</div>

</div>
</center>

</div>
</body>
</html>
