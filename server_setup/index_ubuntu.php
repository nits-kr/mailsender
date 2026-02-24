<?php
session_start();
if(!isset($_SESSION['username'])){
	header("Location:../admin/login.php?action=session+logged+out");die();
} 
$sid=$_SESSION['id']; 
include "../admin/include.php";
?>
<html>
<head>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
<script type="text/javascript" >
			   function myservice() {
			   	$("#karan").html('<img align="center" src="hourglass.gif" height=30 width=30> PROCESSING... PLEASE WAIT..!');
			    var data = $("#form").serialize();
			     $.ajax({
			      type: "POST",
			      url: 'serveraction_ubuntu.php',
			      data: data,
			      success: function(data) {
			     $("#karan").html(data);
			     $("#sql1").load("index.php #sql1")
			      }
			    });         
			}
</script>
<script type="text/javascript" >
			   function sendingip() {
			   	$("#karan_send").html('<img align="center" src="hourglass.gif" height=30 width=30> PROCESSING... PLEASE WAIT..!');
			    var data = $("#formsend").serialize();
			     $.ajax({
			      type: "POST",
			      url: 'sending_ip_sql.php',
			      data: data,
			      success: function(data) {
			     $("#karan_send").html(data);
			      }
			    });         
			}
</script>
<script type="text/javascript" >
			   function myconfig() {
			   	$("#karan").html('<img align="center" src="hourglass.gif" height=30 width=30> PROCESSING... PLEASE WAIT..!');
			    var ip = $("#server_ip").val();
                var pass = $("#server_pass").val();
			    var data = $("#form1").serialize();
			     $.ajax({
			      type: "POST",
			      url: 'server_config.php',
			      data: data + '&server_ip='+ ip + '&server_pass='+ pass,
			      success: function(data) {
			     $("#karan").html(data);
			     $("#sql1").load("index.php #sql1")
			      }
			    });         
			}
</script>
<script type="text/javascript" >
			   function alertt() {
			   	alert("HEADS UP...!! ARE YOU SURE TO REBOOT SERVER");
				}
</script>

<script type="text/javascript" >
			   function alerttt() {
			   	alert("HEADS UP...!! ARE YOU SURE TO RESTART SERVICE");
				}
				function reset() {
				    $("#Actionip").prop('checked', false);
				}
</script>
</head>
<body style='background: aliceblue;'>
<center>
<h1 style=" margin-bottom: 2px;"> <b><u>SERVER SETUP UBUNTU</u></b></h1>
<hr>


