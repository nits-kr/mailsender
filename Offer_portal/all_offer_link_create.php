<?php 
include "session.php";
$des = $_SESSION['designation'];
?>
<html>
<head>
<title>ALL OFFER PORTAL</title>
<style>
input[type=text]{
width: 100%;
background: gainsboro;
font-size: small;
}

li{
    width: 760%;
}
</style>
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
<link href="https://cdn.datatables.net/responsive/2.2.3/css/responsive.dataTables.min.css" rel="stylesheet" />
<link href="https://cdn.datatables.net/1.10.19/css/jquery.dataTables.min.css" rel="stylesheet" />
<script src="https://code.jquery.com/jquery-3.3.1.js"></script>
<script src="https://cdn.datatables.net/1.10.19/js/jquery.dataTables.min.js"></script>
<script src="https://cdn.datatables.net/responsive/2.2.3/js/dataTables.responsive.min.js"></script>
<script>
 /* Formatting function for row details - modify as you need */
function format ( d ) {
    // `d` is the original data object for the row

}
 
    $(document).ready(function() {
    var table = $('#example').DataTable( {
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
<body style="font-size: inherit;"> 
<div class="panel panel-primary" style="width: 95%;margin-left: 2.5%;margin-right: 2.5%;">
    <div class="panel-heading">
        <center><h2><font style="font-family: 'Lucida Console', Courier, monospace;">ALL OFFER PORTAL</font></h2></center>
    </div>
    <div class="panel-body">
        <table id="example" class="display" style="width:100%;font-size: larger;">
            <thead style="background: cadetblue;">
                <tr>
                    <th></th>
                    <th class="all">O.M.ID</th>
                    <th class="all">AFFLIATE</th>
                    <th class="all">OFFER ID</th>
                    <th class="all">OFFER NAME</th>
                    <th class="all">PAYOUT</th>
                    <th class="all">SENSITIVE</th>
                    <?php if($des == 'Admin') { ?>
                    <th class="all">ACTION</th>
                    <?php } ?>
                    <th class="none">SUB URL : </th>
                    <th class="none">UNSUB URL : </th>
                    <th class="none">OPEN URL : </th>
                    <th class="none">OPT-OUT URL : </th>
                    <th class="none">FROM NAME : </th>
                    <th class="none">SUBJECT : </th>
                    <th class="none">RESTRICTIONS :</th>
                    <th class="none"></th>
                </tr>
            </thead>
            <tbody>
            <?php
                include "include.php";
                $query = mysql_query("select * from offermaster");
                while($fetch = mysql_fetch_array($query,MYSQL_ASSOC))
                {
                    echo "<tr>
                            <td></td>
                            <td>$fetch[sno]</td>
                            <td>$fetch[Affiliate]</td>
                            <td>$fetch[offer_id]</td>
                            <td>$fetch[offer_name]</td>
                            <td>$fetch[payout]</td>";
                            if($fetch['sensitive'] == 1)
                            echo "<td>Yes</td>";
                            else
                            echo "<td>No</td>";

                    if($des == 'Admin') {
                    echo " <td><a href='http://173.249.50.153/Offer_portal/index.php?id=$fetch[sno]' target='_blank'/><button onclick=\"return confirm('Are you sure want to edit?')\">Edit</button></a></td>";
                    // echo " <a href='http://173.249.50.153/Offer_portal/delete_offer.php?id=$fetch[sno]'/><button onclick=\"return confirm('Are you sure want to delete?')\">Delete</button></a></td>";
                    }
                    echo "  <td><input type='text' class='form-control' value='$fetch[sub_url]'/></td>
                            <td><input type='text'class='form-control' value='$fetch[unsub_url]'></td>
                            <td><input type='text' class='form-control' value='$fetch[open_url]'></td>
                            <td><input type='text' class='form-control' value='$fetch[opt_out_url]'></td>
                            <td><textarea class='form-control' style='width:100%;background: gainsboro;height: 120px;font-size: small;' >$fetch[from_name]</textarea></td>
                            <td><textarea class='form-control' style='width:100%;background: gainsboro;height: 120px;font-size: small;' >$fetch[subject]</textarea></td>
                            <td><textarea class='form-control' style='width:100%;background: gainsboro;height: 120px;font-size: small;' >$fetch[restrictions]</textarea></td>
                            <td><a href='create_link.php?id=$fetch[sno]' target='_blank'><button type='button' class='btn btn-success' style='margin-left: 40%;'>Create Link</button></a></td>    
                        </tr>";
                }
            ?>
            </tbody>
            </tfoot>
                <?php if($des == 'Admin') { ?>
                <tr><td colspan=8 style="width:100%;background: cadetblue"></td></tr>
                <?php } else { ?>
                <tr><td colspan=7 style="width:100%;background: cadetblue"></td></tr>
                <?php } ?>
            </tfoot>
        </table>
    </div>
</body>
</html>




