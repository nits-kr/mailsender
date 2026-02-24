<?php
include "/var/www/html/interface/session.php";
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<head>
<!-- Latest compiled and minified CSS -->
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">

<!-- Optional theme -->
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css" integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp" crossorigin="anonymous">

<!-- Latest compiled and minified JavaScript -->
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
<style type="text/css">
.style1 {
        font-size: 12px;
        font-weight: bold;
}
.style2 {font-size: 10px; font-weight: bold; font-family: tahoma; text-align:center;}
td {
border: 0;
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

<meta http-equiv="content-type" content="text/html; charset=ISO-8859-1" />
<link rel="stylesheet" href="style.css" type="text/css" media="all">
<style>
input[type="radio"].rad{padding:0;vertical-align:middle;}

td {padding:5px;}

</style>
<title>SMTP</title>
</head>
<link href="select2.css" rel="stylesheet"/>
</head>

<body id="root" style="margin: 0px; padding: 0px;">
<fieldset style=" margin: 15px;padding: 15px;background-color:aliceblue">
<legend></legend>
<table style='width:100%' > <tr><td style='width:75%'>
<form name="tempload" id="tt" method="post" action="saved_temp.php">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<select name="tempp" style="width:370px;height:40px" class="custom-select">  
    <option value="" selected="selected" ><-<b>Select Name Of Approved Templates</b>-></option>
      <?php
        include "include.php";
        $select=mysql_query("select sno,tempname from svml_sendgrid where status = '1' group by tempname");
        while($rows=mysql_fetch_array($select))
        {
          echo "<option value=".$rows[0].">".$rows[1]."</option>";
        }
      ?>
</select>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<input type="submit" value="Load" name="submit"  style="color:white;background: royalblue;padding:6px 26px;border-radius:4px"></form>                                
</td><td style='width:25%;' align='right'>
<b><font size="2px" color="red"> WELCOME :- </font> <font size="1px"><?php echo strtoupper($_SESSION['fname']." ".$_SESSION['lname']);?>&nbsp<button class="btn-primary" style="padding:5px 14px;border-radius:4px"><a href="../admin/logout.php" style="text-decoration: none;color:#fff;font-size:14px">Logout</a></button></font>
</td></tr></table>

<div class="container-fluid">
<div class="row">
<form name="form1" id ="frm1">    
<?php
  $id = $_REQUEST['tempp'];
  $a=mysql_query("select * from svml_sendgrid where sno = '$id'");
  $row = mysql_fetch_array($a);
?> 
        
<table  align="center" style="height: 100%;background-color: #6a4fff; " cellpadding="10" cellspacing="0" border="1" >
<tr>
   <td></td>
   <td></td>
</tr>
<tr>
<!-- ============ LEFT COLUMN (MENU) ============== -->
<td width="30%" valign="top" border='0' style=" font-size:13.5px; padding:10px; line-height:28px; text-align:inherit;text-align:center;background-color: #6a4fff; background-image: linear-gradient(to right, #2500f1, #6a4fff);">
<h2 style='color:white;'><b>OPEN INTERFACE<b></h2><br><hr><br>
  <p><b><h3><font color='white'>List Of Accounts</font><h3></b></p><br><br>
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

if($id == ''){
    $query=mysql_query("select assignedip as data  from mumara ");
} else {
    $query=mysql_query("select assignedip as data  from mumara where where sno = '$id'");
}

    while($rows=mysql_fetch_array($query))
    {
      $all[].=$rows['data'];
    }
    $eee=implode("\n",$all) ;

    $server_using=str_replace("','",",",$server);
  ?>

  <p>
  <textarea style="width:500px; height:270px;" name="accs" cols="75" rows="20" id = "accs" placeholder="put ip here"><?php echo $eee; ?></textarea>
  <p><div id='mailing1'></div></p>
</td>

<!-- ============ MIDDLE COLUMN (CONTENT) ============== -->

<td width="70%" valign="top" style="    background: #f8f9fa;    border-top-left-radius: 10% 50%;    border-bottom-left-radius: 10% 50%;">
<div align="center"  >        

<br><br>
&nbsp;&nbsp;&nbsp;&nbsp;From Email Address---- &nbsp;<input style="border:1px dotted #999; font-weight:500" type="text" name="ip" size="40" id="ip" value="<?php echo $row['ip']; ?>" />
<br><br>


 <center>



                                <?php
                                                          if($row['mode']=='bulk')
                                                            {

                                                                echo '<div class="switch-field">
                                                                 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                                 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                                <input name="mode" type="radio" id="radio-one"  value="test" />
                                                                <label for="radio-one"><strong>Test</strong></label>
                                                                <input name="mode" type="radio" id="radio-two" value="bulk"  checked="checked"/>
                                                                <label for="radio-two"><strong>Bulk</strong></label>
                                                            ';

                                                            }
                                                            else
                                                            {

                                                                echo '<div class="switch-field">
                                                              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                                 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
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




<div align="center" style="padding-top:10px; text-align:left">
<table align="center" cellpadding="0" border="0" cellspacing="0" style="font-size:12px;">
  <tbody>
    <tr>
      <td align="left" style="padding-right:20px;"><strong>Subject</strong></td>
      <td align="left" style="padding-bottom:10px;"><input type="text" name="sub" id="sub2" size="60" value="<?php echo $row['subject']; ?>">
      <br>
      <div>
          <input type="radio" name="sencode" value="ascii"> UTF8-Q                   
          <input type="radio" name="sencode" value="base64"> UTF8-B           
          <input type="radio" name="sencode" value="reset" checked> RESET 
      </div>
      </td>
    </tr>
    <tr>
      <td align="left" style="padding-right:20px;"><strong>From</strong></td>
      <td align="left" style="padding-bottom:10px;"><input type="text" name="from" id="from2" size="60"  value="<?php echo $row['from_val']; ?>">
      <br>
      <div>
          <input type="radio" name="fmencode" value="ascii"> UTF8-Q 
          <input type="radio" name="fmencode" value="base64"> UTF8-B
          <input type="radio" name="fmencode" value="reset" checked> RESET 
      </div>     
      </td>
    </tr>
    <tr>
      <td align="left" style="padding-right:20px;"><strong>Test Email</strong></td>
      <td align="left" style="padding-bottom:10px;"><textarea name="emails" cols="0" rows="0" style="width:434px; height:100px;" id="emails"><?php echo $row['emails']; ?></textarea></td>
    </tr>
  </tbody>
</table>

<!-- Content -->
<table align="center" style="font-size:12px;" cellpadding="0" border="0" cellspacing="0" width="50%">
  <tbody align="center"> 
    <tr>
      <td align="center" style="padding-right:20px;"><strong>Body</strong></td>
      <td>


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
<a href='http://v4mediasolutions.com/edit.php' class="btn-primary" style="background-color:#0cbe05;height:30px;padding:6px 15px;border-radius:4px" type="button" target='_blank'> EDITOR </a>
        </p>

        </p>



        <table cellpadding="5" cellspacing="0" border="0" style="padding:0px;">
          <tr>                
            <td id="sleepid">
                <select name="charen" id="charen" style="width: 200px">
                  <option value="UTF-8" selected="selected"> UTF-8 </option> 
                  <option value="us-ascii" > US-ASCII </option>
                  <option value="iso-8859-1" > ISO-8859-1 </option>
                  <option value="windows-1251" > WINDOWS-1251 </option>                 
                </select>                
                         &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <select name="contend" id="contend" style="width: 200px">
                  <option value="8bit"> 8bit </option>    
                  <option value="binary"> binary </option>                               
                  <option value="quoted-printable" selected="selected"> quoted-printable </option>  
                  <option value="7bit"> 7bit </option>   
                  <option value="base64"> base64 </option>   
                  <option value="x-uuencode">X1</option>                     
                </select>
            </td>
          </tr>                   
          <tr>
           <td><textarea style="width:375px; margin-left:54px; height:300px;" name="message" cols="55" rows="25"><?php echo $row['msg']; ?></textarea> </td>
          </tr>
          <tr>                
            <td id="sleepid">
                <select name="charen_alt" id="charen_alt" style="width: 200px">
                  <option value="UTF-8" selected="selected"> UTF-8 </option>
                  <option value="us-ascii" > US-ASCII </option>
                  <option value="iso-8859-1" > ISO-8859-1 </option>
                  <option value="windows-1251" > WINDOWS-1251 </option>   
                </select>               &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
                <select name="contend_alt" id="contend_alt" style="width: 200px">
                  <option value="8bit"> 8bit </option>      
                  <option value="binary"> binary </option>                             
                  <option value="quoted-printable" selected="selected"> quoted-printable </option>  
                  <option value="7bit"> 7bit </option>   
                  <option value="base64"> base64 </option>  
                  <option value="x-uuencode">X1</option>                      
                </select>
            </td>
          </tr> 
          <tr>
            <td><textarea style="width:375px; margin-left:54px; height:50px;" name="textm" cols="55" rows="25"><?php echo $row['textm']; ?></textarea> </td>
          </tr>
        </table>
        <table style="font-size:12px;" width="450" border="0">
          <tr>
            <td id="mdata"><div align="right"><strong>DataFile</strong></td>
            <td><input type="text" name="data" id="data3" value="<?php echo $row['data']; ?>"></td>                      
            <td width="101" id="mlimit"><div align="right"><strong>Limit</strong></td>
            <td width="193"><input name="limit" type="text" value="<?php echo $row['limits']; ?>"></td>
            <td id="mdata"><div align="right"><strong>Limit_to_Send</strong></td>
            <td><input type="text" name="ls" id="ls" value="<?php echo $row['limit_to_send']; ?>"></td>                  
          </tr>

          <tr style="padding-top:100px">
              <td id="mdata"><div align="right"><strong>Offerid</strong>
              <td><input type="text" name="offer" id="offer" value="<?php echo $row['offer']; ?>"></td>
              <td id="mdata"><div align="right"><strong>Msgid</strong>
              <td><input type="text" name="msid" id="msid" value="<?php echo $row['bcc']; ?>"></td>
              <td id="mdata"><div align="right"><strong>Domain</strong>
              <td><input type="text" name="domain" id="domain" value="<?php echo $row['domain']; ?>"></td>
          </tr>                
          <tr>                
            <td id="mdata"><div align="right"><strong>Wait Time</strong>
            <td><select name="wait" id="wait" style="width: 130">
                  <option value="0"> 0 </option>                  
                  <option value="1"> 1 </option>                  
                  <option value="2" selected="selected"> 2 </option>  
                  <option value="3"> 3 </option>                  
                </select></td>
            <td id="sleepid"><div align="right"><strong>Sleep time</strong>
            <td><input type="text" name="sp" id="sp" value="<?php echo $row['sleep_time']; ?>"></td>
            <td id="mdata"><div align="right"><strong>Times_To_Send </strong>
            <td><input type="text" name="times" id="times" value="1"  ></td>
                  
          </tr>               
          <tr>                
          <td id="mdata"><div align="right"><strong>Restart_Choice</strong>
            <td><select name="res_choice" id="res_choice" style="width: 130">
                  <option value="YES"> YES </option>   
                  <option value="NO"> NO </option>            
                </select>
            </td>
            <td id="mdata"><div align="right"><strong>Relay Percent</strong></td>
            <td><input type="text" name="relayp" id="relayp" value=""></td>
                <td id="mdata"><div align="right"><strong>Temp-Name</strong>
                <td><input type="text" name="name" id="name" value="<?php echo $row['tempname']; ?>"></td>
          </tr>                   
          <tr>
            <td id="mdata"><div align="right"><strong>Mail_After_Every</strong>
            <td><input type="text" name="mail_per" id="mail_per"  value="<?php echo $row['remarks']; ?>"></td>      
            <td id="mdata"><div align="right"><strong>Script_Mail_Choice </strong>
            <td><input type="text" name="mail_ch" id="mail_ch"  value=""></td>
            <td id="mdata"><div align="right"><strong>Inbox Percent</strong>
            <td><input type="text" name="inb" id="inb" value=""></td>                
          </tr>           
          <tr>
            <td id="mdata"><div align="right"><strong>Reply to</td>
            <td>
                <select name="replyto" id="replyto" style="width: 130">
                  <option value="1"> YES </option>   
                  <option value="0"> NO </option>            
                </select>
            </td>
            <td id="mdata"><div align="right"><strong>X-mailer</td>
            <td>
                <select name="xmailer" id="xmailer" style="width: 130">
                  <option value="1"> YES </option>   
                  <option value="0"> NO </option>            
                </select>
            </td>
            <td id="mdata"><div align="right"><strong>Inbox Pattern</td>
            <td>
<select name="inbpatt" id="inbpatt" style='width:100%'>

                                        <?php
                                        $patternitemone =   "value='".trim($row['inbpatt'])."'";
                                        $patternitemtwo =   "value='".trim($row['inbpatt'])."' selected ";
                                         $patterndata = file_get_contents("http://173.249.50.153/interface/getpattern.php");
                                       $patterndata = trim($patterndata);
                                        $patternresult = str_replace($patternitemone,$patternitemtwo,$patterndata);
                                        echo "$patternresult";
                                        ?>
                        </select>

            </td>
          </tr>           
        </table>
        <table>
          <tr>
            <td style="padding-top:10px; padding-bottom:10px;">
              <div  align="center" style=" width:148px; height:18px; z-index:1 ; background-color: #0479C0; layer-background-color: #0479C0; border: 1px none #000000;display:none;" id='loadingreport123'>
              <div align="center" class="style2"><font color="#FFFFFF"><strong><font size="2">Sending .. </font></strong></font></div>
            </td>
          </tr>
        </table>
        <table cellpadding="0" cellspacing="0" width="500" align="center">
          <tr>
            <td width="150" align="center"></td>
            <td width="0" align="center"><input class="btn-primary" type="button" style='border-radius: 4px;   width: 200px;    height: 50px;    font-weight: bold;    background: #1dff23;    font-size: xx-large;' name="button" value="Send" onClick="new Ajax.Updater('mailing1', 'php_mailer_hold.php', {asynchronous:true, evalScripts:true, method:'post', onComplete:function(request){new Effect.Appear('mailing1');new Effect.Fade('loadingreport123');}, onLoading:function(request){new Element.show('loadingreport123')}, parameters:Form.serialize(this.form)})">&nbsp;&nbsp;&nbsp;&nbsp;</td>
          </tr>
        </table>
      </td>
    </tr>
  </tbody>
</table>
  <tr>
    <td><div id='mailing2'></div></td>
    <td align="center" style="border:1px dotted #666666; font-size:9px; padding:5px;"></td>
  </tr>    
  <!-- End Content -->

<!-- ============ FOOTER SECTION ============== -->

<table align="center">
  <tr>
    <td colspan="10" align="center" height="20" ><font size="-2"></font></td>
  </tr>
</table>
</form>
</fieldset>
</div>
</div>
</body>
</html>

