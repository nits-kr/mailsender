<?php
ini_set('memory_limit','-1');
date_default_timezone_set("EST");
include "include.php";
$data = str_replace('<font color="green">','',$_REQUEST['data']);
$data = str_replace('</font>','',$data);

$data = explode(",",$data);
$data = implode('","',$data);

$times = $_REQUEST['times'];
if($times == '')
{
    $times = 0;
}
$data = '"'.rtrim($data,',"').'"';
$count = $_REQUEST['count'];
$type = $_REQUEST['type'];
$selector = $_REQUEST['selector'] == 'both' ? "concat(t1.email,',',t1.md5)" : "t1.email";
$aff = $_REQUEST['aff'];
$ip = trim($_REQUEST['ip']);
$omid = $_REQUEST['offer'];

// print_r($_REQUEST);exit;
$unique = generatefile();
$filename = "/var/www/data/".$unique;

if($type == 'Random')
{
    // $sql = "select email from emailmaster where filename in ($data) order by rand() limit $count";
    // $sql = "SELECT t1.email FROM emailmaster t1 LEFT JOIN fbl_data t2 ON t2.email = t1.email where t1.filename in ($data) and t2.email IS NULL ORDER BY rand() LIMIT $count";
    
    // Suppress Emailmaster data with Fbl and suppression table then give result
    $sql = "SELECT  
            $selector as email
            FROM 
            emailmaster t1  
            LEFT JOIN fbl_data t2 ON t2.md5 = t1.md5 
            LEFT JOIN (select * from supp where affliate='$aff') t3 ON t3.md5 = t1.md5  
            LEFT JOIN (select emailid from offer_module.tracking where category='Unsubscribe' and emailid !='NULL' and omid='$omid' group by 1 ) t4 ON t4.emailid = t1.email  
            where  t1.filename in ($data) and  
            t2.md5 IS NULL and 
            t3.md5 IS NULL and
            t4.emailid IS NULL and
            t1.status = 'A'
            ORDER BY rand() 
            LIMIT $count";
}
else
{
    // $sql = "select email from emailmaster where filename in ($data) limit $count";
    // $sql = "SELECT t1.email FROM emailmaster t1 LEFT JOIN fbl_data t2 ON t2.email = t1.email where t1.filename in ($data) and t2.email IS NULL LIMIT $count";

    // Suppress Emailmaster data with Fbl and suppression table then give result
    $sql = "SELECT  
            $selector as email
            FROM 
            emailmaster t1  
            LEFT JOIN fbl_data t2 ON t2.md5 = t1.md5 
            LEFT JOIN (select * from supp where affliate='$aff') t3 ON t3.md5 = t1.md5  
            LEFT JOIN (select emailid from offer_module.tracking where category='Unsubscribe' and emailid !='NULL' and omid='$omid' group by 1 ) t4 ON t4.emailid = t1.email  
            where  t1.filename in ($data) and  
            t2.md5 IS NULL and 
            t3.md5 IS NULL and
            t4.emailid IS NULL and
            t1.status = 'A'
            LIMIT $count";
}

//Getting Count of Suppression data
$suppression = mysql_fetch_array(mysql_query("SELECT count(t3.md5) supp_count FROM emailmaster t1 LEFT JOIN (select * from supp where affliate='$aff') t3 ON t3.md5 = t1.md5 where t1.filename in ($data) and t3.md5 IS NOT NULL"));
$suppression_count = $suppression['supp_count'];

//Getting Count of Fbl data
$fbl = mysql_fetch_array(mysql_query("SELECT count(t2.md5) fbl_data_count FROM emailmaster t1 LEFT JOIN fbl_data t2 ON t2.md5 = t1.md5 where t1.filename in ($data) and t2.md5 IS NOT NULL"));
$fbl_count = $fbl['fbl_data_count'];

//Getting Count Of UnSub data
$unsub = mysql_fetch_array(mysql_query("SELECT count(t2.emailid) unsub_data_count FROM emailmaster t1 LEFT JOIN offer_module.tracking t2 ON t2.emailid = t1.email where t1.filename in ($data) and t2.emailid IS NOT NULL and t2.category='Unsubscribe' and t2.emailid !='NULL' and t2.omid=$omid"));
$unsub_count = $unsub['unsub_data_count'];

$email = NULL;
$query = mysql_query($sql) or die (mysql_error());
while($fetch = mysql_fetch_array($query,MYSQL_ASSOC))
{
    $email.=$fetch['email']."\n";
}

file_put_contents($filename, $email);



if(file_exists($filename))
{
    `chmod 0777 $filename`;

    //PROCESSOR FOR REPEAT
    if($times > 0)
    {
        $new_unique = generatefile();
        $new_filename = "/var/www/data/".$new_unique;
        #`for i in {1..$times};do cat $filename >> $new_filename;done&&rm -rf $filename`;
	#`chmod 0777 $new_filename`;
	if (file_exists($filename)) {
    		for ($i = 1; $i <= $times; $i++) {
        		// Append the contents of the source file to the destination file
        		file_put_contents($new_filename, file_get_contents($filename), FILE_APPEND);
    		}
    		// Remove the source file
    		unlink($filename);
	}
	`chmod 0777 $new_filename`;
        $filename = "/var/www/data/".$new_unique;
        $wordCount = `wc -l $filename | awk '{print $1}'`;
        $result = $new_unique." || Final Count: ".trim($wordCount)." || Supp Count : $suppression_count";

    }
    else
    {
        $wordCount = `wc -l $filename | awk '{print $1}'`;
        $result = $unique." || Final Count: ".trim($wordCount)." || Fbl Count : $fbl_count || Supp Count : $suppression_count || UnSub Count : $unsub_count";
    }
    
    //Move File Name To Buffer Folder
    `mv $filename /var/www/html/Data_Download/buffer`;
    
    //Check for Setup in remote ip
    if(!UR_exists("http://$ip/Data_download_module/get_files.php"))
    {
        echo "Setup Not Done..!";
    }

    //Ping To ip for Download
    echo $ping_request = file_get_contents("http://$ip/Data_download_module/get_files.php?filename=".base64_encode($filename)."&result=".base64_encode($result));

    //Delete buffer files in /var/www/html/Data_Download/buffer
    `rm -rf /var/www/html/Data_Download/buffer/*`;

}
else
{
    echo "Something Went Wrong..!";
}

mysql_close($conn);

function generatefile()
{
    return $filename = trim(md5(date("Y-m-d H:i:s").microtime().rand(1,10000))).".txt";
}

function UR_exists($url){
    $headers=get_headers($url);
    return stripos($headers[0],"200 OK")?true:false;
 }
?>
