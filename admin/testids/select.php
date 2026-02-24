
  <?php  


 if(isset($_POST["employee_id"]))  
 {  
      $output = '';  
      include "include.php";

      $query = "SELECT * FROM testids WHERE sno = '".$_POST["employee_id"]."'";  
      $result = mysql_query( $query);  
      $output .= '  
      <div >  
      <table id="log" class="table table-striped table-bordered" style="width:100%">  ';
      while($row = mysql_fetch_array($result))  
      {  
           if($row["status"] == 'A') {
                $status = '<font color="green">ACTIVE</font>';
           } else { 
               $status = '<font color="red">Deactive</font>';
           }

           $output .= '  
                <tr>  
                     <td width="30%"><label>Domain</label></td>  
                     <td width="70%">'.$row["domain"].'</td>  
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
                <td width="30%"><label>Inbox hostname</label></td>  
                <td width="70%">'.$row["inboxhostname"].'</td>  
                </tr> 
               <tr>  
           <td width="30%"><label>Spam hostname</label></td>  
           <td width="70%">'.$row["spamhostname"].'</td>  
                 </tr> 
                <tr>  
                     <td width="30%"><label>Port</label></td>  
                     <td width="70%">'.$row["port"].'</td>  
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
 