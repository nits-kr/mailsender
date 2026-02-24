<?php include "session.php";?>
<html>
<head>
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
    <script>
    $(document).ready(function() {
        /*
        * Initialse DataTables, with no sorting on the 'details' column
        */
        
        var oTable = $('#datafilecount').dataTable({
            "aoColumnDefs": [{"bSortable": false, "aTargets":[0]}],
            "aaSorting": [[0,'desc'], [1,'desc']],
            "sScrollY": "470",
            "bScrollCollapse": true,
            "bPaginate": false,
            "bJQueryUI": true,
            "fnFooterCallback": function ( nRow, aaData, iStart, iEnd, aiDisplay ) {
                var count = 0;
                for(var i = iStart; i < iEnd; i++) {  
                    count += parseInt(aaData[aiDisplay[i]][3].replace("<b>", "").replace("</b>", ""));
                } 
                var nCells = nRow.getElementsByTagName('th');
                nCells[1].innerHTML = parseInt(count);
        }
        });   
    });
    </script>
    <script>
        $(document).on('click', '.transfer-btn', function() {
            if (confirm('Are you sure you want to transfer this file?')) {
            var datafile = $(this).data('file');
            // Create popup HTML
            var popupHtml = `
                <div id="ip-popup" style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;">
                    <div style="background:#fff;padding:20px;border-radius:8px;min-width:300px;box-shadow:0 2px 10px rgba(0,0,0,0.2);">
                        <h5>Choose Sending IP Address</h5>
                        <select id="ip-select" class="form-control" style="margin-bottom:10px;">
                        <?php
                        $link = mysqli_connect('localhost', 'root', 'dvfersefag243435') or die('Could not connect: ' . mysqli_error($link));
                        mysqli_select_db($link, 	'admin') or die('Could not select database');
                        $sql = "SELECT `ip` FROM `admin`.`sending_ip_list`";
                        $result = mysqli_query($link, $sql);
                        while ($row = mysqli_fetch_assoc($result)) {
                            echo '<option value="' . htmlspecialchars($row['ip']) . '">' . htmlspecialchars($row['ip']) . '</option>';
                        }
                        mysqli_close($link);
                        ?>
                        </select>
                        <button id="ip-submit" class="btn btn-success" style="margin-right:10px;">Transfer</button>
                        <button id="ip-cancel" class="btn btn-secondary">Cancel</button>
                    </div>
                </div>
            `;
            $('body').append(popupHtml);

            $('#ip-submit').on('click', function() {
                var ip = $('#ip-select').val();
                transferData(ip, datafile, $('.transfer-btn[data-file="' + datafile + '"]'));
                $('#ip-popup').remove();
            });

            $('#ip-cancel').on('click', function() {
                $('#ip-popup').remove();
            });

            return; // Prevent default transfer logic below
            }
        });

        function transferData(ip, datafile, btn) {
            $.ajax({
            url: './data_analysis/transfer_data.php',
                type: 'POST',
                data: { ip: ip, filename: datafile },
                success: function(response) {
                    console.log('Transfer response: ' + response);
                    btn.prop('disabled', true).text('Transferred');
                },
                error: function() {
                    alert('Transfer failed.');
                }
            });
        }
        </script>

    <style>
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
        .table tfoot th {
            vertical-align: bottom;
            border-bottom: 2px solid #dee2e6;
            text-align: center;
            background-color: #60D6FF;
        }
        .header {
            /* padding: 60px; */
            text-align: center;
            background: #1abc9c;
            color: white;
            font-size: 30px;
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
    </style>
</head>
<body>
    <div id="mainbox" class="mainbox">
        <h1 class="header">Data File Panel </h1>
        <table id="datafilecount" class="table table-striped table-bordered" style="width:100%">
            <thead>
                <tr>
                    <th align="center">CREATED DATE</th>
                    <th align="center">CREATED TIME</th>
                    <th align="center">DATAFILE NAME</th>
                    <th align="center">CURRENT COUNT</th>
                    <th align="center">TRANSFER</th>
                </tr>
            </thead>
            <tbody>
                <?php
                    // $allrawData = `wc -l /var/www/data/* | awk '{print $2,$1}' | sed 's|/var/www/data/||g' | grep -v 'total'`;
                    // $allrawData = `find /var/www/data/ -iname "BULK_*" -atime -3 -type f`;
                    // $allrawData = `find /var/www/data/BULK_* -atime -100 -type f`;
                    $allrawData = `find /var/www/data/ -mtime -15 -type f`;
                    $allrawDataArray = explode("\n",trim($allrawData));
                    foreach($allrawDataArray as $singleFile) {
                        $datafile = str_replace("/var/www/data/","",$singleFile);
                        $count = `wc -l $singleFile | awk '{print $1}'`;
                        if($count == 0) {
                            continue;
                        }
                        $datetime = `ls -l $singleFile | awk '{print $6,$7,$8}'`;
                        $datatimeArray = explode(" ",$datetime);
                        $date = $datatimeArray[1]." ".$datatimeArray[0];
                        $timeIST = estToIstConvert($datatimeArray[2]);
                        echo "<tr>
                                <td align='center'><b>$date</b></font></td>
                                <td align='center'><b>$timeIST</b></font></td>
                                <td align='center'><b>$datafile</b></font></td>
                                <td align='center'><b>$count</b></font></td>
                                <td align='center'>
                                    <button class='btn btn-primary transfer-btn' data-file='". htmlspecialchars($datafile) ."'>Transfer</button>
                                </td>
                            </tr>";
                    }
                ?>
            </tbody>
            <tfoot>
                <tr>
                    <th colspan='3'>Total</th>
                    <th align="center"></th>
                </tr>
            </tfoot>
        </table>
    </div>
</body>
</html>

<?php
function estToIstConvert($estTime) {
    $date = new DateTime($estTime, new DateTimeZone('EST'));
    $date->setTimezone(new DateTimeZone('Asia/Kolkata'));
    return $date->format('H:i:s a');
}
