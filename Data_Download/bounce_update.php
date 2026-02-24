<?php 
include "session.php";
include "include.php";
?>
<html>
<head>
<title>Bounce Upload Portal</title>
<script type="text/JavaScript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
<script type="text/JavaScript" src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.11.2/jquery-ui.min.js"></script>
<script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/1.11.3/js/jquery.dataTables.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/plupload/3.1.5/plupload.full.min.js"></script>
<style>
    textarea{
        margin: 0px;
        height: 453px;
        width: 635px;
    }
</style>
<script>
function insert()
{
    $('#result').html("<img src='hourglass.gif' style='height: 40px'/>");
    //validation filename to set
    var textarea = document.getElementById("bounce_ids").value;
    if(textarea == '')
    {
        $('#result').html("<font color=red>Email Id Required..!</font>");
        return;
    }

    //upload script
    $.ajax({
          type: 'post',
          url: 'bounce_update_action.php',
          data: "ids="+textarea,
          success: function (data) {
            $('#result').html(data);
          }
        });
}
</script>
</head>
<body>
<center>
    <h2>Bounce Upload Portal</h2>
    <hr>
    <textarea name='bounce_ids' id='bounce_ids'></textarea><br><br>
    <button onclick = "insert()"> Insert</button><br><br>
    <div id = 'result' name='result'></div>
</body>
</html>
<?php mysql_close($conn);?>
