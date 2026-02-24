<?php 
include "session.php";
include "include.php";

$id = $_REQUEST['id'];
$row = mysql_fetch_array(mysql_query("select `offermaster`.* from `offer_module`.`offermaster` where `offermaster`.`sno` = $id"),MYSQL_ASSOC);
// echo "<pre>";
// print_r($row);
// echo "</pre>";
?>
<html>
<head>
<title>OFFER ADD PORTAL</title>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>
<script type="text/JavaScript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
<script type="text/JavaScript" src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.11.2/jquery-ui.min.js"></script>

<script type="text/javascript">
function get_data()
{
    //Taking Variables

    var aff = document.getElementById('aff').value;  
    var offer_name = document.getElementById('offer_name').value;
    var offer_id = document.getElementById('offer_id').value;
    var payout = document.getElementById('payout').value;
    var sub_url = document.getElementById('sub_url').value;
    var unsub_url = document.getElementById('unsub_url').value;
    var open_url = document.getElementById('open_url').value;
    var opt_out_url = document.getElementById('opt_out_url').value;
    var sensitive = document.getElementById('sensitive').value;
    var from_name = document.getElementById('from_name').value;
    var subject = document.getElementById('subject').value;
    var restrictions = document.getElementById('restrictions').value;
    
    // const variables_array = [aff, offer_name, offer_id, payout, sub_url, unsub_url, open_url, opt_out_url, sensitive, from_name, subject, restrictions];
    // console.log(variables_array);

    document.getElementById('result').innerHTML = "<font color='Blue'>Processing...!</font>";

    // Validations
    if(aff == "Choose...")
    {
        document.getElementById('result').innerHTML="<font color=red>Error : </font>Select Affliate..!";
        document.getElementById('aff').focus;
        return;
    }

    if(offer_name == "")
    {
        document.getElementById('result').innerHTML="<font color=red>Error : </font>Provide Offer Name..!";
        document.getElementById('offer_name').focus;
        return;
    }

    if(offer_id == "")
    {
        document.getElementById('result').innerHTML="<font color=red>Error : </font>Provide Offer Id..!";
        return;
    }

    if(payout == "")
    {
        document.getElementById('result').innerHTML="<font color=red>Error : </font>Provide Offer Payout..!";
        return;
    }

    if(sub_url == "")
    {
        document.getElementById('result').innerHTML="<font color=red>Error : </font>Provide Offer Sub Url..!";
        return;
    }

    if(unsub_url == "")
    {
        document.getElementById('result').innerHTML="<font color=red>Error : </font>Provide Offer UnSub Url..!";
        return;
    }
    // if(open_url == "")
    // {
    //     document.getElementById('result').innerHTML="<font color=red>Error : </font>Provide Offer Open Url..!";
    //     return;
    // }
    if(sensitive == "Choose...")
    {
        document.getElementById('result').innerHTML="<font color=red>Error : </font>Provide Sensitivity!";
        return;
    }
    if(from_name == "")
    {
        document.getElementById('result').innerHTML="<font color=red>Error : </font>Provide From name..!";
        return;
    }
    if(subject == "")
    {
        document.getElementById('result').innerHTML="<font color=red>Error : </font>Provide Subject Lines..!";
        return;
    }

    $.ajax({
            type: 'post',
            url: 'add_offer_action.php',
            data:$("#myform").serialize(),//only input
            success: function (data) {
                document.getElementById('result').innerHTML = data;
            }
        });
}

