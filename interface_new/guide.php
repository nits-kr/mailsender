
<html>
        <head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
                <title>Guide | v4mediasolutions</title>
                <style >
*{
    box-sizing: border-box;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
}
body{
    font-family: Helvetica;
    -webkit-font-smoothing: antialiased;
    background: rgba( 71, 147, 227, 1);
}
h2{
    text-align: center;
    font-size: 18px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: white;
    padding: 30px 0;
}

/* Table Styles */

.table-wrapper{
    margin: 10px 70px 70px;
    box-shadow: 0px 35px 50px rgba( 0, 0, 0, 0.2 );
}

.fl-table {
    border-radius: 5px;
    font-size: 12px;
    font-weight: normal;
    border: none;
    border-collapse: collapse;
    width: 100%;
    max-width: 100%;
    white-space: nowrap;
    background-color: white;
}

.fl-table td, .fl-table th {
    text-align: center;
    font-size: 25px;
    font-weight: bold;
     padding: 15px;
}

.fl-table td {
    border-right: 1px solid #f8f8f8;
    font-size: 15px;


}

.fl-table thead th {
    color: #ffffff;
    background: #4FC3A1;
}


.fl-table thead th:nth-child(odd) {
    color: #ffffff;
    background: #324960;
}

.fl-table tr:nth-child(even) {
    background: #F8F8F8;
}

/* Responsive */

@media (max-width: 767px) {
    .fl-table {
        display: block;
        width: 100%;
    }
    .table-wrapper:before{
        content: "Scroll horizontally >";
        display: block;
        text-align: right;
        font-size: 11px;
        color: white;
        padding: 0 0 10px;
    }
    .fl-table thead, .fl-table tbody, .fl-table thead th {
        display: block;
    }
    .fl-table thead th:last-child{
        border-bottom: none;
    }
    .fl-table thead {
        float: left;
    }
    .fl-table tbody {
        width: auto;
        position: relative;
        overflow-x: auto;
    }
    .fl-table td, .fl-table th {
        padding: 20px .625em .625em .625em;
        height: 60px;
        vertical-align: middle;
        box-sizing: border-box;
        overflow-x: hidden;
        overflow-y: auto;
        width: 120px;
        font-size: 13px;
        text-overflow: ellipsis;
    }
    .fl-table thead th {
        text-align: left;
        border-bottom: 1px solid #f7f7f9;
    }
    .fl-table tbody tr {
        display: table-cell;
    }
    .fl-table tbody tr:nth-child(odd) {
        background: none;
    }
    .fl-table tr:nth-child(even) {
        background: transparent;
    }
    .fl-table tr td:nth-child(odd) {
        background: #F8F8F8;
        border-right: 1px solid #E6E4E4;
    }
    .fl-table tr td:nth-child(even) {
        border-right: 1px solid #E6E4E4;
    }
    .fl-table tbody td {
        display: block;
        text-align: center;
    }
}
</style>
        </head>
        <body>
