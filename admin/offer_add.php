<?php


session_start();

if(!isset($_SESSION['username'])) // If session is not set then redirect to Login Page
 {
     header("Location:../login.php?action=session+logged+out");  
 }

$sid = $_SESSION['id'];
?>
<html>
        <head>
<!-- Latest compiled and minified CSS -->
<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css" integrity="sha384-HSMxcRTRxnN+Bdg0JdbxYKrThecOKuH5zCYotlSAcp1+c8xmyTe9GYg1l9a69psu" crossorigin="anonymous">

<!-- Optional theme -->
<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap-theme.min.css" integrity="sha384-6pzBo3FDv/PJ8r2KRkGHifhEocL+1X2rVCTTkUfGk7/0pbek5mMa1upzvWbrUbOZ" crossorigin="anonymous">

<!-- Latest compiled and minified JavaScript -->
<script src="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js" integrity="sha384-aJ21OjlMXNL5UyIl/XNwTMqvzeRMZH2w8c5cRVpzpU8Y5bApTppSuUkhZXN0VxHd" crossorigin="anonymous"></script>        
      </head>


<body>

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

</body>
</html>

        <div class="main-container">
                <div class="pd-ltr-20 xs-pd-20-10">
                        <div class="min-height-200px">
                                <div class="page-header">
                                        <div class="row">
                                                <div class="col-md-6 col-sm-12">
                                                        <div class="title">
                                                                <h4>OFFER </h4>
                                                        </div>
                                                        <nav aria-label="breadcrumb" role="navigation">
                                                                <ol class="breadcrumb">
                                                                        <li class="breadcrumb-item"><a href="index.html">Home</a></li>
                                                                        <li class="breadcrumb-item active" aria-current="page">Offer Add</li>
                                                                </ol>
                                                        </nav>
                                                </div>
                                                <div class="col-md-6 col-sm-12 text-right">
                                                        <!-- <div class="dropdown">
                                                                <a class="btn btn-primary dropdown-toggle" href="#" role="button" data-toggle="dropdown">
                                                                        January 2018
                                                                </a>
                                                                <div class="dropdown-menu dropdown-menu-right">
                                                                        <a class="dropdown-item" href="#">Export List</a>
                                                                        <a class="dropdown-item" href="#">Policies</a>
                                                                        <a class="dropdown-item" href="#">View Assets</a>
                                                                </div>
                                                        </div> -->
                                                </div>
                                        </div>
                                </div>

                                <div class="pd-20 bg-white border-radius-4 box-shadow mb-30">
                                <h2 class="h4 mb-20" style='color:red'>Add New Offer Details</h2> 
                                     
                                <details>
                <summary>ADD</summary>

                                <form id='addaccount' role="form" class="form-horizontal"  action="javascript:addserver();" > 

                <div class="row" style="padding-left: 15%;padding-right: 15%;">

                                                    <div class="col-md-3 col-sm-12">
                                                                                <div class="form-group">
                                                                                        <h4>Affilate</h4>
                                                                                </div>
                                                                         </div>
                                                             <div class="col-md-9 col-sm-12">
                                                                                <div class="form-group">
                                                                                <select class="selectpicker form-control col-12" data-style="btn-outline-primary" data-size="5" tabindex="-98"  name="affiliate" >
                                                                                                <option value="" selected>Choose...</option>
                                                                                                <option value="INSTAR">INSTAR</option>
                                                                                                <option value="W04">W04</option>
                                                                                                <option value="ZAPPIAN">ZAPPIAN</option>
                                                                                        </select>
                                                                                </div>
                                                                        </div>
<br>
                                                                        <div class="col-md-3 col-sm-12">
                                                                                <div class="form-group">
                                                                                      
                                                                                </div>
                                                                         </div>
                                                             <div class="col-md-9 col-sm-12">
                                                                                <div class="form-group">
                                                                                <h4>Offfer ID</h4>  <input type="text" class="form-control" name="offerid" >
                                                                                </div>
                                                                        </div>

