<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Login Page</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" >
    <style type="text/css">
body{background: #d4d4d4 url(office.jpeg) no-repeat;background-size: cover}
.login-block{position:fixed;top: 50%;left: 50%;width:30em;height:23em;
margin-top: -9em;margin-left: -15em;border-radius: 10px;
background-color: #e2e2e2;box-shadow: 0px 0px 8px 4px rgba(0,0,0,0.2);}
.login-head{background: #fff url(p1t-1.png) repeat;padding: 10px 10px;border-radius: 10px 10px 0 0}
.login-head h3{color: #444;margin: 0;padding: 30px 10px;letter-spacing: 2px}
.login-form{padding: 20px 30px}
.form-control{
border-radius: 0;border:none;border-bottom: 1px solid #888;
background: none;box-shadow: none;padding: 
}.m-bot25{margin-bottom: 25px}
.form-control:hover,.form-control:focus,.form-control:active{box-shadow: none}
    </style>
  </head>
  <body>
<div class="container">
  <div class="row">
    <div class="login-block">
      <div class="login-head text-center">
        <h3 class="form-signin-heading">Login Required</h3>
      </div>
      <div class="login-form">
        <font color="red"><b></b></font>
        <form action="action_session.php" method="POST" class="form1">
          <div class="form-group">
            <input type="email" name="username" id="username" class="form-control" placeholder="Username" required="required">
          </div>
          <div class="form-group m-bot25">
            <input type="password" name="password" id="password" class="form-control" placeholder="password" required="required">
          </div>
          <input class="btn btn-success" id="submit" value="LOG IN" type="submit">
        </form>
      </div>
    </div>
  </div>
</div>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" ></script>
</body>
</html>

