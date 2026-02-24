<?php
include "include.php";
mysql_select_db("imap_data_new");
$email = $_REQUEST['email'];

?>


<html>

<head>
    <title> Imap Log </title>


    <stylv="refresh" content="30">
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



        <style>
            .table {
                width: 90%;
                margin-bottom: 1rem;
                color: #212529;
                font-size: 10px;
            }

            table.dataTable.display tbody td {
                font-weight: bold;
            }

            table.dataTable.display thead th {
                font-weight: bold;
                font-size: large;
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
                text-align: center;
            }

            .table th,
            .table td {
                padding: 0.3rem;
                vertical-align: top;
                border-top: 1px solid #dee2e6;
            }



            .table tbody td {
                text-align: center;
                font-weight: bold;
                table-layout: fixed;
                overflow: hidden;
                word-wrap: break-word;
            }


            .mainbox {
                padding: 10px;
                width: 95%;
                margin-top: 5px;
                margin: 30px;
                -webkit-box-shadow: 2px 4px 7px 1px rgba(0, 0, 0, 0.48);
                -moz-box-shadow: 2px 4px 7px 1px rgba(0, 0, 0, 0.48);
                box-shadow: 2px 4px 7px 1px rgba(0, 0, 0, 0.48);
            }

            .select2-container,
            .select2-drop {
                -webkit-box-sizing: border-box;
                -moz-box-sizing: border-box;
                box-sizing: border-box;
                width: 400px;
            }

            .select2-search,
            .select2-search input {
                width: 350px;
                font-size: 18px;
            }


            .select2-results .select2-result-label {
                padding: 3px 7px 4px;
                margin: 0;
                cursor: pointer;
                min-height: 1em;
                -webkit-touch-callout: none;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
                font-size: initial;
            }

            select {
                word-wrap: normal;
                height: 30px;
                font-size: 20px;
            }


            .btn {
                border: none;
                border-radius: 12px;
                color: white;
                padding: 5px 14px;
                font-size: 15px;
                cursor: pointer;
                height: 30px;
            }


            .success {
                background-color: #4CAF50;
            }

            /* Green */
            .success:hover {
                background-color: #00cc00;
                color: white;
            }

            .info {
                background-color: #2196F3;
            }

            /* Blue */
            .info:hover {
                background: #0b7dda;
            }

            .warning {
                background-color: #ff9800;
            }

            /* Orange */
            .warning:hover {
                background: #e68a00;
            }

            .danger {
                background-color: #f44336;
            }

            /* Red */
            .danger:hover {
                background: #da190b;
                color: white;
            }

            .default {
                background-color: #e7e7e7;
                color: black;
            }

            /* Gray */
            .default:hover {
                background: #ddd;
            }


            .fonter {
                font-size: 20px;
                font-weight: bold;
            }

            .red {
                color: #EB0B00;
            }

            /* red */
            .green {
                color: #00E114;
            }

            /* green */
            .orange {
                color: #FF770C;
            }

            /* orange */
            .blue {
                color: #194EFF;
            }

            /* blue */





            /* Overwrite default styles of hr */
            hr {
                border: 1px solid #f1f1f1;
                margin-bottom: 25px;
            }
        </style>




        <script>
            $(document).ready(function() {
                /*
                 * Initialse DataTables, with no sorting on the 'details' column
                 */
                var oTable = $('#example').dataTable({
                    "order": [
                        [0, "desc"]
                    ],
                    "aoColumnDefs": [{
                        "bSortable": false,
                        "aTargets": [0]
                    }],
                    "sScrollY": "600",
                    "bScrollCollapse": true,
                    "bPaginate": false,
                    "bJQueryUI": true
                });
            });
        </script>




        <script>
            $(document).ready(function() {
                $("#server").select2();

            });
        </script>



</head>

<body>
    <center>
    </center>
    <div id="mainbox" class="mainbox">
        <div>
            <center>
                <h3> IMAP MAILBOX </h3>
            </center>
        </div>
        <hr>
        <div align='center'>

            <table border=0>
                <form name="id" method="post" action="">
                    <tr>
                        <td> <br>
                            <select name='email' id='email' style="width: 500px;" required>
                                <?php
                                $detail = mysql_query("show tables;");
                                while ($details = mysql_fetch_array($detail)) {
                                    $seledctoprion .=  '<option value="' . $details[0] . '"> ' . $details[0] . ' </option>';
                                }
                                $find = 'value="' . $email . '">';
                                $replace = 'value="' . $email . '" selected>';
                                echo  str_replace($find, $replace, $seledctoprion);
                                ?>
                            </select>
                            <br>
                        </td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td align='center'> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <br> <input class='btn info' type="Submit" Value="Fetch" /></td>
                    </tr>
            </table>
        </div>
        <br>
        <hr>
        <div>
            <center>
                <h3 style='color:green'> <?php echo $email; ?></h3>
            </center>
        </div>



        <table cellpadding="0" cellspacing="0" border="1" class="table table-striped table-bordered" id="example" width='100%'>
            <thead>
                <tr>
                    <th style='width:3%'> Sno </th>
                    <th style='width:10%'> Time </th>
                    <th style='width:10%'> SUBJECT </th>
                    <th style='width:10%'> FROM </th>
                    <th style='width:10%'> To </th>
                    <th style='width:5%'> STATUS </th>
                    <th style='width:5%'> IP </th>
                    <!-- <th style='width:5%'> DATE </th> -->
                    <th style='width:10%'> MESSAGE ID </th>
                </tr>
            </thead>

            <?php

            if ($email != '') {

                $detail = mysql_query("select * from `imap_data_new`.`$email` order by sno desc limit 1000;");

                while ($details = mysql_fetch_array($detail)) {
                    $sno = $details['sno'];
                    $subject = base64_decode($details['subject']);
                    $from = base64_decode($details['from']);
                    $to = base64_decode($details['to']);
                    // $date = $details['date'];
                    $message = $details['message_id'];
                    $message = str_replace('<', '', $message);
                    $message = str_replace('>', '', $message);
                    $ip = $details['ip'];
                    $status = $details['status'];

                    if ($status == 'INBOX') {
                        $statuss = "<td style='color:green' > INBOX </td>";
                    } else {
                        $statuss = "<td style='color:red' > SPAM </td>";
                    }

                    $last_update_time = $details['last_update_time'];

                    echo '<tr>';
                    echo "<td> " . $sno . "</td>";
                    echo "<td> " . $last_update_time . "</td>";
                    echo "<td> " . $subject . "</td>";
                    echo "<td> " . $from . "</td>";
                    echo "<td> " . $to . "</td>";
                    echo $statuss;
                    echo "<td> " . $ip . "</td>";
                    //    echo "<td> ". $date."</td>";
                    echo "<td> " . $message . "</td>";
                    echo '</tr>';
                }
            }


            ?>

            </tbody>
        </table>
    </div>
</body>

</html>