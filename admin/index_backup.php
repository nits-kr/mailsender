<?php
session_start();
if(!isset($_SESSION['username'])) // If session is not set then redirect to Login Page
 {
    header("Location:../admin/login.php?action=session+logged+out");  
    die();
 } else {
      $cred=file_get_contents("http://173.249.50.153/admin/autheticate.php?username=".base64_encode($_SESSION['username'])."&password=".base64_encode($_SESSION['password']));
      if(strstr($cred,"|||||"))
      {
        session_destroy();
        header("location:login.php?action=Invalid+Details");
        exit();
      }
 }

$sid = $_SESSION['id'] ;       
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="robots" content="noindex, nofollow">

    <title>Admin</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="//maxcdn.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css" rel="stylesheet" id="bootstrap-css">
    <style type="text/css">
    @import url("//maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css");

.navbar-icon-top .navbar-nav .nav-link > .fa {
  position: relative;
  width: 36px;
  font-size: 24px;
}

.navbar-icon-top .navbar-nav .nav-link > .fa > .badge {
  font-size: 0.75rem;
  position: absolute;
  right: 0;
  font-family: sans-serif;
}

.navbar-icon-top .navbar-nav .nav-link > .fa {
  top: 3px;
  line-height: 12px;
}

.navbar-icon-top .navbar-nav .nav-link > .fa > .badge {
  top: -10px;
}

@media (min-width: 576px) {
  .navbar-icon-top.navbar-expand-sm .navbar-nav .nav-link {
    text-align: center;
    display: table-cell;
    height: 70px;
    vertical-align: middle;
    padding-top: 0;
    padding-bottom: 0;
  }

  .navbar-icon-top.navbar-expand-sm .navbar-nav .nav-link > .fa {
    display: block;
    width: 48px;
    margin: 2px auto 4px auto;
    top: 0;
    line-height: 24px;
  }

  .navbar-icon-top.navbar-expand-sm .navbar-nav .nav-link > .fa > .badge {
    top: -7px;
  }
}

@media (min-width: 768px) {
  .navbar-icon-top.navbar-expand-md .navbar-nav .nav-link {
    text-align: center;
    display: table-cell;
    height: 70px;
    vertical-align: middle;
    padding-top: 0;
    padding-bottom: 0;
  }

  .navbar-icon-top.navbar-expand-md .navbar-nav .nav-link > .fa {
    display: block;
    width: 48px;
    margin: 2px auto 4px auto;
    top: 0;
    line-height: 24px;
  }

  .navbar-icon-top.navbar-expand-md .navbar-nav .nav-link > .fa > .badge {
    top: -7px;
  }
}

@media (min-width: 992px) {
  .navbar-icon-top.navbar-expand-lg .navbar-nav .nav-link {
    text-align: center;
    display: table-cell;
    height: 70px;
    vertical-align: middle;
    padding-top: 0;
    padding-bottom: 0;
  }

  .navbar-icon-top.navbar-expand-lg .navbar-nav .nav-link > .fa {
    display: block;
    width: 48px;
    margin: 2px auto 4px auto;
    top: 0;
    line-height: 24px;
  }

  .navbar-icon-top.navbar-expand-lg .navbar-nav .nav-link > .fa > .badge {
    top: -7px;
  }
}

@media (min-width: 1200px) {
  .navbar-icon-top.navbar-expand-xl .navbar-nav .nav-link {
    text-align: center;
    display: table-cell;
    height: 70px;
    vertical-align: middle;
    padding-top: 0;
    padding-bottom: 0;
  }

  .navbar-icon-top.navbar-expand-xl .navbar-nav .nav-link > .fa {
    display: block;
    width: 48px;
    margin: 2px auto 4px auto;
    top: 0;
    line-height: 24px;
  }

  .navbar-icon-top.navbar-expand-xl .navbar-nav .nav-link > .fa > .badge {
    top: -7px;
  }
}

.resp-container {
    position: relative;
   
}

.resp-iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 750px;
    border: 0;
}
.badge-orange {
    color: #fff;
    background-color: #ff6b3c;
}

    </style>
    <script src="//cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
    <script src="//maxcdn.bootstrapcdn.com/bootstrap/4.1.1/js/bootstrap.min.js"></script>
    <script type="text/javascript">
        window.alert = function(){};
        var defaultCSS = document.getElementById('bootstrap-css');
        function changeCSS(css){
            if(css) $('head > link').filter(':first').replaceWith('<link rel="stylesheet" href="'+ css +'" type="text/css" />'); 
            else $('head > link').filter(':first').replaceWith(defaultCSS); 
        }
        $( document ).ready(function() {
          var iframe_height = parseInt($('html').height()); 
          window.parent.postMessage( iframe_height, 'https://bootsnipp.com');
        });
    </script>
