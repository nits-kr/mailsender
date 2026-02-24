<?php
error_reporting(0);
$screennamee = urldecode(trim($_REQUEST['screenname']));


if ($_REQUEST['action'] == 'delete') {
  $killscreeen  = `/usr/bin/sudo screen -XS $screennamee quit`;

  header("Location: imapscreen.php");
  exit;
}

if ($_REQUEST['action'] == 'stopprocess') {
  $killscreeen  = `/usr/bin/sudo screen -X -S $screennamee  stuff "^C" `;
  header("Location: imapscreen.php");
  exit;
}


if ($_REQUEST['action'] == 'log') {
  echo ' <html> <head>  <meta http-equiv="refresh" content="5"> <head> <body style="background:black;color:#10ff00;font-size:20px;margin:10px;padding-left:100px;padding-right:100px" ><center>';
  echo "<h1>" . $screennamee . "</h1><p align='left'><a style='background:white;padding:4px 12px;border-radius:4px;border:none;color:black;font-size:20px;font-weight:600;text-decoration: none;' href='imapscreen.php'>Go Back</a></p><hr><br><pre align='left'>";
  echo $log = `tac /var/www/html/advance_imap/$screennamee | head -100 | sed 's/final/<br>final/g'`;
  $logn = str_replace("\n", '<br>', $log);
  echo '<?pre></center><body></html>';
  exit;
}

?>

<html>
<title>SCREEN PORTAL </title>
<meta name="viewport" content="width=device-width, initial-scale=1">

<meta charset="utf-8">
<script type="text/javascript" language="javascript" src="https://code.jquery.com/jquery-3.5.1.js"></script>
<script type="text/javascript" language="javascript" src="https://cdn.datatables.net/1.10.24/js/jquery.dataTables.min.js"></script>
<script type="text/javascript" language="javascript" src="https://cdn.datatables.net/1.10.24/js/dataTables.bootstrap4.min.js"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.5.2/css/bootstrap.css" type="text/css" media="screen" title="default" />
<link rel="stylesheet" href="https://cdn.datatables.net/1.10.24/css/dataTables.bootstrap4.min.css" type="text/css" media="screen" title="default" />
<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js"></script>

<script src="http://code.jquery.com/ui/1.10.3/jquery-ui.js"></script>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">




<style>
  html,
  body {
    margin: 15px;
    height: 100%;
  }

  .mainbox {
    padding: 10px;
    height: auto;
    width: auto;
    margin-top: 1px;
    margin: -20px;

    text-align: center;
    -webkit-box-shadow: 3px 4px 23px -4px rgba(0, 0, 0, 0.48);
    -moz-box-shadow: 3px 4px 23px -4px rgba(0, 0, 0, 0.48);
    box-shadow: 3px 4px 23px -4px rgba(0, 0, 0, 0.48);
  }

  .tablediv {
    padding: 10px;
    height: auto;
    width: auto;
    margin-top: 5px;
    margin: 30px;
  }




  .btn {
    color: white;
    font-weight: bold;
    border: none;
    border-radius: 12px;
    color: white;
    padding: 5px 14px;
    font-size: 13px;
    cursor: pointer;
    margin: 5px;
  }

  .success {
    background-color: #4CAF50;
  }

  /* Green */
  .success:hover {
    background-color: #00cc00;
    color: white;
    font-weight: bold;
  }

  .info {
    background-color: #2196F3;
  }

  /* Blue */
  .info:hover {
    background: #0b7dda;
    color: white;
    font-weight: bold;
  }

  .warning {
    background-color: #ff9800;
  }

  /* Orange */
  .warning:hover {
    background: #e68a00;
    color: white;
    font-weight: bold;
  }

  .danger {
    background-color: #f44336;
  }

  /* Red */
  .danger:hover {
    background: #da190b;
    color: white;
    font-weight: bold;
  }

  .default {
    background-color: #e7e7e7;
    color: black;
  }

  /* Gray */
  .default:hover {
    background: #ddd;
    color: white;
    font-weight: bold;
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

  /* The Modal (background) */
  .modal {
    display: none;
    /* Hidden by default */
    position: fixed;
    /* Stay in place */
    z-index: 1;
    /* Sit on top */
    padding-top: 100px;
    /* Location of the box */
    left: 0;
    top: 0;
    width: 100%;
    /* Full width */
    height: 100%;
    /* Full height */
    overflow: auto;
    /* Enable scroll if needed */
    background-color: rgb(0, 0, 0);
    /* Fallback color */
    background-color: rgba(0, 0, 0, 0.4);
    /* Black w/ opacity */
  }

  /* Modal Content */
  .modal-content {
    background-color: #fefefe;
    margin: auto;
    padding: 20px;
    border: 1px solid #888;
    width: 80%;
  }

  /* The Close Button */
  .close {
    color: #aaaaaa;
    float: right;
    font-size: 28px;
    font-weight: bold;
  }

  .close:hover,
  .close:focus {
    color: #000;
    text-decoration: none;
    cursor: pointer;
  }

  h1 {
    color: #4D4D4D;
    font-size: 28px;
    font-weight: bold;
    font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
    font-style: italic;
    text-shadow: 4px 3px 3px #b0b0b0;
    text-align: center;
  }

  input[type=text],
  select,
  textarea {
    padding: 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    resize: vertical;
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
    color: white;
  }

  .table-bordered tbody td {
    font-weight: bold;
    text-align: center;
  }

  .table-bordered tfoot th {
    border: 1px solid #dee2e6;
    background-color: #60d6ff;
    text-align: center;
  }

  #form {
    -webkit-box-shadow: 6px 3px 80px 9px rgb(102 102 102 / 37%);
    -moz-box-shadow: 6px 3px 80px 9px rgba(102, 102, 102, 0.37);
    box-shadow: 6px 3px 80px 9px rgb(102 102 102 / 37%);
    margin: 25px;
    padding: 15px;
    height: 200px;
  }




  .resp-container {
    position: relative;

  }

  .resp-iframe {
    top: 0;
    left: 0;
    width: 100%;
    height: 500px;
    border: 0;
  }
