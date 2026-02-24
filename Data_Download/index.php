<?php 
include "session.php";
include "include.php";
?>

</html>
<head>
<title>DATA DOWNLOADING PORTAL</title>
<script type="text/JavaScript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
<script type="text/JavaScript" src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.11.2/jquery-ui.min.js"></script>
<link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />
<script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
<!-- Script Section -->
<script>
// $(document).ready(function() {
//     $('#aff').select2();
//     $('#offer').select2();
// });

$(document).ready(function() {
var $tabs = $('#t_draggable2')
$("tbody.t_sortable").sortable({
connectWith: ".t_sortable",
items: "> tr:not(:first)",
appendTo: $tabs,
helper:"clone",
zIndex: 999990
}).disableSelection();

var $tab_items = $(".nav-tabs > li", $tabs).droppable({
accept: ".t_sortable tr",
hoverClass: "ui-state-hover",
drop: function( event, ui ) { return false; }
});
});
</script>

<script type="text/javascript">
function get_data()
{
  var cellVal = '';

  //gets table
  var oTable = document.getElementById('t_draggable1');
  
  //gets rows of table
  var rowLength = oTable.rows.length;

  if (rowLength == 1)
  {
      document.getElementById('result').innerHTML = "<font color='Red'>Select Any File First..!</font>";
      return;
  }

  //loops through rows    
  for (i = 1; i < rowLength; i++)
  {
    //gets cells of current row
    var oCells = oTable.rows.item(i).cells;

    //gets amount of cells of current row
    var cellLength = oCells.length;

    //loops through each cell in current row
    for(var j = 0; j < cellLength; j++)
    {
      /* get your cell info here */
      var data = oCells.item(j).innerHTML;
      var myarr = data.split(" | ");
      cellVal += myarr[0]+",";

    }
  }
  document.getElementById('result').innerHTML = "<font color='orange'>Processing...!</font>";

  //Take value of Ip
  var ip = document.getElementById('ip').value;
  if (ip == '')
  {
    document.getElementById('result').innerHTML = "<font color='red'>Please Provide IP Address..!</font>";
    return;
  }

  //Take value of Affliate
  // var aff = document.getElementById('aff').value;
  // if ((aff == 'Select Any') || (aff == 0))
  // {
  //   document.getElementById('result').innerHTML = "<font color='red'>Please Provide Affliate..!</font>";
  //   return;
  // }

  // //Take value of OFFER
  // var offer = document.getElementById('offer').value;
  // if ((offer == 'Select Any') || (offer == 0))
  // {
  //   document.getElementById('result').innerHTML = "<font color='red'>Please Provide Offer..!</font>";
  //   return;
  // }

  //Take value of count
  var count = document.getElementById('count').value;
  if ((count == '') || (count == 0))
  {
    document.getElementById('result').innerHTML = "<font color='red'>Please Provide Count..!</font>";
    return;
  }

  //Take value of type 
  var type = $('input[id="type"]:checked').val();
  var selector = $('input[id="selector"]:checked').val();
  //Take value of Repeat times
  var times = document.getElementById('times').value;
  var aff = '';
  var offer = '';

  $.ajax({
          type: 'post',
          url: 'action_download.php',
          data: "data="+cellVal+"&count="+count+"&type="+type+"&times="+times+"&aff="+aff+"&ip="+ip+"&offer="+offer+"&selector="+selector,
          success: function (data) {
              document.getElementById('filename').value = data;
              document.getElementById('result').innerHTML = "<font color='green'>Success...!</font>";
          }
        });
}
</script>

<script type="text/javascript">
function get_data_local()
{
  var cellVal = '';

  //gets table
  var oTable = document.getElementById('t_draggable1');
  
  //gets rows of table
  var rowLength = oTable.rows.length;

  if (rowLength == 1)
  {
      document.getElementById('result').innerHTML = "<font color='Red'>Select Any File First..!</font>";
      return;
  }

  //loops through rows    
  for (i = 1; i < rowLength; i++)
  {
    //gets cells of current row
    var oCells = oTable.rows.item(i).cells;

    //gets amount of cells of current row
    var cellLength = oCells.length;

    //loops through each cell in current row
    for(var j = 0; j < cellLength; j++)
    {
      /* get your cell info here */
      var data = oCells.item(j).innerHTML;
      var myarr = data.split(" | ");
      cellVal += myarr[0]+",";

    }
  }

  //Take value of Affliate
  var aff = document.getElementById('aff').value;
  if ((aff == 'Select Any') || (aff == 0))
  {
    document.getElementById('result').innerHTML = "<font color='red'>Please Provide Affliate..!</font>";
    return;
  }

  //Take value of count
  var count = document.getElementById('count').value;
  if ((count == '') || (count == 0))
  {
    document.getElementById('result').innerHTML = "<font color='red'>Please Provide Count..!</font>";
    return;
  }

  //Take value of type 
  var type = $('input[id="type"]:checked').val();
  //Take value of Repeat times
  var times = document.getElementById('times').value;
  
  var data="data="+cellVal+"&count="+count+"&type="+type+"&times="+times+"&aff="+aff;
          
  window.location.href = 'http://173.249.50.153/Data_Download/local_file_download.php?'+data;
}
</script>
<!-- Style Section -->

