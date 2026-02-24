<?php
error_reporting(0);
header("Access-Control-Allow-Origin: *");
date_default_timezone_set("EST");
 include "/var/www/html/admin/include.php";
$mainip=$_SERVER['HTTP_HOST'];

$date = date("Y-m-d H:i:s");
session_start();

      if(!isset($_SESSION['username'])) // If session is not set then redirect to Login Page
       {
           header("Location:login.php?action=session+logged+out");
       }

$sid = $_SESSION['id'];


?>






<html>


<head>
<title> Open tracking Generate</title>
<!-- Latest compiled and minified CSS -->
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">

<!-- Optional theme -->
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css" integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp" crossorigin="anonymous">

<!-- Latest compiled and minified JavaScript -->
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>





<meta name="viewport" content="width=device-width, initial-scale=1.0" >
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.0/js/bootstrap.min.js"></script>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>
<script src= "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js"> </script>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>

<meta name="viewport" content="width=device-width, initial-scale=1">
<script src="http://code.jquery.com/ui/1.10.3/jquery-ui.js"></script>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />








<style>
input[type=text], select, textarea {
    padding: 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    resize: vertical;
margin:2px;
width: -webkit-fill-available;
}
input[type=submit] {
    background-color: #04AA6D;
    color: white;
    padding: 12px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    float: center;
    font-weight: bold;
}


#main {
-webkit-box-shadow: 6px 3px 80px 9px rgba(102,102,102,0.37);
-moz-box-shadow: 6px 3px 80px 9px rgba(102,102,102,0.37);
box-shadow: 6px 3px 80px 9px rgba(102,102,102,0.37);
padding: 15px;
margin-top: 25px;
    margin-right: 225px;
    margin-bottom: 225px;
    margin-left: 225px;
}

td {
font-weight: bold;
margin: 2px;
text-align: center;
}

h4 {
        font-weight: bold;


}

</style>




<script type="text/javascript" >
                           function addserver() {
                                $("#delresult").html('<img align="center" src="hourglass.gif" height=30 width=30> <font color = "red" ><b> PROCESSING... PLEASE WAIT..! </b> </font>');
                            var data = $("#addaccount").serialize();
                           // alert(server);
                             $.ajax({
                              type: "POST",
                              url: 'offer_add_action.php',
                              data: data,
                              success: function(data) {
           $("#delresult").html(data);
          //  $("#display").load("server_insert2.php #display");                             

                              }
                            });         
                        }
</script>


</head>

<body>

<center>
<div id='main'>
<br><h1><b> ADD OFFER </b></h1><hr><br>

