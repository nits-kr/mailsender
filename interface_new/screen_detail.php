<!DOCTYPE html>
<html>
<head>
<title></title>
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
</head>
<style>
.head-div {
  position: fixed;
  width:100%;
  background:#2676bb;
  color:#fff;
  padding: 12px
}
.head-optn{
font-size: 18px;
}
.table-div{
 
padding: 10px;
box-shadow: 5px 10px 18px #dad9d9;
margin-top: 5%;
text-align: center;
}
}
h1{
font-size: 30px;
color: #000;
text-transform: uppercase;
font-weight: 300;
text-align: center;
margin-bottom: 15px;
}
table{
width:100%;
table-layout: fixed;
}
.tbl-header{
background-color: rgba(255,255,255,0.3);
}
.tbl-content{
height: 83vh;
overflow-x:auto;
margin-top: 0px;
border: 1px solid rgba(255,255,255,0.3);
}
th{
padding: 5px 9px;
text-align: center;
font-weight: 500;
font-size: 14px;
font-weight: 600;
color: #000;
text-transform: uppercase;
}
td{
padding: 4px;
text-align: center;
vertical-align:middle;
font-weight: 300;
font-size: 14px;
color: #000;
border-bottom: solid 1px rgba(255,255,255,0.1);
}
thead{
background:#537692;

}
thead th{
color:#fff;
border-right: 1px solid #fff;
}
.table-striped>tbody>tr:nth-of-type(odd) {
  background-color: #eceff1;
}



/* for custom scrollbar for webkit browser*/

::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
}
::-webkit-scrollbar-thumb {
  -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
}
</style>
<script>
// '.tbl-content' consumed little space for vertical scrollbar, scrollbar width depend on browser/os/platfrom. Here calculate the scollbar width .
$(window).on("load resize ", function() {
var scrollWidth = $('.tbl-content').width() - $('.tbl-content table').width();
$('.tbl-header').css({'padding-right':scrollWidth});
}).resize();
</script>
</style>
<body>
<div class="container-fluid">
<div class="row head-div">
 
  <div class="col-md-3" style="text-align: center">
    <div class="head-optn">Server : <?php echo $_SERVER['REMOTE_ADDR'];?>  </div>
  </div>
  <div class="col-md-3" style="text-align: center">
    <div class="head-optn">Time Now : <?php echo $d =`date`; ?></div>
  </div>
  <div class="col-md-3" style="text-align: center" >
    <div class="head-optn">Svml ID: <?php echo trim($_REQUEST['id']);?></div>
  </div>
  <div class="col-md-3" style="text-align: center" >
    <div class="head-optn"><button><a href = 'screen_detail.php?id=<?php echo trim($_REQUEST['id']);?>'>SHOW ALL LOG</a></button></div>
  </div>
  </div>
  <div class="row table-div">
<?php
if ($_REQUEST['limit'] == 'limit 100')
echo "SHOWING LAST 100 LINES";
else
echo "SHOWING ALL LOGS";
?>
<div class="tbl-header">
<table cellpadding="0" cellspacing="0" border="0">
    <thead>
      <tr>
        <th>Output</th>
        <th>Date</th>
       
      </tr>
    </thead>
  </table>
</div>
<div class="tbl-content">
  <table cellpadding="0" cellspacing="0" border="0" class="table-striped">
  <tbody>

    <?php
    $s_svml_id = trim($_REQUEST['id']);
    $limit = $_REQUEST['limit']; 

    $connection = mysql_connect("localhost","root","dvfersefag243435") or die ("Could Not Connect To Database : <br>".mysql_error());
    mysql_select_db("svml") or die ("Database Not Found : <br>".mysql_error());

    $query = mysql_query("select * from screen_status where svml_id = '".$s_svml_id."' order by sno desc $limit");

    while($fetch = mysql_fetch_array($query))
    {
        echo "<tr>";
        if(strstr($fetch['output'],"|1"))
        {
            $data = explode("|",$fetch['output']);
            echo " <td>DATA BEFORE : <b>$data[0]</b>  Sucessfully Sent to <b>".($data[0]-$data[1])."</b> Subscribres. DATA AFTER : <b>$data[1]</b></td>";
            echo " <td>$fetch[s_timestamp]</br></td>";
        }
        else
        {
            echo "<td>$fetch[output]</td>";
            echo "<td>$fetch[s_timestamp]</td>";
        }
        echo "</tr>";
    }
    mysql_close($connection);
?>

</tbody>
</table>
</div>
   
</div>  
</div>  




</div>
</body>

</html>
