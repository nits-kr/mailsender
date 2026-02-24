<?php
error_reporting(0);
header("Access-Control-Allow-Origin: *");
date_default_timezone_set("EST");
include "/var/www/html/admin/include.php";
$mainip = $_SERVER['HTTP_HOST'];
session_start();
if($_SESSION['designation'] != 'Admin'){ exit(); }
$sid = $_SESSION['id'];
$susername = $_SESSION['email'];
$sfname = $_SESSION['name'];
$slname = $_SESSION['name'];
$spassword = $_SESSION['password'];

// Fetch Members and define constants
$members = [];

// Fetch members from the database
$query = "SELECT * FROM `login`.`users` WHERE `status` = '1'";
$result = mysql_query($query);
while ($row = mysql_fetch_assoc($result)) {
    $members[$row['id']] = $row['name'];
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <title>IP Hourly Report</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta charset="utf-8">
    <!-- Bootstrap & DataTables CSS -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.5.2/css/bootstrap.min.css"/>
    <link rel="stylesheet" href="https://cdn.datatables.net/1.10.24/css/dataTables.bootstrap4.min.css"/>
    <!-- Highcharts -->
    <script src="https://code.jquery.com/jquery-3.5.1.js"></script>
    <script src="https://cdn.datatables.net/1.10.24/js/jquery.dataTables.min.js"></script>
    <script src="https://cdn.datatables.net/1.10.24/js/dataTables.bootstrap4.min.js"></script>
    <script src="https://code.highcharts.com/highcharts.js"></script>
    <script src="https://code.highcharts.com/highcharts-3d.js"></script>
    <script src="https://code.highcharts.com/modules/exporting.js"></script>
    <script src="https://code.highcharts.com/modules/accessibility.js"></script>
    <style>
        body {
            transform: scale(0.80);
            transform-origin: top left; /* Adjust as needed */
            width: 125%; /* Compensate for scaling in width */
            background: #181c20;
            color: #f8f9fa;
            min-height: 100vh;
        }
        .main-header {
            background: #23272b;
            /* padding: 30px 0 15px 0; */
            margin-bottom: 30px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .main-header .container {
            max-width: 80%;         /* Make container fill the header */
            width: 100%;
            padding-left: 0;
            padding-right: 0;
        }
        .main-header .container .row > div {
            flex: 0 0 50%;
            max-width: 50%;
        }
        .main-header h1 {
            color: #fff;
            font-family: 'Segoe UI', Arial, sans-serif;
            font-weight: 700;
            letter-spacing: 2px;
            text-shadow: 2px 2px 8px #00000044;
        }
        .filter-bar {
            background: #23272b;
            padding: 20px 30px;
            border-radius: 8px;
            margin-bottom: 30px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.10);
        }
        .filter-bar label {
            color: #fff;
            font-weight: 500;
        }
        .highcharts-figure {
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.10);
            padding: 20px;
            margin-bottom: 30px;
        }
        .mainbox {
            background: #23272b;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.10);
            padding: 20px;
            margin-bottom: 30px;
        }
        .table thead th {
            background: #007bff;
            color: #fff;
            text-align: center;
        }
        .table tfoot th {
            background: #007bff;
            color: #fff;
            text-align: center;
        }
        .table-striped tbody tr:nth-of-type(odd) {
            background-color: #23272b;
        }
        .table-striped tbody tr:nth-of-type(even) {
            background-color: #181c20;
        }
        .btn-custom {
            background: #007bff;
            color: #fff;
            font-weight: 600;
            border-radius: 4px;
            padding: 6px 18px;
            border: none;
        }
        .btn-custom:hover {
            background: #0056b3;
        }
        #timestamp {
            color: #ffc107;
            font-weight: 500;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="main-header">
        <div class="container">
            <div class="row align-items-center mb-3">
                <!-- Left: Heading -->
                <div class="text-center text-md-left">
                    <h1 class="mb-0" style="font-size:2.2rem;">SENDING REPORT</h1>
                </div>
                <!-- Right: Date Selector -->
                <div class="text-center text-md-right">
                    <div class="filter-bar mb-0 d-inline-block">
                        <?php
                        $from_date = isset($_REQUEST['from_date']) ? $_REQUEST['from_date'] : date('Y-m-d');
                        $to_date = isset($_REQUEST['to_date']) ? $_REQUEST['to_date'] : date('Y-m-d');
                        ?>
                        <form class="form-inline justify-content-end" action="" method="post">
                            <label for="from_date" class="mr-2">From:</label>
                            <input type="date" id="from_date" name="from_date" class="form-control mr-3" value="<?php echo $from_date; ?>">
                            <label for="to_date" class="mr-2">To:</label>
                            <input type="date" id="to_date" name="to_date" class="form-control mr-3" value="<?php echo $to_date; ?>">
                            <button type="submit" class="btn btn-custom">Apply</button>
                        </form>
                        <div class="text-center mt-2">
                            <span class="badge badge-info" style="font-size:1.1em;">
                                <?php echo htmlspecialchars($from_date) . " to " . htmlspecialchars($to_date); ?>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="container-fluid">
        <div class="row">
            <!-- Left Side: Pie Chart -->
            <div class="col-lg-6 col-md-6 mb-4">
                <figure class="highcharts-figure">
                    <div id="pie-container" style="height: 400px;"></div>
                </figure>
            </div>
            <!-- Right Side: Cylinder Chart -->
            <div class="col-lg-6 col-md-6 mb-4">
                <figure class="highcharts-figure">
                    <div id="cylinder-container" style="height: 400px;"></div>
                </figure>
            </div>
        </div>
        <!-- Table Below -->
        <div class="row">
            <div class="col-12">
                <div class="mainbox">
                    <div class="table-responsive">
                <table id="log" class="table table-striped table-bordered table-dark text-center" style="width:100%">
                    <thead>
                        <tr>
                            <th class="text-center">SENT ON</th>
                            <th class="text-center">MAILER</th>
                            <th class="text-center">TEMPLATE ID</th>
                            <th class="text-center">INTERFACE</th>
                            <th class="text-center">SERVER</th>
                            <th class="text-center">OFFER ID</th>
                            <th class="text-center">DOMAIN</th>
                            <th class="text-center">FROM</th>
                            <th class="text-center">TEST SENT</th>
                            <th class="text-center">BULK TEST SENT</th>
                            <th class="text-center">BULK TEST</th>
                            <th class="text-center">ERROR</th>
                        </tr>
                    </thead>
                    <tbody>
                    <?php
                    $query = "SELECT 
                              a.`mailer`,
                              a.`template_id`,
                              a.`interface`,
                              b.`server`,
                              a.`offer_id`,
                              a.`domain`,
                              a.`from`,
                              DATE(`created_at`) AS `created_at`,
                              SUM(CASE WHEN `mode` = 'test' THEN `sent` ELSE 0 END) AS `Test_Sent`,
                              SUM(CASE WHEN `mode` = 'Bulk Test' THEN `sent` ELSE 0 END) AS `Bulk_Test_Sent`,
                              SUM(CASE WHEN `mode` = 'Bulk' THEN `sent` ELSE 0 END) AS `Bulk_Sent`,
                              SUM(`error`) AS `Error`
                              FROM `report`.`sending_stats` AS a, `svml`.`mumara` AS b
                              WHERE a.`smtp` = b.`assignedip` AND
                              DATE(a.`created_at`) BETWEEN '$from_date' AND '$to_date'
                              GROUP BY a.`mailer`, a.`template_id`, a.`interface`, b.`server`, a.`offer_id`, a.`domain`, a.`from`";
                    $result = mysql_query($query) or die('Query failed: ' . mysql_error());
                    if ($result && mysql_num_rows($result) > 0) {
                        while ($row = mysql_fetch_assoc($result)) {
                            echo '<tr class="text-center">';
                            echo '<td>' . htmlspecialchars($row['created_at']) . '</td>';
                            echo '<td>' . htmlspecialchars($members[$row['mailer']]) . '</td>';
                            echo '<td>' . htmlspecialchars($row['template_id']) . '</td>';
                            echo '<td>' . htmlspecialchars($row['interface']) . '</td>';
                            echo '<td>' . htmlspecialchars($row['server']) . '</td>';
                            echo '<td>' . htmlspecialchars($row['offer_id']) . '</td>';
                            echo '<td>' . htmlspecialchars($row['domain']) . '</td>';
                            echo '<td>' . htmlspecialchars($row['from']) . '</td>';
                            echo '<td>' . htmlspecialchars($row['Test_Sent']) . '</td>';
                            echo '<td>' . htmlspecialchars($row['Bulk_Test_Sent']) . '</td>';
                            echo '<td>' . htmlspecialchars($row['Bulk_Sent']) . '</td>';
                            echo '<td>' . htmlspecialchars($row['Error']) . '</td>';
                            echo '</tr>';
                        }
                    } else {
                        echo '<tr class="text-center"><td colspan="12">No records found for this date.</td></tr>';
                    }
                    ?>
                    </tbody>
                    <tfoot>
                        <tr>
                            <th class="text-right" colspan="8">Totals:</th>
                            <th class="text-center"></th>
                            <th class="text-center"></th>
                            <th class="text-center"></th>
                            <th class="text-center"></th>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    </div>

    <!-- Scripts -->
    <script>
        $(document).ready(function() {
            var oTable = $('#log').DataTable({
                "order": [[10, 'desc']],
                "scrollY": "500px",
                "scrollCollapse": true,
                "paging": false,
                "info": false,
                "autoWidth": false,
                "footerCallback": function ( row, data, start, end, display ) {
                    var api = this.api();

                    // Helper to parse numbers
                    var intVal = function ( i ) {
                        return typeof i === 'string' ?
                            i.replace(/[\$,]/g, '')*1 :
                            typeof i === 'number' ?
                                i : 0;
                    };

                    // Calculate totals for each column
                    var totalTestSent = 0, totalBulkTestSent = 0, totalBulkSent = 0, totalError = 0;
                    api.rows({search: 'applied'}).every(function() {
                        var d = this.data();
                        totalTestSent += intVal(d[8]);
                        totalBulkTestSent += intVal(d[9]);
                        totalBulkSent += intVal(d[10]);
                        totalError += intVal(d[11]);
                    });

                    // Update footer
                    $(api.column(8).footer()).html(totalTestSent);
                    $(api.column(9).footer()).html(totalBulkTestSent);
                    $(api.column(10).footer()).html(totalBulkSent);
                    $(api.column(11).footer()).html(totalError);
                }
            });
        });
    </script>
    <script type="text/javascript">
    <?php
    // Fetch SMTP and Bulk Sent count for the selected date range
    $smtp_query = "
        SELECT `smtp`, SUM(CASE WHEN `mode` = 'Bulk' THEN `sent` ELSE 0 END) AS `Bulk_Sent`
        FROM `report`.`sending_stats`
        WHERE DATE(`created_at`) BETWEEN '$from_date' AND '$to_date'
        GROUP BY `smtp`
    ";
    $smtp_result = mysql_query($smtp_query);
    $smtp_data = [];
    if ($smtp_result && mysql_num_rows($smtp_result) > 0) {
        while ($row = mysql_fetch_assoc($smtp_result)) {
            $smtp = $row['smtp'] ? $row['smtp'] : 'Unknown';
            $smtp_data[] = [
                'name' => addslashes($smtp),
                'y' => (int)$row['Bulk_Sent']
            ];
        }
    }
    // $smtp_data = [
    //     ['name' => 'SMTP1', 'y' => 1200],
    //     ['name' => 'SMTP2', 'y' => 950],
    //     ['name' => 'SMTP3', 'y' => 700],
    //     ['name' => 'SMTP4', 'y' => 450],
    //     ['name' => 'SMTP5', 'y' => 300]
    // ];
    ?>
    Highcharts.chart('pie-container', {
        chart: {
            type: 'pie',
            backgroundColor: '#fff',
            options3d: {
                enabled: true,
                alpha: 45,
                beta: 0
            }
        },
        title: {
            text: 'Bulk Sent Analysis by SMTP'
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.y}</b>'
        },
        subtitle: {
            text: 'Showing total Bulk Sent count per SMTP'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                depth: 45,
                dataLabels: {
                    enabled: true,
                    format: '{point.name}: {point.y}'
                }
            }
        },
        series: [{
            name: 'Bulk Sent',
            colorByPoint: true,
            data: <?php echo json_encode($smtp_data); ?>
        }]
    });

    <?php
