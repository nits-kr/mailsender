<?php
include "session.php";
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<head>

<style type="text/css">
.style1 {
        font-size: 12px;
        font-weight: bold;
}
.style2 {font-size: 10px; font-weight: bold; font-family: tahoma; text-align:center;}
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
</script>

<meta http-equiv="content-type" content="text/html; charset=ISO-8859-1" />
<link rel="stylesheet" href="style.css" type="text/css" media="all">
<style>
input[type="radio"].rad{padding:0;vertical-align:middle;}
</style>
<title>SMTP</title>
</head>

<body id="root" style="margin: 0px; padding: 0px;">


<fieldset style="border: 1px solid #000000; border: 2px dotted #000000; left:5px">
<legend></legend>
&nbsp;&nbsp;&nbsp;&nbsp;<form name="tempload" id="tt" method="post" action="saved_temp.php">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<select name="tempp" style="width:250px">  
                                <option value="" selected="selected"><-<b>Select Name Of Approved Templates</b>-></option>

                                <?php
                                          include "include.php";
                                          $select=mysql_query("select sno,tempname from svml_sendgrid where status = '1' group by tempname");
                                           while($row=mysql_fetch_array($select))
                                         {
                                          echo "<option value=".$row[0].">".$row[1]."</option>";
                                         }
                                   ?>

                                </select><input type="submit" value="Load" name="submit"></form>
        <form name="form1" id ="frm1">
<?php


        $id = $_REQUEST['tempp'];
        $a=mysql_query("select * from svml_sendgrid where sno = '$id'");
        $row = mysql_fetch_array($a);
        ?> 
        <table align="right">
						<tr>
                       <td colspan="3"></td>        
                  </tr>
        </table>
        <table width="90%" align="center" style="height: 100%;" cellpadding="10" cellspacing="0" border="2">
  
<!-- ============ NAV ============== -->
        <tr>
        <td style="background-color:#000033; color:#fff"><h2>SMTP AUTO</h2></td>
                <td  valign="middle" align="center" height="30" style="border:1px dotted #999">
<table width="100%">
<tr>
  <td align="center">
    --- From Email Address<br>
    <input style="border:1px dotted #999; font-weight:500" type="text" name="ip" size="40" id="ip" value="<?php echo $row['ip']; ?>" /></td>
  <td align="right">
    <b><font size="1px" color="red"> WELCOME :- </font> <font size="1px"><?php echo strtoupper($_SESSION['fname']." ".$_SESSION['lname']);?>&nbsp<button style="background: #ddd;"><a href="logout.php" style="text-decoration: none;">Logout</a></button></font>
     </td>
</tr>
</table></td>
        </tr>

        <tr>
<!-- ============ LEFT COLUMN (MENU) ============== -->
        <td width="30%" valign="top" style=" border:1px solid #666; font-size:13.5px; padding:10px; line-height:28px; text-align:inherit;">

        <!--<p style="border-bottom:1px dotted #666">SMTP Credentials</p>
<b>Server: <input name="server" type="text" value="<?php echo $row['domain']; ?>"></br>
Port: <input name="port" type="text" value="<?php echo $row['head']; ?>"></br>
User: <input name="usr" type="text" value="<?php echo $row['username']; ?>"></br>
pass: <input name="pass" type="text" value="<?php echo $row['pwd']; ?>"></br>
TLS: <select name='tls'>
<option>No</option>
<option>Yes</option>
</select></b>-->
 <p style="border-bottom:1px dotted #666">List Of Accounts</p>

         <textarea style="width:325px; height:300px;" name="accs" cols="55" rows="15" id = "accs" placeholder="put ip here"><?php echo $row['mutidomains']; ?></textarea>
    
    <p><div id='mailing1'>
    <?php 
    echo "<font size='2'  color='red'>Your ID :[".$row['sno']."]</font><br>";
    echo "<font color='green'> Your Templete is approved You can run script </font> <br>";   
    echo "To Run In Screen Use Below Command<br>cd /var/www/html/php_file_auto_new/<br>";
    echo "php send_lu.php ".$row['sno'];
    ?>
    </div></p>
    </td>

<!-- ============ MIDDLE COLUMN (CONTENT) ============== -->

        <td width="70%" valign="top" >
        <div align="center"  >
        
         <?php
                 
                 if($row['mode']=='bulk')
                 {
                 echo "<input name='mode' type='radio' value='test'>";
                           echo "Test";
       echo " <input name='mode' type='radio' value='bulk'  checked='checked'>";
                   echo "Bulk"; 
      
                }

else
{
      echo "<input name='mode' type='radio' value='test' checked='checked'>";
                           echo "Test";
        echo "<input name='mode' type='radio' value='bulk'>";
                   echo "Bulk"; 
                }
