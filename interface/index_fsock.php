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
</style>
<title>SMTP</title>
</head>
<!--<script src="jquery.js"></script>-->
<link href="select2.css" rel="stylesheet"/>
</head>
<body id="root" style="margin: 0px; padding: 0px;">

<td>
<fieldset style="border: 1px solid #000000; border: 2px dotted #000000; left:5px">
<legend></legend>
<div class="container-fluid">
<div classs="row">
<div class="col-md-4" style="text-align:left;padding-top:20px">
<form name="tempload" id="tt" method="post" action="saved_temp.php">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<select name="tempp" style="width:270px;height:30px" class="custom-select">  
                                <option value="" selected="selected" ><-<b>Select Name Of Approved Templates</b>-></option>

                                <?php
                                          include "include.php";
                                          $select=mysql_query("select sno,tempname from svml_sendgrid where status = '1' group by tempname");
                                           while($row=mysql_fetch_array($select))
                                         {
                                          echo "<option value=".$row[0].">".$row[1]."</option>";
                                         }
                                   ?>

                                </select><input type="submit" value="Load" name="submit" class="btn-primary" style="padding:6px 26px;border-radius:4px"></form>
                                
                         </div>       
</div>
</div>
</td>
       <div class="container-fluid">
       <div class="row">
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
        <table  align="center" style="height: 100%;" cellpadding="10" cellspacing="0" border="2">
  
<!-- ============ NAV ============== -->
        <tr>
        <td style="background-color:#000033; color:#fff;text-align:center"><h2>SMTP AUTO</h2></td>
                <td  valign="middle" align="center" height="30" style="border:1px dotted #999">
<table width="100%">
<tr>
  <td align="center">
 &nbsp;&nbsp;&nbsp;&nbsp;From Email Address   
    ---- &nbsp;<input style="border:1px dotted #999; font-weight:500" type="text" name="ip" size="40" id="ip" value="<?php echo $row['ip']; ?>" /></td>
  <td align="right">
    <b><font size="2px" color="red"> WELCOME :- </font> <font size="1px"><?php echo strtoupper($_SESSION['fname']." ".$_SESSION['lname']);?>&nbsp<button class="btn-primary" style="padding:5px 14px;border-radius:4px"><a href="logout.php" style="text-decoration: none;color:#fff;font-size:14px">Logout</a></button></font>
     </td>
</tr>
</table></td>
        </tr>

        <tr>
<!-- ============ LEFT COLUMN (MENU) ============== -->
        <td width="30%" valign="top" style=" border:1px solid #666; font-size:13.5px; padding:10px; line-height:28px; text-align:inherit;text-align:center">

 <p style="border-bottom:1px dotted #666">List Of Accounts</p>
 

<?php
include "include.php";
$a=array($_REQUEST);
for ($i=0; $i<=count($a['0']['server'])-1; $i++) 
{
if($i==count($a['0']['server'])-1 ){
$server.=$a['0']['server'][$i];
}
else
{
$server.=$a['0']['server'][$i]."','";
}
}
//$query=mysql_query("select concat(hostname,'|',assignedip,'|',user,'|',pass,'|',server) as data  from mumara where server in ('$server')");
$query=mysql_query("select assignedip as data  from mumara where server in ('$server')");
while($row=mysql_fetch_array($query)){
$all[].=$row['data'];
}
$eee=implode("\n",$all) ;


$server_using=str_replace("','",",",$server);

?>
 
 
<p>
         <textarea style="width:325px; height:270px;" name="accs" cols="55" rows="20" id = "accs" placeholder="put ip here"><?php echo $eee; ?></textarea>
        
    
    <p><div id='mailing1'></div></p>
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
      echo "<input name='mode' type='radio' value='test' checked='checked' >";
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

    <br>
      
