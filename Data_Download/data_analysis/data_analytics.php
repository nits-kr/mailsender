<?php include "../session.php";?>
</html>
<head>
<title>DATA ANALYSIS PORTAL</title>
<script type="text/JavaScript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
<script type="text/JavaScript" src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.11.2/jquery-ui.min.js"></script>
<link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />
<script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>

<!-- Script Section -->
<script>
$(document).ready(function() {
    $('.type').select2();
    $("#type_checkbox").click(function(){
    if($("#type_checkbox").is(':checked') ){
        $("#type > option").prop("selected","selected");
        $("#type").trigger("change");
    }else{
        $("#type > option").removeAttr("selected");
         $("#type").trigger("change");
     }
});
});
</script>
<script>
    function stepone()
    {
        var type_selected = $('#type').val();
        document.getElementById('offers_div').innerHTML = "<img src='hourglass.gif' style='height: 22px;'>";
        $.ajax({
          type: 'post',
          url: 'give_offers.php',
          data: "data="+type_selected,
          success: function (data) {
              document.getElementById('offers_div').innerHTML = data;
              $('.offer').select2();
              $("#offers_checkbox").click(function(){
                if($("#offers_checkbox").is(':checked') ){
                    $("#offer > option").prop("selected","selected");
                    $("#offer").trigger("change");
                }else{
                    $("#offer > option").removeAttr("selected");
                    $("#offer").trigger("change");
                }
            });
          }
        });
    }
    function steptwo()
    {
        var type_selected = $('#type').val();
        var offer_selected = $('#offer').val();
        document.getElementById('offerid_div').innerHTML = "<img src='hourglass.gif' style='height: 22px;'>";
        $.ajax({
          type: 'post',
          url: 'give_offerid.php',
          data: "offer="+offer_selected+"&type="+type_selected,
          success: function (data) {
              document.getElementById('offerid_div').innerHTML = data;
              $('.offerid').select2();
              $("#offerid_checkbox").click(function(){
                if($("#offerid_checkbox").is(':checked') ){
                    $("#offerid > option").prop("selected","selected");
                    $("#offerid").trigger("change");
                }else{
                    $("#offerid > option").removeAttr("selected");
                    $("#offerid").trigger("change");
                }
            });
          }
        });
    }
    function stepthree()
    {
        var type_selected = $('#type').val();
        var offer_selected = $('#offer').val();
        var offerid_selected = $('#offerid').val();
        document.getElementById('isp_div').innerHTML = "<img src='hourglass.gif' style='height: 22px;'>";
        $.ajax({
          type: 'post',
          url: 'give_isp.php',
          data: "offer="+offer_selected+"&type="+type_selected+"&oid="+offerid_selected,
          success: function (data) {
              document.getElementById('isp_div').innerHTML = data;
              $('.isp').select2();
              $("#isp_checkbox").click(function(){
                if($("#isp_checkbox").is(':checked') ){
                    $("#isp > option").prop("selected","selected");
                    $("#isp").trigger("change");
                }else{
                    $("#isp > option").removeAttr("selected");
                    $("#isp").trigger("change");
                }
            });
          }
        });
    }
    function stepfour()
    {
        var type_selected = $('#type').val();
        var offer_selected = $('#offer').val();
        var offerid_selected = $('#offerid').val();
        var isp_selected = $('#isp').val();
        document.getElementById('timeframe_div').innerHTML = "<img src='hourglass.gif' style='height: 22px;'>";
        $.ajax({
          type: 'post',
          url: 'give_timeframe.php',
          data: "offer="+offer_selected+"&type="+type_selected+"&oid="+offerid_selected+"&isp="+isp_selected,
          success: function (data) {
              document.getElementById('timeframe_div').innerHTML = data;
              $('.timeframe').select2();
              $("#timeframe_checkbox").click(function(){
                if($("#timeframe_checkbox").is(':checked') ){
                    $("#timeframe > option").prop("selected","selected");
                    $("#timeframe").trigger("change");
                }else{
                    $("#timeframe > option").removeAttr("selected");
                    $("#timeframe").trigger("change");
                }
            });
          }
        });
    }
    function stepfive()
    {
        document.getElementById('buttons').innerHTML = "<hr><button onclick='stepsix()'>LOAD DATA</button>";
    }
    function stepsix()
    {
        var type_selected = $('#type').val();
        if(!type_selected)
        {
            alert("TYPE NOT SELECTED");
            document.getElementById("type").focus();
            return; 
        }

        var offer_selected = $('#offer').val();
        if(!offer_selected)
        {
            alert("OFFER NOT SELECTED");
            document.getElementById("offer").focus();
            return; 
        }

        var offerid_selected = $('#offerid').val();
        if(!offerid_selected)
        {
            alert("OFFERID NOT SELECTED");
            document.getElementById("offerid").focus();
            return; 
        }

        var isp_selected = $('#isp').val();
        if(!isp_selected)
        {
            alert("ISP NOT SELECTED");
            document.getElementById("isp").focus();
            return; 
        }

        var timeframe_selected = $('#timeframe').val();
        if(!timeframe_selected)
        {
            alert("TIMEFRAME NOT SELECTED");
            document.getElementById("timeframe").focus();
            return; 
        }

        document.getElementById('Count_div').innerHTML = "<hr><img src='hourglass.gif' style='height: 22px;'>";
        $.ajax({
          type: 'post',
          url: 'give_data.php',
          data: "offer="+offer_selected+"&type="+type_selected+"&oid="+offerid_selected+"&isp="+isp_selected+"&tframe="+timeframe_selected,
          success: function (data) {
              document.getElementById('Count_div').innerHTML = "<hr>"+data;
          }
        });
    }
    function stepseven()
    {
        var ip = $('#ip').val();
        if(!ip)
        {
            alert("PROVIDE IP FOR TRANSFER");
            document.getElementById("ip").focus();
            return; 
        }
        var filename = $('#filename').val();

        document.getElementById('result_div').innerHTML = "<img src='hourglass.gif' style='height: 22px;'>";
        $.ajax({
          type: 'post',
          url: 'transfer_data.php',
          data: "ip="+ip+"&filename="+filename,
          success: function (data) {
              document.getElementById('result_div').innerHTML = data;
          }
        });
    }