?> </div>

                <div align="center" style="padding-top:10px; text-align:left">
        <table align="center" cellpadding="0" border="0" cellspacing="0" style="font-size:12px;">
        <tbody >
        
        <tr >
        
        <td align="left" style="padding-right:20px;"><strong>Subject</strong></td>
        
        
        <td align="left" style="padding-bottom:10px;"><input type="text" name="sub" id="sub2" size="60" value="<?php echo $row['subject']; ?>">



                </tr>


        <tr>
        <td align="left" style="padding-right:20px;"><strong>From</strong></td>
        <td align="left" style="padding-bottom:10px;"><input type="text" name="from" id="from2" size="60"  value="<?php echo $row['from_val']; ?>"></td>
        
        </tr>


        <tr>
        <td align="left" style="padding-right:20px;"><strong>Test Email</strong></td>
        <td align="left" style="padding-bottom:10px;"><textarea name="emails" cols="0" rows="0" style="width:374px; height:100px;" id="emails"><?php echo $row['emails']; ?></textarea></td>
        
        </tr>
                </tbody></table>

<!-- Content -->
        <table align="center" style="font-size:12px;" cellpadding="0" border="0" cellspacing="0" width="50%">
        <tbody align="center"> 
        
        <tr>
         <td align="left" style="padding-right:20px;"><strong>Body</strong></td>
        
        <td><p>Type: 
                   <?php
                               
                                  if($row['type']=='plain')
                 {
$dd = "document.getElementById('mime').style.display = 'none'";
echo "<input name='type' type='radio' value='plain' onClick='$dd' class='rad'>";
                 echo "Plain";
                  echo "<input name='type' type='radio' value='html' onClick='$dd' class='rad'>";
                 echo "Html";
                 echo "<input name='type' type='radio' value='mime' onClick='$dd' class='rad'  checked='checked'>";
                 echo "MIME";

}
 elseif($row['type']=='mime')
                 {
$dd = "document.getElementById('mime').style.display = 'none'";
echo "<input name='type' type='radio' value='plain' onClick='$dd' class='rad' checked='checked'>";
                 echo "Plain";
                  echo "<input name='type' type='radio' value='html' onClick='$dd' class='rad'>";
                 echo "Html";
echo "<input name='type' type='radio' value='mime' onClick='$dd' class='rad'>";
                 echo "MIME";
}
else
{
$dd= "document.getElementById('mime').style.display = 'none'";
echo "<input name='type' type='radio' value='plain' onClick='$dd' class='rad'>";
                 echo "Plain";
                  echo "<input name='type' type='radio' value='html' onClick='$dd' class='rad'  checked='checked'>";
                 echo "Html";
                 echo "<input name='type' type='radio' value='mime' onClick='$dd' class='rad'>";
                 echo "MIME";

}
     
                                  ?>
                  <input type="button" value=" Preview " onClick="displayHTML(this.form)">
                  </p>
                  <table cellpadding="5" cellspacing="0" border="0" style="padding:0px;">
                  <tr>
                  <td >
                  
                  <textarea style="width:375px; margin-left:54px; height:300px;" name="message" cols="55" rows="25"><?php echo $row['msg']; ?></textarea> </td>
                                 
                 
                  </tr>
                  <tr>
                  <td >
                  
                  <textarea style="width:375px; margin-left:54px; height:50px;" name="textm" cols="55" rows="25"><?php echo $row['textm']; ?></textarea> </td>
                                 
                 
                  </tr></table>
                  
                  
                  <table style="font-size:12px;" width="450" border="0">
                                        <tr>
                <td width="101" id="mlimit"><div align="right"><strong>Limit</strong>
                </div>
                <td width="193">
                  <input name="limit" type="text" value="<?php echo $row['limits']; ?>"></td>
                <td id="mdata"><div align="right"><strong>DataFile</strong>
                </div>
                <td>
                  <input type="text" name="data" id="data3" value="<?php echo $row['data']; ?>"></td>
                </tr>
                
                <tr><td id="mdata"><div align="right"><strong>Offerid</strong>
                </div>
                <td>
                  <input type="text" name="offer" id="offer" value="<?php echo $row['offer']; ?>"></td>
                  <td id="mdata"><div align="right"><strong>msgid</strong>
                </div>
                <td>
                  <input type="text" name="msid" id="msid" value="<?php echo $row['bcc']; ?>"></td>
                </tr>
