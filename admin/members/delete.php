<?php  
  include "include.php";
  
 if(isset($_POST["employee_id"]))  
 {  
      $query = "delete FROM users WHERE id = '".$_POST["employee_id"]."'";  
      $result = mysqli_query($connect, $query);  
      echo $message = 'Data Deleted';  

 }  

 
 ?>
 