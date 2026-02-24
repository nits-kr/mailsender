<?php 
include "session.php";
include "include.php";

?>
<html>
<head>
<title>Data Insert Portal</title>
<script type="text/JavaScript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
<script type="text/JavaScript" src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.11.2/jquery-ui.min.js"></script>
<script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/1.11.3/js/jquery.dataTables.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/plupload/3.1.5/plupload.full.min.js"></script>
<style>
textarea{
    margin: 0px;
    height: 453px;
    width: 635px;
}
</style>
<script>
function loadlink(){
    $("#view").load(location.href + " #view");
}
 
loadlink(); // This will run on page load
setInterval(function(){
    loadlink() // this will run after every 5 seconds
}, 10000);
</script>

<!-- SELECT SCRIPT -->
<script>
    $(document).ready(function() {
        document.getElementById("fromdesktop").style.display = "block"; 
        document.getElementById("fromserver").style.display = "none"; 
    });

    function update(x)
    {
        if(x == 'Server')
        {
            document.getElementById("fromdesktop").style.display = "none"; 
            document.getElementById("fromserver").style.display = "Block";
        }
        else
        {
            document.getElementById("fromdesktop").style.display = "block"; 
        document.getElementById("fromserver").style.display = "none"; 
        }
    }
</script>

<!-- UPLOAD SCRIPT -->
<script>
    window.addEventListener("load", function()
    {
        var uploader = new plupload.Uploader(
        {
            runtimes : "html5,html4",
            browse_button : "fileToUpload",
            url : "supp_uploader.php",
            chunk_size : "11mb",
            init: {
                PostInit: function()
                {
                    document.getElementById("progress").innerHTML = "";
                },

                FilesAdded: function(up, files)
                {
                    plupload.each(files, function(file) 
                    {
                        document.getElementById("progress").innerHTML += `<div id="${file.id}">${file.name} (${plupload.formatSize(file.size)}) - <strong>0%</strong></div>`;
                    });
                    uploader.start();
                },

                UploadProgress: function(up, file)
                {
                    document.querySelector(`#${file.id} strong`).innerHTML = `${file.percent}%`;
                },

                Error: function(up, err)
                {
                    console.log(err);
                }
            }
        });
        uploader.init();
    })
</script>

<!-- AJAX SCRIPT -->
<script>
function insert()
{
    //validation filename to set
    var filename_to_upload = document.getElementById("filename").value;
    if(filename_to_upload == '')
    {
        alert("Filename Needed..!");
        return;
    }

    //validation File
    var get_file_string = document.getElementById("progress").innerHTML;
    if(get_file_string == '')
    {
        alert("Upload Needed..!");
        return;
    }

    //validation percentage
    const get_progress_array_one = get_file_string.split("<strong>");
    const get_progress_array_two = get_progress_array_one[1].split("</strong>");
    var percent_upload = get_progress_array_two[0];
    
    if(percent_upload != '100%')
    {
        alert("Wait for 100% Upload");
        return;
    }

    const get_file_array_one = get_file_string.split('">');
    const get_file_array_two = get_file_array_one[1].split(" (");
    var filename = get_file_array_two[0];
    
    var mode = jQuery("input[name='toselect']:checked").val();

    //upload script
    $.ajax({
          type: 'post',
          url: 'insert_data_action_scheduler.php',
          data: "filename_to_upload="+filename_to_upload+"&filename="+filename+"&mode="+mode,
          success: function (data) {
              document.getElementById('result').innerHTML = data;
          }
        });
}

function insert_another()
{
    //validation filename to set
    var filename_to_upload = document.getElementById("filename").value;
    if(filename_to_upload == '')
    {
        alert("Filename Needed..!");
        return;
    }

    //fileToUploadserver validation
    var filename = document.getElementById("fileToUploadserver").value;
    if(filename == '')
    {
        alert("Upload Filename Needed..!");
        return;
    }

    var mode = jQuery("input[name='toselect']:checked").val();

    //upload script
    $.ajax({
          type: 'post',
          url: 'insert_data_action_scheduler.php',
          data: "filename_to_upload="+filename_to_upload+"&filename="+filename+"&mode="+mode,
          success: function (data) {
              document.getElementById('result').innerHTML = data;
          }
        });
}
</script>

</head>
<body>
<center>
    <h2>Data Insert Portal</h2>
    <hr>
    <!-- <form id='myform' action="insert_data_action.php" method="POST" enctype="multipart/form-data"> -->
    File Name To Dispay :- <input type="text" id="filename" name="filename" placeholder='Name' required><br><br>
    <input type='radio' id='toselect' name = 'toselect' value='Desktop' checked onchange='update(this.value)'> Desktop
    <!-- <input type='radio' id='toselect' name = 'toselect' value='Server' onchange='update(this.value)'> Server -->

    <br><br>
    <div id='fromdesktop'>
        <!-- File Upload :- <input type="file" name="fileToUploadDesktop" id="fileToUploadDesktop"> -->
        <div id="container">
            File Upload :- <span id="fileToUpload" ><button>Choose</button></span>
        </div>
        <br>
        <div id="container">
            Upload Progress :- <span id='progress'></span>
        </div>
        </br></br>
        <button onclick = "insert()"> Insert Into DB</button>
    </div>

    <div id='fromserver'>
        File Upload :- <input type="text" name="fileToUploadserver" id="fileToUploadserver">
        </br></br>
        <button onclick = "insert_another()"> Insert Into DB</button>
    </div>

    </br></br>
    <div id='result'></div>
    <div id='view' style='background: cadetblue;'>
    <iframe src='http://173.249.50.153/Data_Download/iframe_main_data.php' style="height: 100%;width: -webkit-fill-available;"></iframe>
    </div>
</center>
</body>
</html>
<?php mysql_close($conn);?>