<center>
<h2>GUIDE TABLE</h2>
<div class="table-wrapper">
    <table class="fl-table">
        <thead>
        <tr>
            <th style='width:20%'>Syantax</th>
            <th style='width:30%'>Replace by</th>
            <th style='width:50%'>Example</th>
        </tr>
        </thead>
        <tbody>
        <tr>
            <td>{{email}}</td>
            <td>Client email id</td>
            <td>testid@mydomain.com</td>
        </tr>
        <tr>
            <td>{{name}}</td>
            <td>Client name</td>
            <td>testid name (fetch from test id )</td>
        </tr>
        <tr>
            <td>{{fromid}}</td>
            <td>From email id</td>
            <td>fromtestid@sendingdomain.com</td>
        </tr>
        <tr>
            <td>{{fromname}}</td>
            <td>From name</td>
            <td>fromtestid</td>
        </tr>
        <tr>
            <td>{{date}}</td>
            <td>DATE </td>
            <td>08-07-2021</td>
        </tr>

        <tr>
            <td>{{datetime}}</td>
            <td>DATE TIME </td>
            <td>Sun, 05 Sep 2021 14:01:44 +0000</td>
        </tr>
        <tr>
            <td>{{domain}}</td>
            <td>Domain </td>
            <td>freehelping.com</td>
        </tr>
        <tr>
            <td>{{msgid}}</td>
            <td>Message id</td>
            <td>&#60;hrc2hpdm9oYW1pbmZvdGVjaC5jb20=@mydomain.com&#62;</td>
        </tr>
        <tr>
            <td>====================================</td>
            <td>====================================</td>
            <td>====================================</td>
        </tr>
    
        <tr>
            <td>{{base_trk}}</td>
            <td> Base64 encoded</td>
            <td>Open tracking / Offer link/ Unsub link </td>
        </tr>
        <tr>
            <td>{{hex_trk}}</td>
            <td> Hex encoding</td>
            <td>Open tracking / Offer link/ Unsub link </td>
        </tr>
        <tr>
            <td>{{unsl}}</td>
            <td>simple encoding</td>
            <td> Unsub  link </td>
        </tr>
        <tr>
            <td>{{oln}}</td>
            <td>simple encoding</td>
            <td>Offer  link</td>
        </tr>
        <tr>
            <td>{{ourl}}</td>
            <td>simple encoding</td>
            <td>Open tracking link </td>
        </tr>
        <tr>
            <td>====================================</td>
            <td>====================================</td>
            <td>====================================</td>
        </tr>
        <tr>
            <td>[[num(10)]]</td>
            <td>Only Number</td>
            <td>0123456789</td>
        </tr>
        <tr>
            <td>[[smallchar(10)]]</td>
            <td>Only Small character</td>
            <td>abcdefghijklmnopqrstuvwxyz</td>
        </tr>

        <tr>
            <td>[[bigchar(10)]]</td>
            <td>Only Big character</td>
            <td>ABCDEFGHIJKLMNOPQRSTUVWXYZ</td>
        </tr>

        <tr>
            <td>[[mixsmallalphanum(10)]]</td>
            <td>Mix Small + numbers character</td>
            <td>0123456789abcdefghijklmnopqrstuvwxyz</td>
        </tr>
        <tr>
            <td>[[mixbigalphanum(10)]]</td>
            <td>Mix  Big + Numbers character</td>
            <td>0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ</td>
        </tr>
        <tr>
            <td>[[mixall(10)]]</td>
            <td>Mix All (Numbers + Small + Big)</td>
            <td>0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ</td>
        </tr>
        <tr>
            <td>[[hexdigit(10)]]</td>
            <td>Only Hex digit</td>
            <td>0123456789abcdef</td>
        </tr>

        <tr>
            <td>====================================</td>
            <td>=========================================</td>
            <td>============================================================</td>
        </tr>
        <tr>
            <td>[[RFC_Date_EST]]</td>
            <td>EST Date Format</td>
            <td></td>
        </tr>
        <tr>
            <td>[[RFC_Date_UTC]]</td>
            <td>UTC Date Format</td>
            <td></td>
        </tr>
        <tr>
            <td>[[RFC_Date_EDT]]</td>
            <td>EDT Date Format</td>
            <td></td>
        </tr>
        <tr>
            <td>[[RFC_Date_IST]]</td>
            <td>IST Date Format</td>
            <td></td>
        </tr>

        <tbody>
    </table>
</div>
<br><hr><br>
<p style='background-color:white;text-align:left;padding:10px;margin:10px'><font color='red' size='4'>Example 1 : </font><br><br>
Received: from {{domain}}  for <{{email}}>; [[RFC_Date_EST]]<br>
Precedence: bulk<br>
X-BeenThere: {{fromid}}<br>
X-Mailman-Version: 2.1.33<br>
X-List-Administrivia: yes<br>
Sender: "{{fromid}}" &#60;{{fromid}}&#62;<br>
</p>
<br><hr><br>
<p style='background-color:white;text-align:left;padding:10px;margin:10px'><font color='red' size='4'>Example 2 : </font><br><br>
X-Message-ID: {{msgid}}<br>
X-Date: [[RFC_Date_UTC]]<br>
x-idnv: [[num(1)]]-[[mixsmallalphanum(32)]]<br>
x-job: [[num(5)]]-[[num(8)]]<br>
List-Unsubscribe: &#60;mailto:unsub@{{domain}}?subject=unsubscribe&#62;<br>
Sender: {{fromname}} &#60;{{fromid}}&#62;<br>
X-From:{{fromname}} &#60;{{fromid}}&#62;<br>
X-To: {{name}} &#60;{{email}}&#62;<br>

</p>
<br><br><br><br>
</center>
        </body>

</html>
