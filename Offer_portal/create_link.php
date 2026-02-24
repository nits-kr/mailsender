<?php
include "session.php";
include "include.php";
$mailer_id = $_SESSION['id'];
$mailer_email = $_SESSION['username'];
$mailer_name = $_SESSION['name'];
$fetch = mysql_fetch_array(mysql_query("select * from offermaster where sno=$_REQUEST[id]"));
$sno = $fetch['sno'];
$Affiliate = $fetch['Affiliate'];;
$offer_id = $fetch['offer_id'];
$offer_name = $fetch['offer_name'];
$payout = $fetch['payout'];
if($fetch['sensitive'] == 1)
$sensitive = "Yes";
else
$sensitive = "No";
$sub_url = $fetch['sub_url'];
$unsub_url = $fetch['unsub_url'];
$open_url = $fetch['open_url'];
$opt_out_url = $fetch['opt_out_url'];
?>

<html>
<head>
<title>LINK CREATE PORTAL</title>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>
<script type="text/JavaScript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
<script type="text/JavaScript" src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.11.2/jquery-ui.min.js"></script>

<script>
$( document ).ready(function() 
{
    document.getElementById('main_link').style.display = 'none'
    document.getElementById('unsub_link').style.display = 'none'
    document.getElementById('open_link').style.display = 'none'
});
</script>

<script type="text/javascript">
function showLink(element)
{
    switch(element)
    {
        case "Subscribe":
            // console.log("Subscribe");
            document.getElementById('main_link').style.display = 'block'
            document.getElementById('unsub_link').style.display = 'none'
            document.getElementById('open_link').style.display = 'none'
        break;
        case "Unsubscribe":
            document.getElementById('main_link').style.display = 'none'
            document.getElementById('unsub_link').style.display = 'block'
            document.getElementById('open_link').style.display = 'none'
        break;
        case "Open":
            document.getElementById('main_link').style.display = 'none'
            document.getElementById('unsub_link').style.display = 'none'
            document.getElementById('open_link').style.display = 'block'
    }
}

function get_data()
{
    //Taking Variables

    var domain = document.getElementById('domain').value;  
    var type = document.getElementById('type').value;
    var own_offer_id = document.getElementById('own_offer_id').value;
    var pattern = document.getElementById('pattern').value;
    var main_link = document.getElementById('main_link').value;
    var status = document.getElementById('status').value;

    document.getElementById('result').innerHTML = "<font color='Blue'>Processing...!</font>";

    // Validations
    if(domain == "")
    {
        document.getElementById('result').innerHTML="<font color=red>Error : </font>Domain Required..!";
        return;
    }

    if(type == "Choose...")
    {
        document.getElementById('result').innerHTML="<font color=red>Error : </font>Provide Type of Link..!";
        return;
    }

    if(own_offer_id == "")
    {
        document.getElementById('result').innerHTML="<font color=red>Error : </font>Provide Offer Id..!";
        return;
    }

    if(pattern == "")
    {
        document.getElementById('result').innerHTML="<font color=red>Error : </font>Provide Link Pattern..!";
        return;
    }

    if(type != "Open" && main_link == "")
    {
        document.getElementById('result').innerHTML="<font color=red>Error : </font>Provide Main link..!";
        return;
    }

    if(status == "")
    {
        document.getElementById('result').innerHTML="<font color=red>Error : </font>Provide Offer UnSub Url..!";
        return;
    }

    $.ajax({
            type: 'post',
            url: 'create_link_action.php',
            data:$("#myform").serialize(),//only input
            success: function (data) {
                document.getElementById('result').innerHTML = data;
            }
        });
}
</script>
<style>
textarea{
    margin: 0px;
    height: 453px;
    width: 635px;
}
</style>

</head>
<body>
    