// Prepare data for cylinder chart (SMTP vs Bulk Sent)
$cylinder_data = [];
if ($smtp_result && mysql_num_rows($smtp_result) > 0) {
    mysql_data_seek($smtp_result, 0); // reset pointer
    while ($row = mysql_fetch_assoc($smtp_result)) {
        $smtp = $row['smtp'] ? $row['smtp'] : 'Unknown';
        $cylinder_data[] = [addslashes($smtp), (int)$row['Bulk_Sent']];
    }
}
// $cylinder_data = [
//         ['name' => 'SMTP1', 'y' => 1200],
//         ['name' => 'SMTP2', 'y' => 950],
//         ['name' => 'SMTP3', 'y' => 700],
//         ['name' => 'SMTP4', 'y' => 450],
//         ['name' => 'SMTP5', 'y' => 300]
//     ];
?>
Highcharts.chart('cylinder-container', {
    chart: {
        type: 'column',
        backgroundColor: '#fff',
        options3d: {
            enabled: true,
            alpha: 15,
            beta: 15,
            depth: 50,
            viewDistance: 25
        }
    },
    title: {
        text: 'Bulk Sent by SMTP (Cylinder)'
    },
    xAxis: {
        type: 'category',
        title: { text: 'SMTP' }
    },
    yAxis: {
        title: { text: 'Bulk Sent' }
    },
    plotOptions: {
        column: {
            depth: 40
        }
    },
    series: [{
        name: 'Bulk Sent',
        data: <?php echo json_encode($cylinder_data); ?>
    }]
});
    </script>
</body>
</html>