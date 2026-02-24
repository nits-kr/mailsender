<?php  
  include "include.php";
  
 if(isset($_POST["employee_id"]))  
 {  
     $query1 = "SELECT * FROM testids WHERE sno = '".$_POST["employee_id"]."'";  
     $result1 = mysql_query( $query1);  
     $row = mysql_fetch_array($result1);  
    
     $emailid  =  $row['email'] ; 


      $query = "delete FROM testids WHERE sno = '".$_POST["employee_id"]."'";  
      $result = mysql_query( $query);  
      
      $query2 = "drop table `imap_data_new`.`$emailid`";  
      $result2 = mysql_query( $query2);  

      echo $message = 'Data Deleted';

      mysql_close($connect);
 }  

 
 ?>
 