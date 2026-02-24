<?php
include "/var/www/html/interface_new/session.php";
 
?>


<html>
<head>



<link href="//maxcdn.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css" rel="stylesheet" id="bootstrap-css">
<script src="//maxcdn.bootstrapcdn.com/bootstrap/4.1.1/js/bootstrap.min.js"></script>
<script src="//cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
<script src= "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js"> </script>


<style>



.container {
    max-width: 100%;
}




#main {
 margin : 15px; 
 padding : 15px;


 -webkit-box-shadow: 0px 3px 22px 14px rgba(0,0,0,0.21);
-moz-box-shadow: 0px 3px 22px 14px rgba(0,0,0,0.21);
box-shadow: 0px 3px 22px 14px rgba(0,0,0,0.21);

}


.resp-iframe {
    width: 100%;
    border: 0;
}



.register{
    background: -webkit-linear-gradient(left, #3931af, #00c6ff);
    margin-top: 1%;
    padding: 1%;
}
.register-left{
    text-align: center;
    color: #fff;
    margin-top: 4%;
}
.register-left input{
    border: none;
    border-radius: 1.5rem;
    padding: 2%;
    width: 60%;
    background: #f8f9fa;
    font-weight: bold;
    color: #383d41;
    margin-top: 30%;
    margin-bottom: 3%;
    cursor: pointer;
}
.register-right{
    background: #f8f9fa;
    border-top-left-radius: 10% 50%;
    border-bottom-left-radius: 10% 50%;
}
.register-left img{
    margin-top: 15%;
    margin-bottom: 5%;
    width: 25%;
    -webkit-animation: mover 2s infinite  alternate;
    animation: mover 1s infinite  alternate;
}
@-webkit-keyframes mover {
    0% { transform: translateY(0); }
    100% { transform: translateY(-20px); }
}
@keyframes mover {
    0% { transform: translateY(0); }
    100% { transform: translateY(-20px); }
}
.register-left p{
    font-weight: lighter;
    padding: 12%;
    margin-top: -9%;
}
.register .register-form{
    padding: 10%;
    margin-top: 10%;
}
.btnRegister{
    float: right;
    margin-top: 10%;
    border: none;
    border-radius: 1.5rem;
    padding: 2%;
    background: #0062cc;
    color: #fff;
    font-weight: 600;
    width: 50%;
    cursor: pointer;
}
.register .nav-tabs{
    margin-top: 3%;
    border: none;
    background: #0062cc;
    border-radius: 1.5rem;
    width: 28%;
    float: right;
}
.register .nav-tabs .nav-link{
    padding: 2%;
    height: 34px;
    font-weight: 600;
    color: #fff;
    border-top-right-radius: 1.5rem;
    border-bottom-right-radius: 1.5rem;
}
.register .nav-tabs .nav-link:hover{
    border: none;
}
.register .nav-tabs .nav-link.active{
    width: 100px;
    color: #0062cc;
    border: 2px solid #0062cc;
    border-top-left-radius: 1.5rem;
    border-bottom-left-radius: 1.5rem;
}
.register-heading{
    text-align: center;
    margin-top: 8%;
    margin-bottom: -15%;
    color: #495057;
}







.switch-field {
        display: flex;
        margin-bottom: 36px;
        overflow: hidden;
}

.switch-field input {
        position: absolute !important;
        clip: rect(0, 0, 0, 0);
        height: 1px;
        width: 1px;
        border: 0;
        overflow: hidden;
}

.switch-field label {
        background-color: #89e1ff;
    font-weight: bold;
        color: rgba(0, 0, 0, 0.6);
        font-size: 14px;
        line-height: 1;
        text-align: center;
        padding: 8px 16px;
        margin-right: -1px;
        border: 1px solid rgba(0, 0, 0, 0.2);
        box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3), 0 1px rgba(255, 255, 255, 0.1);
        transition: all 0.1s ease-in-out;
}

