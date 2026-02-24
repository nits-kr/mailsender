
<?php

error_reporting(0);
header("Access-Control-Allow-Origin: *");
date_default_timezone_set("EST");
$mainip=$_SERVER['HTTP_HOST'];
include "include.php";




session_start();

      if(!isset($_SESSION['username'])) // If session is not set then redirect to Login Page
       {
           header("Location:login.php?action=session+logged+out");  
       }

       $susername = $_SESSION['email'];
 $sid = $_SESSION['id'];
 $designation = $_SESSION['designation'];


$downdatefrom  = $_REQUEST['downdatefrom'];
$downdateto =  $_REQUEST['downdateto'];
$downloadfile = $_REQUEST['downloadfile'];

if ( $downloadfile == 'Downlaod In CSV' )
{    
    header("Content-type: text/txt");


    $uploadfile ='';
    $query1="select DISTINCT(t1.emailid) as emailids from `admin`.`optrack_2021` t1 where date(t1.ts) BETWEEN '".$downdatefrom."' AND '".$downdateto."' ";
    $detaildata = mysql_query($query1,$rds);

    while( $downdetails = mysql_fetch_array($detaildata))
    {  
        $emailids = $downdetails['emailids'];
        $uploadfile .= $emailids."\n";
    }

    $filename = 'Opener'.$downdatefrom.'_'.$downdateto.'.txt';
    $file = '/var/www/html/admin/temp/'.$filename;
    unlink($file);
    $uploadfile = trim($uploadfile);
    file_put_contents($file, $uploadfile);
    header("Content-disposition: attachment; filename = $filename");
    readfile("temp/$filename");
    exit;
}



$oid = $_REQUEST['oid'];
$action =  $_REQUEST['action'];

$sd = trim($_REQUEST['datefrom']);
$ld = trim($_REQUEST['dateto']);

$d = $sd ; 

if($d == '')
{

$sd = date('Y-m-d');
$ld = date('Y-m-d');
}



$ssd = $sd;
$lld = $ld;


function check($dat) {

    if ($dat == '') {
             $returnn = '0';
       } else {
              $returnn = $dat;
          }
    return $returnn;
 }
 


 

?>


<html>

<head>
<meta charset="utf-8">
<title>OPEN REPORT</title>
  <meta http-equiv="refresh" content="3600">
  <meta name="viewport" content="width=device-width, initial-scale=1">
<script type="text/javascript" language="javascript" src="https://code.jquery.com/jquery-3.5.1.js"></script>
<script type="text/javascript" language="javascript" src="https://cdn.datatables.net/1.10.24/js/jquery.dataTables.min.js"></script>
<script type="text/javascript" language="javascript" src="https://cdn.datatables.net/1.10.24/js/dataTables.bootstrap4.min.js"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.5.2/css/bootstrap.css" type="text/css" media="screen" title="default" />
<link rel="stylesheet" href="https://cdn.datatables.net/1.10.24/css/dataTables.bootstrap4.min.css" type="text/css" media="screen" title="default" />
<meta name="viewport" content="width=device-width, initial-scale=1">

<script src="http://code.jquery.com/ui/1.10.3/jquery-ui.js"></script>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />






<!-- Latest compiled and minified CSS -->
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">

<!-- Optional theme -->
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css" integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp" crossorigin="anonymous">

<!-- Latest compiled and minified JavaScript -->
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>









<script>

$(document).ready(function() {

    /*
     * Initialse DataTables, with no sorting on the 'details' column
     */
   var oTable = $('#log').dataTable( {
        "aoColumnDefs": [
            { "bSortable": false, "aTargets": [ 0 ] }
        ],
        "aaSorting": [[1, 'desc']],
                  "sScrollY": "500",
                "bScrollCollapse": true,
                "bPaginate": false,
                "bJQueryUI": true,
                "fnFooterCallback": function ( nRow, aaData, iStart, iEnd, aiDisplay ) {
/*
* Calculate the total market share for all browsers in this table (ie inc. outside
* the pagination)
*/

/* Calculate the market share for browsers on this page */
var countD = 0;
var countF = 0;
for ( var i=iStart ; i<iEnd ; i++ )
{
countD += aaData[ aiDisplay[i] ][3]*1;
countF += aaData[ aiDisplay[i] ][4]*1;

}

/* Modify the footer row to match what we want */
var nCells = nRow.getElementsByTagName('th');
nCells[3].innerHTML = countD ;
nCells[4].innerHTML = countF ;

}



    });   
} );

</script>




<style>
.h1, .h2, .h3, h1, h2, h3 {
    margin-top: 20px;
    margin-bottom: 10px;
}

.h1, h1 {
    font-size: 36px;
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
}


