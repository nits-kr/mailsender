<?php
include "session.php";
include "include.php";

define(0,"<font color='orange'>Queued</font>");
define(1,"<font color='green'>Completed</font>");
define(3,"<font color='red'>Error</font>");
define(2,"<font color='blue'>Running</font>");
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SUPPRESSION</title>
    <script type="text/JavaScript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
    <script type="text/JavaScript" src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.11.2/jquery-ui.min.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />
    <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script> 
    <script src="https://cdnjs.cloudflare.com/ajax/libs/plupload/3.1.5/plupload.full.min.js"></script>   
    <script>
        // Offer Select box
        $(document).ready(function() {
            $('#offer').select2();
            $('#offer1').select2();

        });

        // Save Logic
        function saveMappingToDb() {
            // Validation
            var get_offer = document.getElementById("offer").value;
            if(get_offer == ''){
                alert("Choose Offer...!");
                return;
            }

            //validation File
            var get_file_string = document.getElementById("upload-percentage").innerHTML;
            if(get_file_string == '')
            {
                alert("Upload Needed..!");
                return;
            }

            //validation percentage
            const get_progress_array_one = get_file_string.split("<strong>");
            const get_progress_array_two = get_progress_array_one[1].split("</strong>");
            var percent_upload = get_progress_array_two[0];

            // Confirm if file was uploaded via Cyberduck or check upload percentage
            const isCyberduckUpload = confirm("Did you upload the file via Cyberduck?");
            if (!isCyberduckUpload && percent_upload !== '100%') {
                alert("Wait for 100% Upload");
                return;
            }

            //upload script
            const get_file_array_one = get_file_string.split('">');
            const get_file_array_two = get_file_array_one[1].split(" (");
            var filename = get_file_array_two[0];
            document.getElementById('mapping_result').innerHTML = 'Processing..!';
            $.ajax({
                type: 'post',
                url: 'save_mapping_action.php',
                data: "filename="+filename+"&offer="+get_offer,
                success: function (data) {
                    $("#mapping_result").fadeOut( 100 , function() { $(this).html(data);}).fadeIn( 1000 );
				    setTimeout(function() { $('#mapping_result').fadeOut("slow");}, 3000 );
                    $(".tableFixHead_map").load(location.href + " .tableFixHead_map>*", "");
                    document.getElementById('mapping_result').innerHTML = '';
                }
            });
        }

        // Schedule Logic
        function schedule() {
            // Validation
            var get_offer = document.getElementById("offer1").value;
            if(get_offer == '') {
                alert("Choose Offer...!");
                return;
            }

            //validation File
            var DataFileName = document.getElementById("datafile_name").value;
            if(DataFileName == '')
            {
                alert("Data File Name Required..!");
                return;
            }

            //validation New File
            var NewDataFileName = document.getElementById("new_datafile_name").value;
            if(NewDataFileName == '')
            {
                alert("New Data File Name Required..!");
                return;
            }

            document.getElementById('queue_result').innerHTML = 'Processing..!';
            //upload script
            $.ajax({
                type: 'post',
                url: 'save_schedule_action.php',
                data: "filename="+DataFileName+"&newfilename="+NewDataFileName+"&offer="+get_offer,
                success: function (data) {
                    // $("#queue_result").fadeOut( 100 , function() { $(this).html(data);}).fadeIn( 1000 );
				    // setTimeout(function() { $('#queue_result').fadeOut("slow");}, 8000 );
                    $(".tableFixHead_queue").load(location.href + " .tableFixHead_queue>*", "");
                    document.getElementById('queue_result').innerHTML = data;
                }
            });
        }

        // Delete MAPPING Logic
        function deleteMapping(omid) {
            if (confirm("Heads Up.. Sure to Delete ..?")) {
                $.ajax({
                    type: 'post',
                    url: 'delete_mapping_action.php',
                    data: "omid="+omid,
                    success: function (data) {
                        alert(data);
                        $(".tableFixHead_map").load(location.href + " .tableFixHead_map>*", "");
                    }
                });
            } 
        }

        // Delete QUEUE Logic
        function deleteQueue(sno) {
            if (confirm("Heads Up.. Sure to Delete ..?")) {
                $.ajax({
                    type: 'post',
                    url: 'delete_queue_action.php',
                    data: "sno="+sno,
                    success: function (data) {
                        alert(data);
                        $(".tableFixHead_queue").load(location.href + " .tableFixHead_queue>*", "");
                    }
                });
            } 
        }

        // Show Los
        function showLog(sno) {
            // Display Modal
            document.getElementById('reportModal').style.display = 'block';
            fetch('/suppression/logs/'+sno+'.log')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch log file report');
                }
                return response.text();
            })
            .then(data => {
                var logLines = data.split('\n');
                var reversedLog = logLines.reverse();
                var output = reversedLog.join('\n');
                // Display the fetched data in the modal
                document.getElementById('reportContent').innerHTML = '<pre>' + output + '</pre>';
                showLog(sno);
            })
            .catch(error => {
                // Display error message in case of failure
                document.getElementById('reportContent').innerHTML = '<p>Error: ' + error.message + '</p>';
            });
        }

        
        $(document).ready(function(){
            // Search logic for Mapping table
            $("#myInput").on("keyup", function() {
                var value = $(this).val().toLowerCase();
                $("#mapping-table tr").filter(function() {
                    $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
                });
            });

            // Search logic for Supression Queue
            $("#myInput_supp").on("keyup", function() {
                var value = $(this).val().toLowerCase();
                $("#supp-table tr").filter(function() {
                    $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
                });
            });

            document.getElementsByClassName('close')[0].addEventListener('click', function() {
                location.reload();
            });
        });

    </script>
    <!-- UPLOAD SCRIPT -->
    <script>
        window.addEventListener("load", function(){
            var uploader = new plupload.Uploader({
                runtimes : "html5,html4",
                browse_button : "fileToUpload",
                url : "supp_uploader.php",
                chunk_size : "100mb",
                init: {
                    PostInit: function(){
                        document.getElementById("upload-percentage").innerHTML = "";
                    },

                    FilesAdded: function(up, files){

                        // Validation of file select box.
                        var get_offer = document.getElementById("offer").value;
                        if(get_offer == ''){
                            alert("Choose Offer...!");
                            return;
                        } else {
                            // Upload Start Process.
                            plupload.each(files, function(file) 
                            {
                                document.getElementById("upload-percentage").innerHTML += `<div id="${file.id}">${file.name} (${plupload.formatSize(file.size)}) - <strong>0%</strong></div>`;
                            });
                            uploader.start();
                        }
                    },

                    UploadProgress: function(up, file){
                        document.querySelector(`#${file.id} strong`).innerHTML = `${file.percent}%`;
                    },

                    Error: function(up, err){
                        console.log(err);
                    }
                }
            });
            uploader.init();
        })
    </script>

    <style>
        body, html {
            margin: 0;
            padding: 0;
            height: 100%;
        }
        .container {
            display: flex;
            flex-direction: column;
            height: 100%;
        }
        .row1 {
            display: flex;
            height: 30%;
        }
        .row2 {
            display: flex;
            height: 70%;
        }
        .section {
            border: 1px solid black; /* Adding border to each section */
            box-sizing: border-box; /* Ensuring border doesn't affect dimensions */
        }
        .upper-section {
            flex: 1;            
            background-color: lightblue; /* You can change the background color */
        }
        .lower-section {
            flex: 2;
            background-color: lightblue; /* You can change the background color */
        }
        .supp-upload {
            padding: 10px 20px; 
            border-radius: 5px; 
            background-color: #007bff; 
            color: #fff; 
            border: none;
            width: 30%;
        }
        .save-supp-info {
            padding: 10px 20px; 
            border-radius: 5px; 
            background-color: black; 
            color: #fff; 
            border: none;
            width: 100%;
        }
        .delete-button {
            background-color: red;
            color: white;
            border: none;
            padding: 8px 12px;
            cursor: pointer;
            border-radius: 4px;
        }

        .log-button{
            background-color: orange;
            color: white;
            border: none;
            padding: 8px 12px;
            cursor: pointer;
            border-radius: 4px;
        }

        .tableFixHead_map {
            overflow: auto;
            height: 600px;
            thead {
                th {
                    position: sticky;
                    top: 0;
                    z-index: 1;
                    border: 1px solid #ddd; 
                    padding: 12px; 
                    text-align: left;
                    background-color: white;
                }
            }
        }

        .tableFixHead_queue {
            overflow: auto;
            height: 600px;
            thead {
                th {
                    position: sticky;
                    top: 0;
                    z-index: 1;
                    border: 1px solid #ddd; 
                    padding: 12px; 
                    text-align: left;
                    background-color: white;
                }
            }
        }

        table {
            width: -webkit-fill-available; 
            border-collapse: collapse; 
            border: 1px solid black; 
            font-family: Arial, sans-serif;
            margin: 0 10px;
        }

        #datafile_name, #new_datafile_name {
            padding: 8px; 
            border-radius: 5px; 
            border: 1px solid #ccc; 
            width: 45%;
        }
        
        #submit-button {
            padding: 10px 20px; 
            border-radius: 5px; 
            background-color: #FFA500; 
            color: #fff; 
            border: none;
            width: 100%;
        }

        body {
            font-size:small;
        }

        /* Modal styles */
        .modal {
            display: none; /* Hidden by default */
            position: fixed; /* Stay in place */
            z-index: 1; /* Sit on top */
            left: 0;
            top: 0;
            width: 100%; /* Full width */
            height: -webkit-fill-available; /* Full height */
            overflow: auto; /* Enable scroll if needed */
            background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
        }

        /* Modal content */
        .modal-content {
            background-color: #fefefe;
            margin: 5% auto;
            padding: 20px;
            border: 1px solid #888;
            width: 80%;
            max-height: 80%;
            overflow-y: auto; /* Enable vertical scroll */
        }

        /* Close button */
        .close {
            color: #aaa;
            float: right;
            font-size: 28px;
            font-weight: bold;
        }

        .close:hover,
        .close:focus {
            color: black;
            text-decoration: none;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="row1">
            <!-- Content for the upper left section goes here -->
            <div class="upper-section section">
                <h2 style="text-align: center; font-family: 'Arial', sans-serif;"><u>UPLOAD SUPRESSION SECTION</u></h2>
                <div style="text-align: left; margin-left:20px">
                    <b>Choose Offer :</b> <select id="offer" name="offer" required>
                    <option value=''>Select Any</option>
                    <?php getOffers(); ?> 
                    </select>
                </div>
                <br>
                <div style="text-align: left; margin-left:20px;">                
                    <b>Vendor Suppression File : </b><span id="fileToUpload" ><button class="supp-upload">Upload File</button></span>
                    <span id="upload-percentage" style="margin-right: 150px; float:right"></span>
                </div>
                <br><br>
                <div style="text-align: center; margin:0 20px">                
                    <button class="save-supp-info" onclick='saveMappingToDb()'>Save Data</button>
                </div>
                <br>
                <div style="text-align: center; margin:0 20px">
                    <span id="mapping_result"></span>
                </div>
            </div>
            <!------------------------------------------------->

            <!-- Content for the upper right section goes here -->
            <div class="upper-section section">
                <h2 style="text-align: center; font-family: 'Arial', sans-serif;"><u>SUPPRESSION SCHEDULER</u></h2>
                <div id = "suppression_scheduler" style="text-align: left; margin-left:20px; width: min-content">
                    <b>Choose Offer :</b> <select id="offer1" name="offer1" required>
                    <option value=''>Select Any</option>
                    <?php getSuppEligibleOffers(); ?> 
                    </select>
                </div>
                <br><br>
                <div style="text-align: center;">
                    <input type="text" id="datafile_name" placeholder="DATAFILE NAME">
                    <input type="text" id="new_datafile_name" placeholder="NEW DATAFILE NAME" style="margin-left: 10px;">
                </div>
                <br>
                <div style="text-align: center;margin:0 20px">
                    <button id="submit-button" onclick="schedule()"> Schedule </button>
                </div>
                <br>
                <div style="text-align: center; margin:0 20px">
                    <span id="queue_result"></span>
                </div>
            </div>
            <!------------------------------------------------->

        </div>
        <div class="row2">

            <!-- Content for the lower left section goes here -->
            <div class="lower-section section">
                <h2 style="text-align: center; font-family: 'Arial', sans-serif;"><u>OFFER WISE SUPPRESSION DETAILS</u><input id="myInput" type="text" placeholder="Search.." style="float:right;margin-right:10px"></h2>
                <div class="tableFixHead_map">
                    <table id="mapping-table">
                        <thead>
                            <tr>
                                <th>Affliate</th>
                                <th>Offer Name</th>
                                <th>Supp File Name</th>
                                <th>Uploaded At</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Table content will go here -->
                            <?php
                                include "include.php";
                                $q = mysql_query("SELECT a.`offer_master_id`, b.`Affiliate`, b.`offer_name`, a.`filename`, a.`upload_at` FROM `suppression_v2`.`offer_supp_file_mapping` AS a , `offer_module`.`offermaster` AS b WHERE b.`sno` = a.`offer_master_id` ORDER BY a.`sno` DESC");
                                while($f = mysql_fetch_array($q)) {
                                    echo "<tr>
                                            <td style='border: 1px solid #ddd; padding: 12px;'>$f[Affiliate]</td>
                                            <td style='border: 1px solid #ddd; padding: 12px;'>$f[offer_name]</td>
                                            <td style='border: 1px solid #ddd; padding: 12px;'>$f[filename]</td>
                                            <td style='border: 1px solid #ddd; padding: 12px;'>$f[upload_at]</td>
                                            <td style='border: 1px solid #ddd; padding: 12px; text-align: center;'><button class='delete-button' onclick='deleteMapping($f[offer_master_id])'>Delete</button></td>
                                        </tr>";
                                }
                                mysql_close($conn);
                            ?>
                            <!-- Add more rows as needed -->
                        </tbody>
                    </table>
                </div>
            </div>
            <!------------------------------------------------->

            <!-- Content for the lower right section goes here -->
            <div class="lower-section section">
                <h2 style="text-align: center; font-family: 'Arial', sans-serif;"><u>SUPPRESSION QUEUE</u><input id="myInput_supp" type="text" placeholder="Search.." style="float:right;margin-right:10px"></h2>
                <div class="tableFixHead_queue">
                    <table id="supp-table">
                        <thead>
                            <tr>
                                <th>Affliate</th>
                                <th>Offer Name</th>
                                <th>New Supp DataFile</th>
                                <th>Status</th>
                                <th>O.C.</th>
                                <th>F.C.</th>
                                <th>S.C.</th>
                                <th>Date Queued</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Table content will go here -->
                            <?php
                                include "include.php";
                                $q = mysql_query("SELECT a.`sno`, b.`Affiliate`, b.`offer_name`, a.`status`, a.`new_filename`, a.`initial_file_count`, a.`final_file_count`, a.`suppressed_file_count`, a.`date_queued` FROM `suppression_v2`.`offer_supp_queue` as a, `offer_module`.`offermaster` as b WHERE a.`offer_master_id` = b.`sno` ORDER BY a.sno DESC");

                                while($f = mysql_fetch_array($q)) {
                                    echo "<tr>
                                            <td style='border: 1px solid #ddd; padding: 12px;'>$f[Affiliate]</td>
                                            <td style='border: 1px solid #ddd; padding: 12px;'>$f[offer_name]</td>
                                            <td style='border: 1px solid #ddd; padding: 12px;'>$f[new_filename]</td>
                                            <td style='border: 1px solid #ddd; padding: 12px;'><b>".constant($f['status'])."</b></td>
                                            <td style='border: 1px solid #ddd; padding: 12px;'>$f[initial_file_count]</td>
                                            <td style='border: 1px solid #ddd; padding: 12px;'>$f[final_file_count]</td>
                                            <td style='border: 1px solid #ddd; padding: 12px;'>$f[suppressed_file_count]</td>
                                            <td style='border: 1px solid #ddd; padding: 12px;'>$f[date_queued]</td>
                                            <td style='border: 1px solid #ddd; padding: 12px; text-align: center;'>";
                                                if(($f['status'] == 0)) {
                                                    echo "<button class='delete-button' onclick='deleteQueue($f[sno])'>Delete</button>";
                                                } else {
                                                    echo "<button class='log-button' onclick='showLog($f[sno])'>Log</button>";
                                                }
                                            echo"</td>
                                        </tr>";
                                }
                                mysql_close($conn);
                            ?>
                            <!-- Add more rows as needed -->
                        </tbody>
                    </table>
                </div>
            </div>
            <!------------------------------------------------->

        </div>
    </div>
    <!-- POP UP MODAL -->
    <div id="reportModal" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <div id="reportContent"></div>
        </div>
    </div>
</body>
</html>
<?php
function getOffers() {
    include "include.php";
    $q = mysql_query("select sno,offer_name,Affiliate from `offer_module`.`offermaster`");
    while($f = mysql_fetch_array($q)) {
        echo "<option value='$f[sno]'>$f[sno] | $f[Affiliate] | $f[offer_name]</option>";
    }
    mysql_close($conn);
}

function getSuppEligibleOffers() {
    include "include.php";
    $q = mysql_query("select a.`sno`,a.`offer_name`,a.`Affiliate` from `offer_module`.`offermaster` as a, `suppression_v2`.`offer_supp_file_mapping` as b where a.`sno` = b.`offer_master_id`");
    while($f = mysql_fetch_array($q)) {
        echo "<option value='$f[sno]'>$f[sno] | $f[Affiliate] | $f[offer_name]</option>";
    }
    mysql_close($conn);
}
?>