.switch-field label:hover {
        cursor: pointer;
}

.switch-field input:checked + label {
    background-color: #46c100;
    box-shadow: none;
    color: white;
}

.switch-field label:first-of-type {
        border-radius: 4px 0 0 4px;
}

.switch-field label:last-of-type {
        border-radius: 0 4px 4px 0;
}



textarea { font-size: 12px; }
input { font-size: 12px; }
select { font-size: 12px;  width: 80px; height: 30px; }
strong { font-size: 12px; }
table {table-layout: fixed; }
td { margin-bottom : 10px; margin-top : 10px; margin-left : 20px; padding-bottom : 10px; padding-top : 10px;}
input[type=checkbox], input[type=radio] {
    box-sizing: border-box;
    padding: 5px;
    margin: 5px;
    width: 50;
    height: 20;
}

input[type=text] {
    box-sizing: border-box;
    padding: 5px;
    margin: 5px;
  height: 35px;
}






</style>




<script language=javascript>
checked=false;
function checkedAll (frm1) {
        var aa= document.getElementById('frm1');
         if (checked == false)
          {
           checked = true
          }
        else
          {
          checked = false
          }
        for (var i =0; i < aa.elements.length; i++) 
        {
         aa.elements[i].checked = checked;
        }
      }
</script>
<script language="JavaScript" type="text/JavaScript">
<!--
function MM_reloadPage(init) {  //reloads the window if Nav4 resized
  if (init==true) with (navigator) {if ((appName=="Netscape")&&(parseInt(appVersion)==4)) {
    document.MM_pgW=innerWidth; document.MM_pgH=innerHeight; onresize=MM_reloadPage; }}
  else if (innerWidth!=document.MM_pgW || innerHeight!=document.MM_pgH) location.reload();
}
MM_reloadPage(true);
//-->
</script>
<script src="scriptaculous.shrunk.js" type="text/javascript" charset="ISO-8859-1">
</script>
<script>
function displayHTML(form) {
  var inf = form.message.value;
  win = window.open(", ", 'popup', 'toolbar = no, status = no, scrollbars = yes');
  win.document.write("" + inf + "");
}

function myFunction(val) {
  alert("The input value has changed. The new value is: " + val);
}

</script>


<script>

function checkdata() {
$("#loaderIcon").show();
jQuery.ajax({
url: "check_data.php",
fetch:'data='+$("#data3").val(),
type: "POST",
success:function(fetch){
$("#user-availability-status").html(fetch);
$("#loaderIcon").hide();
},
error:function (){}
});
}

</script>




<script>
function validdata(str) {
if (str=="")
    {
        document.getElementById("datafilevalid").innerHTML="";
        return;
    }
var xmlhttp=new XMLHttpRequest();
xmlhttp.onreadystatechange=function()
    {
        if (this.readyState==4 && this.status==200)
        {
          if (this.responseText == "<img src='tick.png'/></img> <font color = 'green'> Verified</font>")
            {
              document.getElementById("datafilevalid").innerHTML=this.responseText;
            }
          else
            {
              document.getElementById("datafilevalid").innerHTML=this.responseText;
            }
        }
    }
xmlhttp.open("GET","validate_datafile.php?q="+str,true);
xmlhttp.send();
}
</script>








<script>
function validoffer(str) {
    if (str=="")
        {
            document.getElementById("offervaliddiv").innerHTML="";
            return;
        }
    var xmlhttp=new XMLHttpRequest();
    xmlhttp.onreadystatechange=function()
        {
            if (this.readyState==4 && this.status==200)
            {
              if (this.responseText == "<img src='tick.png'/></img> <font color = 'green'> Verified</font>")
              {
                document.getElementById("offervaliddiv").innerHTML=this.responseText;

              }
              else
              {
                document.getElementById("offervaliddiv").innerHTML=this.responseText;

              }
            }
        }
    xmlhttp.open("GET","validate_offerid.php?q="+str,true);
    xmlhttp.send();
 }
