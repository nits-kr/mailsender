
 <?php
  include "include.php";

 $query = "SELECT * FROM testids ORDER BY sno ASC";  
 $result = mysql_query($query);  
 ?>  
 <!DOCTYPE html>  
 <html>  
      <head>  
           <title>Testids</title>  
           <meta name="viewport" content="width=device-width, initial-scale=1">
           <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js"></script>  
           <script type="text/javascript" language="javascript" src="https://cdn.datatables.net/1.10.24/js/jquery.dataTables.min.js"></script>
           <script type="text/javascript" language="javascript" src="https://cdn.datatables.net/1.10.24/js/dataTables.bootstrap4.min.js"></script>

           
           <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" />  
           <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js"></script> 

<script>

$(document).ready(function() {

    /*
     * Initialse DataTables, with no sorting on the 'details' column
     */
   var oTable = $('#log').dataTable( {
        "aoColumnDefs": [
            { "bSortable": false, "aTargets": [ 0 ] }
        ],
        "aaSorting": [[1, 'desc']],
                  "sScrollY": "700",
                "bScrollCollapse": true,
                "bPaginate": false,
                "bJQueryUI": true,
                "fnFooterCallback": function ( nRow, aaData, iStart, iEnd, aiDisplay ) {


}



    });   
} );

</script>




<style>

.table>tbody>tr>td, .table>tbody>tr>th, .table>tfoot>tr>td, .table>tfoot>tr>th, .table>thead>tr>td, .table>thead>tr>th {
    padding: 8px;
    line-height: 1.42857143;
    vertical-align: top;
    border-top: 1px solid #ddd;
    font-size: large;
}

body {
    margin: 0;
    padding: 50px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    color: #212529;
    text-align: left;
    background-color: #fff;
}



button, html input[type=button], input[type=reset], input[type=submit] {
    -webkit-appearance: button;
    cursor: pointer;
    width: 30%;
    height: 30px;
}

.table {
    width: 100%;
    max-width: 100%;
    margin-bottom: 0px;
}


div.dataTables_wrapper div.dataTables_filter label {
    font-weight: bold;
    white-space: nowrap;
    text-align: left;
    color: red;
}


.table thead th {
    vertical-align: bottom;
    border-bottom: 2px solid #dee2e6;
    text-align: center;
    background-color: #60D6FF;
}

.table-responsive {
    overflow-x: visible;
}


.mainbox {
    padding: 20px;
    height: auto;
    width: auto;
    margin-top: 10px;
    margin: -20px;
    text-align: center;
    -webkit-box-shadow: 3px 4px 23px -4px rgb(0 0 0 / 48%);
    -moz-box-shadow: 3px 4px 23px -4px rgba(0,0,0,0.48);
    box-shadow: 3px 4px 23px -4px rgb(0 0 0 / 48%);
}

.btn-restart {
    color: #fff;
    background-color: #ffb651;
    border-color: #ffb651;
}

