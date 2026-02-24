<?php
session_start();
if (!isset($_SESSION['username'])) {
	header("Location:../admin/login.php?action=session+logged+out");
	die();
}
$sid = $_SESSION['id'];
include "../admin/include.php";
?>
<html>

<head>
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
	<script type="text/javascript">
		function myservice() {
			$("#karan").html('<img align="center" src="../hourglass.gif" height=30 width=30> PROCESSING... PLEASE WAIT..!');
			var data = $("#form").serialize();
			$.ajax({
				type: "POST",
				url: 'sending_ip_install.php',
				data: data,
				success: function(data) {
					$("#karan").html(data);
				}
			});
		}
	</script>
	<script type="text/javascript">
		function removeSendingIP() {
			$("#karan_send").html('<img align="center" src="../hourglass.gif" height=30 width=30> PROCESSING... PLEASE WAIT..!');
			var ip = $("#old_server_ip").val();
			var pass = $("#old_server_password").val();
			$.ajax({
				type: "POST",
				url: 'sending_ip_remove.php',
				data: '&server_ip=' + ip + '&server_pass=' + pass,
				success: function(data) {
					$("#karan_send").html(data);
				}
			});
		}
	</script>
	<script type="text/javascript">
		function alertt() {
			alert("HEADS UP...!! ARE YOU SURE TO REBOOT SERVER");
		}
	</script>

	<script type="text/javascript">
		function alerttt() {
			alert("HEADS UP...!! ARE YOU SURE TO RESTART SERVICE");
		}
	</script>
</head>