<div class="panel panel-primary" style="width: 95%;margin-left: 2.5%;margin-right: 2.5%;">
    <div class="panel-heading">
        <center><h2><font style="font-family: 'Lucida Console', Courier, monospace;"><u>LINK CREATE PORTAL</u></h2><br>
        <table>
            <tr>
                <td><font color=white><b>OFFER MASTER ID</b></font></td>
                <td><font color=white><b>&nbsp:&nbsp</b></font></td>
                <td><?php echo $sno; ?></td>
            </tr>
            <tr>
                <td><font color=white><b>AFFLIATE</b></font></td>
                <td><font color=white><b>&nbsp:&nbsp</b></font></td>
                <td><?php echo $Affiliate; ?></td>
            </tr>
            <tr>
                <td><font color=white><b>OFFER ID</b></font></td>
                <td><font color=white><b>&nbsp:&nbsp</b></font></td>
                <td><?php echo $offer_id; ?></td>
            </tr>
            <tr>
                <td><font color=white><b>OFFERNAME</b></font></td>
                <td><font color=white><b>&nbsp:&nbsp</b></font></td>
                <td><?php echo $offer_name; ?></td>
            </tr>
            <tr>
                <td><font color=white><b>PAYOUT</b></font></td>
                <td><font color=white><b>&nbsp:&nbsp</b></font></td>
                <td><?php echo $payout; ?></td>
            </tr>
            <tr>
                <td><font color=white><b>SENSITIVE</b></font></td>
                <td><font color=white><b>&nbsp:&nbsp</b></font></td>
                <td><?php echo $sensitive; ?></td>
            </tr>
        </table>
        </center>

    </div>
    <div class="panel-body">
        <form id='myform'>
            <!-------------------------------------------------------------------1nd row----------------------------------------------------->  
            <div class="form-row">
                <div class="form-group col-md-4">
                <label for="inputPassword4">Domain link</label>
                    <input type="text" class="form-control" id="domain" name="domain" placeholder='http://domain.com'>
                </div>
                <div class="form-group col-md-4">
                    <label for="inputEmail4">Link Type</label>
                        <select id="type" name="type" class="form-control" onchange="showLink(this.value)">
                            <option selected>Choose...</option>
                            <option value='Subscribe'>Subscribe</option>
                            <option value='Unsubscribe'>Unsubscribe</option>
                            <option value='Open'>Open</option>
                        </select>
                </div>
                <div class="form-group col-md-4">
                    <label for="inputPassword4">Own Offerid</label>
                    <input type="text" class="form-control" id="own_offer_id"  name="own_offer_id" placeholder='example_sub'>
                </div>
            </div>
            <br>

            <!-------------------------------------------------------------------3rd row----------------------------------------------------->  
            <div class="form-row">
                <div class="form-group col-md-12">
                    <label for="inputPassword4">Link Pattern</label>
                    <input type="text" class="form-control" id="pattern" name="pattern" placeholder='/Showing/example/of/link/pattern' >
                </div>
            </div>
            <br>

            <!-------------------------------------------------------------------4th row----------------------------------------------------->              
            <div class="form-row">
                <div class="form-group col-md-8">
                    <label for="inputPassword4">Redirect Link (OFFER/UNSUB)</label>
                    <input type="text" class="form-control" id="main_link" name="main_link" value='<?php echo $sub_url?>'>
                    <input type="text" class="form-control" id="unsub_link" name="unsub_link" value='<?php echo $unsub_url?>'>
                    <input type="text" class="form-control" id="open_link" name="open_link">
                </div>
                <div class="form-group col-md-4">
                    <label for="inputEmail4">Status</label>
                        <select id="status" name="status" class="form-control">
                            <option value='1'>REDIRECTION ON</option>
                            <option value='0'>REDIRECTION OFF</option>
                        </select>
                </div>
            </div>
            <br>
            <input type="hidden" id="omid" name="omid" value='<?php echo $sno?>'>
            <input type="hidden" id="mailer_id" name="mailer_id" value='<?php echo $mailer_id?>'>
            <input type="hidden" id="mailer_email" name="mailer_email" value='<?php echo $mailer_email?>'>
            <input type="hidden" id="mailer_name" name="mailer_name" value='<?php echo $mailer_name?>'>
        </form>
        <center><button onclick="get_data()" class="btn btn-primary"> ADD OFFER </button><br><br><div id='result'></div></center>
    </div>
</div>
</body>
</html>