<div class="pd-20 bg-white border-radius-4 box-shadow mb-30">
                                <h2 class="h4 mb-20" style='color:red' ><b>Add New Offer Details</b></h2> <br><br>
                                     
                                <details>
                                <summary role="button" class="btn-primary" style="background:#42d838;border-radius:4px;height: auto;width: 250px;text-align: center;margin: 5px;padding: 5px;"><b><font>ADD</font></b></summary>
                                <br><br>
                                <form id='addaccount' role="form" class="form-horizontal"  action="javascript:addserver();" > 

                <div class="row" style="padding-left: 15%;padding-right: 15%;">

                <table border="0"  style="width: 90%">
			<tbody>
				<tr>
					<td>
						<h4>Affilate</h4>   
					</td>
					<td>
						<select class="selectpicker form-control col-12" data-style="btn-outline-primary" data-size="5" tabindex="-98"  name="affiliate" >
                                                                                                <option value="" selected>Choose...</option>
                                                                                                <option value="INSTAR">INSTAR</option>
                                                                                                <option value="W04">W04</option>
                                                                                                <option value="ZAPPIAN">ZAPPIAN</option>
                                                                                        </select>
					</td>
				</tr>
				<tr>
					<td>
						  <h4>Offfer ID</h4> </td>
					<td>
						<input type="text" class="form-control" name="offerid" ></td>
				</tr>
				<tr>
					<td>
						 <h4>Payout</h4> </td>
					<td>
						  <input type="text" class="form-control" name="payout" >
					
					</td>
				</tr>
				<tr>
					<td>
						<h4>Offer Name</h4> </td>
					<td>
					 <input type="text" class="form-control" name="offername" > 
					 </td>
				</tr>
				<tr>
					<td>
						  <h4>Date Added</h4> </td>
					<td>
						    <input type="date" class="form-control" name="lastsuppdate" > 
							</td>
				</tr>
				<tr>
					<td>
						  <h4>Traffic Type</h4>  </td>
					<td>
						 <select class="selectpicker form-control col-12" data-style="btn-outline-primary" data-size="5" tabindex="-98" name="cap" >
                                                                                                <option value="0" selected>Choose...</option>
                                                                                                <option value="CPA">CPA</option>
                                                                                                <option value="CPC">CPC</option>
                                                                                                <option value="CPM">CPM</option>
                                                                                                <option value="CPS">CPS</option>
                                                                                        </select>
																						</td>
				</tr>
				<tr>
					<td>
						 <h4>Expiry Date</h4>  </td>
					<td>
						  <input type="date" class="form-control" name="expdate" >
					</td>
				</tr>
				<tr>
					<td>
						   <h4>Offer Link</h4>  </td>
					<td>
						<input type="text" class="form-control" name="offerlink" > </td>
				</tr>
				<tr>
					<td>
						 <h4>Unsubscribe link</h4> </td>
					<td>
					       <input type="text" class="form-control" name="unslink" >
					</td>
				</tr>
				<tr>
					<td>
						 <h4>Preview Link</h4> </td>
					<td>
					       <input type="text" class="form-control" name="prelink" >
					</td>
				</tr>
				<tr>
					<td>
						 <h4>Category</h4></td>
					<td>
						<input type="text" class="form-control" name="trtype" >
					</td>
				</tr>
				<tr>
					<td>
						<h4>Status</h4> </td>
					<td>
						<select class="selectpicker form-control col-12" data-style="btn-outline-primary" data-size="5" tabindex="-98" name="suppstatus" >
                                                                                                <option value="" selected>Choose...</option>
                                                                                                <option value="1">YES</option>
                                                                                                <option value="2">NO</option>
                                                                                        </select>
					</td>
				</tr>
				<tr>
					<td>
						<h4>Subject Lines</h4> </td>
					<td>
					       <textarea  class="form-control" name="sub_lines" rows="10" ></textarea>
					</td>
				</tr>
				<tr>
					<td>
						  <h4>From Names</h4> </td>
					<td>
						<textarea  class="form-control" name="from_names" rows="10"  ></textarea>
					</td>
				</tr>
				<tr>
					<td>
						   <h4>Comments</h4>  </td>
					<td>
						<textarea  class="form-control" name="comments" ></textarea>
					</td>
				</tr>
				<tr>
					<td>
					  <h4>Short Name</h4> </td>
					<td>
						       <input type="text" class="form-control" name="srt" >  
					</td>
				</tr>
				<tr>
					<td>
					<h4>Sensitivity</h4> </td>
					<td>
						<select class="selectpicker form-control col-12" data-style="btn-outline-primary" data-size="5" tabindex="-98" name="sensitivity" >
                                                                                                <option value="1" selected>Choose...</option>
                                                                                                <option value="1">YES</option>
                                                                                                <option value="2">NO</option>
                                                                                        </select>
					</td>
				</tr>
			</tbody>
		</table>

<br><br>


                          <div class='row center'> 
                                                            <div class="col-md-4 col-sm-4"></div>
                                                                        <div class="col-md-3 col-sm-3">
                                                                                <div class="form-group">
                                                                                        <label></label>
                                                                                              <div class="btn-list">
                                                                                                  <input type="submit" value='ADD' class="btn btn-success btn-lg btn-block">
                                                   </div>
                                                                                </div>
                                     </div>
                                                                 <div class="col-md-4 col-sm-4"></div>
                                                  </div>
                                                           

                                </div>
                                <form>
</div>


                        <div class="footer-wrap pd-20 mb-20 card-box">


                        <div class="delresult" id="delresult"> </div>

                        </div>
  
       



         </div>

                 </details>
        </div>





<div>
    <p align='left'>  <?php echo $result; ?> </p>

</div>
</body>
</html>