<tr>
                    <td id="mdata"><div align="right"><strong>Limit To Send</strong>
                </div>
                <td>
                  <input type="text" name="ls" id="ls" value="<?php echo $row['limit_to_send']; ?>"></td>
                <td id="sleepid"><div align="right"><strong>Sleep time</strong>
                </div>
                <td><input type="text" name="sp" id="sp" value="<?php echo $row['sleep_time']; ?>"></td>
                                </tr>
            <tr>
               
               <td id="mdata"><div align="right"><strong>Domain</strong>
                </div>
                <td>
                  <input type="text" name="domain" id="domain" value="<?php echo $row['domain']; ?>"></td>
                  <td id="mdata"><div align="right"><strong>List-Unsub domain</strong>
                </div>
                <td>
                  <input type="text" name="remarks" id="remarks" value="<?php echo $row['remarks']; ?>"></td></tr>
                <tr>                
                <td id="mdata"><div align="right"><strong>Temp-Name</strong></td>
                </div>
                <td>
                  <input type="text" name="name" id="name" value="<?php echo $row['tempname']; ?>">
                  </td>
                  <td id="mdata"><div align="right"><strong>Wait Time</strong></td>
                <td>
                <!--<input type="text" name="wait" id="wait" value="<?php echo $row['sleep']; ?>">-->
                <select name="wait" id="wait" style="width: 130">
                <?php 
                $sleep=$row['sleep'];
                switch($sleep) 
                {
                	case "0" : echo "<option value='0' selected='selected'> 0 </option>
                	                         <option value='1' > 1 </option>                  
                                            <option value='2' > 2 </option>  
                                            <option value='3' > 3 </option>";
                                            break;
                	case "1" : echo "<option value='0' > 0 </option>
                	                         <option value='1' selected='selected'> 1 </option>                  
                                            <option value='2' > 2 </option>  
                                            <option value='3' > 3 </option>";   
                                            break;
                	case "2" : echo "<option value='0' > 0 </option>
                	                         <option value='1' > 1 </option>                  
                                            <option value='2' selected='selected'> 2 </option>  
                                            <option value='3' > 3 </option>";   
                                            break;
                	default : echo "<option value='0' > 0 </option>
                	                         <option value='1' > 1 </option>                  
                                            <option value='2' > 2 </option>  
                                            <option value='3' selected='selected'> 3 </option>";                             
                }                                       
                ?>
                
                                          
                                       
                  </select>       
                  </td>
                  </tr>
                </table>
<table >
<tr>
<td style="padding-top:10px; padding-bottom:10px;">
                                <div  align="center" style=" width:148px; height:18px; z-index:1 ; background-color: #0479C0; layer-background-color: #0479C0; border: 1px none #000000;display:none;" id='loadingreport123'>
  <div align="center" class="style2"><font color="#FFFFFF"><strong><font size="2">Sending .. </font></strong></font></div>
</div>

</td>
</tr>
</table>
                <table cellpadding="0" cellspacing="0" width="500" align="center" border="1">
                      <tr>
                                <td width="150" align="center">-- HEADERS --</td>
                                
 <td width="0" align="center"><input type="button" name="button" value="Send List Unsub" onClick="new Ajax.Updater('mailing1', 'global_send_lu.php', {asynchronous:true, evalScripts:true, method:'post', onComplete:function(request){new Effect.Appear('mailing1');new Effect.Fade('loadingreport123');}, onLoading:function(request){new Element.show('loadingreport123')}, parameters:Form.serialize(this.form)})">&nbsp;&nbsp;&nbsp;&nbsp;</td>
 <td width="0" align="center"><input type="button" name="button" value="Open Count" onClick="new Ajax.Updater('mailing2', 'opencount.php', {asynchronous:true, evalScripts:true, method:'post', onComplete:function(request){new Effect.Appear('mailing2');new Effect.Fade('loadingreport123');}, onLoading:function(request){new Element.show('loadingreport123')}, parameters:Form.serialize(this.form)})">&nbsp;&nbsp;&nbsp;&nbsp;</td>
<!--  <td width="0" align="center"><input type="button" name="button" value="Save Template" onClick="new Ajax.Updater('mailing1', 'save.php', {asynchronous:true, evalScripts:true, method:'post', onComplete:function(request){new Effect.Appear('mailing1');new Effect.Fade('loadingreport123');}, onLoading:function(request){new Element.show('loadingreport123')}, parameters:Form.serialize(this.form)})">&nbsp;&nbsp;&nbsp;&nbsp;</td>  -->
  </tr>


                                                        </table>


                        </td>
         </tr>
                 
                 
                 
                 
        </tbody></table>
                </div>
                <tr>
                <td><div id='mailing2'></div></td>
<td align="center" style="border:1px dotted #666666; font-size:9px; padding:5px;">

</td>
</tr>    
<!-- End Content -->
</td>

                

</tbody>
</table>



<!-- ============ FOOTER SECTION ============== -->

<table align="center">

<tr><td colspan="10" align="center" height="20" ><font size="-2"></font></td></tr>
</table>
</table>

</form></fieldset>

</body>


</html>