<!-- CODE FOR COUNT TOTAL -->
<script>
$( document ).ready(function() {
  updateDataCount();
  $(".tables_ui").hover(function(){
    updateDataCount();
  });
});

function updateDataCount() {
  var d, sum=0;
  $("#t_draggable2 .ui-sortable-handle font").each(function(i) {
      d = $(this)[0].innerText;
      if(!isNaN(d)) {
          sum += parseInt(d);
      } 
  });
  $(".totalCount").text("Total : "+sum)

  var d, sum=0;
  $("#t_draggable1 .ui-sortable-handle font").each(function(i) {
      d = $(this)[0].innerText;
      if(!isNaN(d)) {
          sum += parseInt(d);
      } 
  });
  $(".selectCount").text("Total : "+sum)

}
</script>
<!-- ---------- -->

<!-- SEARCH BOX -->
<script>
$(document).ready(function(){
  $("#myInput").on("keyup", function() {
    var value = $(this).val().toLowerCase();
    $("#t_draggable2 td").filter(function() {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
    });
  });
});
</script>
<!-- -------------- -->
<style>
.tables_ui {
  display:inline-block;
  margin:1px 2%;
  border:2px solid #3333fe;
  border-spacing:0;
  width: 33%;
  overflow: scroll;
  height: 400px;
}
.tables_ui ul li {
  /* min-width: 200px; */
}
.dragging li.ui-state-hover {
  min-width: 240px;
}
.dragging .ui-state-hover a {
  color:green !important;
  font-weight: bold;
}
.tables_ui th,td {
  /* text-align: right; */
  /* padding: 2px 4px; */
  border: 1px solid;
  width: 1000;
}
.t_sortable tr, .ui-sortable-helper {
  cursor: move;
}
.t_sortable tr:first-child {
  cursor: default;
}
.ui-sortable-placeholder {
  background: yellow;
}

textarea {
    margin: 0px;
    width: 996px;
    height: 67px;
}
.title .name { float:right }

</style>
</head>
<body>
<center>
<div class="title"><h2>DATA DOWNLOADING PORTAL</h2>
</div>
<hr>
<table class="tables_ui" id="t_draggable1"><caption><h4><font color='green'>SELECTED</font></h4></caption>
    <tbody class="t_sortable">
    <tr>
        <th>Filename<span class='selectCount' style='float: inline-end;'></span></th>
    </tr>   
    </tbody>
</table>

<table class="tables_ui" id="t_draggable2"><caption><h4><font color='Blue'>All</font></h4><input id="myInput" type="text" placeholder="Search.."></caption>
    <tbody class="t_sortable">
    <tr>
        <th>Filename<span class='totalCount' style='float: inline-end;'></span></th>
    </tr>
        <?php
            $file = file_get_contents(__DIR__."/files.txt");
            $array = explode("\n",$file);
            foreach($array as $line)
            {
              echo "<tr>";
              echo "<td>$line</td>";
              echo "</tr>";
            }
        ?>
</tbody>
</table>
<br><br>
<form id='myform'>
IP : <input type='text' name='ip' id='ip' value="173.249.50.153"><br><br>
<!-- Affliate Name :- 
<select id="aff" name="aff" required>
  <?php
    echo file_get_contents(__DIR__."/affliate.txt");
  ?>
</select><br><br>
Offer Name :- 
<select id="offer" name="offer" required>
    <option >Select Any</option> -->
<?php
  // include "include.php";
  // $q = mysql_query("select sno,offer_name,Affiliate from `offer_module`.`offermaster`");
  // while($f = mysql_fetch_array($q))
  // {
  //   echo "<option value='$f[sno]'>$f[sno] | $f[Affiliate] | $f[offer_name]</option>";
  // }
  // mysql_close($conn);
?>
<!-- </select><br><br> -->
Count : <input type='text' name='count' id='count'>
<br><br>
Repeat By: <input type='text' name='times' id='times'>
<br><br>
Type : <input type='radio' name='type' id='type' value='Random' checked> Random <input type='radio' name='type' id='type' value='Not_Random'> Not Random
<br><br>
Selector : <input type='radio' name='selector' id='selector' value='email' checked> Email <input type='radio' name='selector' id='selector' value='both'> Email / MD5
<br><br>
</form>
<button onclick="get_data()"> Download </button>
<br><br>
<div id='result'></div>
<textarea id='filename' placeholder='Filename Will Be Generated Here..!'></textarea>
</center>
</body>
</html>
<?php mysql_close($conn);?>
