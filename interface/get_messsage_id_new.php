<?php




function get_message_id($svml)
{
    date_default_timezone_set("EST");
    include "/var/www/html/interface/include.php";
    $number = mysql_fetch_array(mysql_query("select bcc,domain from svml.svml_sendgrid where sno='$svml'"));
    $mssgidfsock = $number['bcc'];
    $msid = $number['domain'];

preg_match_all("/\[\[(.*?)\]\]/i", $mssgidfsock, $match);
$all_msid_variable_array = $match[1];
foreach($all_msid_variable_array as $function)
{
                 $function_array = explode("(",$function);
                 $functionName = trim($function_array[0]);
                 @$argumnet = trim($function_array[1]);
                 $return_data = $functionName($argumnet);
                 $mssgidfsock  = str_replace("[[$function]]",$return_data,$mssgidfsock);                                                     // REPLACE ALL [[*]] type data
 }

 $mssgidfsock  = str_replace('{{domain}}',$msid,$mssgidfsock);
 $mssgidfsock = get_randomdata($mssgidfsock);

 $message_id = "<".trim($mssgidfsock).">";

$data = trim($message_id);
 return $data;

}





function get_randomdata($svmls)
{
 $match = array();
                                preg_match_all("/\[\[(.*?)\]\]/i", $svmls, $match);
                                $all_variable_array = $match[1];               
                                foreach($all_variable_array as $function)
                                {
                                                $function_array = explode("(",$function);
                                                $functionName = trim($function_array[0]);
                                                @$argumnet = trim($function_array[1]);
                                                $return_data = $functionName($argumnet);
                                                $svmls = str_replace("[[$function]]",$return_data,$svmls);                                   // REPLACE ALL [[*]] type data
                                }

    $data = trim($svmls);
 return $data;

}








function ascii2hex($ascii) 
{
  $hex = '';
  for ($i = 0; $i < strlen($ascii); $i++) {
    $byte = strtoupper(dechex(ord($ascii{$i})));
    $byte = "=".str_repeat('0', 2 - strlen($byte)).$byte;
    $hex.=$byte;
  }
  return $hex;
}


// new headers -------------------------------------------------------------


function num($x)
{
    $permitted_chars = '0123456789';
    return  @substr(str_shuffle($permitted_chars), 0, $x);
}

function smallchar($x)
{
    $permitted_chars = 'abcdefghijklmnopqrstuvwxyz';
    return @substr(str_shuffle($permitted_chars), 0, $x);
}

function bigchar($x) 
{
    $permitted_chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return @substr(str_shuffle($permitted_chars), 0, $x);
}

function bigsmallchar($x)
{
    $permitted_chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return @substr(str_shuffle($permitted_chars), 0, $x);
}

function mixsmallalphanum($x)
{
    $permitted_chars = '0123456789abcdefghijklmnopqrstuvwxyz';
    return @substr(str_shuffle($permitted_chars), 0, $x);
}

function mixbigalphanum($x)
{
    $permitted_chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return @substr(str_shuffle($permitted_chars), 0, $x);
}

function mixall($x)
{
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $charactersLength = strlen($characters); 
    $randomString = '';
    for ($i = 0; $i < $x; $i++)
            {
                    $randomString.= $characters[rand(0, $charactersLength - 1)];
            }
    return @$randomString;
}

function hexdigit($x)
{
    $characters = '0123456789abcdef';
    $charactersLength = strlen($characters);
    $randomString = '';
    for ($i = 0; $i < $x; $i++)
            {
                    $randomString.= $characters[rand(0, $charactersLength - 1)];
            }
    return @$randomString;
}



function str_to_uue($message)
{
        $message_encoded = convert_uuencode($message);
        $uumessage = "begin 0644 unknown";
        $uumessage .="\n";
        $uumessage .= $message_encoded;
        $uumessage .= "end";
        return $uumessage;
}

function RFC_Date_EST()
{
    date_default_timezone_set('EST');
    return date(DATE_RFC2822)." (EST)";
}

function RFC_Date_UTC()
{
    date_default_timezone_set('UTC');
    return date(DATE_RFC2822)." (UTC)";
}

function RFC_Date_EDT()
{
    date_default_timezone_set('US/Eastern');
    return date(DATE_RFC2822)." (EDT)";
}

function RFC_Date_IST()
{ 
    date_default_timezone_set('Asia/Calcutta');
    return date(DATE_RFC2822)." (IST)";
}



?>
