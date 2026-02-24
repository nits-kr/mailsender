<?php
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
$aff = $_REQUEST['aff'];
$unique = generatefile();
$filename = "/var/www/data/".$unique;

if($type == 'Random')
{
    // $sql = "select email from emailmaster where filename in ($data) order by rand() limit $count";
    // $sql = "SELECT t1.email FROM emailmaster t1 LEFT JOIN fbl_data t2 ON t2.email = t1.email where t1.filename in ($data) and t2.email IS NULL ORDER BY rand() LIMIT $count";
    
    // Suppress Emailmaster data with Fbl and suppression table then give result
    $sql = "SELECT  
            t1.email  
            FROM 
            emailmaster t1  
            LEFT JOIN fbl_data t2 ON t2.md5 = t1.md5 
            LEFT JOIN (select * from supp where affliate='$aff') t3 ON t3.md5 = t1.md5  
            where  t1.filename in ($data) and  
            t2.md5 IS NULL and 
            t3.md5 IS NULL and
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
            t1.email  
            FROM 
            emailmaster t1  
            LEFT JOIN fbl_data t2 ON t2.md5 = t1.md5 
            LEFT JOIN (select * from supp where affliate='$aff') t3 ON t3.md5 = t1.md5  
            where  t1.filename in ($data) and  
            t2.md5 IS NULL and 
            t3.md5 IS NULL and
            t1.status = 'A'
            LIMIT $count";
}

//Getting Count of Suppression data
$suppression = mysql_fetch_array(mysql_query("SELECT count(t3.md5) supp_count FROM emailmaster t1 LEFT JOIN (select * from supp where affliate='$aff') t3 ON t3.md5 = t1.md5 where t1.filename in ($data) and t3.md5 IS NOT NULL"));
$suppression_count = $suppression['supp_count'];

//Getting Count of Fbl data
$fbl = mysql_fetch_array(mysql_query("SELECT count(t2.md5) fbl_data_count FROM emailmaster t1 LEFT JOIN fbl_data t2 ON t2.md5 = t1.md5 where t1.filename in ($data) and t2.md5 IS NOT NULL"));
$fbl_count = $fbl['fbl_data_count'];


$email = NULL;
$query = mysql_query($sql);
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
        `for i in {1..$times};do cat $filename >> $new_filename;done&&rm -rf $filename`;
        `chmod 0777 $new_filename`;
        $wordCount = `wc -l $filename | awk '{print $1}'`;
        $filename = "/var/www/data/".$new_unique;
        $result = $new_unique." || Final Count: ".trim($wordCount)." || Supp Count : $suppression_count";

    }
    else
    {
        $wordCount = `wc -l $filename | awk '{print $1}'`;
        $result = $unique." || Final Count: ".trim($wordCount)." || Fbl Count : $fbl_count || Supp Count : $suppression_count";
    }


    //Define header information
    header('Content-Description: File Transfer');
    header('Content-Type: application/octet-stream');
    header("Cache-Control: no-cache, must-revalidate");
    header("Expires: 0");
    header('Content-Disposition: attachment; filename="'.basename($filename).'"');
    header('Content-Length: ' . filesize($filename));
    header('Pragma: public');
    ob_clean();
    flush();    
    readfile($filename);

    echo $result;
}
else
{
    echo "Something Went Wrong..!";
}

function generatefile()
{
    return $filename = trim(md5(date("Y-m-d H:i:s").microtime().rand(1,10000)));
}

function UR_exists($url){
    $headers=get_headers($url);
    return stripos($headers[0],"200 OK")?true:false;
 }
?>