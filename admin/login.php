<?php 

session_start();   // session starts with the help of this function 


if(isset($_SESSION['username']))   // Checking whether the session is already there or not if 
                              // true then header redirect it to the home page directly 
 {
    header("Location:index.php"); 
 }

$result = $_REQUEST['action'];


$ip=$_SERVER['HTTP_HOST'];


if(isset($_POST['login']))
{
$password=base64_encode($_POST['password']);
$dec_password=$password;
$useremail=base64_encode($_POST['uemail']);

$loginurl = "http://173.249.50.153/admin/autheticate.php?username=".$useremail."&password=".$dec_password;

$cred=file_get_contents($loginurl);
$cred = trim($cred);

if($cred == "|||||")
{
header("location:login.php?action=Invalid+Details");
exit();
}
else
{
$extra="index.php";
   $credn=explode("|",$cred);

$status = trim($credn[5]);

  $_SESSION['id']=$credn[0];
   $_SESSION['username'] = $credn[1];
   $_SESSION['name'] = $credn[2];
   $_SESSION['designation'] = $credn[3];
   $_SESSION['password'] = $credn[4];
   $_SESSION['status'] = $credn[5];
   
$_SESSION['login']=$_POST['uemail'];
$_SESSION['name']=$credn[2];
$host=$_SERVER['HTTP_HOST'];

if($status == "1")
{
header("location:index.php");
exit();
}else { 
header("location:login.php?action=Blocked");
exit();
}

}

}







?>


?>
<!DOCTYPE html>


<html>
<head>
<link href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0-beta/css/bootstrap.min.css" rel='stylesheet' type='text/css' />
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.5.0/css/font-awesome.min.css" rel='stylesheet' type='text/css' />
<link href="https://fonts.googleapis.com/css?family=Roboto" rel='stylesheet' type='text/css' />

<style>
body {
    background: #222D32;
    font-family: 'Roboto', sans-serif;
    transform: scale(0.67);
    transform-origin: top left; /* Adjust as needed */
    width: 150%; /* Compensate for scaling in width */
}

.login-box {
    margin-top: 75px;
    height: auto;
    background: #1A2226;
    text-align: center;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
}

.login-key {
    height: 100px;
    font-size: 80px;
    line-height: 100px;
    background: -webkit-linear-gradient(#27EF9F, #0DB8DE);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.login-title {
    margin-top: 15px;
    text-align: center;
    font-size: 30px;
    letter-spacing: 2px;
    margin-top: 15px;
    font-weight: bold;
    color: #ECF0F5;
}

.login-form {
    margin-top: 25px;
    text-align: left;
}

input[type=text], input[type=email] {
    background-color: #FFFDD0;
    border: none;
    border-bottom: 2px solid #0DB8DE;
    border-top: 0px;
    border-radius: 0px;
    font-weight: bold;
    outline: 0;
    margin-bottom: 20px;
    padding-left: 0px;
    color: #0f1941;
}

input[type=password] {
    background-color: #FFFDD0;
    border: none;
    border-bottom: 2px solid #0DB8DE;
    border-top: 0px;
    border-radius: 0px;
    font-weight: bold;
    outline: 0;
    padding-left: 0px;
    margin-bottom: 20px;
    color: #0f1941;
}

.form-group {
    margin-bottom: 40px;
    outline: 0px;
}

/* .form-control:focus {
    border-color: inherit;
    -webkit-box-shadow: none;
    box-shadow: none;
    border-bottom: 2px solid #0DB8DE;
    outline: 0;
    background-color: #1A2226;
    color: #ECF0F5;
} */

input:focus {
    outline: none;
    box-shadow: 0 0 0;
}

label {
    margin-bottom: 0px;
}

.form-control-label {
    font-size: 10px;
    color: #6C6C6C;
    font-weight: bold;
    letter-spacing: 1px;
}

.btn-outline-primary {
    border-color: #0DB8DE;
    color: #0DB8DE;
    border-radius: 0px;
    font-weight: bold;
    letter-spacing: 1px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
}

.btn-outline-primary:hover {
    background-color: #0f1941;
    right: 0px;
}

.login-btm {
    float: left;
}

.login-button {
    padding-right: 0px;
    text-align: right;
    margin-bottom: 25px;
}

.login-text {
    text-align: left;
    padding-left: 0px;
    color: #A2A4A4;
}

.loginbttm {
    padding: 0px;
}

img {
    width: -webkit-fill-available;
    padding-top:10px;
}

.login-box {
    background:#FFFDD0;
    border-radius:20px
}
</style>
</head>
<body>

    <div class="container">
        <div class="row">
            <div class="col-lg-3 col-md-2"></div>
            <div class="col-lg-6 col-md-8 login-box">
                <div class="col-lg-12 login-head">
                    <img src='./logo/MJ TECH_New.png' style="width: 65%;">
                </div>

                <div class="col-lg-12 login-form">
                    <div class="col-lg-12 login-form">
                          <form name="login" action="" method="post">     
                            <div class="form-group">
                                <label class="form-control-label">Email ID</label>
                                <input type="email" class="form-control inputbox" name="uemail" value="<?php echo $useremail;?>" required>
                            </div>
                            <div class="form-group">
                                <label class="form-control-label">PASSWORD</label>
                                <input type="password" class="form-control inputbox" name="password"  value="" required>
                            </div>

                            <div class="col-lg-12 loginbttm">
                                <div class="col-lg-6 login-btm login-text">
                                 <p style='color:red' > <?php echo $result;?></p>
                                    <!-- Error Message -->
                                </div>
                                <div class="col-lg-6 login-btm login-button">
                                    <button type="submit" class="btn btn-outline-primary" name="login"  >LOGIN</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                <div class="col-lg-3 col-md-2"></div>
            </div>
        </div>





</body>
</html>
