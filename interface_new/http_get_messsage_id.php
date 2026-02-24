<?php

$inbno = trim($_REQUEST['inbno']);
$msgdom = trim($_REQUEST['msgdom']);

echo get_message_id($inbno, $msgdom);

function get_message_id($inb_num, $msid)
{
    date_default_timezone_set("EST");

    switch($inb_num)
    {
        case 1:
            $return = "<".randdsmallchar(4)."_".randdnum(8)."_".randdnum(6)."_".randdnum(6)."_".randdnum(1)."_".randdnum(4).".".randdnum(10).'@'.$msid.">";
        break;

        case 2:
            $msiden=time().rand(1,100000);
                        $msidencoded=md5(base64_encode($msiden)); 
            $return= '<'.$msidencoded.'@' .$msid.'>';
        break;

        case 3:
            $return = "<".randmixchar(42).'@'.$msid.">";
        break;

        case 4:
            $return = "<".randdnum(10).".".randdnum(6).".".randdnum(13).'@'.$msid.">";
        break;

        case 5:
            $return = "<".randdnum(1).randmixchar(11)."_".randmixchar(9).'@'.$msid.">";
        break;

        case 6:
            $return = "<".randmixbignum(2).".".randmixbignum(2).".".randdnum(5).".".randmixbignum(8).'@'.$msid.">";
        break;

        case 7:
            $return = "<".randdnum(10).randmixsmallnum(6)."-".randmixsmallnum(8)."-".randmixsmallnum(4)."-".randmixsmallnum(4)."-".randmixsmallnum(4)."-".randmixsmallnum(12)."-".randdnum(6).'@'.$msid.">";
        break;

        case 8:
            $strtotime = date("Ymdhis");
            $return = "<".$strtotime.".".randdnum(1).".".randdbigchar(16).'@'.$msid.">";
        break;

        case 9:
            $return = "<".randdnum(10).randmixsmallnum(6)."-".randmixsmallnum(8)."-".randmixsmallnum(4)."-".randmixsmallnum(4)."-".randmixsmallnum(4)."-".randmixsmallnum(12)."-".randdnum(6).'@email.amazonses.com>';
        break;

        case 10:
            $return = "<".randdnum(15).".".randdnum(8).".".randmixchar(13).'@'.$msid.">";
        break;

   case 11:
            $return = "<".randdnum(10).".".randdnum(4).".".randdnum(10).".".randdsmallchar(4).'@'.$msid.">";
        break;

        case 12:
            $return = "<".randmixchar(11).".".randdbigchar(4).randdnum(9).".".randdnum(10).'@'.$msid.">";
        break;
     case 13:
 $return = "<".randdnum(1).".".randdnum(1).".".randmixchar(3).".".randmixchar(3).".".randmixchar(15).".".randdnum(1).'@'.$msid.">";
  break;
  case 14:
 $return = "<".randmixchar(8)."-".randmixchar(4)."-".randmixchar(4)."-".randmixchar(4)."-".randmixchar(12).'@'.$msid.">";
  break;
  case 15:
 $return = "<".randdbigchar(7)."=".randmixchar(30)."_".randmixchar(11).'@'.$msid.">";
  break;
  case 16:
 $return = "<".randmixchar(8)."_".randmixchar(12)."_".randmixchar(10).'@'.$msid.">";
  break;

  case 17:
 $return = "<".randdsmallchar(36).'@'.$msid.">";
  break;
  case 18:
 $return = "<".randdsmallchar(6).randdnum(17).'@'.$msid.">";
  break;
  case 19:
 $return = "<".randdnum(9).".".randdnum(8).".".randdnum(10).randdnum(3).'.JavaMail.cloud@'.$msid.">";
  break;
 case 20:
 $return = "<".randmixchar(22).'@'.$msid.">";
  break;
  case 21:
  $return = "<".randdnum(11).randmixsmallnum(5)."-".randmixsmallnum(8)."-".randmixsmallnum(4)."-".randmixsmallnum(4)."-".randmixsmallnum(4)."-".randmixsmallnum(12)."-".randdnum(6).'@email.amazonses.com>';
  break;
  case 22:
 $return = "<".randmixsmallnum(8)."-".randmixsmallnum(4)."-".randmixsmallnum(4)."-".randmixsmallnum(4)."-".randmixsmallnum(4).randdnum(8).'@'.$msid.">";
  break;
  case 23:
 $return = "<".randmixchar(22).'@'.$msid.">";
  break;
  case 24:
 $return = "<".randmixsmallnum(32).'@'.$msid.">";
  break;


    }

    return $return;

    mysql_close($link);

}

function randdnum($x)
{
    $permitted_chars = '0123456789';
    return substr(str_shuffle($permitted_chars), 0, $x);
}

function randdsmallchar($x)
{
    $permitted_chars = 'abcdefghijklmnopqrstuvwxyz';
    return substr(str_shuffle($permitted_chars), 0, $x);
}

function randdbigchar($x)
{
    $permitted_chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return substr(str_shuffle($permitted_chars), 0, $x);
}

function randmixchar($x)
{
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $charactersLength = strlen($characters);
    $randomString = '';
    for ($i = 0; $i < $x; $i++) 
            {
                    $randomString.= $characters[rand(0, $charactersLength - 1)];
            }
    return $randomString;
}

function randmixbignum($x)
{
    $characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $charactersLength = strlen($characters);
    $randomString = '';
    for ($i = 0; $i < $x; $i++) 
            {
                    $randomString.= $characters[rand(0, $charactersLength - 1)];
            }
    return $randomString;
}

function randmixsmallnum($x)
{
    $characters = '0123456789abcdefghijklmnopqrstuvwxyz';
    $charactersLength = strlen($characters);
    $randomString = '';
    for ($i = 0; $i < $x; $i++) 
            {
                    $randomString.= $characters[rand(0, $charactersLength - 1)];
            }
    return $randomString;
}
?>
