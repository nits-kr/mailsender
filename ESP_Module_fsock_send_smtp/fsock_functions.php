<?php
// error_reporting(0);
// include_once __DIR__.'/fsock_include.php';


function ascii2hex($ascii) 
{
	$hex = '';
	for ($i = 0; $i < strlen($ascii); $i++) 
	{
		$byte = strtoupper(dechex(ord($ascii{$i})));
		$byte = "=".str_repeat('0', 2 - strlen($byte)).$byte;
		$hex.=$byte;
	}
	return $hex;
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

function num($x)
{
    $characters = '0123456789';
    $charactersLength = strlen($characters);
    $randomString = '';
    for ($i = 0; $i < $x; $i++)
            {
                    $randomString.= $characters[rand(0, $charactersLength - 1)];
            }
    return @$randomString;
}

function smallchar($x)
{
    $characters = 'abcdefghijklmnopqrstuvwxyz';
    $charactersLength = strlen($characters);
    $randomString = '';
    for ($i = 0; $i < $x; $i++)
            {
                    $randomString.= $characters[rand(0, $charactersLength - 1)];
            }
    return @$randomString;
}

function bigchar($x)
{
    $characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $charactersLength = strlen($characters);
    $randomString = '';
    for ($i = 0; $i < $x; $i++)
            {
                    $randomString.= $characters[rand(0, $charactersLength - 1)];
            }
    return @$randomString;
}

function mixsmallbigchar($x)
{
    $characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $charactersLength = strlen($characters);
    $randomString = '';
    for ($i = 0; $i < $x; $i++)
            {
                    $randomString.= $characters[rand(0, $charactersLength - 1)];
            }
    return @$randomString;
}

function mixsmallalphanum($x)
{
    $characters = '0123456789abcdefghijklmnopqrstuvwxyz';
    $charactersLength = strlen($characters);
    $randomString = '';
    for ($i = 0; $i < $x; $i++)
            {
                    $randomString.= $characters[rand(0, $charactersLength - 1)];
            }
    return @$randomString;
}

function mixbigalphanum($x)
{
    $characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $charactersLength = strlen($characters);
    $randomString = '';
    for ($i = 0; $i < $x; $i++)
            {
                    $randomString.= $characters[rand(0, $charactersLength - 1)];
            }
    return @$randomString;
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


?>