<br>
                                                                        <div class="col-md-3 col-sm-12">
                                                                                <div class="form-group">
                                                                                        <h4>Payout</h4>
                                                                                </div>
                                                                         </div>
                                                             <div class="col-md-9 col-sm-12">
                                                                                <div class="form-group">
                                                                                        <input type="text" class="form-control" name="payout" >
                                                                                </div>
                                                                        </div>


                                                                        <div class="col-md-3 col-sm-12">
                                                                                <div class="form-group">
                                                                                        <h4>Offer Name</h4>
                                                                                </div>
                                                                         </div>
                                                             <div class="col-md-9 col-sm-12">
                                                                                <div class="form-group">
                                                                                        <input type="text" class="form-control" name="offername" >
                                                                                </div>
                                                                        </div>




                                                                        <div class="col-md-3 col-sm-12">
                                                                                <div class="form-group">
                                                                                        <h4>Date Added</h4>
                                                                                </div>
                                                                         </div>
                                                             <div class="col-md-9 col-sm-12">
                                                                                <div class="form-group">
                                                                                        <input type="date" class="form-control" name="lastsuppdate" >
                                                                                </div>
                                                                        </div>



                                                                        <div class="col-md-3 col-sm-12">
                                                                                <div class="form-group">
                                                                                        <h4>Traffic Type</h4>
                                                                                </div>
                                                                         </div>
                                                             <div class="col-md-9 col-sm-12">
                                                                                <div class="form-group">
                                                                                <select class="selectpicker form-control col-12" data-style="btn-outline-primary" data-size="5" tabindex="-98" name="cap" >
                                                                                                <option value="0" selected>Choose...</option>
                                                                                                <option value="CPA">CPA</option>
                                                                                                <option value="CPC">CPC</option>
                                                                                                <option value="CPM">CPM</option>
                                                                                                <option value="CPS">CPS</option>
                                                                                        </select>
                                                                                </div>
                                                                        </div>


                                                                        <div class="col-md-3 col-sm-12">
                                                                                <div class="form-group">
                                                                                        <h4>Expiry Date</h4>
                                                                                </div>
                                                                         </div>
                                                             <div class="col-md-9 col-sm-12">
                                                                                <div class="form-group">
                                                                                        <input type="date" class="form-control" name="expdate" >
                                                                                </div>
                                                                        </div>

                                                                        <div class="col-md-3 col-sm-12">
                                                                                <div class="form-group">
                                                                                        <h4>Offer Link</h4>
                                                                                </div>
                                                                         </div>
                                                             <div class="col-md-9 col-sm-12">
                                                                                <div class="form-group">
                                                                                        <input type="text" class="form-control" name="offerlink" >
                                                                                </div>
                                                                        </div>

                                                                        <div class="col-md-3 col-sm-12">
                                                                                <div class="form-group">
                                                                                        <h4>Unsubscribe link</h4>
                                                                                </div>
                                                                         </div>
                                                             <div class="col-md-9 col-sm-12">
                                                                                <div class="form-group">
                                                                                        <input type="text" class="form-control" name="unslink" >
                                                                                </div>
                                                                        </div>

                                                                        <div class="col-md-3 col-sm-12">
                                                                                <div class="form-group">
                                                                                        <h4>Preview Link</h4>
                                                                                </div>
                                                                         </div>
                                                             <div class="col-md-9 col-sm-12">
                                                                                <div class="form-group">
                                                                                        <input type="text" class="form-control" name="prelink" >
                                                                                </div>
                                                                        </div>


                                                                        <div class="col-md-3 col-sm-12">
                                                                                <div class="form-group">
                                                                                        <h4>Category</h4>
                                                                                </div>
                                                                         </div>
                                                             <div class="col-md-9 col-sm-12">
                                                                                <div class="form-group">
                                                                                <input type="text" class="form-control" name="trtype" >
                                                                                </div>
                                                                        </div>








                                                                        <div class="col-md-3 col-sm-12">
                                                                                <div class="form-group">
                                                                                        <h4>Status</h4>
                                                                                </div>
                                                                         </div>
                                                             <div class="col-md-9 col-sm-12">
                                                                                <div class="form-group">
                                                                                <select class="selectpicker form-control col-12" data-style="btn-outline-primary" data-size="5" tabindex="-98" name="suppstatus" >
                                                                                                <option value="" selected>Choose...</option>
                                                                                                <option value="1">YES</option>
                                                                                                <option value="2">NO</option>
                                                                                        </select>
                                                                                </div>
                                                                        </div>



                                                                        <div class="col-md-3 col-sm-12">
                                                                                <div class="form-group">
                                                                                        <h4>Subject Lines</h4>
                                                                                </div>
                                                                         </div>
                                                             <div class="col-md-9 col-sm-12">
                                                                                <div class="form-group">
                                                                                        <textarea  class="form-control" name="sub_lines" ></textarea>
                                                                                </div>
                                                                        </div>


                                                                        <div class="col-md-3 col-sm-12">
                                                                                <div class="form-group">
                                                                                        <h4>From Names</h4>
                                                                                </div>
                                                                         </div>
                                                             <div class="col-md-9 col-sm-12">
                                                                                <div class="form-group">
                                                                                <textarea  class="form-control" name="from_names" ></textarea>
                                                                                </div>
                                                                        </div>

                                                                        <div class="col-md-3 col-sm-12">
                                                                                <div class="form-group">
                                                                                        <h4>Comments</h4>
                                                                                </div>
                                                                         </div>
                                                             <div class="col-md-9 col-sm-12">
                                                                                <div class="form-group">
                                                                                <textarea  class="form-control" name="comments" ></textarea>
                                                                                </div>
                                                                        </div>


                                                                        <div class="col-md-3 col-sm-12">
                                                                                <div class="form-group">
                                                                                        <h4>Short Name</h4>
                                                                                </div>
                                                                         </div>
                                                             <div class="col-md-9 col-sm-12">
                                                                                <div class="form-group">
                                                                                        <input type="text" class="form-control" name="srt" >
                                                                                </div>
                                                                        </div>


                                                                        <div class="col-md-3 col-sm-12">
                                                                                <div class="form-group">
                                                                                        <h4>Sensitivity</h4>
                                                                                </div>
                                                                         </div>
                                                             <div class="col-md-9 col-sm-12">
                                                                                <div class="form-group">
                                                                                <select class="selectpicker form-control col-12" data-style="btn-outline-primary" data-size="5" tabindex="-98" name="sensitivity" >
                                                                                                <option value="1" selected>Choose...</option>
                                                                                                <option value="1">YES</option>
                                                                                                <option value="2">NO</option>
                                                                                        </select>
                                                                                </div>
                                                                        </div>

                                                </div>

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

                        <!-- DeskApp - Bootstrap 4 Admin Template By <a href="https://github.com/dropways" target="_blank">Ankit Hingarajiya</a> -->

                        </div>
  
       



         </div>

                 </details>
        </div>


        <?php
   include "footer.php";
