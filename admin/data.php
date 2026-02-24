<?php
error_reporting(0);
set_time_limit(0);
ini_set("memory_limit",-1);


session_start();

      if(!isset($_SESSION['username'])) // If session is not set then redirect to Login Page
       {
           header("Location:login.php?action=session+logged+out");
     die();
       }

       $sid= trim($_SESSION['id']) ; 


include "include.php";

       $assign ="<select name='assign' id='assign'  style='width: 28%;' required>";                    
       $detail = mysql_query("select * from `login`.`users`");

       while( $details = mysql_fetch_array($detail)){  
        $assign .=  '<option value="'.$details['id'].'"> '.$details['name'].' </option>';
       }
        $assign .= '</select>';


$dataids = trim($_REQUEST['ids']);
$count = $_REQUEST['count'];
$filename = trim($_REQUEST['filename']);

$fullpath = "/var/www/data/".$filename ; 



function strToHex($string){
  $hex='';
  for ($i=0; $i < strlen($string); $i++){
      $hex .= dechex(ord($string[$i]));
  }
  return $hex;
}


function hexToStr($hex){
  $string='';
  for ($i=0; $i < strlen($hex)-1; $i+=2){
      $string .= chr(hexdec($hex[$i].$hex[$i+1]));
  }
  return $string;
}




?>




<html>

<head>

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


.btn {
  border: none;
  border-radius: 12px;
  color: white;
  padding: 5px 14px;
  font-size: 13px;
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



input[type=text], select, textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: vertical;
}


input[type=submit] {
  background-color: #04AA6D;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  float: center;
  font-weight: bold;
}

input[type=submit]:hover {
  background-color: #2CE8A3;
}


table.dataTable>thead>tr {
    padding-right: 30px;
    background-color: #07d1f2;
    color: white;
    font-weight: bold;
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


table.dataTable>tbody>tr {
    font-weight: bold;
}

#form {
-webkit-box-shadow: 6px 3px 80px 9px rgba(102,102,102,0.37);
-moz-box-shadow: 6px 3px 80px 9px rgba(102,102,102,0.37);
box-shadow: 6px 3px 80px 9px rgba(102,102,102,0.37);
margin: 25px;
padding: 15px;
height: 200px;
}


#form2 {
-webkit-box-shadow: 6px 3px 80px 9px rgba(102,102,102,0.37);
-moz-box-shadow: 6px 3px 80px 9px rgba(102,102,102,0.37);
box-shadow: 6px 3px 80px 9px rgba(102,102,102,0.37);
margin: 25px;
padding: 15px;
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
        "aaSorting": [[1, 'desc']],
                  "sScrollY": "320",
                "bScrollCollapse": true,
                "bPaginate": false,
                "bJQueryUI": true,
                "fnFooterCallback": function ( nRow, aaData, iStart, iEnd, aiDisplay ) {


}



    });
} );

</script>




</head>
<body>
<center>
<div id='form2' style='width:80%; ' >


<br>

<h2> DATA SHEET </h2> 


<details>
<summary role="button" class="btn-primary" style="background:#269abc;border-radius:4px;height: auto;width: 50%;text-align: center;margin: 5px;padding: 5px;"><b><font>CREATE TEST DATAFILE</font></b></summary>
<div id='form'  style='width:80%; height:400px' >
<form  id='adddata' method='post' action="" >
<table  style='width: 85%;' >  <tr><td rowspan="3" style="padding:15px;"> 
<textarea name='ids' id='ids'  style="max-width:100%;height:220px; margin:5px" placeholder='Put Ids Here.....' required></textarea> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </td><td>
<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <input type='text'  style='width:75%;' name='count' id='count' placeholder='Put Total Datafile Count' required> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </td>  </tr> <tr> <td> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<input type='text' name='filename' style='width:75%;' id='filename' placeholder='Datafile Name' required> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </td><td> </tr> <tr> <td>   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<input align='center' type='submit'  name='generate' value='Generate'> </td><td></tr></table>
</form>
<br>
</div>
</details>
<p align='right'> <b> Welcome : <font color='red'><?php echo $_SESSION['fname'];?> </font> </b></p>
<br><hr><br>
<p align='center' id='#delresult' > <b> 