function updatePostData() {
    jQuery('#aff').val('<?php echo $row['Affiliate']?>');
    jQuery('#sensitive').val('<?php echo $row['sensitive']?>');
}
setTimeout(function(){updatePostData()},2000);

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
        <center><h2><font style="font-family: 'Lucida Console', Courier, monospace;">OFFER ADD PORTAL</font></h2></center>
    </div>
    <div class="panel-body">
        <form id='myform'>
            <!-------------------------------------------------------------------1st row----------------------------------------------------->  
            <div class="form-row">
                <div class="form-group col-md-12">
                <label >Affliate Name</label>
                    <select id="aff" name="aff" class="form-control" required>
                        <option selected>Choose...</option>
                        <option value="OB MEDIA">OB MEDIA</option>
                        <option value="HASTRAFFIC">HASTRAFFIC</option>
                        <option value="SKENZO">SKENZO</option>
                        <option value="INSTAR">INSTAR</option>
                        <option value="W4">W4</option>
                        <option value="GWM">GWM</option>
                        <option value="MADRIO">MADRIO</option>
                        <option value="B2D">B2D</option>
                        <option value="MINT GLOBAL">MINT GLOBAL</option>
                        <option value="CONCISE">CONCISE</option>
			            <option value="AC">AC</option>
                        <option value="IDRIVE">IDRIVE</option>
                        <option value="AD1">AD1</option>
                        <option value="PUD">PureAds</option>
                    </select>
                </div>
            </div>
            <br>

            <!-------------------------------------------------------------------2nd row----------------------------------------------------->  
            <div class="form-row">
                <div class="form-group col-md-4">
                <label for="inputPassword4">Affliate Offer Name</label>
                    <input type="text" class="form-control" id="offer_name" name="offer_name" placeholder='Name Of Offer' value = "<?php echo htmlspecialchars($row['offer_name']);?>" required>
                </div>
                <div class="form-group col-md-4">
                    <label for="inputEmail4">Affliate Offer ID</label>
                    <input type="text" class="form-control" id="offer_id" name="offer_id" placeholder='Affliate Offer id' value = "<?php echo htmlspecialchars($row['offer_id']);?>" required>
                </div>
                <div class="form-group col-md-4">
                    <label for="inputPassword4">Affliate Offer Payout</label>
                    <input type="text" class="form-control" id="payout"  name="payout" placeholder='Affliate payout' value = "<?php echo htmlspecialchars($row['payout']);?>" required>
                </div>
            </div>
            <br>

            <!-------------------------------------------------------------------3rd row----------------------------------------------------->  
            <div class="form-row">
                <div class="form-group col-md-6">
                    <label for="inputPassword4">Affliate Offer Sub URL</label>
                <input type="text" class="form-control" id="sub_url" name="sub_url" placeholder='Affliate Sub Url' value = "<?php echo htmlspecialchars($row['sub_url']);?>" required>
                </div>
                <div class="form-group col-md-6">
                    <label for="inputEmail4">Affliate Offer Unsub URL</label>
                    <input type="text" class="form-control" id="unsub_url" name="unsub_url" placeholder='Affliate UnSub Url' value = "<?php echo htmlspecialchars($row['unsub_url']);?>" required>
                </div>
            </div>
            <br>

            <!-------------------------------------------------------------------4th row----------------------------------------------------->              
            <div class="form-row">
                <div class="form-group col-md-4">
                    <label for="inputPassword4">Affliate Offer Open URL</label>
                    <input type="text" class="form-control" id="open_url" name="open_url" placeholder='Affliate Open Url' value = "<?php echo htmlspecialchars($row['open_url']);?>" required>
                </div>

                <div class="form-group col-md-4">
                    <label for="inputPassword4">Affliate Offer Opt Out URL</label>
                <input type="text" class="form-control" id="opt_out_url" name="opt_out_url" value = "<?php echo htmlspecialchars($row['opt_out_url']);?>" placeholder='Affliate Opt Out Url'>
                </div>
                <div class="form-group col-md-4">
                    <label for="inputEmail4">Affliate Offer Sensitive</label>
                        <select id="sensitive" name="sensitive" class="form-control" required>
                            <option selected>Choose...</option>
                            <option value='1'>1</option>
                            <option value='2'>2</option>
                            <option value='3'>3</option>
                            <option value='4'>4</option>
                            <option value='5'>5</option>
                        </select>
                </div>
            </div>
            <br>

            <!-------------------------------------------------------------------5th row----------------------------------------------------->              
            <div class="form-row">
                <div class="form-group col-md-4">
                    <label for="inputPassword4">Affliate Offer From names</label>
                        <textarea class="form-control" id="from_name" name="from_name" placeholder='Affliate Offer From Names' style="width: 414px; height: 175px;" required><?php echo htmlspecialchars($row['from_name']);?></textarea>
                </div>

                <div class="form-group col-md-4">
                    <label for="inputPassword4">Affliate Offer Subject Lines</label>
                        <textarea class="form-control" id="subject" name="subject" placeholder='Affliate Offer Subjects' style="width: 414px; height: 175px;" required><?php echo htmlspecialchars($row['subject']);?></textarea>
                </div>
                <div class="form-group col-md-4">
                    <label for="inputEmail4">Affliate Offer Restrictions</label>
                        <textarea class="form-control" id="restrictions" name="restrictions" placeholder='Affliate Offer Restrictions' style="width: 414px; height: 175px;"><?php echo htmlspecialchars($row['restrictions']);?></textarea>
                </div>
            </div>
            <input type="hidden" id="update_id" name="update_id" value = <?php echo $id?>>
        </form>
        <center><button onclick="get_data()" class="btn btn-primary"> ADD OFFER </button><br><br><div id='result'></div></center>
    </div>
</div>
</body>
</html>