#main {
-webkit-box-shadow: 6px 3px 80px 9px rgba(102,102,102,0.37);
-moz-box-shadow: 6px 3px 80px 9px rgba(102,102,102,0.37);
box-shadow: 6px 3px 80px 9px rgba(102,102,102,0.37);
padding: 15px;
margin: 125px
}

td, th {
    padding: 11px;
    text-align: center;
    font-weight: bold;
}

</style>


</head>

<body>
<br><br><div id="main">
<br>
<center><h1><b>Opener Report</b></h1>
<hr>

<?php  echo  $sid.' | '. $designation ; ?>

<p align='center'> <b> <font color="black"  size="4">  From  </font><font color='red' size='4'><?php echo $ssd  ; echo ' </font ><font color="black"  size="4"> To </font> <font color="red" size="4"> '  ; echo $lld; ?></font></b> </p>
<form action="" method="post">
<p align='center'>

<input  style="margin:2px; padding:10px ; width: 255px;font-weight: bold;height: 40px;font-size: 1em;"  type="date" id="datedemo" name='datefrom' value='<?php echo $ssd ; ?>'> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<input  style="margin:2px; padding:10px ; width: 255px;font-weight: bold;height: 40px;font-size: 1em;"  type="date" id="datedemo" name='dateto' value='<?php echo $lld ; ?>'> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
<input class='btn info' style='margin-bottom: 6px;background:#f13333;border:none;color:#fff;font-size:large;font-weight:bold'  type="submit" value="Fetch" name="submit" />
</form></p>

<?php
if (trim($_SESSION['designation']) == 'Admin') {
?>

    <p> <form action='' method='post'><input type='hidden'  name='downdatefrom' value='<?php echo $ssd ; ?>'>  <input type='hidden'  name='downdateto' value='<?php echo $lld ; ?>'> 
<input class='btn info' style='margin-bottom: 6px;background:#f13333;border:none;color:#fff;font-size:large;font-weight:bold'  type="submit" value="Downlaod In CSV" name="downloadfile" />
</form></p>

<?php } ?>





<hr>
</center>

<br>





<table id="log" class="table table-striped table-bordered" style="width:90%; ">
        <thead style=' background-color: #4100cc; color: white;'>
            <tr>
                <td align="center" style="width:10%" >Date</td>
                <td align="center" style="width:25%" > Mailer</td>
                <td align="center" style="width:25%" >Offer ID</td>
                <td align="center" style="width:20%" >Total</td>
                <td align="center" style="width:20%" >Uniq</td>
            </tr
  </thead> <tbody>

  
  <?php
    

   $query="select date(t1.ts) as date,t1.offerid,count(DISTINCT(t1.emailid)) as uniq , count(t1.emailid) as total from `admin`.`optrack_2021` t1 where date(t1.ts) BETWEEN '".$ssd."' AND '".$lld."' group by offerid";
    $detail = mysql_query($query,$rds);
   
    $tabledatabody='';
    
    while( $details = mysql_fetch_array($detail))
    {  


       $offermailername = "select t1.mailer,t2.name  from `svml`.`svml_sendgrid`  t1, `login`.`users` t2  where  t1.mailer=t2.id and offer='".$details['offerid']."'  group by mailer limit 1;";
      
      
       $namedata = mysql_fetch_array(mysql_query($offermailername));
       $namemailer = $namedata['name'];    
       echo $idmailer = $namedata['mailer'];   
   echo '<br>';
    echo $sid;
       
       if ($namedata['name'] =='') {
      $namemailer = 'ADMIN';    
         }       


         if (trim($_SESSION['designation']) == 'Admin') {


            $tabledatabody .= '<tr>';     
            $tabledatabody .= '<td>'.$details['date'].'</td>';  
            $tabledatabody .= '<td>'.$namemailer.'</td>';
            $tabledatabody .= '<td class="table-plus" >'.$details['offerid'].'</td>';      
            $tabledatabody .= '<td class="font-16">'.$details['total'].'</td>'; 
            $tabledatabody .= '<td>'.$details['uniq'].'</td>';     
            $tabledatabody .= '</tr>';  


         }  else {



         if ($sid != $idmailer ){

    $tabledatabody .= '<tr>';     
    $tabledatabody .= '<td>'.$details['date'].'</td>';  
    $tabledatabody .= '<td>'.$namemailer.'</td>';
    $tabledatabody .= '<td class="table-plus" >'.$details['offerid'].'</td>';      
    $tabledatabody .= '<td class="font-16">'.$details['total'].'</td>'; 
    $tabledatabody .= '<td>'.$details['uniq'].'</td>';     
    $tabledatabody .= '</tr>';  

         }

        }


   }

}

       echo  $tabledatabody ; 
?>

<tfoot style=' background-color: #4100cc; color: white; text-align:center;'>
<th></th>
<th></th>
<th></th>
<th></th>
<th></th>
  </tbody></table></div></body>
</html>