<div>       <input type="radio" name="sencode" value="ascii"> UTF8-Q                   <input type="radio" name="sencode" value="base64"> UTF8-B           <input type="radio" name="sencode" value="reset" checked> RESET </div>

          </tr>


        <tr>
        <td align="left" style="padding-right:20px;"><strong>From</strong></td>
        
        <td align="left" style="padding-bottom:10px;"><input type="text" name="from" id="from2" size="60"  value="<?php echo $row['from_val']; ?>">
        
          <br>
      
<div>       <input type="radio" name="fmencode" value="ascii"> UTF8-Q                    <input type="radio" name="fmencode" value="base64"> UTF8-B              <input type="radio" name="fmencode" value="reset" checked> RESET </div>
     
        </td>
 
    
        </tr>


        <tr>
        <td align="left" style="padding-right:20px;"><strong>Test Email</strong></td>
        <td align="left" style="padding-bottom:10px;"><textarea name="emails" cols="0" rows="0" style="width:434px; height:100px;" id="emails"><?php echo $row['emails']; ?></textarea></td>
        
        </tr>
                </tbody></table>

<!-- Content -->
        <table align="center" style="font-size:12px;" cellpadding="0" border="0" cellspacing="0" width="50%">
        <tbody align="center"> 
        
        <tr>
         <td align="center" style="padding-right:20px;"><strong>Body</strong></td>
        
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
                  <input class="btn-primary" style="padding:6px 12px;border-radius:4px" type="button" value=" Preview " onClick="displayHTML(this.form)">
                  </p>
                  <table cellpadding="5" cellspacing="0" border="0" style="padding:0px;">
                  <tr>
                  <td >
                  
                  <textarea style="width:375px; margin-left:54px; height:300px;" name="message" cols="55" rows="25"><?php echo $row['msg']; ?></textarea> </td>
                                 
                 
                  </tr>
                  <tr>
                  <td >
                  
                  <textarea style="width:375px; margin-left:54px; height:50px;" name="textm" cols="55" rows="25"><?php echo $row['textm']; ?></textarea> </td>
                                 
                 
                  </tr>
                  

                  </table>
                  
                  <div align="center"  >
        
       Send Type :
         <?php
                 
                 if($row['sen_t']=='auto')
                 {
                 echo "<input name='sen_t' type='radio' value='script'>";
                           echo "Manual";
       echo " <input name='sen_t' type='radio' value='auto'  checked='checked'>";
                   echo "Auto"; 
      
                }

else
{
      echo "<input name='sen_t' type='radio' value='manual' checked='checked'>";
                           echo "Manual";
        echo "<input name='sen_t' type='radio' value='auto'>";
                   echo "Auto"; 
                }
?>

 </div>
                  
                  <table style="font-size:12px;" width="450" border="0">
                                        <tr>
                                        
                                        
                  <td id="mdata"><div align="right"><strong>DataFile</strong>
                </div>
                <td>
                  <input type="text" name="data" id="data3" value="<?php echo $row['data']; ?>"></td>                      
                                        
                <td width="101" id="mlimit"><div align="right"><strong>Limit</strong>
                </div>
                <td width="193">
                  <input name="limit" type="text" value="<?php echo $row['limits']; ?>"></td>
                  
                  

                    <td id="mdata"><div align="right"><strong>Limit_to_Send</strong>
                </div>
                <td>
                  <input type="text" name="ls" id="ls" value="<?php echo $row['limit_to_send']; ?>"></td>                  
                  
                  
               
               
               
                </tr>
                <tr style="padding-top:100px">                <br>

                
                
                               <td id="mdata"><div align="right"><strong>Offerid</strong>
                </div>
                <td>
                  <input type="text" name="offer" id="offer" value="<?php echo $row['offer']; ?>"></td>

                  <td id="mdata"><div align="right"><strong>Msgid</strong>
                </div>
                <td>
                  <input type="text" name="msid" id="msid" value="<?php echo $row['bcc']; ?>"></td>


  <td id="mdata"><div align="right"><strong>Domain</strong>
                </div>
                <td>
                  <input type="text" name="domain" id="domain" value="<?php echo $row['domain']; ?>"></td>

                  
  
                  
               
                                </tr>                

      
                <tr>                
             
                  <td id="mdata"><div align="right"><strong>Wait Time</strong>
                </div>
                <td>
                  <select name="wait" id="wait" style="width: 130">
                           <option value="0"> 0 </option>                  
                           <option value="1"> 1 </option>                  
                           <option value="2" selected="selected"> 2 </option>  
                           <option value="3"> 3 </option>                  
                  </select>
                  </td>
             
             
              <td id="sleepid"><div align="right"><strong>Sleep time</strong>
                </div>
                <td><input type="text" name="sp" id="sp" value="<?php echo $row['sleep_time']; ?>"></td>
                <td id="mdata"><div align="right"><strong>Times_To_Send </strong>
                </div>
                <td>
                  <input type="text" name="times" id="times" value="1"  ></td>
                  
                  </tr>               

                 
            
                 
