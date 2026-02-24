<?php
include "../include.php";
?>
<html>
<head>
<title></title>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script type="text/javascript" language="javascript" src="js/jquery.js"></script>
<script type="text/javascript" language="javascript" src="js/jquery.dataTables.js"></script>
<script type="text/javascript" language="javascript" src="js/jquery.ui.datepicker.js"></script>
<script type="text/javascript" language="javascript" src="js/jquery.ui.widget.js"></script>
<link rel="stylesheet" href="css/screen.css" type="text/css" media="screen" title="default" />
<link rel="stylesheet" href="css/demo_page.css" type="text/css" media="screen" title="default" />
<link rel="stylesheet" href="css/demo_table_jui.css" type="text/css" media="screen" title="default" />
<link rel="stylesheet" href="css/jquery-ui-1.8.4.custom.css" type="text/css" media="screen" title="default" />
<script src="http://code.jquery.com/ui/1.10.3/jquery-ui.js"></script>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

<script type="text/javascript">
    function get_sts(server)
    {
        $('#iframeHolder').html('karan');
        var link = '<iframe id="iframe" src="get_status.php?id='+server+'" style=" width: 100%; height: 200%; border: 1px black solid;" ></iframe>';
        if(!$('#iframe').length) 
        {   
            $('#iframeHolder').html(link);
        }          
    }
</script>	

<script>
    $(document).ready(function()
    {
        $("#fdate").datepicker
        ({
            changeMonth: true,
            changeYear: true,
            dateFormat: 'yy-mm-dd',
            numberOfMonths: 1,
            minDate: '-2D',
            maxDate: '+0D'
        });
    });

    $(document).ready(function() {
        /*
        * Initialse DataTables, with no sorting on the 'details' column
        */
        var oTable = $('#example').dataTable
        ({
            "aoColumnDefs": 
            [
                { "bSortable": false, "aTargets": [ 0 ] }
            ],
            "aaSorting": [[0, 'asc']],
            "sScrollY": "300",
            "bScrollCollapse": true,
            "bPaginate": false,
            "bJQueryUI": true,
            "fnFooterCallback": function ( nRow, aaData, iStart, iEnd, aiDisplay ) 
            {
                /*
                * Calculate the total market share for all browsers in this table (ie inc. outside
                * the pagination)
                */

                /* Calculate the market share for browsers on this page */
                // var countR = 0;
                // var countD = 0;
                // var countF = 0;
                // for ( var i=iStart ; i<iEnd ; i++ )
                // {
                //     countR += aaData[ aiDisplay[i] ][2]*1;
                //     countD += aaData[ aiDisplay[i] ][3]*1;
                //     countF += aaData[ aiDisplay[i] ][4]*1;

                // }

                /* Modify the footer row to match what we want */
                    // var nCells = nRow.getElementsByTagName('th');
                    // nCells[1].innerHTML = countR ;
                    // nCells[2].innerHTML = countD ;
                    // nCells[3].innerHTML = countF ;
            }
                            

            
        });    
    });

</script>
<style>
 hr 
    {
        border-top: 2px solid green; margin-top:10px;
        width:100%;
    }
</style>
</head>

<body>
 <h1><u>NOTIFICATION TABLE</u></h1> 
 <hr>
 <br>
 <table width = "100%">
     <tr>
         <td>
            <table  cellpadding="0" cellspacing="0" border="0" class="display" id="example">
                <thead>
                    <tr>
                        <th>TEMPLATE ID</th>
                        <th>FROM EMIALS</th>
                        <th>SUBJECT</th>
                        <th>OFFER ID</th>
                        <th>IP's</th>
                        <th>DATAFILE</th>
                        <th>DATAFILE COUNT</th>
                        <th>WAIT TIME</th>
                        <th>SLEEP TIME</th>
                        <th>LIMIT TO SEND</th>
                        <th>TOTAL LIMIT</th>
                        <th>VIEW</th> 
                        
                    </tr>
                </thead>
                <tbody>
                    <?php
                        $q = mysql_query("select svml_ip_pool.svml_sendgrid_id,svml_sendgrid.ip,svml_sendgrid.subject,svml_sendgrid.offer,svml_sendgrid.mutidomains,svml_sendgrid.data,svml_sendgrid.sleep,svml_sendgrid.sleep_time,svml_sendgrid.limit_to_send,svml_sendgrid.limits from svml.svml_ip_pool,svml.svml_sendgrid where svml_ip_pool.svml_sendgrid_id = svml_sendgrid.sno group by svml_ip_pool.svml_sendgrid_id;");
                        while($fetch = mysql_fetch_array($q))
                        {
                            // print_r($fetch);
                            echo "<tr>
                                <td>".trim($fetch[0])."</td>
                                <td>".trim($fetch[1])."</td>
                                <td>".trim($fetch[2])."</td>
                                <td>".trim($fetch[3])."</td>
                                <td>".trim(str_replace("\n"," , ",$fetch[4]))."</td>
                                <td>".trim($fetch[5])."</td>
                                <td>count</td>
                                <td>".trim($fetch[6])."</td>
                                <td>".trim($fetch[7])."</td>
                                <td>".trim($fetch[8])."</td>
                                <td>".trim($fetch[9])."</td>
                                <td><button style='width: 60px;' onclick= get_sts('".trim($fetch[0])."')>View</button></a></td>
                                </tr>";
                        }
                    ?>
                </tbody>
                <tfoot>
                    <tr>
                        <th colspan = 12></th>
                    </tr>
                </tfoot>
            </table>
        </td>
    </tr>
    </tr>               
        <td>
            <div id="iframeHolder" >
        </td>
     <tr>
</table>