</style>





<script>
  $(document).ready(function() {

    /*
     * Initialse DataTables, with no sorting on the 'details' column
     */
    var oTable = $('#log').dataTable({
      "aoColumnDefs": [{
        "bSortable": false,
        "aTargets": [0]
      }],
      "aaSorting": [
        [4, 'desc']
      ],
      "sScrollY": "800",
      "bScrollCollapse": true,
      "bPaginate": false,
      "bJQueryUI": true,
      "fnFooterCallback": function(nRow, aaData, iStart, iEnd, aiDisplay) {
        /*
         * Calculate the total market share for all browsers in this table (ie inc. outside
         * the pagination)
         */

        /* Calculate the market share for browsers on this page */
        var countR = 0;
        var countD = 0;
        var countF = 0;
        for (var i = iStart; i < iEnd; i++) {
          countR += aaData[aiDisplay[i]][4] * 1;
          countD += aaData[aiDisplay[i]][5] * 1;
          countF += aaData[aiDisplay[i]][6] * 1;

        }

        /* Modify the footer row to match what we want */
        var nCells = nRow.getElementsByTagName('th');
        nCells[2].innerHTML = countR;
        nCells[3].innerHTML = countD;
        nCells[4].innerHTML = countF;

      }



    });
  });
</script>
</head>