<table border="1" style="width: 100%; border-collapse: collapse;">
	<tr>
		<td style="width: 65%">
				<form name="form" id="form" action="javascript:myservice();" >
				<table  style="width: 100%;border-collapse: collapse;" >
						<tr>
								<td colspan="4" style="text-align: center;">
								<b>SERVER CREDENTIALS</b>
								</td>
						</tr>
						<tr>
								<td colspan="4" style="text-align: center;">
								<b><hr></b>
								</td>
						</tr>
						<tr>
								<td style="width:25%;text-align: center;">
									<b>IP : </b>
								</td>
								<td style="width:25%;text-align: center;">
									<input type="text" name="server_ip" id="server_ip" required>
								</td>
								<td style="width:25%;text-align: center;">
									<b>PASS : </b>
								</td>
								<td style="width:25%;text-align: center;">
									<input type="text" name="server_pass" id="server_pass" required>
								</td>
						</tr>
						<tr>
								<td colspan="4" style="text-align: center;">
								<b><hr></b>
								</td>
						</tr>
						<tr>
								<td colspan = "2" style="text-align: center;">
									<b>IP TUNNEL/DETUNNEL</b>
								</td>
								<td colspan = "2" style="text-align: center;">
									<b>SERVER CONFIG</b>
								</td>
						</tr>
                   <tr><td colspan="4"><hr></td>
						<tr>
								<td colspan = "2" style="text-align: center;">
									<button type="button" onclick="reset()">RESET</button>
									<table   style="width: 100%;border-collapse: collapse;">
											<tr>
													<td style="width: 16%;text-align: center;">
														<input type="radio" name="Actionip" id="Actionip" value="Chekips">
													</td>
													<td style="width: 16%;text-align: center;">
															<b>Check  IP's</b>
													</td>
													<td style="width: 16%;text-align: center;">
														<input type="radio" name="Actionip" id="Actionip" value="Tunnel">
													</td>
													<td style="width: 16%;text-align: center;">
															<b>Tunnel IP's</b>
													</td>
													<td style="width: 16%;text-align: center;">
														<input type="radio" name="Actionip" id="Actionip" value="Detunnel">
													</td>
													<td style="width: 16%;text-align: center;">
															<b>Detunnel IP's</b>
													</td>
											</tr>
											<tr><td colspan="6"><hr></td>
											<tr>
												<td colspan="2" style="text-align: center;">
														DEV NAME:&nbsp&nbsp&nbsp<input type="text" name="dev" id="dev" value="eth0" style="width: 60px"> 
												</td>
												<td colspan="4" style="text-align: center;">
														<textarea placeholder="PLEASE INSERT IP's HERE..!" style="height: 100px;width: 300px" name="textarea" id="textarea"></textarea>
												</td>	
											</tr>
											<tr><td colspan="6"><hr></td>
											<tr>
												<td colspan="3" style="text-align: center;">
														<b>UPDATE & UPGRADE </b>
												</td>	
												<td colspan="3" style="text-align: center;">
														<input type="checkbox" name="update" value="install">
												</td>
											</tr>
											<tr><td colspan="6"><hr></td>
											<tr>
												<td colspan="3" style="text-align: center;">
														<b>INSTALL HTTP </b>
												</td>	
												<td colspan="3" style="text-align: center;">
														<input type="checkbox" name="http" value="install">
												</td>
											</tr>
											<tr><td colspan="6"><hr></td>
											<tr>
												<td colspan="3" style="text-align: center;">
														<b>INSTALL PHP </b>
												</td>	
												<td colspan="3" style="text-align: center;">
														<input type="checkbox" name="php" value="install">
												</td>
											</tr>
											<tr><td colspan="6"><hr></td>
											
											<tr>
												<td colspan="3" style="text-align: center;">
														<b>INSTALL PMTA </b>
												</td>	
												<td colspan="3" style="text-align: center;">
														<input type="checkbox" name="pmta" value="install">
												</td>
											</tr>
											<tr><td colspan="6"><hr></td>
											<tr>
												<td colspan="3" style="text-align: center;">
														<b>INSTALL NTP-DATE </b>
												</td>	
												<td colspan="3" style="text-align: center;">
														<input type="checkbox" name="ntpdate" value="install">
												</td>
											</tr>
											<tr><td colspan="6"><hr></td>
											<tr>
												<td colspan="3" style="text-align: center;">
														<b>FLUSH IPTABLES </b>
												</td>	
												<td colspan="3" style="text-align: center;">
														<input type="checkbox" name="iptables" value="install">
												</td>
											</tr>
											<tr><td colspan="6"><hr></td>
											<tr>
												<td colspan="3" style="text-align: center;">
														<b>INSTALL BOUNCE PROCESSOR </b>
												</td>	
												<td colspan="3" style="text-align: center;">
														<input type="checkbox" name="bounce" value="install">
												</td>
											</tr>
											<tr><td colspan="6"><hr></td>
											<tr>
												<td colspan="3" style="text-align: center;">
														<b>INSTALL PMTA WEB-PORTAL </b>
												</td>	
												<td colspan="3" style="text-align: center;">
														<input type="checkbox" name="portal" value="install">
												</td>
											</tr>
											<tr><td colspan="6"><hr></td>
											<tr>
												<td colspan="3" style="text-align: center;">
														<b>SET CRONTABS</b>
												</td>	
												<td colspan="3" style="text-align: center;">
														<input type="checkbox" name="cron" value="install">
												</td>
											</tr>
											<tr><td colspan="6"><hr></td>
											<tr>
												<td colspan="3" style="text-align: center;">
												 <b>REBOOT SERVER </b>
												 </td>
												 <td colspan="3" style="text-align: center;">
												      <input type="checkbox" onclick="alertt()" name="reboot" id="reboot" value="reboot" >
												 </td>
											</tr>
											<tr><td colspan="6"><hr></td>
											<tr>
												<td colspan="3" style="text-align: center;">
												 <b>RESTART ALL SERVICE </b>
												 </td>
												 <td colspan="3" style="text-align: center;">
												      <input type="checkbox" onclick="alerttt()" name="restart" id="restart" value="restart" >
												 </td>
											</tr>
											<tr>
												<td colspan="6" style="text-align: center;">
													<input type="submit" name="submit" id="submit">
												</td>	
											</tr>
									</table>
									</form>
								</td>
								<form name="form1" id="form1" action="javascript:myconfig();" >
								<td colspan = "2" style="text-align: center;">
									<table border="1" style="width: 100%;border-collapse: collapse;">
											<tr>
													<td>
														<table  style="text-align: center; width: 100%">
															<tr>
																<td colspan="2">
																		<b>IP's : </b>	
																</td>
																<td colspan="2">
																	 <textarea placeholder="PLEASE INSERT IP's,RDNS Records" style="height: 100px;width: 300px" name="configtext" id="configtext" required></textarea>
																</td>
															</tr>
															<!--<tr>
																<td style="width: 50%">
																		<b>No of IP's In Pool : </b>	
																</td>
																<td style="width: 50%">
														            <input type="text" name="poolip" id="poolip">
																</td>
															</tr>-->
															<tr><td colspan="4"><hr></td>
															<tr>
																<td colspan="2">
																		<b>Shared Pool IP : </b>	
																</td>
																<td colspan="2">
														            <input type="text" name="shredpoolip" id="shredpoolip">
																</td>
															</tr>
															<tr><td colspan="4"><hr></td>
															<tr>
																			<td style="text-align: center;">
																					<b>HOSTNAME </b><br><input type="text" name="host" id="host" required>
																			</td>
																			<td  style="text-align: center;">
																					<b>SERVER </b><br><input type="text" name="server" id="server" required>
																			</td>
																			<td style="text-align: center;">
																					<b>PORT </b><br><input type="text" name="port" id="port" required>
																			</td>
																			<td  style="text-align: center;">
																					<b>TLS </b><br><select name="tls" id="tls" required> <option value="Yes">Yes</option><option value="No">No</option></select>
																			</td>
															</tr>
															<tr><td colspan="4"><hr></td>															
															<tr>
																<td colspan="4" style="text-align: center;">
																		<input type="submit">
																</td>
															</tr>
															<tr><td colspan="4"><hr></td></tr>
															<tr><td colspan="4"><b><u>REPORTS</u></b></td></tr>		
															<tr>
																<td align="center" colspan = "4" style="width: 100%;">
																		<div id = "karan" style="height: 410px; width:700px; background-color: black; color:white;  overflow: auto; ">
																</td>
															</tr>
														</table>
													</td>
											</tr>
									</table>
								</td>
							</form>
	
						</tr>
				</table>
		</td>
		<td style="width: 30%">
		<form name="formsend" id="formsend" action="javascript:sendingip();" >
			<table style="width: 100%;border-collapse: collapse;" id="sql1">
						<!-- <tr>
								<td colspan="2" style="text-align: center;">
								     <b>SENDING IP : </b>	
								</td>
								<td colspan="2" style="text-align: center;">
								    <input type="text" name="send_ip" id="send_ip" value='217.76.58.151' required>
								</td>
						</tr> -->
						<!-- <tr><td colspan="4"><hr></td> -->
						<!-- <tr>
								<td colspan="2" style="text-align: center;">
								     <b>SENDING IP PASS : </b>	
								</td>
								<td colspan="2" style="text-align: center;">
								    <input type="text" name="send_pass" id="send_pass" value='oUTRAjd68lJ7VcBj' required>
								</td>
						</tr> -->
						<tr><td colspan="4"><hr></td>
						<tr>
								<td colspan="2" style="text-align: center;">
								     <b>ASSIGNED TO :  </b>	
								</td>
								<td colspan="2" style="text-align: center;">
									<select name="assigned" id="assigned" required>
										<option value=''> Select Any </option>
										<?php
											$q = mysql_query("select `id`,`name` from `login`.`users`");
											while($fetch = mysql_fetch_array($q)) {
												echo "<option value='".$fetch['id']."'>$fetch[name]</option>";
											}
										?>
									</select>
								</td>
						</tr>
						<tr><td colspan="4"><hr></td>
						<tr>
								<td colspan="2" style="text-align: center;">
								     <b>SELECT SQL FILE : </b>	
								</td>
								<td colspan="2" style="text-align: center;">
								    <select name="sql" id="sql">
								    		<?php
												$cmd = `ls -lt /var/www/html/server_setup/sql_files/ | grep 'sql' | awk '{print $9}'`;
												$option = explode("\n",$cmd);
												foreach($option as $line)
												{
													echo "<option value='".$line."'>$line</option>";
												}	    		
								    		?>
								    	</select>
								</td>
						<tr><td colspan="4"><hr></td>
						<tr><td colspan="4"><br></td>
						<tr>
						<td colspan="4" style="text-align: center;">
								<input type="submit">
						</td>
					   </tr>
						<tr><td colspan="4"><br></td></tr>
						<tr>
								<td align="center" colspan = "4" style="width: 100%;">
									<div id = "karan_send" style="height: 600px; width:600px;background-color: black; color:white;  overflow: auto; align-content:center; ">
								</td>
						</tr>
				</table>
				</form>

		</td>
	</tr>
</table>
</center>
</body>
</html>
