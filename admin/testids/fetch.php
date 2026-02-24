<?php  
  include "include.php";
  
 if(isset($_POST["employee_id"]))  
 {  
      $query = "SELECT * FROM testids WHERE sno = '".$_POST["employee_id"]."'";  
      $result = mysql_query( $query);  
      $row = mysql_fetch_array($result);  
      echo json_encode($row);  
 }  



 ?>
 