</head>
<body>
    <nav class="navbar navbar-icon-top navbar-expand-lg navbar-dark bg-dark">
  <a class="navbar-brand" href="#"> <img src='./logo/VishOLMedia4.png' style='width:190px ; height:60px'>  <?php //echo  $_SESSION['designation']; ?></a>
  <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
  </button>

  <div class="collapse navbar-collapse" id="navbarSupportedContent">
    <ul class="navbar-nav mr-auto">

    
      <!--?php  if (trim($_SESSION['designation']) == 'Admin') { ?-->
     <!--   <li class="nav-item">
          <a class="nav-link" href="../server_report/" target="frame" >
            <i class="fa fa-contao">
            </i>
             SENT COUNT
          </a>
        </li> -->
      <!--?php } ?-->


      <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          <i class="fa fa-dollar">
            <!-- <span class="badge badge-primary">2</span> -->
          </i>
          REVENUE
        </a>
        <div class="dropdown-menu" aria-labelledby="navbarDropdown">
          <a class="dropdown-item" href="../LiveReport.php" target="frame">Live Report</a>
          <a class="dropdown-item" href="../LiveReportMonthly.php" target="frame">Monthly Report</a>
        </div>
      </li>


      

      <li class="nav-item">
         <a class="nav-link" href="../admin/account_page.php" target="frame" >
          <i class="fa fa-th-list">
          </i>
          ACCOUNT
        </a>
      </li>


      <?php  
      if (trim($_SESSION['username']) == 'vishal@visholmedia.com' || trim($_SESSION['username']) == 'vijay.suryavanshi@visholmedia.com') {
      ?>
      <li class="nav-item">
         <a class="nav-link" href="../smtp/" target="frame" >
          <i class="fa fa-file-code-o">
          </i>
          SMTP
        </a>
      </li>
      <?php } ?>


      <li class="nav-item">
         <a class="nav-link" href="../screen.php" target="frame" >
          <i class="fa fa-tachometer">
          </i>
          SCREEN
        </a>
      </li>


      <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          <i class="fa fa-cogs">
            <!-- <span class="badge badge-primary">2</span> -->
          </i>
          TOOLS
        </a>
        <div class="dropdown-menu" aria-labelledby="navbarDropdown">
          <a class="dropdown-item" href="stc.php" target="frame">Sleep time calculator</a>
          <a class="dropdown-item" href="../Data_Download/datacount.php" target="frame">Data File List</a>
        </div>
      </li>


      <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          <i class="fa fa-line-chart">
            <!-- <span class="badge badge-primary">2</span> -->
          </i>
          REPORTS
        </a>
        <div class="dropdown-menu" aria-labelledby="navbarDropdown">
        <a class="dropdown-item" href="../server_report/" target="frame">IP Report</a>
        <a class="dropdown-item" href="../DailyTestReport.php" target="frame">Daily Test Report</a>
        <a class="dropdown-item" href="../SenderVolume.php" target="frame">Sender Volume Report</a>

        <a class="dropdown-item" href="../admin/ip_hourly_report.php" target="frame">PHP Hourly Report</a>
        <a class="dropdown-item" href="../admin/ip_offer_report.php" target="frame">PHP IP Offer Report</a>

        <a class="dropdown-item" href="../admin/account_page_fsock.php" target="frame">FSOCK Account Page</a>
        <a class="dropdown-item" href="../admin/IP_Report_fsock.php" target="frame">FSOCK IP Report</a>
          <a class="dropdown-item" href="../admin/ip_hourly_report_fsock.php" target="frame">FSOCK Hourly Report</a>
          
          <!--<a class="dropdown-item" href="../admin/server.php" target="frame">Server Report</a>-->
        </div>
      </li>


      <?php  
      if (trim($_SESSION['username']) == 'vishal@visholmedia.com') {
      ?>
        <li class="nav-item">
          <a class="nav-link" href="members/" target="frame" >
            <i class="fa fa-shield">
              <span class="badge badge-danger"></span>
            </i>
            LOGIN
          </a>
        </li>
      <?php } ?>

      <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          <i class="fa fa-envelope-o">
          </i>
          INTERFACE
        </a>
        <div class="dropdown-menu" aria-labelledby="navbarDropdown">
          <a class="dropdown-item"  target="_blank" href="../interface/header.php" target="frame">NEW INTERFACE</a>
          <?php  if (trim($_SESSION['designation']) == 'Admin') { ?>
            <a class="dropdown-item" href="../smtp_tester/"  target="frame">SMTP TESTER</a>  
          <?php } ?>
          <a class="dropdown-item" target="_blank" href="../ESP_Module_fsock/"  target="frame">FSOCK MANUAL INTERFACE</a>
        </div>
      </li>

      <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          <i class="fa fa-database">
            <!-- <span class="badge badge-primary">LIVE</span> -->
          </i>
          DATA
        </a>
        <div class="dropdown-menu" aria-labelledby="navbarDropdown">
          <?php  if (trim($_SESSION['designation']) == 'Admin') { ?>
            <a class="dropdown-item" href="../Data_Download/" target="frame" >DATA DOWNLOAD PORTAL</a>
          <?php } ?>
          <?php  if (trim($_SESSION['designation']) == 'Admin') { ?>
          <a class="dropdown-item" href="../Data_Download/insert_data.php" target="frame" >DATA UPLOAD PORTAL</a>
          <?php } ?>
          <a class="dropdown-item" href="../Data_Download/split_data.php" target="frame" >DATA SPLIT PORTAL</a>
          <a class="dropdown-item" href="../bounce_processor/index.php" target="frame" >BOUNCE FETCH</a>
          <?php  if (trim($_SESSION['designation']) == 'Admin') { ?>
            <a class="dropdown-item" href="../Data_Download/bounce_update.php" target="frame" >BOUNCE UPDATE</a>
            <a class="dropdown-item" href="../Data_Download/complain_update.php" target="frame" >COMPLAIN UPDATE</a>
          <?php } ?>
        </div>
      </li>

      <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          <i class="fa fa-link">
            <span class="badge badge-primary"></span>
          </i>
          OFFER
        </a>
        <div class="dropdown-menu" aria-labelledby="navbarDropdown">
          <?php  if (trim($_SESSION['designation']) == 'Admin') { ?>
          <a class="dropdown-item" href="../Offer_portal/" target="frame" >ADD OFFER</a>
          <?php } ?>
          <a class="dropdown-item" href="../Offer_portal/all_offer_link_create.php" target="frame" >ALL OFFER / LINK CREATE PORTAL</a>
          <a class="dropdown-item" href="../Offer_portal/show_all_link.php" target="frame" >ALL LINKS PORTAL</a>
          <a class="dropdown-item" href="../image_portal/" target="frame" >IMAGE TRANSFER</a>
        </div>
      </li>
      <?php  if (trim($_SESSION['designation']) == 'Admin') { ?>
      <li class="nav-item">
        <a class="nav-link" href="../suppression/" target="frame" >
          <i class="fa fa-gavel">
          </i>
          SUPPRESSION
        </a>
      </li>
      <?php } ?>

      <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          <i class="fa fa-check-square-o">
          </i>
          APPROVAL
        </a>
        <div class="dropdown-menu" aria-labelledby="navbarDropdown">
        <?php  if (trim($_SESSION['designation']) == 'Admin') { ?>
          <a class="dropdown-item" href="../offer_approval/show_all_approval.php" target="frame">Approval Portal</a>
          <?php } ?>
          <a class="dropdown-item" href="../offer_approval/send_approval.php" target="frame">Send Approval</a>
          <a class="dropdown-item" href="../offer_approval/show_approval_status.php" target="frame">Show Approval Status</a>
        </div>
      </li>

    </ul>
    <form class="form-inline my-2 my-lg-0">
<font color='white' size='5'><?php echo strtoupper($_SESSION['name']);?> </font>
&nbsp;&nbsp;&nbsp;&nbsp;
<a class="btn btn-outline-danger my-2 my-sm-0" href="../admin/logout.php">Logout</a>
    </form>
  </div>
</nav>
<div class="resp-container">
<!-- <iframe class="resp-iframe" name="frame" src="server.php" gesture="media"  allow="encrypted-media" allowfullscreen></iframe> -->
  <iframe class="resp-iframe" name="frame" src="" gesture="media"  allow="encrypted-media" allowfullscreen></iframe>
</div>
<!-- <script type="text/javascript">
</script> -->
</body>
</html>