</style>






           
      </head>  
      <body>  
           <br /><br />  
     <div class="mainbox">
                <h3 align="center">Test Ids Managment portal</h3>  
                <br />  
                <div>  
                     <div align="right">  
                          <button type="button" name="add" id="add" data-toggle="modal" data-target="#add_data_Modal" style="width:6%;" class="btn btn-warning">Add</button>  
                     </div>  
                     <br />  
                     <br /> <br /> 
                     <div class="mainbox" id="employee_table">  
                          <table id="log" class="table table-striped table-bordered" style="width:50%">  
                          <thead>
                               <tr>  
                                    <th width="10%">sno</th> 
                                    <th width="25%">Email</th>  
                                    <th width="25%">Domain</th> 
                                    <th width="10%">Status</th> 
                                    <!-- <th width="7%">Screen</th>   -->
                                    <th width="7%">Edit</th>  
                                    <th width="7%">View</th>  
                                    <th width="7%">Delete</th>  
                               </tr>

                              </thead>
                              <tbody>
                          <?php 
                               while($row = mysql_fetch_array($result))  
                               {  
                                   if($row["status"] == 'A') {
                                        $status = '<font color="green"><b>ACTIVE</b></font>';
                                   } else { 
                                       $status = '<font color="red"><b>Deactive</b></font>';
                                   }
                    
                               ?>  
                               <tr>  
                                    <td><?php echo $row["sno"]; ?></td>  
                                    <td><?php echo $row["email"]; ?></td>  
                                    <td><?php echo $row["domain"]; ?></td>  
                                    <td><?php echo $status ; ?></td> 

                                    <!-- <td>  -->
                                    <!-- <form action='restart.php' method='post'>  <input type='hidden' value="<?php echo $row["sno"]; ?>" name='employee_id'><input type="submit" name="restart" value="Screen" style="width:55%;" class="btn btn-restart btn-xs restart_data" /> </form></td>  -->
                                    <td><input type="button" name="edit" value="Edit" id="<?php echo $row["sno"]; ?>" style="width:55%;" class="btn btn-success btn-xs edit_data" /></td>  
                                    <td><input type="button" name="view" value="view" id="<?php echo $row["sno"]; ?>" style="width:55%;" class="btn btn-info btn-xs view_data" /></td>  
                                    <td><input type="button" name="delete" value="Delete" id="<?php echo $row["sno"]; ?>"  style="width:55%;" class="btn btn-danger btn-xs delete_data" /></td>  
                               </tr>  
                               <?php  
                               }  
                               ?>  
                               </tbody>
                          </table>  
                     </div>  
                </div>  
           </div>  
      </body>  
 </html>  
 <div id="dataModal" class="modal fade">  
      <div class="modal-dialog">  
           <div class="modal-content">  
                <div class="modal-header">  
                     <button type="button" class="close" data-dismiss="modal">&times;</button>  
                     <h4 class="modal-title">Test Ids Details</h4>  
                </div>  
                <div class="modal-body" id="employee_detail">  
                </div>  
                <div class="modal-footer">  
                     <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>  
                </div>  
           </div>  
      </div>  
 </div>  
 <div id="add_data_Modal" class="modal fade">  
      <div class="modal-dialog">  
           <div class="modal-content">  
                <div class="modal-header">  
                     <button type="button" class="close" data-dismiss="modal">&times;</button>  
                     <h4 class="modal-title">Test Ids Portal</h4>  
                </div>  
                <div class="modal-body">  
                     <form method="post" id="insert_form">  
                          <label>Enter Domain</label>  
                          <input type="text" name="domain" id="domain" class="form-control" />  
                          <br />  
                          <label>Enter Email Id </label>  
                          <input type="text" name="email" id="email" class="form-control" />  
                          <br />  
                          <label>Select Password</label>  
                          <input type="text" name="password" id="password" class="form-control" />  
                          <br />  
                          <label>Enter Hostname For Inbox </label>    
                          <input type="text" name="inboxhostname" id="inboxhostname" class="form-control" />  
                          <br />  
                          <label>Enter Hostname For Spam </label>    
                          <input type="text" name="spamhostname" id="spamhostname" class="form-control" />  
                          <br />  
                          <label>Enter Port </label>    
                          <input type="text" name="port" id="port" class="form-control" />  
                          <br /> 
                          <label>Enter Status</label>  
                          <select name="status" id="status" class="form-control" >
                              <option value='A'>Active</option> 
                              <option value='D'>Deactive</option> 
                              </select>
                          <br /> 
                          <br /> 
                          <input type="hidden" name="employee_id" id="employee_id" /> 
                          <input type="submit" name="insert" id="insert" style="width:26%;"  value="Insert" class="btn btn-success" />  
                     </form>  
                </div>  
                <div class="modal-footer">  
                     <button type="button" sizeclass="btn btn-default" style="width:26%;" data-dismiss="modal">Close</button>  
                </div>  
           </div>  
      </div>  
</div>  
 <script>  
 $(document).ready(function(){  
      $('#add').click(function(){  
           $('#insert').val("Insert");  
           $('#insert_form')[0].reset();  
      });  
      $(document).on('click', '.edit_data', function(){  
           var employee_id = $(this).attr("id");  
           $.ajax({  
                url:"fetch.php",  
                method:"POST",  
                data:{employee_id:employee_id},  
                dataType:"json",  
                success:function(data){  
                     $('#domain').val(data.domain);  
                     $('#email').val(data.email);  
                     $('#password').val(data.password);  
                     $('#inboxhostname').val(data.inboxhostname);  
                     $('#spamhostname').val(data.spamhostname);  
                     $('#status').val(data.status);  
                     $('#port').val(data.port);  
                     $('#employee_id').val(data.sno);  
                     $('#insert').val("Update");  
                     $('#add_data_Modal').modal('show');  
                }  
           });  
      });  
      $('#insert_form').on("submit", function(event){  
           event.preventDefault();  
           if($('#domain').val() == "")  
           {  
                alert("Domain is required");  
           }  
           else if($('#email').val() == '')  
           {  
                alert("Email-ID is required");  
           }  
           else if($('#password').val() == '')  
           {  
                alert("password is required");  
           }  
           else if($('#inboxhostname').val() == '')  
           {  
                alert("Inbox Hostname is required");  
           }  
           else if($('#spamhostname').val() == '')  
           {  
                alert("Spam Hostname is required");  
           }  
           else if($('#status').val() == '')  
           {  
                alert("Status is required");  
           }  
           else  
           {  
                $.ajax({  
                     url:"insert.php",  
                     method:"POST",  
                     data:$('#insert_form').serialize(),  
                     beforeSend:function(){  
                          $('#insert').val("Inserting");  
                     },  
                     success:function(data){  
                          $('#insert_form')[0].reset();  
                          $('#add_data_Modal').modal('hide');  
                          $('#employee_table').html(data);  
                     }  
                });  
           }  
      });  
      $(document).on('click', '.view_data', function(){  
           var employee_id = $(this).attr("id");  
           if(employee_id != '')  
           {  
                $.ajax({  
                     url:"select.php",  
                     method:"POST",  
                     data:{employee_id:employee_id},  
                     success:function(data){  
                          $('#employee_detail').html(data);  
                          $('#dataModal').modal('show');  
                     }  
                });  
           }            
      });  
 }); 

     $(document).on('click', '.delete_data', function(){  
           var employee_id = $(this).attr("id");  
           if(employee_id != '')  
           {  
                $.ajax({  
                     url:"delete.php",  
                     method:"POST",  
                     data:{employee_id:employee_id},  
                     success:function(data){  
                         location.reload(true);
                         //alert(data);  
                     }  
                });  
           }            
     });  

 </script>