<body>
  <center>


    <br>
    <div class="mainbox ">


      <br><br>

      <h1> <b>SCREEN MANAGMENT</b> </h1>
      <br>
      <p align='right'><a onClick="window.location.reload();" target="frame"><i style="font-size:24px;cursor: pointer; margin-right:15px" class="fa">&#xf021;</i></a></p>
      <hr>
      <br>


      <details>
        <summary role="button" class="btn-primary" style="background:#42d838;border-radius:4px;height: auto;width: 250px;text-align: center;margin: 5px;padding: 5px;"><b>
            <font>CREATE NEW SCREEN</font>
          </b></summary>
        <div id='form' style='width:96%; height:100px; margin:25px; padding:25px'>


          <form action='' method='post'>
            <select name='newsname' id='newsname' style='width:350px;font-weight:bold;'>
              <?php
              include "include.php";
              $detail = mysql_query("SELECT * FROM  `admin`.`testids` where status ='A'");
              while ($details = mysql_fetch_array($detail)) {
                $sno =  $details['sno'];
                $email =  $details['email'];
                echo "<option value='" . $sno . "' selected>" . $email . "</option>";
              }
              ?>
            </select>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <input type='hidden' name='action' value='newscreencreate' required>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <input type='submit' name='submit' value='START' class="btn info" style="background:#;border:none;color:#fff;font-size:25px;font-weight:600" />
          </form>
          <hr>
        </div>
      </details>





      <?php


      if ($_REQUEST['action'] == 'newscreencreate') {


        $sno = trim($_REQUEST['newsname']);
        $detail = mysql_query("SELECT * FROM  `admin`.`testids` where sno = '" . $sno . "' ; ");
        $details = mysql_fetch_array($detail);


        $email =  $details['email'];
        $filenamedel =  $email . '.txt';

        $detail = mysql_query("truncate `imap_data_new`.`$email`;");
        `rm -rf /var/www/html/advance_imap/$filenamedel`;


        $sno =  $details['sno'];
        $domain =  $details['domain'];
        $filenameinbox =  $details['filenameinbox'];
        $filenamespam =  $details['filenamespam'];

        $inboxnamee = explode('.', $filenameinbox);
        $sinboxname  = $inboxnamee[0] . "_" . $sno;
        $inboxname  = $inboxnamee[0] . "_" . $sno . ".php";

        $spamnamee = explode('.', $filenamespam);
        $sspamname  = $spamnamee[0] . "_" . $sno;
        $spamname  = $spamnamee[0] . "_" . $sno . ".php";

        $sreendetailsno = `/usr/bin/sudo screen -ls | grep 'ached' | awk '{print \$1}' | awk -F '.' '{print \$2}'`;
        $allsreenname = explode("\n", $sreendetailsno);

        //  =======================================  inbox screen  =======================================

        $i = array_search($sinboxname, $allsreenname);
        $result = ($i !== false) ? $i : -1;

        // if ($result == '-1') {
        //   $ouput =  `/usr/bin/sudo screen -dmS $inboxname`;
        //   $cmdd  = "/usr/bin/sudo screen -S $inboxname -X stuff 'cd /var/www/html/advance_imap/ ;php /var/www/html/advance_imap/inbox.php $sno \n' | at now";
        //   $ouput .= `$cmdd`;
        //   $outresult = "<font color='green' ><b>Inbox script Created Successfully</b></font><br>";
        // } else {
        //   $outresult =  "<font color='red' ><b>Inbox script Name Already present</b></font><br>";
        // }
        if ($result == '-1') {
            // Display inbox screen commands
            echo "<div style='background:#f5f5f5; padding:10px; margin:10px; border:1px solid #ddd; border-radius:4px;'>";
            echo "<h4 style='color:#333;'>Commands for Inbox Screen:</h4>";
            echo "<pre style='background:#fff; padding:10px; border-radius:4px;'>";
            echo "/usr/bin/sudo screen -dmS $inboxname && ";
            echo '/usr/bin/sudo screen -S '.$inboxname.' -X stuff \'cd /var/www/html/advance_imap/ ;php /var/www/html/advance_imap/inbox.php '.$sno.'\n\'';
            echo "</pre></div>";
            $outresult = "<font color='green'><b>Above are the commands for Inbox script</b></font><br>";
        } else {
            $outresult = "<font color='red'><b>Inbox script Name Already present</b></font><br>";
        }

        // =======================================   spam screen  =======================================

        $s = array_search($sspamname, $allsreenname);
        $results = ($s !== false) ? $s : -1;

        // if ($results == '-1') {
        //   $ouputs =  `/usr/bin/sudo screen -dmS $spamname`;
        //   $cmdd  = "/usr/bin/sudo screen -S $spamname -X stuff 'cd /var/www/html/advance_imap/ ;php /var/www/html/advance_imap/spam.php $sno \n' | at now";
        //   $ouput .= `$cmdd`;
        //   echo $outresult .= "<font color='green' ><b>Spam script Created Successfully</b></font>";
        // } else {
        //   echo $outresult .=  "<font color='red' ><b>Spam script Name Already present</b></font>";
        // }
        if ($results == '-1') {
            // Display spam screen commands
            echo "<div style='background:#f5f5f5; padding:10px; margin:10px; border:1px solid #ddd; border-radius:4px;'>";
            echo "<h4 style='color:#333;'>Commands for Spam Screen:</h4>";
            echo "<pre style='background:#fff; padding:10px; border-radius:4px;'>";
            echo "/usr/bin/sudo screen -dmS $spamname &&";
            echo '/usr/bin/sudo screen -S '.$spamname.' -X stuff \'cd /var/www/html/advance_imap/ ;php /var/www/html/advance_imap/spam.php '.$sno.'\n\'';
            echo "</pre></div>";
            echo $outresult .= "<font color='green'><b>Above are the commands for Spam script</b></font>";
        } else {
            echo $outresult .= "<font color='red'><b>Spam script Name Already present</b></font>";
        }
      }
      ?>

      <table border='1' id="log" class="table table-striped table-bordered" style="width:100%">

        <thead>

          <tr>
            <th style='width:5%;'> Screen Id</th>
            <th style='width:10%;'> Screen Name </th>
            <th style='width:5%;'> CMD Id </th>
            <th style='width:35%;'> COMMAND </th>
            <th style='width:15%;'> DATAFILE NAME </th>
            <th style='width:5%;'> COUNT </th>
            <th style='width:30%;'> ACTION</th>
          </tr>
        </thead>
        <tbody>


          <?php

          if (trim($_SESSION['designation']) == 'Admin') {
            $sreendetailsno = `/usr/bin/sudo screen -ls | grep 'SPAM_..php\|INBOX_..php\|SPAM_...php\|INBOX_...php' | awk '{print \$1}' `;
          }

          $sreendetailsno = trim($sreendetailsno);
          if ($sreendetailsno != '') {

            $sreendetailsnoar = explode("\n", $sreendetailsno);

            foreach ($sreendetailsnoar as $sreendetailsnoarr) {

              $sreendetailsnoarr =  trim($sreendetailsnoarr);
              $sreendetailsnoarrr = explode('.', $sreendetailsnoarr);
              $no = $sreendetailsnoarrr[0];
              $name = $sreendetailsnoarrr[1];
              $uelname = urlencode(trim($name));

              $screenuse = explode('_', $name);
              $sno = end($screenuse);
              $ssno = "_" . $sno;
              $typescript = str_replace("$ssno", '', $name);
              $typescriptt = explode('_', $typescript);
              $typescripttt = end($typescriptt);

              $cmdno = `/usr/bin/sudo ps -el | grep "$no" | grep 'bash\|grep' | awk '{print \$4}'`;
              $cmdno = trim($cmdno);
              $sccmd = `/usr/bin/sudo ps -ef | grep "$cmdno" | grep -v 'bash\|grep' | awk -F ':' '{print ":"\$4}' | sed 's|:[0-9][0-9] ||g'`;
              $sccmd = trim($sccmd);
              if (!is_numeric($sno)) {
                $datafilename = 'NULL';
                $datacount = 'NULL';
              } else {
                $query = mysql_query("select * from `admin`.`testids` where sno ='$sno'");
                $row = mysql_fetch_array($query);

                $email  = $row['email'];
                $logfile = $email . ".txt";
                if ($typescripttt == 'INBOX') {
                  $query2 = mysql_query("select count(*) as count from `imap_data_new`.`$email` where status = 'INBOX';");
                } else {
                  $query2 = mysql_query("select count(*) as count from `imap_data_new`.`$email` where status = 'SPAM';");
                }
                $row2 = mysql_fetch_array($query2);
                $datacount = $row2['count'];



                $datafilename  = $email;
              }

              echo "<tr> <td> ";
              echo $no;


              if ($sccmd  == '') {
                echo " </td>  <td style='color:red' > ";
                echo $name . "<input type='hidden' name='screenname' value='" . $name . "' >";
              } else {
                echo " </td>  <td style='color:limegreen'> ";
                echo $name . "<input type='hidden' name='screenname' value='" . $name . "' >";
              }

              echo " </td>  <td> ";
              echo $cmdno;
              echo " </td>  <td> ";
              echo $sccmd;
              echo " </td>  <td> ";
              echo $datafilename;
              echo " </td>  <td> ";
              echo $datacount;
              echo " </td>  <td> 
                                       <a href='imapscreen.php?action=log&screenname=" . $logfile . "'  target='frame'  class='btn btn-info' style='cursor: pointer;' >LOG</a>  
                                       <a onclick=\"location.href='imapscreen.php?action=stopprocess&screenname=" . $uelname . "'\" class='btn btn-warning' style='color:white;cursor: pointer;' >STOP Process</a>  
                     <a onclick=\"location.href='imapscreen.php?action=delete&screenname=" . $uelname . "'\" class='btn btn-danger'  style='cursor: pointer;' >DELETE</a>                </td> </tr> <form>";
            }
          } else {
            echo '<tr> <td>  </td>  <td> </td> <td>  </td> <td>  </td> <td>  </td> </tr>';
          }

          ?>

        </tbody>
      </table>
      <br>
      <hr> <br>
      <div class="resp-container">
        <iframe class="resp-iframe" id="framee" name="frame" src="" gesture="media" allow="encrypted-media" allowfullscreen></iframe>
      </div>


      <br>
    </div>
  </center>


</body>

</html>