<?php 
include "include1.php"; 
$empOptions = NULL;

// CHECK FOR PAGE ACCESS
$data = mysql_fetch_array(mysql_query("SELECT `emp_id` FROM `login`.`role_mapped` where `role_mapped`.`role` = 'LOGIN ROLE MAPPING'"), MYSQL_ASSOC);
$allowesEMP = explode(',', $data['emp_id']); // Assuming emp_id is a comma-separated string
if(!in_array(trim($_SESSION['id']), $allowesEMP)) {
    echo "<font color=red>Not Allowed..!</font>";exit;
}

// Fetch all users
$users = [];
$emp_id_object = mysql_query("SELECT `id`, `name` FROM `login`.`users`");
while($empid = mysql_fetch_array($emp_id_object, MYSQL_ASSOC)) {
    $users[] = $empid;
}

// Fetch role mappings
$data = mysql_query("SELECT * FROM `login`.`role_mapped`");

function getOptions($users, $selectedEmpIds) {
    $options = '';
    foreach ($users as $user) {
        $selected = in_array($user['id'], $selectedEmpIds) ? 'selected' : '';
        $options .= "<option value='{$user['id']}' $selected>{$user['name']}</option>";
    }
    return $options;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Roles and Permissions</title>
    <script type="text/JavaScript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
    <script type="text/JavaScript" src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.11.2/jquery-ui.min.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />
    <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
    <script>
    $(document).ready(function() {
        $('.type').select2();
    });

    function update(selectElement) {
        var roleId = selectElement.id;
        var emp_selected = $("#" + selectElement.id).val();
        $.ajax({
          type: 'post',
          url: 'updateRole.php',
          data: "roleId=" + roleId + "&empid=" + emp_selected,
          success: function (data) {
             alert(data);
          }
        });
    }
    </script>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            background-color: #f0f0f0;
            margin: 0;
            padding: 20px;
        }

        h2 {
            text-align: center;
            margin-bottom: 20px;
            background-color: #4CAF50;
            color: white;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            background-color: #fff;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        th, td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: center;
        }

        th {
            background-color: #f2f2f2;
        }

        td {
            background-color: #fff;
        }

        select {
            width: 100%;
            height: 120px;
            padding: 5px;
            box-sizing: border-box;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
        }
    </style>
</head>
<body>

<h2>User Roles and Permissions</h2>

<table>
    <thead>
        <tr>
            <th>S.No</th>
            <th>Roles</th>
            <th>Allowed Users</th>
        </tr>
    </thead>
    <tbody>
        <?php
        while ($details = mysql_fetch_array($data, MYSQL_ASSOC)) {
            $selectedEmpIds = explode(',', $details['emp_id']); // Assuming emp_id is a comma-separated string
            $options = getOptions($users, $selectedEmpIds);
            echo "<tr>
                    <td>{$details['sno']}</td>
                    <td>{$details['role']}</td>
                    <td>
                        <select class='type' name='{$details['sno']}[]' id='{$details['sno']}' multiple='multiple' style='width: 75%' onchange='update(this)'>
                            $options
                        </select>
                    </td>
                </tr>";
        }
        ?>
    </tbody>
</table>
<?php
mysql_close($connect);
?>
</body>
</html>
