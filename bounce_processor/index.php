<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bounce Update Portal</title>
    <script type="text/JavaScript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
    <script type="text/JavaScript" src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.11.2/jquery-ui.min.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />
    <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script> 
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }

        .container {
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        h1 {
            text-align: center;
            color: #333;
        }

        form {
            margin-top: 20px;
        }

        label {
            display: block;
            margin-bottom: 8px;
            color: #555;
        }

        input[type="date"],
        select,
        textarea {
            width: 100%;
            padding: 10px;
            margin-bottom: 20px;
            border: 1px solid #ccc;
            border-radius: 5px;
            box-sizing: border-box;
            resize: vertical; /* Allow vertical resizing */
        }

        .get_info {
            background-color: #4CAF50;
            color: white;
            padding: 12px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            width: 100%;
        }
        .get_info:hover {
            background-color: #45a049;
        }
    </style>
    <script>
        // Offer Select box
        $(document).ready(function() {
            $('#selectServer').select2();
        });

        // Fetch
        function fetchBounce() {
            // Validation Date
            var get_date = document.getElementById("selectDate").value;
            if(get_date == ''){
                alert("Choose Date...!");
                return;
            }

            //validation Server
            var get_server = document.getElementById("selectServer").value;
            if(get_server == ''){
                alert("Choose Server...!");
                return;
            }

            document.getElementById('response').innerHTML = 'Processing..!';
            $.ajax({
                type: 'post',
                url: 'get_data.php',
                data: "server="+get_server+"&date="+get_date,
                success: function (data) {
                    var m = data.split("|");
                    document.getElementById('message').value = m[1];
                    document.getElementById('response').innerHTML = m[0];
                }
            });
        }
    </script>
</head>
<body>
    <div class="container">
        <h1>Bounce Fetch Portal</h1>
        <label for="selectDate">Select Date:</label>
        <input type="date" id="selectDate" name="selectDate">

        <label for="selectServer">Select Server:</label>
        <select id="selectServer" name="selectServer">
        <option value="">Select Server</option>
        <?php
            include "../admin/include.php";
            $q = mysql_query("select `mumara`.`server` from `svml`.`mumara` group by `mumara`.`server`") or die (mysql_error());
            while($f = mysql_fetch_array($q)) {
                echo "<option value='$f[0]'>$f[0]</option>";
            }
            mysql_close($link);
            mysql_close($rds);
            mysql_close($loginrds);
        ?>
        </select>
        <br><br>
        <button class="get_info" onclick='fetchBounce()'>Get Bounce</button>
        <br><br>
        <label for="message">Response:&nbsp&nbsp&nbsp<span id="response">dsfsdf</span></label>
        <textarea id="message" name="message" rows="18" required></textarea>

    </div>
</body>
</html>