</script>








</head>
</body>

<div id="main">


<div align="center" style="width=100% ; height: 12px; ">
 
<div align="left" style="width=50% ; height: 12px; ">

<p  >
 <form name="tempload" id="tt" method="post" action="saved_temp.php" >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            <select name="tempp" style="width:200px;height:40px" class="custom-select">  
                                <option value="" selected="selected" ><b>CAMPAIGN</b></option>
                                <?php
                                    include "include.php";
                                    $select=mysql_query("select max(sno),tempname from svml_sendgrid where status = '1' group by tempname");
                                    while($rowip=mysql_fetch_array($select))
                                    {
                                    echo "<option value=".$rowip[0].">".$rowip[1]."</option>";
                                    }
                                ?>
                            </select> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                       <input type="submit" value="Load" name="submit" class="btn-primary" style="padding:6px 26px;border-radius:4px;" ></form>  
 </p>
</div>
 <div align="right" style="width=50% ; height: 12px; ">

 <p align="right"><b><font size="2px" color="red"> </font> <font size="1px">   
&nbsp;
<button class="btn-primary red" style=" background-color:#0ebf20 ;color:white; padding:5px 14px;border-radius:4px ; width:82px; height:39px;border-color: #ffffff;"><a href="guide.php" target='_black' style="text-decoration: none;color:#fff;font-size:4px "><font size='3'><b>Guide</b></font></a></button>&nbsp;&nbsp;
<button class="btn-primary red" style=" background-color:red ;color:white; padding:5px 14px;border-radius:4px ; width:82px; height:39px;border-color: #ffffff;"><a href="logout.php" style="text-decoration: none;color:#fff;font-size:4px "><font size='3'><b>Logout</b></font></a></button></font></p>


 </div>
 </div>
<br><br>

<form name="form1" id ="frm1">    
      <div class="container register" style="    max-width: 100%;">
                <div class="row">
                         <div class="col-md-3 register-left">
<br><br>
                                <h4><?php echo strtoupper($_SESSION['fname']." ".$_SESSION['lname']);?></h4> <br><br><br>
                                
                                <?php
                                    include "include.php";
                                    $a=array($_REQUEST);
                                    for ($i=0; $i<=count($a['0']['server'])-1; $i++)  
                                    {
                                    if($i==count($a['0']['server'])-1 )
                                    {
                                    $server.=$a['0']['server'][$i];
                                    }
                                    else  
                                    {
                                    $server.=$a['0']['server'][$i]."','";
                                    }
                                    }

                                    $query=mysql_query("select assignedip as data  from mumara");
                                    while($rowips=mysql_fetch_array($query))
                                    {
                                    $all[].=$rowips['data'];
                                    }
                                    $eee=implode("\n",$all) ;

                                    $server_using=str_replace("','",",",$server);

                                    $id = $_REQUEST['tempp'];
                                    $a=mysql_query("select * from svml_sendgrid where sno = '$id'");
                                    $row = mysql_fetch_array($a);

                                    if ($id == '') {

                                    $eee = trim($eee);

                                    } else { 
                                    $eee =  $row['mutidomains'];

                                    }
                                    ?>
                            <textarea style="width:90%; height:220px;" name="accs" cols="55" rows="20" id = "accs" placeholder="Put IP's Here"></textarea>
                            <br><br>
                        </div>
                    <div class="col-md-9 register-right">
                    <center>
                  
      <table width='90%' border='0'> 
                  

                


             <tr>
 
 
                                <td rowspan="12" colspan="1" valign='top'>  