<?php

if (isset($_POST['generate'])) {

  $dataids = trim($_REQUEST['ids']);
  $count = $_REQUEST['count'];
  $filename = trim($_REQUEST['filename']);

 
 $fullpath = "/var/www/data/".$sid."-".$filename ; 
 

 
 if (file_exists($fullpath)){
 
 echo $msg = "<font color='black'> ".$filename."  </font> <font color='red'>  Already Exist </font>";
 exit;
 }
 
 
 
 $dataidss = explode("\n",$dataids);
 
 
 $data = array();
 $invailddata = array();
 
     foreach ($dataidss as $dataidid) {
   
              $dataid = trim($dataidid);
 
           if (filter_var(trim($dataid), FILTER_VALIDATE_EMAIL)) {
           array_push($data,$dataid);
           } else {
           array_push($invailddata,$dataid);
           }
 
 
 
     }
 
        $countdata = count($data);
        
        if ($countdata == '0' ){
        
          echo $msg = "<font color='black'> ".$filename."  </font> <font color='red'> All ids are invaild... </font>";
          exit;
          }

  
          $countinvailddata = count($invailddata);
     
          if ($countinvailddata != '0' ){
              $invresult = '<p style="color:red" > Invaild Ids : '.$countinvailddata.' <br> ';
                    foreach ( $invailddata as $invailddataa ) {
                      $invresult .= $invailddataa."<br>";
                    } 
              $invresult .= '</p>';
              echo  $invresult;
          }

          

 $loopcounts = round($count / $countdata); 
$loopcount = ($loopcounts + 1);
 
 $maindata = array();
 
 
 
         for ($x = 0; $x <= $loopcount; $x++) {
 
                 foreach ( $data as $item ) {
                     $email = $item."\n";
                     file_put_contents($fullpath, $email, FILE_APPEND);
                 } 
 
         } 

         
 $fullpath1 = $fullpath."_1";
 
 `cat $fullpath | shuf | head -$count > $fullpath1 ; echo -ne 'y\n' | mv $fullpath1 $fullpath ; chmod 0777 $fullpath`;
 
 
     if (file_exists($fullpath)){
         echo $msg = "<font color='black'> ".$filename."  </font> <font color='green'>  Created Successfully </font>";
     }
 
 
 }
 






 if (isset($_POST['delete'])) {

$name = trim(hexToStr($_REQUEST['id']));


$file_pointer = "/var/www/data/".$name  ; 


if (!unlink($file_pointer)) { 
$delmsg = "<font color='red'> ".$name."  </font> <font color='black'>  cannot be deleted due to an error </font>";
} 
else { 

$delmsg = "<font color='red'> ".$name."  </font> <font color='black'>  Deleted Successfully </font>";
}

echo $delmsg; 

 }




 if (isset($_POST['split'])) {


$name = trim(hexToStr($_REQUEST['id']));
$count = trim($_REQUEST['filecount']);
$assign = trim($_REQUEST['assign']);
$count1 =  ($count + 1);

$file_pointer = "/var/www/data/".$name ;

$newfile_pointer = "/var/www/data/".$assign."-".$name."_".$count ;

$newfile_pointer1 = "/var/www/data/".$assign."-".$name."_".$count1 ;

`sed -n "1,$count"p $file_pointer > $newfile_pointer `; 
`sed -n "$count1,$"p $file_pointer > $newfile_pointer1 `; 
`rm -rf $file_pointer  ; mv $newfile_pointer1 $file_pointer`;
`chmod 0777 $file_pointer $newfile_pointer `;

$delmsg = "<font color='red'> ".$newfile_pointer."  </font> <font color='black'> Created  Successfully </font>";

echo $delmsg;

 }

?>




</b></p>

<div style='width:80%; ' >


<?php



if (trim($_SESSION['designation']) == 'Admin') {
  $allfiles = `wc -l /var/www/data/* | grep '/var/www/data' | sed 's|/var/www/data/||g' |awk -F ' ' '{print $2","$1}'`;
} else {
  $nnn = '^'.$sid.'-';
  $allfiles = `wc -l /var/www/data/* | grep '/var/www/data' | sed 's|/var/www/data/||g' |awk -F ' ' '{print $2","$1}' | grep "$nnn" `;
}


