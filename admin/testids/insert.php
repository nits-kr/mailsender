
  <?php  
  include "include.php";
  date_default_timezone_set("EST");
  

 if(!empty($_POST))  
 {  
      $output = '';  
      $message = '';  
      $date = date('Y-m-d H:i:s') ; 
      $domain = mysql_real_escape_string($_POST["domain"]);  
      $email = mysql_real_escape_string($_POST["email"]);  
      $password = mysql_real_escape_string($_POST["password"]);  
      $inboxhostname = mysql_real_escape_string($_POST["inboxhostname"]);  
      $spamhostname = mysql_real_escape_string($_POST["spamhostname"]);  
      $port = mysql_real_escape_string($_POST["port"]);  
      $status = mysql_real_escape_string($_POST["status"]);  
      
      $dataemail = explode('@',$email);
      $dataemails = str_replace('_','',trim($dataemail[0]));
      $dataemails = str_replace('.','',$dataemails);
      $dataemails = str_replace('-','',$dataemails);
      $filenameinbox = $domain."_".$dataemails."_INBOX.php";
      $filenamespam = $domain."_".$dataemails."_SPAM.php";

      if($_POST["employee_id"] != '')  
      {  
           $query = "  
           UPDATE testids   
           SET domain='$domain',   
           email='$email',   
           password='$password',   
           inboxhostname='$inboxhostname',
           spamhostname='$spamhostname',
           port = '$port',   
           status = '$status'   
           WHERE sno ='".$_POST["employee_id"]."'";  
           $message = 'Data Updated';  

      }  
      else  
      {  
           $query = "  
           INSERT INTO testids(`sno`,`domain`, `email`, `password`, `inboxhostname`, `spamhostname`, `port`, `status`,`filenameinbox`,`filenamespam`,`temp3`,`created`)  
           VALUES('','$domain', '$email', '$password','$inboxhostname' ,'$spamhostname' ,'$port', '$status','$filenameinbox','$filenamespam','','$date');  
           ";  
           
           $querytable = " CREATE TABLE `imap_data_new`.`$email` (
               `sno` int(10) NOT NULL AUTO_INCREMENT,
               `subject` varchar(512) NOT NULL,
               `from` varchar(512) NOT NULL,
               `to` varchar(255) NOT NULL,
               `date` varchar(255) NOT NULL,
               `message_id` varchar(255) NOT NULL,
               `uid` varchar(100) NOT NULL,
               `ip` varchar(255) NOT NULL,
               `status` varchar(255) NOT NULL,
               `last_update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
               PRIMARY KEY (`sno`),
               UNIQUE KEY `uid` (`uid`),
               KEY `message_id` (`message_id`)
             ) ENGINE=InnoDB AUTO_INCREMENT=22343 DEFAULT CHARSET=latin1; ";

         $resultss = mysql_query($querytable);  
         $message = 'Data Inserted'; 


      }  
      if(mysql_query($query)) 
      {  
          $idd = mysql_insert_id();

          if($_POST["employee_id"] != '')  
          {  
               $rds_query = "Update esp_admin.test_ids set email='$email' , pwd= '$password' where sno ='".$_POST["employee_id"]."'";
          }
          else
          {
               $rds_query = "insert into esp_admin.test_ids (`sno`,`email`,`pwd`) values ('$idd','$email','$password')";
          }
          $output .= '<label class="text-success">' . $message . '</label>';  
          $select_query = "SELECT * FROM testids ORDER BY sno ASC";  
          $result = mysql_query($select_query);  
          $output .= '  
          <div id="employee_table">  
          <table id="log" class="table table-striped table-bordered" style="width:100%"> 
          <thead>
                    <tr>  
                    <th width="10%">sno</th> 
                    <th width="25%">Email</th>  
                    <th width="25%">Domain</th> 
                    <th width="10%">Status</th> 
                    <th width="10%">Edit</th>  
                    <th width="10%">View</th>  
                    <th width="10%">Delete</th> 
                    </tr>   </thead>  <tbody>
          ';  
          while($row = mysql_fetch_array($result))  
          {  
          if($row["status"] == 'A') {
               $status = '<font color="green"><b>ACTIVE</b></font>';
          } else { 

               $status = '<font color="red"><b>Deactive</b></font>';
          }

               $output .= '  
                    <tr>  
                         <td>' . $row["sno"] . '</td>  
                         <td>' . $row["email"] . '</td>  
                         <td>' . $row["domain"] . '</td>  
                         <td>' .  $status . '</td>  
                         <td><input type="button" name="edit" value="Edit" id="'.$row["id"] .'" class="btn btn-success btn-xs edit_data" /></td>  
                         <td><input type="button" name="view" value="view" id="' . $row["id"] . '" class="btn btn-info btn-xs view_data" /></td>  
                         <td><input type="button" name="delete" value="Delete" id="' . $row["id"] . '" class="btn btn-danger btn-xs delete_data" /></td>  
                    </tr>  
               ';  
          }
          $output .= '  </tbody> </table>';  
     }  
     mysql_close($connect);
     
     //STORE INTO RDS
     #$rds = mysql_connect('gauravdb.czlpyv2rx9vj.us-east-1.rds.amazonaws.com','root','HAqn9SIikfAJcjOINsGS') or mysql_error(); 
     #mysql_select_db('esp_admin', $rds);
     #mysql_query($rds_query) or die ("COULD NOT SAVE INTO RDS -> ".mysql_error($rds));
     #mysql_close($rds);
     echo $output;  
 }  


 ?>
 
