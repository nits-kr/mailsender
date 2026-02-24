
<?php  
 include "include.php";
 if(!empty($_POST))  
 {  
      $output = '';  
      $message = '';  
      $name = mysqli_real_escape_string($connect, $_POST["name"]);  
      $email = mysqli_real_escape_string($connect, $_POST["email"]);  
      $password = mysqli_real_escape_string($connect, $_POST["password"]);  
      $designation = mysqli_real_escape_string($connect, $_POST["designation"]);  
      $status = mysqli_real_escape_string($connect, $_POST["status"]); 
      $header_access =  trim($_POST["Header"]);
      if($_POST["employee_id"] != '')  
      {  
           $query = "  
           UPDATE users   
           SET name='$name',   
           email='$email',   
           password='$password',   
           designation = '$designation',   
           status = '$status',
           header_acces = '$header_access' 
           WHERE id='".$_POST["employee_id"]."'";  
           $message = 'Data Updated';  
      }  
      else  
      {  
           $query = "  
           INSERT INTO users(name, email, password, designation, status, header_acces)  
           VALUES('$name', '$email', '$password', '$designation', '$status', '$header_access');  
           ";  
           $message = 'Data Inserted';  
      }  
     //  echo $query;exit;
      if(mysqli_query($connect, $query))  
      {  
           $output .= '<label class="text-success">' . $message . '</label>';  
           $designation = $_SESSION['designation'];
           $allowed = 'Admin';
           if($designation == $allowed) {
               $select_query = "SELECT * FROM users ORDER BY id DESC"; 
           } else {
               $select_query = "SELECT * FROM users where id = $_SESSION[id]"; 
           }
           $result = mysqli_query($connect, $select_query);  
           $output .= '  
           <div id="employee_table">  
           <table id="log" class="table table-striped table-bordered" style="width:100%"> 
           <thead>
                     <tr>  
                     <th width="25%">Employee Name</th>  
                     <th width="25%">Email Id</th>
                     <th width="10%">Designation</th>  
                     <th width="10%">Status</th> 
                     <th width="10">Edit</th>  
                     <th width="10%">View</th>';  
                     echo ($designation == $allowed)? '<th width="10%">Delete</th>':''; 
          $output .= '</tr>   </thead>  <tbody>
           ';  
           while($row = mysqli_fetch_array($result))  
           {  
               if($row["status"] == '1') {
                    $status = '<font color="green"><b>ACTIVE</b></font>';
               } else { 

                   $status = '<font color="red"><b>Deactive</b></font>';
               }

                $output .= '  
                     <tr>  
                          <td>' . $row["name"] . '</td>  
                          <td>' . $row["email"] . '</td>  
                          <td>' . $row["designation"] . '</td>  
                          <td>' .  $status . '</td>  
                          <td><input type="button" name="edit" value="Edit" id="'.$row["id"] .'" class="btn btn-success btn-xs edit_data" /></td>  
                          <td><input type="button" name="view" value="view" id="' . $row["id"] . '" class="btn btn-info btn-xs view_data" /></td>';
                          echo ($designation == $allowed)? '<td><input type="button" name="delete" value="Delete" id="\' . $row["id"] . \'" class="btn btn-danger btn-xs delete_data" /></td>': '';  
               $output .= '</tr>  
                ';  
           }
           $output .= '  </tbody> </table>';  
      }  
      echo $output;  
 }  
 ?>
 