<tr>                
             
                 
             
              <td id="sleepid"><div align="right"><strong>Char_Encoding</strong>
                </div>
                <td>
                 <select name="charen" id="charen" style="width: 130">
                           <option value="UTF-8" selected="selected"> UTF-8 </option>                  
                        <!--   <option value="1"> 1 </option>                  
                           <option value="2" selected="selected"> 2 </option>  
                           <option value="3"> 3 </option>                  -->
                  </select>                
                
               
                
                <td id="mdata"><div align="right"><strong>Cont_Encoding </strong>
                </div>
                <td>
                  <select name="contend" id="contend" style="width: 130">
                           <option value="8bit"> 8bit </option>                  
                            <option value="binary"> binary </option>              
                           <option value="quoted-printable" selected="selected"> quoted-printable </option>  
                           <option value="7bit"> 7bit </option>   
                           <option value="base64"> base64 </option>        
                           <option value="x-uuencode">X1 </option>     
                           
                           
                  </select>     </td>
                     <td id="mdata"><div align="right"><strong>Temp-Name</strong>
                </div>
                <td>
                  <input type="text" name="name" id="name" value="<?php echo $row['tempname']; ?>"></td>
                  
                  </tr>                   
               
                  
                  <tr>
               
             
             <td id="mdata"><div align="right"><strong>Mail_After_Every</strong>
                </div>
                <td>
                  <input type="text" name="mail_per" id="mail_per"  value="<?php echo $row['remarks']; ?>"></td>
                  
           <td id="mdata"><div align="right"><strong>Script_Mail_Choice </strong>
                </div>               
 <td>
 
 
 <input type="text" name="mail_ch" id="mail_ch"  value=""></td>
                     </td>       
                  
                                      <td id="mdata"><div align="right"><strong>Inbox Percent</strong>
                </div>
                <td>
                  <input type="text" name="inb" id="inb" value=""></td>
                          
                  </tr>           
                  
                  
                  <tr>
                  
                                 <td id="mdata"><div align="right"><strong>Restart_Choice</strong>
                </div>
                <td>
                 <select name="res_choice" id="res_choice" style="width: 130">
                         
                           <option value="YES"> YES </option>   
                           <option value="NO"> NO </option>            
                           
                           
                  </select>  </td>
                  
                  
                  
                                      <td id="mdata"><div align="right"><strong>Relay Percent</strong></td>
                </div>
                <td>
                  <input type="text" name="relayp" id="relayp" value=""></td>
                          
                          
                          <td id="mdata"><div align="right"><strong>MSGID TYPE</strong>
                </div>
                <td>
                  <select name="msgt" id="msgt" style="width: 130">
                           <option value="T1" selected="selected"> T1 </option>                  
                            <option value="T2"> T2 </option>              
                           <option value="T3"> T3 </option>   
                           
                  </select>     </td>
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
         
