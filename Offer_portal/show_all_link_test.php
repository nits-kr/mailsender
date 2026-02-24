<?php 
include "session.php";
include "include.php";
$limit = $_REQUEST['limit']; 
?>
<html>
<head>
<title>ALL LINK PORTAL</title>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">

<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
<link href="https://cdn.datatables.net/responsive/2.2.3/css/responsive.dataTables.min.css" rel="stylesheet" />
<link href="https://cdn.datatables.net/1.10.19/css/jquery.dataTables.min.css" rel="stylesheet" />
<link href="https://cdn.jsdelivr.net/gh/gitbrent/bootstrap4-toggle@3.6.1/css/bootstrap4-toggle.min.css" rel="stylesheet">
<script src="https://code.jquery.com/jquery-3.3.1.js"></script>
<script src="https://cdn.datatables.net/1.10.19/js/jquery.dataTables.min.js"></script>
<script src="https://cdn.datatables.net/responsive/2.2.3/js/dataTables.responsive.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/gitbrent/bootstrap4-toggle@3.6.1/js/bootstrap4-toggle.min.js"></script>

<style>
li{
    width: 315%;
}
</style>

<script>
    function toggel(value)
    {
        // alert(value);
        $.ajax({
            type: 'post',
            url: 'toggel.php',
            data: 'id='+value,
            success: function (data) {
                document.getElementById('tick_'+value).innerHTML = data;
            }
        });
    }

    function changelink (link, id)
    {
        // console.log(value,id);
        var encoded_link = btoa(link);
        $.ajax({
            type: 'post',
            url: 'link_change.php',
            data: 'link='+encoded_link+'&id='+id,
            success: function (data) {
                document.getElementById('tick_'+id).innerHTML = data;
            }
        });
    }

    function fetch_report(offer_id, id)
    {
        var existing_data = document.getElementById('report_'+id).innerHTML;
        if( existing_data == '')
        {
            var encoded_offer_id = btoa(offer_id);
            $.ajax({
                type: 'post',
                url: 'report.php',
                data: 'offer_id='+encoded_offer_id,
                success: function (data) {
                    document.getElementById('report_'+id).innerHTML = data;
                    document.getElementById('report_button_'+id).innerHTML = "CLOSE..";
                    document.getElementById('report_button_'+id).style.backgroundColor = 'Red';  
                }
            });
        }
        else
        {
            document.getElementById('report_'+id).innerHTML = '';
            document.getElementById('report_button_'+id).innerHTML = "CHECK..";
            document.getElementById('report_button_'+id).style.backgroundColor = 'white'; 
        }
    }
</script>

<script>
    $(document).ready(function() {
    var table = $('#example').DataTable( {
        pageLength: 100,
        responsive: {
      details: {
         type: 'column'
      }
   },
   columnDefs: [{
      className: 'control',
      orderable: false,
      targets: 0
   }],
   order: [1, 'desc']
    });

    // Add event listener for opening and closing details
    $('#example tbody').on('click', 'td.dt-control', function () {
        var tr = $(this).closest('tr');
        var row = table.row( tr );
 
        if ( row.child.isShown() ) {
            // This row is already open - close it
            row.child.hide();
            tr.removeClass('shown');
        }
        else {
            // Open this row
            row.child( format(row.data()) ).show();
            tr.addClass('shown');
        }
    });
});
</script>
</head>
<body>
<div class="panel panel-primary" style="width: 95%;margin-left: 2.5%;margin-right: 2.5%;">
    <div class="panel-heading">
        <center><h2><font style="font-family: 'Lucida Console', Courier, monospace;"><u>ALL LINK PORTAL</u></h2>
    </div>
    <div class="panel-body">
    <div id='pagination'>PAGINATION : 
        <?php
            if($_SESSION['designation'] == 'Admin') {
                $q = mysql_fetch_array(mysql_query("select max(sno) mx from all_links order by sno desc"));
            } else {
                $q = mysql_fetch_array(mysql_query("select max(sno) mx from all_links where `sender` = $_SESSION[id] order by sno "));
            }
            $numberofButtons = ceil($q['mx']/100);
            for($i = 1; $i <= $numberofButtons ; $i++) {
                $s = $i*100;
                echo "<button><a href =\"$_SERVER[PHP_SELF]?limit=$s\">$s</a></button>";

            }
        ?>
    </div>
    <br>
    <table id="example" class="display" style="width:100%;font-size: x-small;">
        <thead style="background: cadetblue;">
            <tr>
                <th></th>
                <th class="all">S-NO</th>
                <th class="all">OM-ID</th>
                <th class="all">O-ID</th>
                <th class="all">SENDER</th>
                <th class="all">DOMAIN</th>
                <th class="all">LINK TYPE</th>
                <th class="none">PATTERN</th>
                <th class="none">REDIRECT LINK</th>
                <th class="none">GEN. LINK</th>
                <th class="all">CREATE AT</th>
                <th class="all">ACTION</th>
                <th class="all">FETCH REPORT</th>
            </tr>
        </thead>
        <tbody> 
        <?php
            
            if($_SESSION['designation'] == 'Admin') {
                if($limit != '') {
                    $lower = $limit-100;
                    $q = mysql_query("select * from all_links where sno between $lower and $limit order by sno desc");
                } else {
                    $q = mysql_query("select * from all_links order by sno desc limit 100");
                }
                
            } else {
                $q = mysql_query("select * from all_links where `sender` = $_SESSION[id] order by sno ");
            }
            while($fetch=mysql_fetch_array($q,MYSQL_ASSOC))
            {
                echo "<tr>
                        <td></td>
                        <td>$fetch[sno]</td>
                        <td>$fetch[offer_master_id]</td>
                        <td>$fetch[own_offerid]</td>
                        <td>$fetch[sender_name]</td>
                        <td>$fetch[domain]</td>
                        <td>$fetch[link_type]</td>
                        <td>$fetch[pattern]</td>
                        <td><input type ='text'  value = '$fetch[main_link]' style='width: 90%' onfocusout='changelink(this.value,\"$fetch[sno]\")' \></td>";
                        if ($fetch["link_type"] == "Open")
                        echo '<td><input type ="text" style="width: 90%" value = \'<img alt="" src="'.$fetch["generated_link"].'" width="1px" height="1px" style="visibility:hidden"/>\' readonly></td>';
                        else
                        echo "<td>$fetch[generated_link]</td>";

                        echo "<td>$fetch[created_at]</td>";
                        if($fetch["Status"] == 1)
                        echo "<td><input type='checkbox' checked data-toggle='toggle' data-onstyle='success' data-size='xs' onchange='toggel($fetch[sno])'>&nbsp&nbsp&nbsp<span id='tick_$fetch[sno]'></span></td>";
                        else
                        echo "<td><input type='checkbox' data-toggle='toggle' data-onstyle='success' data-size='xs' onchange='toggel($fetch[sno])'>&nbsp&nbsp&nbsp<span id='tick_$fetch[sno]'></span></td>";
                        echo "<td><button id = 'report_button_$fetch[sno]' onclick = fetch_report('$fetch[own_offerid]','$fetch[sno]')> CHECK..</button>&nbsp&nbsp&nbsp<span id='report_$fetch[sno]'></span></td>";

                    echo "</tr>";
            }
        ?>
        </tbody>
        <tfoot>
            <tr>
                <td colspan=9></td>
            </tr>
        </tfoot>
        </table>
    </div>
</div>
<?php mysql_close($conn);?>
</body>
</html>