<body style='background: aliceblue;'>
	<center>
		<h1 style=" margin-bottom: 2px;"> <b><u>SENDING IP UBUNTU SETUP - 20 </u></b></h1>
		<hr>
		<table border="1" style="width: 100%; border-collapse: collapse;">
			<tr>
				<td style="width: 65%">
					<form name="form" id="form" action="javascript:myservice();">
						<table>
							<tr>
								<td colspan="4" style="text-align: center;">
									<b>SERVER CREDENTIALS</b>
								</td>
							</tr>
							<tr>
								<td colspan="4" style="text-align: center;">
									<b>
										<hr>
									</b>
								</td>
							</tr>
							<tr>
								<td style="width:25%;text-align: center;">
									<b>IP : </b>
								</td>
								<td style="width:25%;text-align: center;">
									<input type="text" name="server_ip" id="server_ip" placeholder="Enter Sending IP" required>
								</td>
								<td style="width:25%;text-align: center;">
									<b>PASS : </b>
								</td>
								<td style="width:25%;text-align: center;">
									<input type="text" name="server_pass" id="server_pass" placeholder="Enter Password" required>
								</td>
							</tr>
							<tr>
								<td colspan="4" style="text-align: center;">
									<b>
										<hr>
									</b>
								</td>
							</tr>
							<tr>
								<td colspan="4" style="text-align: center;">
									<b>INSTALL SERVICES</b>
								</td>
							</tr>
							<tr>
								<td colspan="4">
									<hr>
								</td>
							<tr>
								<td colspan="2" style="text-align: center;vertical-align: top;">
									<table style="width: 100%;border-collapse: collapse; ">
										<tr>
											<td colspan="3" style="text-align: center;">
												<b>UPDATE & UPGRADE </b>
											</td>
											<td colspan="3" style="text-align: center;">
												<input type="checkbox" name="update" value="install">
											</td>
										</tr>
										<tr>
											<td colspan="6">
												<hr>
											</td>
										<tr>
											<td colspan="3" style="text-align: center;">
												<b>INSTALL HTTP </b>
											</td>
											<td colspan="3" style="text-align: center;">
												<input type="checkbox" name="http" value="install">
											</td>
										</tr>
										<tr>
											<td colspan="6">
												<hr>
											</td>
										<tr>
											<td colspan="3" style="text-align: center;">
												<b>INSTALL PHP </b>
											</td>
											<td colspan="3" style="text-align: center;">
												<input type="checkbox" name="php" value="install">
											</td>
										</tr>
										<tr>
											<td colspan="6">
												<hr>
											</td>
										<tr>
											<td colspan="3" style="text-align: center;">
												<b>INSTALL MYSQL </b>
											</td>
											<td colspan="3" style="text-align: center;">
												<input type="checkbox" name="mysql" value="install">
											</td>
										</tr>
										<tr>
											<td colspan="6">
												<hr>
											</td>
										<tr>
											<td colspan="3" style="text-align: center;">
												<b>INSTALL NTP-DATE </b>
											</td>
											<td colspan="3" style="text-align: center;">
												<input type="checkbox" name="ntpdate" value="install">
											</td>
										</tr>
										<tr>
											<td colspan="6">
												<hr>
											</td>
										<tr>
											<td colspan="3" style="text-align: center;">
												<b>FLUSH IPTABLES </b>
											</td>
											<td colspan="3" style="text-align: center;">
												<input type="checkbox" name="iptables" value="install">
											</td>
										</tr>
										<tr>
											<td colspan="6">
												<hr>
											</td>
										<tr>
											<td colspan="3" style="text-align: center;">
												<b>INSTALL ALIAS </b>
											</td>
											<td colspan="3" style="text-align: center;">
												<input type="checkbox" name="alias" value="install">
											</td>
										</tr>
										<tr>
											<td colspan="6">
												<hr>
											</td>
										<tr>
											<td colspan="3" style="text-align: center;">
												<b>INSTALL INTERFACES </b>
											</td>
											<td colspan="3" style="text-align: center;">
												<input type="checkbox" name="portal" value="install">
											</td>
										</tr>
										<tr>
											<td colspan="6">
												<hr>
											</td>
										<tr>
											<td colspan="3" style="text-align: center;">
												<b>SET CRONTABS</b>
											</td>
											<td colspan="3" style="text-align: center;">
												<input type="checkbox" name="cron" value="install">
											</td>
										</tr>
										<tr>
											<td colspan="6">
												<hr>
											</td>
										<tr>
											<td colspan="3" style="text-align: center;">
												<b>REBOOT SERVER </b>
											</td>
											<td colspan="3" style="text-align: center;">
												<input type="checkbox" onclick="alertt()" name="reboot" id="reboot" value="reboot">
											</td>
										</tr>
										<tr>
											<td colspan="6">
												<hr>
											</td>
										<tr>
											<td colspan="3" style="text-align: center;">
												<b>RESTART ALL SERVICE </b>
											</td>
											<td colspan="3" style="text-align: center;">
												<input type="checkbox" onclick="alerttt()" name="restart" id="restart" value="restart">
											</td>
										</tr>
										<tr>
											<td colspan="6">
												<hr>
											</td>
										<tr>
										<tr>
											<td colspan="6">
												&nbsp;
											</td>
										</tr>
										<tr>
											<td colspan="6" style="text-align: center;">
												<input type="submit" name="submit" id="submit" value="INSTALL">
											</td>
										</tr>
									</table>
					</form>
				</td>
				<td colspan="2" style="text-align: center;">
					<table border="1" style="width: 100%;border-collapse: collapse;">
						<tr>
							<td>
								<table style="text-align: center; width: 100%">
									<tr>
										<td colspan="4"><b><u>CONSOLE OUTPUT</u></b></td>
									</tr>
									<tr>
										<td align="center" colspan="4" style="width: 100%;">
											<div id="karan" style="height: 600px; width:700px; background-color: black; color:white;  overflow: auto; ">
										</td>
									</tr>
								</table>
							</td>
						</tr>
					</table>
				</td>
			</tr>
		</table>
		</td>
		<td style="width: 30%">
			<form name="formsend" id="formsend" action="javascript:removeSendingIP();">
				<table style="width: 100%;border-collapse: collapse;">
					<tr>
						<td colspan="4" style="text-align: center;">
							<b>REMOVE SENDING IP</b>
						</td>
					</tr>
					<tr>
						<td colspan="4">
							<hr>
						</td>
					</tr>
					<tr>
						<td colspan="2" style="text-align: center;">
							<b>OLD SENDING IP : </b>
						</td>
						<td colspan="2" style="text-align: center;">
							<input type="text" name="old_server_ip" id="old_server_ip" placeholder="Enter Old Sending IP" required>
						</td>
					</tr>
					<tr>
						<td colspan="4">
							<hr>
						</td>
					</tr>
					<tr>
						<td colspan="2" style="text-align: center;">
							<b>OLD SENDING PASSWORD : </b>
						</td>
						<td colspan="2" style="text-align: center;">
							<input type="text" name="old_server_password" id="old_server_password" placeholder="Enter Password" required>
						</td>
					</tr>
					<tr>
						<td colspan="4">
							<hr>`
						</td>
					</tr>
					<tr>
						<td colspan="4" style="text-align: center;">
							<input type="submit" name="submit" id="submit" value="REMOVE">
						</td>
					</tr>
					<tr>
						<td colspan="4"><br></td>
					</tr>
					<tr>
						<td align="center" colspan="4" style="width: 100%;">
							<div id="karan_send" style="height: 600px; width:600px;background-color: black; color:white;  overflow: auto; align-content:center; ">
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