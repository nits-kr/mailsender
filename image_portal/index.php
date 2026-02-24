<?php include "../Offer_portal/session.php";?>
<html>
<head>
<title>IMAGE UP PORTAL</title>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>
<script type="text/JavaScript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
<script type="text/JavaScript" src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.11.2/jquery-ui.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/plupload/3.1.5/plupload.full.min.js"></script>

<script>
function get_data()
{
    //validation Domain
    var domain = document.getElementById("domain").value;
    if(domain == '')
    {
        document.getElementById("result").innerHTML = "<font color=red>Domain Needed..!</font>";
        jQuery("#domain").focus();
        return;
    }
    var dom = btoa(domain);

    //validation Pattern
    var pattern = document.getElementById("pattern").value;
    if(pattern == '')
    {
        document.getElementById("result").innerHTML = "<font color=red>Pattern Needed..!</font>";
        jQuery("#pattern").focus();
        return;
    }
    var patt = btoa(pattern);

    //validation File
    var get_progress_string = document.getElementById("progress").innerHTML;
    if(get_progress_string == '')
    {
        document.getElementById("result").innerHTML = "<font color=red>Select File..!</font>";
        return;
    }

     //validation percentage
    const get_progress_array_one = get_progress_string.split("<strong>");
    const get_progress_array_two = get_progress_array_one[1].split("</strong>");
    var percent_upload = get_progress_array_two[0];
    
    if(percent_upload != '100%')
    {
        document.getElementById("result").innerHTML = "<font color=red>Wait for 100% Upload</font>";
        return;
    }

    var get_file_string = document.getElementById("progress").innerHTML;
    const get_file_array_one = get_file_string.split('">');
    const get_file_array_two = get_file_array_one[1].split(" (");
    var filename = btoa(get_file_array_two[0]);

    $.ajax({
            type: 'post',
            url: 'upload_action.php',
            data: 'domain='+dom+'&patt='+patt+'&img='+filename,
            success: function (data) {
                document.getElementById('result').innerHTML = data;
            }
        });
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
            url : "img_uploader.php",
            chunk_size : "3mb",
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
<style>
textarea{
    margin: 0px;
    height: 453px;
    width: 635px;
}
</style>

</head>
<body>
    
<div class="panel panel-primary" style="width: 95%;margin-left: 2.5%;margin-right: 2.5%;">
    <div class="panel-heading">
        <center><h2><font style="font-family: 'Lucida Console', Courier, monospace;">IMAGE UPLOAD PORTAL (Sentora)</font></h2></center>
    </div>
    <div class="panel-body">
            <!-------------------------------------------------------------------1st row----------------------------------------------------->  
            <div class="form-row">
                <div class="form-group col-md-12">
                <label >Domain</label>
                    
                        <input type="text" class="form-control" id="domain" name="domain" placeholder='http://domain.com' required>
                </div>
            </div>
            <br>

            <!-------------------------------------------------------------------2nd row----------------------------------------------------->  
            <div class="form-row">
                <div class="form-group col-md-6">
                <label for="inputPassword4">Pattern</label>
                    <input type="text" class="form-control" id="pattern" name="pattern" placeholder='/pattern/of/the/link/' required>
                </div>
                <div class="form-group col-md-6">
                <label for="inputPassword4">Select Image</label>
                    <!-- <input type="text" class="form-control" id="pattern" name="pattern" placeholder='/pattern/of/the/link/' required> -->
                    <span class="form-control" id="fileToUpload" ><button>Choose</button></span>&nbsp&nbsp&nbsp<span id='progress'></span>
                </div>
            </div>
            <br>
            </div>
        <center><button onclick="get_data()" class="btn btn-primary"> UPLOAD </button><br><br><br><div id='result'></div></center>
    </div>
</div>
</body>
</html>