<br><br><br>
 
                                <center>


                                <?php
                                                          if($row['mode']=='bulk')
                                                            {

                                                                echo '<div class="switch-field"> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                                <input name="mode" type="radio" id="radio-one"  value="test" />
                                                                <label for="radio-one"><strong>Test</strong></label>
                                                                <input name="mode" type="radio" id="radio-two" value="bulk"  checked="checked"/>
                                                                <label for="radio-two"><strong>Bulk</strong></label>
                                                            ';

                                                            }
                                                            else
                                                            {
                                                            
                                                                echo '<div class="switch-field">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                                <input name="mode" type="radio" id="radio-one"  value="test" checked="checked" />
                                                                <label for="radio-one"><strong>Test</strong></label>
                                                                <input name="mode" type="radio" id="radio-two" value="bulk" />
                                                                <label for="radio-two"><strong>Bulk</strong></label>
                                                            ';
                    
                                                        }
                    
                    
                    
                            echo "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
                    
                                    if($row['sen_t']=='auto')
                                        {

                                            echo '
                                            <input name="sen_t" type="radio" id="radio-one"  value="script" />
                                            <label for="radio-one"><strong>Manual</strong></label>
                                            <input name="sen_t" type="radio" id="radio-two" value="auto" checked="checked" />
                                            <label for="radio-two"><strong>Auto</strong></label>
                                        </div>';



                                        }
                                        else
                                        {

                                            echo '
                                            <input name="sen_t" type="radio" id="radio-three"  value="manual" checked="checked" />
                                            <label for="radio-three"><strong>Manual</strong></label>
                                            <input name="sen_t" type="radio" id="radio-four" value="auto" />
                                            <label for="radio-four"><strong>Auto</strong></label>
                                        </div>';



                                        }
                                    ?>

                                    <br>


                        <details style='width: revert;'>
                        <summary role="button" class="btn-primary" style="background:#269abc;border-radius:4px;height: auto;width: 50%;text-align: center;margin: 5px;padding: 5px;"  ><b><font>Settings</font></b></summary>

                        <table style='width: revert;' border="0">

                        <tr> 
                        <td><table> <tr> <td> <P id="datafilevalid" > </p> </td>  <td> <input type="text" name="data"  id="data3" onInput="validdata(this.value)"  autocomplete='off'   title="Data File" placeholder="Data File" value="<?php echo $row['data']; ?>">  </td> </tr> </table>    </td> 

                        <td> <input name="limit" type="text" title="Total Send" placeholder="Total Send"  value="<?php echo $row['limits']; ?>"> </td> 
                        </tr>
                        <tr> 
                        <td> <input type="text" name="ls" id="ls"  title="Limit_to_Send" placeholder="Limit_to_Send"  value="<?php echo $row['limit_to_send']; ?>"> </td> 
                        <td> <input type="text" name="sp" id="sp"  title="Sleep Time" placeholder="Sleep Time" value="<?php echo $row['sleep_time']; ?>"> </td> 
                        </tr>
                        <tr> 
                        <td> <table> <tr> <td>  <P id="offervaliddiv"></p>  </td>  <td>   <input type="text" name="offer" id="offer"  title="Offer ID" onInput="validoffer(this.value)" autocomplete='off'  placeholder="Offer ID"   value="<?php echo $row['offer']; ?>"> </td> </tr> </table>   </td> 
                        <td> <input type="text" name="name" id="name"  title="Template Name" placeholder="Template Name" value="<?php echo $row['tempname']; ?>"> </td> 
                        </tr>
                        <tr> 
                        <td> <input type="text" name="domain" id="domain"   title="Domain" placeholder="Domain"   value="<?php echo $row['domain']; ?>"> </td> 
                        <td> <select name="wait" id="wait" style="width: 155px; height:32px"  title="Wait Time"  >
                                            <option value="2" selected> Wait Time </option>                  
                                            <option value="1"> 1 </option>                  
                                            <option value="2"> 2 </option>  
                                            <option value="3"> 3 </option>                  
                                            </select>  </td> 
                        </tr>
                        <tr> 
                        <td> <input type="text" name="msid" id="msid"   title="Message ID" placeholder="Message ID"   value="<?php echo $row['bcc']; ?>"> </td> 
                        <td>  <select name="inbpatt" id="inbpatt" style="width: 155px; height:32px">

                                        <?php
                                        $patternitemone =   "value='".trim($row['inbpatt'])."'";
                                        $patternitemtwo =   "value='".trim($row['inbpatt'])."' selected ";
                                         $patterndata = file_get_contents("http://75.119.149.20/interface/getpattern.php");
                                       $patterndata = trim($patterndata);

                                        $patternresult = str_replace($patternitemone,$patternitemtwo,$patterndata);
                                        echo "$patternresult";
                                        ?>
                        </select></td> 
                        </tr>

                        <tr> 
                        <td><select name="res_choice" id="res_choice"  title="Restart_Choice" style="width: 155px; height:32px">
                                        <option value="YES"> Restart_Choice </option>   
                                            <option value="YES"> YES </option>   
                                            <option value="NO"> NO </option>            
                                            </select>
                                        </td> </td> 
                        <td>  <input type="text" name="mail_ch" id="mail_ch"  title="Script_Mail_Choice" placeholder='Script_Mail_Choice'   value="<?php echo $row['head']; ?>">  </td> 
                        </tr>
                        <tr> 
                        <td><input type="text" name="relayp" id="relayp"  title="Relay Percent" placeholder="Relay Percent" value="<?php echo $row['relay_per']; ?>">  </td> 
                        <td> <input type="text" name="inb" id="inb"  title="Inbox Percent" placeholder='Inbox Percent'  value="<?php echo $row['oid']; ?>"> </td> 
                        </tr>
                        <tr> 
                        <td> <input type="text" name="times"  title="Times_To_Send" placeholder="Times_To_Send" id="times" value="1"  >   </td> 
                        <td> <input type="text" name="mail_per" id="mail_per"  title="Mail_After_Every" placeholder='Mail_After_Every' value="<?php echo $row['pwd']; ?>"> </td> 
                        </tr>

                        <tr> 
                        <td> <select name="replyto" id="replyto"  title=" Reply to" placeholder='Reply to' style="width: 155px; height:32px">

                        <?php
                        if($row['reply_to'] == '1')
                                    {
                                        echo '<option value="0" > Reply to </option>';
                                        echo '<option value="1" selected> YES </option>';
                                        echo '<option value="0" > NO </option>';
                                    } 
                            else 
                                    {
                                        echo '<option value="0" selected> Reply to </option>';
                                        echo '<option value="1"> YES </option>  ';
                                        echo '<option value="0"> NO </option>';
                                    }

                        ?>

                        </select> </td> 
                        <td>   &nbsp; <select name="xmailer" id="xmailer"  title="XMAILER" style="width: 155px; height:32px">
                            <?php
                            if($row['xmailer']=='1')
                                        {
                                            echo '<option value="0"> XMAILER </option>';
                                            echo '<option value="1" selected> YES </option>';
                                            echo '<option value="0" > NO </option>';
                                        } 
                                else 
                                        {
                                            echo '<option value="0" selected> XMAILER </option>';
                                            echo '<option value="1"> YES </option>  ';
                                            echo '<option value="0"> NO </option>';
                                        }
                            ?>
                                            </select> </td> 
                        </tr>
                        </table>

                        </details></center>



                  </td>                  <td>      
                      <br>         <br>   <br>       
                      <input  placeholder='From Email Address' style="border:1px solid #999; font-weight:500 ;"  type="text" name="ip" size="40" id="ip" value="<?php echo $row['ip']; ?>" />  
                 </td>  </tr>
             <tr> 
           

                            <td> 
                                        
                    </td></tr>
                    <tr> <td>
                      
                    <input type="text"  placeholder='Subject' name="sub" id="sub2" size="60" value="<?php echo $row['subject']; ?>">
                    <br>
                    <div>
                        <input type="radio" name="sencode" value="ascii"><strong> UTF8-Q   </strong>                
                        <input type="radio" name="sencode" value="base64"> <strong>UTF8-B    </strong>       
                        <input type="radio" name="sencode" value="reset" checked> <strong>RESET </strong>
                    </div>

                      
                    </td> </tr>
                    <tr><td> 
                    
                    
                    <input type="text" name="from"  placeholder='From Name'  id="from2" size="60"  value="<?php echo $row['from_val']; ?>">
                    <br>
                        <div>
                            <input type="radio" name="fmencode" value="ascii"> <strong>UTF8-Q </strong>
                            <input type="radio" name="fmencode" value="base64"> <strong>UTF8-B</strong>
                            <input type="radio" name="fmencode" value="reset" checked> <strong>RESET </strong>
                        </div> 
                    
                    </td> </tr>
                    <tr><td>

                    <textarea name="emails" cols="0" rows="0" placeholder='demo@demo.com'  style="width:90%; height:120px;" id="emails"><?php echo $row['emails']; ?></textarea>

                     </td> </tr>
                    <tr>  <td>
                    
                    <p>
        <?php
          if($row['type']=='plain')
            {
              $dd = "document.getElementById('mime').style.display = 'none'";
              echo "<input name='type' type='radio' value='plain' onClick='$dd' class='rad'  checked='checked'>";
              echo "<strong>Plain<strong>";
              echo "<input name='type' type='radio' value='html' onClick='$dd' class='rad'>";
              echo "<strong>Html</strong>";
              echo "<input name='type' type='radio' value='mime' onClick='$dd' class='rad'>";
              echo "<strong>MIME</strong>";
            }

          elseif($row['type']=='mime')
            {
              $dd = "document.getElementById('mime').style.display = 'none'";
              echo "<input name='type' type='radio' value='plain' onClick='$dd' class='rad'>";
              echo "<strong>Plain<strong>";
              echo "<input name='type' type='radio' value='html' onClick='$dd' class='rad'>";
              echo "<strong>Html</strong>";
              echo "<input name='type' type='radio' value='mime' onClick='$dd' class='rad'  checked='checked'>";
              echo "<strong>MIME</strong>";
            }
          else
            {
              $dd= "document.getElementById('mime').style.display = 'none'";
              echo "<input name='type' type='radio' value='plain' onClick='$dd' class='rad'>";
              echo "<strong>Plain<strong>";
              echo "<input name='type' type='radio' value='html' onClick='$dd' class='rad'  checked='checked'>";
              echo "<strong>Html</strong>";
              echo "<input name='type' type='radio' value='mime' onClick='$dd' class='rad'>";
              echo "<strong>MIME</strong>";
            } 
        ?>
