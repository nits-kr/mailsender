
  <?php  


 if(isset($_POST["employee_id"]))  
 {  
      $output = '';  
      include "include.php";

      $query = "SELECT * FROM users WHERE id = '".$_POST["employee_id"]."'";  
      $result = mysqli_query($connect, $query);  
      $output .= '  
      <div >  
      <table id="log" class="table table-striped table-bordered" style="width:100%">  ';
      while($row = mysqli_fetch_array($result))  
      {  
           if($row["status"] == '1') {
                $status = '<font color="green">ACTIVE</font>';
           } else { 
               $status = '<font color="red">Deactive</font>';
           }

           $output .= '  
                <tr>  
                     <td width="30%"><label>Name</label></td>  
                     <td width="70%">'.$row["name"].'</td>  
                </tr>  
                <tr>  
                     <td width="30%"><label>Email Id</label></td>  
                     <td width="70%">'.$row["email"].'</td>  
                </tr>  
                <tr>  
                     <td width="30%"><label>Password</label></td>  
                     <td width="70%">'.$row["password"].'</td>  
                </tr>  
                <tr>  
                     <td width="30%"><label>Designation</label></td>  
                     <td width="70%">'.$row["designation"].'</td>  
                </tr>  
                <tr>  
                     <td width="30%"><label>Status</label></td>  
                     <td width="70%">'.$status.'</td>  
                </tr>  
           ';  
      }  
      $output .= '  
           </table>  
      </div>  
      ';  
      echo $output;  
 }  
 ?>
 