<?php
session_start();
if (!isset($_SESSION['username'])) // If session is not set then redirect to Login Page
{
  header("Location:../admin/login.php?action=session+logged+out");
  die();
} else {
  $cred = file_get_contents("http://173.249.50.153/admin/autheticate.php?username=" . base64_encode($_SESSION['username']) . "&password=" . base64_encode($_SESSION['password']));
  if (strstr($cred, "|||||")) {
    session_destroy();
    header("location:login.php?action=Invalid+Details");
    exit();
  }
}

$sid = $_SESSION['id'];

include "/var/www/html/admin/include.php";
// Fetch role mappings
$roles = [];
$data = mysql_query("SELECT * FROM `login`.`role_mapped`");
while ($details = mysql_fetch_array($data, MYSQL_ASSOC)) {
  $selectedEmpIds = explode(',', $details['emp_id']); // Assuming emp_id is a comma-separated string
  $roles[$details['role']] = $selectedEmpIds;
}

// Fetching sending IPs
$sendingIPs = [];
$sql = "SELECT `ip` FROM `admin`.`sending_ip_list`";
$result = mysql_query($sql);
while ($row = mysql_fetch_array($result)) {
    $sendingIPs[] = $row['ip']; 
}

mysql_close($link);
mysql_close($rds);
mysql_close($loginrds);
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

    body {
        transform: scale(0.67);
        transform-origin: top left; /* Adjust as needed */
        width: 150%; /* Compensate for scaling in width */
    }
    .navbar-icon-top .navbar-nav .nav-link>.fa {
      position: relative;
      width: 36px;
      font-size: 24px;
    }

    .navbar-icon-top .navbar-nav .nav-link>.fa>.badge {
      font-size: 0.75rem;
      position: absolute;
      right: 0;
      font-family: sans-serif;
    }

    .navbar-icon-top .navbar-nav .nav-link>.fa {
      top: 3px;
      line-height: 12px;
    }

    .navbar-icon-top .navbar-nav .nav-link>.fa>.badge {
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

      .navbar-icon-top.navbar-expand-sm .navbar-nav .nav-link>.fa {
        display: block;
        width: 48px;
        margin: 2px auto 4px auto;
        top: 0;
        line-height: 24px;
      }

      .navbar-icon-top.navbar-expand-sm .navbar-nav .nav-link>.fa>.badge {
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

      .navbar-icon-top.navbar-expand-md .navbar-nav .nav-link>.fa {
        display: block;
        width: 48px;
        margin: 2px auto 4px auto;
        top: 0;
        line-height: 24px;
      }

      .navbar-icon-top.navbar-expand-md .navbar-nav .nav-link>.fa>.badge {
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

      .navbar-icon-top.navbar-expand-lg .navbar-nav .nav-link>.fa {
        display: block;
        width: 48px;
        margin: 2px auto 4px auto;
        top: 0;
        line-height: 24px;
      }

      .navbar-icon-top.navbar-expand-lg .navbar-nav .nav-link>.fa>.badge {
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

      .navbar-icon-top.navbar-expand-xl .navbar-nav .nav-link>.fa {
        display: block;
        width: 48px;
        margin: 2px auto 4px auto;
        top: 0;
        line-height: 24px;
      }

      .navbar-icon-top.navbar-expand-xl .navbar-nav .nav-link>.fa>.badge {
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
      height: 130vh;
      border: 0;
    }

    .badge-orange {
      color: #fff;
      background-color: #ff6b3c;
    }

    /* Loader overlay + spinner */
    #frame-loader-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: none;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.6);
      z-index: 9999;
    }

    #frame-loader-overlay .spinner {
      margin-top: 1000px;
      width: 56px;
      height: 56px;
      border: 6px solid #f3f3f3;
      border-top: 6px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }

      100% {
        transform: rotate(360deg);
      }
    }

    /* blur effect for iframe while loading */
    .resp-iframe.loading-blur {
      filter: blur(3px);
      transition: filter 0.15s linear;
    }

    /* Multi-level dropdowns for Bootstrap 4 */
    .dropdown-submenu {
      position: relative;
    }

    .dropdown-submenu > .dropdown-menu {
      top: 0;
      left: 100%;
      margin-top: -6px;
      margin-left: 0;
      border-radius: 0.25rem;
      min-width: 200px;
    }

    .dropdown-submenu:hover > .dropdown-menu {
      display: block;
    }
  </style>
  <script src="//cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
  <script src="//maxcdn.bootstrapcdn.com/bootstrap/4.1.1/js/bootstrap.min.js"></script>
  <script type="text/javascript">
    window.alert = function() {};
    var defaultCSS = document.getElementById('bootstrap-css');

    function changeCSS(css) {
      if (css) $('head > link').filter(':first').replaceWith('<link rel="stylesheet" href="' + css + '" type="text/css" />');
      else $('head > link').filter(':first').replaceWith(defaultCSS);
    }
    $(document).ready(function() {
      var iframe_height = parseInt($('html').height());
      window.parent.postMessage(iframe_height, 'https://bootsnipp.com');
    });
  </script>
  <script>
    function showFrameLoader() {
      var container = document.querySelector('.resp-container');
      if (!container) return;

      // ensure container is positioned so overlay can be absolute inside it
      if (getComputedStyle(container).position === 'static') {
        container.style.position = 'relative';
      }

      // create overlay if missing
      var overlay = document.getElementById('frame-loader-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'frame-loader-overlay';
        var spinner = document.createElement('div');
        spinner.className = 'spinner';
        overlay.appendChild(spinner);
        container.appendChild(overlay);
      }

      overlay.style.display = 'flex';

      var iframe = document.querySelector('.resp-iframe');
      if (iframe) {
        // add blur
        iframe.classList.add('loading-blur');

        // attach one-time load handler to remove overlay + blur
        var onLoad = function() {
          iframe.classList.remove('loading-blur');
          if (overlay) overlay.style.display = 'none';
          iframe.removeEventListener('load', onLoad);
        };
        iframe.addEventListener('load', onLoad);
      }
    }
  </script>
  <script>
    $(document).ready(function() {
      // Multi-level dropdowns for Bootstrap 4
      $('.dropdown-submenu > .dropdown-toggle').on("click", function(e) {
        var submenu = $(this).next('.dropdown-menu');
        if (submenu.length) {
          submenu.toggle();
          e.stopPropagation();
          e.preventDefault();
        }
      });

      // Populate submenu on hover, with data-interface attribute
      $('.dropdown-submenu').on('mouseenter', function() {
        var $submenu = $(this).find('.dropdown-menu').first();
        var interfaceLabel = $(this).children('.dropdown-toggle').text().trim();
        $submenu.empty();
        <?php foreach ($sendingIPs as $ip): ?>
          $submenu.append(
            $('<a>')
              .addClass('dropdown-item sending-ip-link')
              .attr('href', '#')
              .attr('data-ip', '<?php echo htmlspecialchars($ip, ENT_QUOTES); ?>')
              .attr('data-interface', interfaceLabel)
              .text('<?php echo htmlspecialchars($ip, ENT_QUOTES); ?>')
          );
        <?php endforeach; ?>
        $submenu.show();
      }).on('mouseleave', function() {
        $(this).find('.dropdown-menu').first().hide();
      });

      // On click of IP, open the dynamic link in new tab based on data-interface
      $(document).on('click', '.sending-ip-link', function(e) {
        e.preventDefault();
        var ip = $(this).data('ip');
        var type = $(this).attr('data-interface');
        var url = '';
        if(type === 'NEW INTERFACE') {
          url = 'http://' + ip + '/interface/header.php';
        } else if(type === 'SMTP TESTER') {
          url = 'http://' + ip + '/smtp_tester/';
        } else if(type === 'FSOCK MANUAL INTERFACE') {
          url = 'http://' + ip + '/ESP_Module_fsock/';
        } else if(type === 'NEW INTERFACE AUTO') {
          url = 'http://' + ip + '/interface_new/header.php';
        } else if(type === 'FSOCK SEND SMTP') {
          url = 'http://' + ip + '/ESP_Module_fsock_send_smtp/';
        } else if(type === 'FSOCK SEND SMTP AUTO') {
          url = 'http://' + ip + '/ESP_Module_fsock_send_smtp_auto/';
        }
        if(url) window.open(url, '_blank');
      });
    });
  </script>
</head>

<body>
  <nav class="navbar navbar-icon-top navbar-expand-lg navbar-dark bg-dark">
    <a class="navbar-brand" href="index.php"> <img src='./logo/MJ TECH_New.png' style='height:60px'> <?php //echo  $_SESSION['designation']; 
                                                                                                        ?></a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav mr-auto">

        <?php if (trim($_SESSION['designation']) == 'Admin') { ?>
          <li class="nav-item">
            <a class="nav-link" href="../smtp/" target="frame">
              <i class="fa fa-file-code-o">
              </i>
              SMTP
            </a>
          </li>
        <?php } ?>

        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            <i class="fa fa-cogs">
              <!-- <span class="badge badge-primary">2</span> -->
            </i>
            TOOLS
          </a>
          <div class="dropdown-menu" aria-labelledby="navbarDropdown">
            <a class="dropdown-item" href="../Data_Download/datacount.php" target="frame" onclick="showFrameLoader()">Data File List</a>
          </div>
        </li>


        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            <i class="fa fa-shield">
            </i>
            LOGIN
          </a>
          <div class="dropdown-menu" aria-labelledby="navbarDropdown">
            <a class="dropdown-item" href="members/" target="frame">CREATE CREDENTIALS</a>
          </div>
        </li>

        <li class="nav-item">
          <a class="nav-link" href="../screen.php" target="frame">
            <i class="fa fa-tachometer">
            </i>
            SCREEN
          </a>
        </li>

        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            <i class="fa fa-envelope-o">
            </i>
            INTERFACE
          </a>
          <div class="dropdown-menu" aria-labelledby="navbarDropdown">
            <h6 class="dropdown-header">MAIN SERVER </h6>
            <a class="dropdown-item" target="_blank" href="../interface/header.php" target="frame">NEW INTERFACE</a>
            <a class="dropdown-item" href="../smtp_tester/" target="frame">SMTP TESTER</a>
            <a class="dropdown-item" target="_blank" href="../ESP_Module_fsock/" target="frame">FSOCK MANUAL INTERFACE</a>
            <a class="dropdown-item" target="_blank" href="../interface_new/header.php" target="frame">NEW INTERFACE AUTO</a>
            <a class="dropdown-item" target="_blank" href="../ESP_Module_fsock_send_smtp/" target="frame">FSOCK SEND SMTP</a>
            <a class="dropdown-item" target="_blank" href="../ESP_Module_fsock_send_smtp_auto/" target="frame">FSOCK SEND SMTP AUTO</a>
            <div class="dropdown-divider"></div>
            <h6 class="dropdown-header">SENDING IP </h6>
            <!-- <a class="dropdown-item" target="_blank" href="http://157.173.122.179/interface/header.php" target="frame">NEW INTERFACE</a>
            <a class="dropdown-item" href="http://157.173.122.179/smtp_tester/" target="frame">SMTP TESTER</a>
            <a class="dropdown-item" target="_blank" href="http://157.173.122.179/ESP_Module_fsock/" target="frame">FSOCK MANUAL INTERFACE</a>
            <a class="dropdown-item" target="_blank" href="http://157.173.122.179/interface_new/header.php" target="frame">NEW INTERFACE AUTO</a>
            <a class="dropdown-item" target="_blank" href="http://157.173.122.179/ESP_Module_fsock_send_smtp/" target="frame">FSOCK SEND SMTP</a>
            <a class="dropdown-item" target="_blank" href="http://157.173.122.179/ESP_Module_fsock_send_smtp_auto/" target="frame">FSOCK SEND SMTP AUTO</a> -->

            <div class="dropdown-submenu">
              <a class="dropdown-item dropdown-toggle" href="#">NEW INTERFACE</a>
              <div class="dropdown-menu">
                <!-- Submenu items here -->
              </div>
            </div>
            <div class="dropdown-submenu">
              <a class="dropdown-item dropdown-toggle" href="#">SMTP TESTER</a>
              <div class="dropdown-menu">
                <!-- Submenu items here -->
              </div>
            </div>
            <div class="dropdown-submenu">
              <a class="dropdown-item dropdown-toggle" href="#">FSOCK MANUAL INTERFACE</a>
              <div class="dropdown-menu">
                <!-- Submenu items here -->
              </div>
            </div>
            <div class="dropdown-submenu">
              <a class="dropdown-item dropdown-toggle" href="#">NEW INTERFACE AUTO</a>
              <div class="dropdown-menu">
                <!-- Submenu items here -->
              </div>
            </div>
            <div class="dropdown-submenu">
              <a class="dropdown-item dropdown-toggle" href="#">FSOCK SEND SMTP</a>
              <div class="dropdown-menu">
                <!-- Submenu items here -->
              </div>
            </div>
            <div class="dropdown-submenu">
              <a class="dropdown-item dropdown-toggle" href="#">FSOCK SEND SMTP AUTO</a>
              <div class="dropdown-menu">
                <!-- Submenu items here -->
              </div>
            </div>
          </div>
        </li>

        <?php if (trim($_SESSION['designation']) == 'Admin') { ?>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <i class="fa fa-globe">
              </i>
              TESTIDS PORTAL
            </a>
            <div class="dropdown-menu" aria-labelledby="navbarDropdown">
              <a class="dropdown-item" href="testids/" target="frame">Testids Managment</a>
              <a class="dropdown-item" href="testids/imapscreen.php" target="frame">Testids Screen</a>
              <a class="dropdown-item" href="testids/imaplog.php" target="frame">Testids Mailbox</a>
            </div>
          </li>
        <?php } ?>

        <?php if (trim($_SESSION['designation']) == 'Admin') { ?>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <i class="fa fa-database">
                <!-- <span class="badge badge-primary">LIVE</span> -->
              </i>
              DATA
            </a>
            <div class="dropdown-menu" aria-labelledby="navbarDropdown">
              <a class="dropdown-item" href="../Data_Download/" target="frame">DATA DOWNLOAD PORTAL</a>
              <a class="dropdown-item" href="../Data_Download/insert_data.php" target="frame">DATA UPLOAD PORTAL</a>
              <a class="dropdown-item" href="../Data_Download/split_data.php" target="frame">DATA SPLIT PORTAL</a>
              <a class="dropdown-item" href="../Data_Download/dataMerge.php" target="frame">DATA MERGE PORTAL</a>
              <a class="dropdown-item" href="../bounce_processor/index.php" target="frame">BOUNCE FETCH</a>
              <a class="dropdown-item" href="../complain_processor/index.php" target="frame">COMPLAIN FETCH</a>
              <a class="dropdown-item" href="../Data_Download/bounce_update.php" target="frame">BOUNCE UPDATE</a>
              <a class="dropdown-item" href="../Data_Download/complain_update.php" target="frame">COMPLAIN UPDATE</a>
              <a class="dropdown-item" href="../Data_Download/data_analysis/data_analytics.php" target="frame">Fetch Opener & Clicker Data</a>
              <a class="dropdown-item" href="../Data_Download/data_delete.php" target="frame">DELETE DATAFILE FROM DB</a>
            </div>
          </li>
        <?php } ?>

        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            <i class="fa fa-link">
              <span class="badge badge-primary"></span>
            </i>
            OFFER
          </a>
          <div class="dropdown-menu" aria-labelledby="navbarDropdown">
            <?php if (trim($_SESSION['designation']) == 'Admin') { ?>
              <a class="dropdown-item" href="../Offer_portal/" target="frame">ADD OFFER</a>
              <a class="dropdown-item" href="../Offer_portal/all_offer_link_create.php" target="frame">ALL OFFER</a>
              <a class="dropdown-item" href="../Offer_portal/show_all_link.php" target="frame">ALL LINKS PORTAL</a>
              <a class="dropdown-item" href="../image_portal/" target="frame">IMAGE TRANSFER</a>
            <?php } ?>
          </div>
        </li>

        <?php if (trim($_SESSION['designation']) == 'Admin') { ?>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            <!-- <a class="nav-link " href="../suppression/" target="frame"> -->
              <i class="fa fa-gavel">
              </i>
              SUPPRESSION
            </a>
            <div class="dropdown-menu" aria-labelledby="navbarDropdown">
              <a class="dropdown-item" href="../suppression/" target="frame">SUPPRESSION</a>
              <a class="dropdown-item" href="../suppression/manual_suppression/complainer_suppression.php" target="frame">COMPLAINER SUPPRESSION</a>
            </div>
          </li>
        <?php } ?>

        <?php if (trim($_SESSION['designation']) == 'Admin') { ?>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <i class="fa fa fa-wrench">
                <!-- <span class="badge badge-primary">LIVE</span> -->
              </i>
              Server Setup
            </a>
            <div class="dropdown-menu" aria-labelledby="navbarDropdown">
              <a class="dropdown-item" href="../server_setup/" target="frame">Server Setup Centos</a>
              <a class="dropdown-item" href="../server_setup/index_ubuntu.php" target="frame">Server Setup Ubuntu</a>
              <a class="dropdown-item" href="../server_setup/sending_ip_setup/" target="frame">Sending IP Setup</a>
            </div>
          </li>
        <?php } ?>


      </ul>
      <form class="form-inline my-2 my-lg-0">
        <font color='white' size='5'><?php echo strtoupper($_SESSION['name']); ?> </font>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <a class="btn btn-outline-danger my-2 my-sm-0" href="../admin/logout.php">Logout</a>
      </form>
    </div>
  </nav>
  <div class="resp-container">
    <!-- <iframe class="resp-iframe" name="frame" src="server.php" gesture="media"  allow="encrypted-media" allowfullscreen></iframe> -->
    <iframe class="resp-iframe" name="frame" src="sending_report.php" gesture="media" allow="encrypted-media" allowfullscreen></iframe>
  </div>
  <!-- <script type="text/javascript">
</script> -->
</body>

</html>