<?php
error_reporting(0);
header("Access-Control-Allow-Origin: *");
date_default_timezone_set("EST");
// print_r($_REQUEST);
session_start();

if (!isset($_SESSION['username'])) // If session is not set then redirect to Login Page
{
    header("Location:admin/login.php?action=session+logged+out");
    die();
}

$sid = trim($_SESSION['id']);
$username = trim($_SESSION['username']);

$link = mysql_connect('localhost', 'root', 'dvfersefag243435') or die('Could not connect: ' . mysql_error());
mysql_select_db('svml') or die('Could not select database');

$screennamee = urldecode(trim($_REQUEST[screenname]));

if ($_REQUEST[action] == 'delete') {
    $killscreeen  = `/usr/bin/sudo screen -XS $screennamee quit`;
    header("Location: screen.php");
    exit;
}

if ($_REQUEST[action] == 'stopprocess') {
    $killscreeen  = `/usr/bin/sudo screen -X -S $screennamee  stuff "^C" `;
    header("Location: screen.php");
    exit;
}

if ($_REQUEST[action] == 'log') {
    echo ' <html> <head>  <meta http-equiv="refresh" content="5"> <head> <body style="background:black;color:#10ff00;font-size:20px;margin:10px;padding-left:100px;padding-right:100px" ><center>';
    echo "<h1>" . $screennamee . "</h1><p align='left'><a style='background:white;padding:4px 12px;border-radius:4px;border:none;color:black;font-size:20px;font-weight:600;text-decoration: none;' href='screen.php'>Go Back</a></p><hr><br><pre align='left'>";
    echo $log = `tac /var/www/html/screenout/$screennamee | sed 's/final/<br>final/g'`;
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


  .blinking {

    animation: opacity 0.5s ease-in-out infinite;
    opacity: 1;
  }

  @keyframes opacity {
    0% {
      opacity: 4;
    }

    50% {
      opacity: 2;
    }

    100% {
      opacity: 0;
    }
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




  setTimeout(function() {
    $('#mydiv').fadeOut('fast');
  }, 4000); // <-- time in milliseconds
</script>
</head>
<body>
  <center>
    <br>
    <div class="mainbox ">
      <br><br>
      <h1> <b>SCREEN MANAGMENT</b> </h1>
      <br>
      <div style='text-align: center;' id="mydiv">
        <font color='red' sizew='3' class='blinking'><b> Delete Screen if not using...</b></font>
      </div>
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

            <input type='text' name='newsname' placeholder='Screen Name' value='<?php echo $newsname; ?>' required> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <select name='interfacename' id='interfacename' style='width:350px;font-weight:bold;'>
              <option value='/var/www/html/interface/send_mul_phpm_new.php' selected>INTERFACE</option>
              <option value='/var/www/html/interface_new/php_mailer_auto_send_v2.php'>INTERFACE AUTO TESTER</option>
              <option value='/var/www/html/ESP_Module_fsock_send_smtp_auto/auto_send.php'>SMTP AUTO TESTER</option>
            </select>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <input type='text' name='screencmdrun' placeholder='Put svml id' style='width:350px' value='<?php echo $screencmdrun; ?>' required>
            <input type='hidden' name='action' value='newscreencreate' required>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <input type='submit' name='submit' value='START' class="btn info" style="background:#;border:none;color:#fff;font-size:25px;font-weight:600" />

          </form>
          <hr>
        </div>
      </details>





      <?php
      if ($_REQUEST['action'] == 'newscreencreate') {
          $newsnamee = trim($_REQUEST['newsname']);
          $newsnameew = str_replace('_', '', $newsnamee);
          $newsnameew = str_replace('-', '', $newsnameew);
          $newsnameew = str_replace('.', '', $newsnameew);
          $newsnameew = str_replace(',', '', $newsnameew);
          $newsnameew = str_replace('"', '', $newsnameew);
          $newsnameew = str_replace('spam', '', $newsnameew);
          $newsnameew = str_replace('inbox', '', $newsnameew);
          $screencmdrun = trim($_REQUEST['screencmdrun']);
          $newsname = $sid . "-" . $screencmdrun . "_" . $newsnameew;

          $screenpath = trim($_REQUEST['interfacename']);

          $sreendetailsno = `/usr/bin/sudo screen -ls | grep 'ached' | awk '{print \$1}' | awk -F '.' '{print \$2}'`;
          $allsreenname = explode("\n", $sreendetailsno);

          $i = array_search($newsname, $allsreenname);
          $result = ($i !== false) ? $i : -1;
          if ($result == '-1') {
              $checkScreeninFile = `grep "dmS $newsname &" /var/www/html/screenout/auto_screen_cron.txt  | wc -l`;
              if ($checkScreeninFile > 0) {
                  echo $outresult =  "<font color='red' ><b>Screen Name Already present in Queue</b></font>";
                  exit;
              }
              $cmd  = NULL;
              $cmd = "/usr/bin/sudo screen -dmS $newsname && ";
              $cmd .='/usr/bin/sudo screen -S '.$newsname.' -X stuff \'php '.$screenpath.' '.$screencmdrun.' >> /var/www/html/screenout/'.$newsname.'\n\';';
              file_put_contents(__DIR__ . "/screenout/auto_screen_cron.txt", "$cmd\n", FILE_APPEND);
              mysql_query("INSERT INTO `svml`.`screenmapper` (`svml_id`, `interface`, `screen_name`, `mailer`,`ip`) VALUES ('$screencmdrun', '$screenpath', '$newsnameew', '$username','$_SERVER[HTTP_HOST]')");
              echo $outresult = "<font color='green'><b>Screen script $newsname is Scheduled</b></font><br>";
          } else {
              echo $outresult =  "<font color='red' ><b>Screen Name Already Exist</b></font>";
          }
      }
      ?>


      <table border='1' id="log" class="table table-striped table-bordered" style="width:100%">
        <thead>
          <tr>
            <th style='width:8%;'> Screen Id</th>
            <th style='width:18%;'> Screen Name </th>
            <th style='width:8%;'> Temp ID </th>
            <th style='width:12%;'> MAILER </th>
            <th style='width:22%;'> DATAFILE NAME </th>
            <th style='width:7%;'> COUNT </th>
            <th style='width:25%;'> ACTION</th>
          </tr>
        </thead>
        <tbody>
          <?php
          if (trim($_SESSION['designation']) == 'Admin') {
              $sreendetailsno = `/usr/bin/sudo screen -ls | grep 'ached' | grep -v 'inbox\|spam\|INBOX_..php\|SPAM_..php\|INBOX_...php\|SPAM_...php' | awk '{print \$1}' `;
          } else {
              $nnn = $sid . '-';
              $sreendetailsno = `/usr/bin/sudo screen -ls | grep 'ached' | grep -v 'inbox\|spam\|INBOX_..php\|SPAM_..php\|INBOX_...php\|SPAM_...php' | awk '{print \$1}' |  grep ".$nnn"  `;
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
                  $screenuse = explode('-', $name);
                  $screenuser = trim($screenuse[0]);
                  $snoa = explode('_', $name);
                  $screenName = $snoa[1];
                  $sno = explode('-', $snoa[0]);
                  $snoo = trim($sno[1]);
                  $cmdno = `/usr/bin/sudo ps -el | grep "$no" | grep 'bash\|grep' | awk '{print \$4}'`;
                  $cmdno = trim($cmdno);
                  $sccmd = `/usr/bin/sudo ps -ef | grep "$cmdno" | grep -v 'bash\|grep'`;
                  $sccmd = trim($sccmd);
                  if (!is_numeric($snoo)) {
                      $datafilename = 'NULL';
                      $datacount = 'NULL';
                  } else {
                      $q = "SELECT 
                            a.*,
                            b.`name` as `mailer`
                            FROM 
                            `svml`.`screenmapper` a, 
                            `login`.`users` b 
                            WHERE 
                            a.`mailer`=b.`email` AND
                            a.`svml_id`='$snoo'";
                      $getScreenDetails = mysql_fetch_array(mysql_query($q), MYSQL_ASSOC);
                      $tempmailer = $getScreenDetails['mailer'];
                      $templateId = $getScreenDetails['svml_id'];
                      list($datafilename, $datacount) = provideDataAndCount($templateId,$getScreenDetails['interface']);
                  }
                  echo "<tr> <td> ";
                  echo $no;
                  $color = ($sccmd == '') ? 'red' : 'limegreen';
                  echo " </td>  <td style='color:$color'> ";
                  echo trim($screenName) . "<input type='hidden' name='screenname' value='" . htmlspecialchars($name, ENT_QUOTES) . "' >";
                  echo " </td>  <td> ";
                  echo $templateId;
                  echo " </td>  <td> ";
                  echo $tempmailer;
                  echo " </td>  <td> ";
                  echo $datafilename;
                  echo " </td>  <td> ";
                  echo $datacount;
                  echo " </td> <td> 
                      <a href='admin/template.php?sno=" . $snoo . "' target='frame'  class='btn btn-info' style='cursor: pointer;background-color: slateblue;' >DETAILS</a>
                      <a href='screen.php?action=log&screenname=" . $uelname . "'  target='frame'  class='btn btn-info' style='cursor: pointer;' >LOG</a>  
                      <a onclick=\"location.href='screen.php?action=stopprocess&screenname=" . $uelname . "'\" class='btn btn-warning' style='color:white;cursor: pointer;' >STOP Process</a>  
                      <a onclick=\"location.href='screen.php?action=delete&screenname=" . $uelname . "'\" class='btn btn-danger'  style='cursor: pointer;' >DELETE</a> </td> </tr> <form>";
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
<?php

function provideDataAndCount($svml,$interface)
{
  global $link;
  $map = [
    '/var/www/html/interface/send_mul_phpm_new.php' => 'svml_sendgrid',
    '/var/www/html/interface_new/php_mailer_auto_send_v2.php' => 'svml_sendgrid',
    '/var/www/html/ESP_Module_fsock_send_smtp_auto/auto_send.php' => 'ESP_admin_data',
  ];

  if (array_key_exists($interface, $map)) {
    $table = $map[$interface];
  } else {
    return ['NULL', 'NULL'];
  }

  $sno = ($table == 'svml_sendgrid') ? 'sno' : 'entity_id';
  $query = mysql_query("SELECT * FROM `svml`.`$table` WHERE `$sno` = '$svml'");
  if (!$query) {
    return ['NULL', 'NULL'];
  }

  $rawData = mysql_fetch_array($query);
  if (!$rawData) {
    return ['NULL', 'NULL'];
  }

  if ($table == 'svml_sendgrid') {
    $datafilename = $rawData['data'];
    $datacount = count(file("/var/www/data/" . $datafilename)) - 1;
  } else {
    $decode = json_decode(base64_decode($rawData['body']), true);
    $datafilename = basename($decode['dataFile']);
    $datacount = count(file("/var/www/data/" . $datafilename)) - 1;
  }
  if ($datacount < 0) {
      $datacount = "Deleted";
  }
  return [$datafilename, $datacount];
}

mysql_close($link);