&nbsp;&nbsp;&nbsp;   <input class="btn-primary" style="padding:6px 12px;border-radius:4px" type="button" value=" Preview " onClick="displayHTML(this.form)">
&nbsp;&nbsp;&nbsp;&nbsp;
<a href='http://75.119.149.20/edit.php' class="btn-primary" style="background-color:#0cbe05;height:30px;padding:6px 15px;border-radius:4px" type="button" target='_blank'> EDITOR </a>
        </p>

        </p>

                     </td> </tr>
                    <tr>  <td>
                    


                <select name="charen" id="charen" style="width: 155px; height: 30px">
     <?php


                  $patterncharen = "<option value='UTF-8'> UTF-8 </option>
                                    <option value='us-ascii'> US-ASCII </option>
                                    <option value='iso-8859-1'> ISO-8859-1 </option>
                                    <option value='windows-1251'> WINDOWS-1251 </option>";
                   $patternonecharen =   "value='".trim($row['charen'])."'";
                 $patterntwocharen =   "value='".trim($row['charen'])."' selected ";
                echo str_replace($patternonecharen,$patterntwocharen,$patterncharen);
    ?>
                </select>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <select name="contend" id="contend" style="width: 155px;height: 30px; ">
    <?php
                $patterncontend ="<option value='8bit'> 8bit </option>
                                    <option value='binary'> binary </option>
                                    <option value='quoted-printable'> quoted-printable </option>
                                    <option value='7bit'> 7bit </option>
                                    <option value='base64'> base64 </option>";

                 $patternonecontend=   "value='".trim($row['contend'])."'";
                 $patterntwocontend =   "value='".trim($row['contend'])."' selected ";
                echo str_replace($patternonecontend,$patterntwocontend,$patterncontend);
       ?>
       </select>

                   </td> </tr>
                    <tr>  <td>
             <textarea style="width:100%; height:180px;" name="message"  placeholder='Message' cols="55" rows="25"><?php echo $row['msg']; ?></textarea>
                    </td> </tr>
                    <tr>  <td>
                    <select name="charen_alt" id="charen_alt" style="width: 155px;height: 30px">
         <?php
                   $patterncharen_alt = "<option value='UTF-8'> UTF-8 </option>
                                    <option value='us-ascii'> US-ASCII </option>
                                    <option value='iso-8859-1'> ISO-8859-1 </option>
                                    <option value='windows-1251'> WINDOWS-1251 </option>";

                 $patternonecharen_alt=   "value='".trim($row['charen_alt'])."'";
                 $patterntwocharen_alt =   "value='".trim($row['charen_alt'])."' selected ";
               echo str_replace($patternonecharen_alt,$patterntwocharen_alt,$patterncharen_alt);
              ?>
  </select>

                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

                <select name="contend_alt" id="contend_alt" style="width: 155px;height: 30px">
       <?php
                  $patterncontend_alt="<option value='8bit'> 8bit </option>
                                   <option value='binary'> binary </option>
                                   <option value='quoted-printable'> quoted-printable </option>
                                   <option value='7bit'> 7bit </option>
                                   <option value='base64'> base64 </option>";
                   $patternonecontend_alt=   "value='".trim($row['contend_alt'])."'";
                   $patterntwocontend_alt =   "value='".trim($row['contend_alt'])."' selected ";
               echo str_replace($patternonecontend_alt,$patterntwocontend_alt,$patterncontend_alt);
           ?>
                </select>
                    </td> </tr>
                    <tr> <td>
                    
                    <textarea style="width:100%; height:80px;"  placeholder='MIME Messsage ' name="textm" cols="55" rows="25"><?php echo $row['textm']; ?></textarea>
                     </td> </tr>
                    <tr> <td>
                    
    </td> </tr>
            <tr>  <td align="center" >  <input class="btn-primary" style="width:150px;height: 50px;font-size: 20; background:#43d643;border-radius:4px;border-color: white; " type="button" style="border-radius:4px" name="button" value="SEND" onClick="new Ajax.Updater('mailing1', 'php_mailer_hold.php', {asynchronous:true, evalScripts:true, method:'post', onComplete:function(request){new Effect.Appear('mailing1');new Effect.Fade('loadingreport123');}, onLoading:function(request){new Element.show('loadingreport123')}, parameters:Form.serialize(this.form)})"> </td> </tr>


             <tr>  <td colspan="2" align="center" >
                    
                    <div  align="center" style=" width:300px; height:25px; z-index:1 ;  layer-background-color: #0479C0; border: 1px none #000000;display:none;" id='loadingreport123'>
                    <div align="center" class="style2"><font color="#FFFFFF"><strong><font color='red' size="5"> Sending .. </font></strong></font></div>
                 </td> </tr>

                 <tr>  <td align="center" colspan="2" >  <p align="center"  style="color:black;font-size:12px;" id='mailing1'></p> <br> </td> </tr>



           <tr>  <td align="center" colspan="2" >   <iframe id='resultmail' name='resultmail' src='' class="resp-iframe" ><center></center></iframe> </td></tr>
           </table>
                    </center> 
               </form>
                    </div>
               
                </div>

      </div>



</div>
            </body>


            </html>