$files = explode("\n", trim($allfiles));

$tableresult = '<table border="1" id="log" class="table table-striped table-bordered" style="width:80%">   <thead><tr> <td>FILENAME</td><td>COUNT</td><td>STATUS</td> </tr></thead><tbody>';
foreach ($files as $file) {
  
  if (trim($file) != '') {
  $F = explode(',',trim($file));



$reportbutton =  ' <form method="post" action=""> <input type="hidden" name="id" value='.strToHex($F[0]).' >   <input type="submit" name="report" id="report"  style="margin-left:15px;background:#14ca27;padding:4px 12px;border-radius:4px;border:none;color:#fff;font-size:15px;font-weight:600" value="REPORT"> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ';

$delbutton = '<input type="submit" name="delete" id="delete"  style="background:#ff0700;padding:4px 12px;border-radius:4px;border:none;color:#fff;font-size:15px;font-weight:600" value="DELETE">';

$splitbutton =  '<details>
<summary role="button" class="btn-primary" style="background:#269abc;border-radius:4px;height: auto;width: 50%;text-align: center;margin: 5px;padding: 5px;"><b><font>SPLIT</font></b></summary> '.$assign.' <input type="text" name="filecount" id="filecount" placeholder="File count" style="width:200px"> 
<input type="submit" name="split" id="split"  style="margin-left:15px;background:#14ca27;padding:4px 12px;border-radius:4px;border:none;color:#fff;font-size:15px;font-weight:600" value="SPLIT"></details> </form>';




if (trim($_SESSION['designation']) == 'Admin') {
  $tableresult .=  '<tr><td>'.$F[0].'</td><td>'.$F[1].'</td>  <td> <div> '.$reportbutton .$delbutton .  $splitbutton.'  </p></td></tr>';

} else {
      $tableresult .=  '<tr><td>'.$F[0].'</td><td>'.$F[1].'</td>  <td> <div> '.$reportbutton .'  </p></td></tr>';

}

}

}

$tableresult .=  '</tbody></table>';

echo $tableresult;




?>

</div>







<div style='width:80%; ' >




<?php

 
if (isset($_POST['report'])) {

  $dfname = trim(hexToStr($_REQUEST['id']));


  // $dfname = preg_replace('/[^A-Za-z0-9. -]/', '', $dfname);
  // $dfname = preg_replace('/  */', '', $dfname);
  // $dfname = preg_replace('/\\s+/', '', $dfname);

  echo "<h3> <font color='red'>".$dfname." </font></h3>";

    `echo $dfname > /var/www/html/temp`;

    $allfiles = `cat /var/www/data/$dfname  | awk -F '@' '{print $2}' | sort |uniq -c | sed 's|/var/www/data/||g' | awk -F ' ' '{print $2","$1}'`;
    $count = `wc -l /var/www/data/$dfname | grep '/var/www/data/' |  sed 's|/var/www/data/||g' | awk -F ' ' '{print $2","$1}' `; 

    $files = explode("\n", trim($allfiles));
    $tableresult2 = '<table border="1" id="log" class="table table-striped table-bordered" style="width:80%">   <thead><tr align="center" style="background-color: #60D6FF;font-weight: bold;" > <td>FILENAME</td><td>COUNT</td>  </tr></thead><tbody>';
    $Totalcount = '0';
    foreach ($files as $file) {
      
        $F = explode(',',trim($file));

        $tableresult2 .=  '<tr><td>'.$F[0].'</td><td>'.$F[1].'</td> </tr>';
      $Totalcount =  ($Totalcount + $F[1]);
      
    }

    $tableresult2 .=  ' </tbody> <tfoot><tr align="center" style="background-color: #60D6FF;font-weight: bold;" ><td> Total </td><td> <font color="black"> <b> '.$Totalcount.'</b> </font></td> </tr><tfoot></table>';

    echo '<br><hr><br>';
echo $tableresult2;
}


?>

</div>


</div>
</center>



</body>
</html>