<!--<td width="0" align="center"><input class="btn-primary" type="button" style="border-radius:4px" name="button" value="phpmailer" onClick="new Ajax.Updater('mailing1', 'php_mailer_hold.php', {asynchronous:true, evalScripts:true, method:'post', onComplete:function(request){new Effect.Appear('mailing1');new Effect.Fade('loadingreport123');}, onLoading:function(request){new Element.show('loadingreport123')}, parameters:Form.serialize(this.form)})">&nbsp;&nbsp;&nbsp;&nbsp;</td>
<td width="0" align="center"><input class="btn-primary"style="background:#5bc0de;border-radius:4px" type="button" name="button" value="Swift Mailer" onClick="new Ajax.Updater('mailing1', 'swift_mailer_hold.php', {asynchronous:true, evalScripts:true, method:'post', onComplete:function(request){new Effect.Appear('mailing1');new Effect.Fade('loadingreport123');}, onLoading:function(request){new Element.show('loadingreport123')}, parameters:Form.serialize(this.form)})">&nbsp;&nbsp;&nbsp;&nbsp;</td>
<td width="0" align="center"><input class="btn-primary" style="background:#f0ad4e;border-radius:4px" type="button" name="button" value="phpmailer2" onClick="new Ajax.Updater('mailing1', 'smtp2go_hold.php', {asynchronous:true, evalScripts:true, method:'post', onComplete:function(request){new Effect.Appear('mailing1');new Effect.Fade('loadingreport123');}, onLoading:function(request){new Element.show('loadingreport123')}, parameters:Form.serialize(this.form)})">&nbsp;&nbsp;&nbsp;&nbsp;</td>
-->
<td width="0" align="center"><input class="btn-primary" style="background:#5cb85c;border-radius:4px" type="button" name="button" value="Fsock" onClick="new Ajax.Updater('mailing1', 'socket_hold.php', {asynchronous:true, evalScripts:true, method:'post', onComplete:function(request){new Effect.Appear('mailing2');new Effect.Fade('loadingreport123');}, onLoading:function(request){new Element.show('loadingreport123')}, parameters:Form.serialize(this.form)})">&nbsp;&nbsp;&nbsp;&nbsp;</td>
<!--<td width="0" align="center"><input class="btn-primary" style="background:#5cb85c;border-radius:4px" type="button" name="button" value="Open" onClick="new Ajax.Updater('mailing2', 'opencount.php', {asynchronous:true, evalScripts:true, method:'post', onComplete:function(request){new Effect.Appear('mailing2');new Effect.Fade('loadingreport123');}, onLoading:function(request){new Element.show('loadingreport123')}, parameters:Form.serialize(this.form)})">&nbsp;&nbsp;&nbsp;&nbsp;</td>
-->
<td width="0" align="center"><input class="btn-primary" type="button" style="border-radius:4px" name="button" value="Open" onClick="new Ajax.Updater('mailing2', 'opencount2.php', {asynchronous:true, evalScripts:true, method:'post', onComplete:function(request){new Effect.Appear('mailing2');new Effect.Fade('loadingreport123');}, onLoading:function(request){new Element.show('loadingreport123')}, parameters:Form.serialize(this.form)})">&nbsp;&nbsp;&nbsp;&nbsp;</td>
<td width="0" align="center"><input class="btn-primary"style="background:#269abc;border-radius:4px" type="button" name="button" value="Get Link" onClick="new Ajax.Updater('mailing2', 'get_link.php', {asynchronous:true, evalScripts:true, method:'post', onComplete:function(request){new Effect.Appear('mailing2');new Effect.Fade('loadingreport123');}, onLoading:function(request){new Element.show('loadingreport123')}, parameters:Form.serialize(this.form)})">&nbsp;&nbsp;&nbsp;&nbsp;</td>

  
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
</div>
</div>
</body>


</html>