</script>
</head>
<body>
<center>
<div class="title"><h2>ANALYSIS PORTAL</h2></div>
<hr>
<table id='analysis'>
    <thead>
        <tr>
            <th>OPTIONS</th>
            <th>VALUE</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>TYPE</td>
            <td>
                <input type="checkbox" id="type_checkbox" >
                <select class="type" name="type[]" id="type" multiple="multiple" style="width: 75%" onchange="stepone()">
                    <option value="Open">OPENER</option>
                    <option value="Subscribe">CLCKER</option>
                </select>
            </td>
        </tr>
        <tr>
            <td>OFFER</td>
            <td>
                <div id='offers_div'></div>
            </td>
        </tr>
        <tr>
            <td>OFFERID</td>
            <td>
                <div id='offerid_div'></div>
            </td>
        </tr>
        <tr>
            <td>ISP</td>
            <td>
                <div id='isp_div'></div>
            </td>
        </tr>
        <tr>
            <td>TIMEFRAME</td>
            <td>
                <div id='timeframe_div'></div>
            </td>
        </tr>
    </tbody>
</table>
<div id='buttons'></div>
<div id='Count_div'></div>
<div id='result_div'></div>
</body>
<style>
#analysis {
  font-family: Arial, Helvetica, sans-serif;
  border-collapse: collapse;
  width: 90%;
}

#analysis td, #analysis th {
  border: 1px solid #ddd;
  padding: 8px;
}

#analysis tr:nth-child(even){background-color: #f2f2f2;}

#analysis tr:hover {background-color: #ddd;}

#analysis th {
  padding-top: 12px;
  padding-bottom: 12px;
  text-align: left;
  background-color: #04AA6D;
  color: white;
}
.loader {
  border: 16px solid #f3f3f3;
  border-radius: 50%;
  border-top: 16px solid #3498db;
  width: 120px;
  height: 120px;
  -webkit-animation: spin 2s linear infinite; /* Safari */
  animation: spin 2s linear infinite;
}

/* Safari */
@-webkit-keyframes spin {
  0% { -webkit-transform: rotate(0deg); }
  100% { -webkit-transform: rotate(360deg); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
</html>
