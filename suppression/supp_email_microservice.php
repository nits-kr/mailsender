<?php
// @author Karan Giri
// Initializing variables
$chunkEncoded = trim($argv[1]);
$vendorSuppressionFile = trim($argv[2]);
$outputFile = trim($argv[3]);

// Decoding Raw Data
$chunkDecoded = base64_decode($chunkEncoded);
$chunkDecodedUns = unserialize($chunkDecoded);
$chunkDecodedUnsString = implode("\|",$chunkDecodedUns);

// Matching Value
$cmd = "grep '$chunkDecodedUnsString' $vendorSuppressionFile";
$exec = exec($cmd, $curroptData, $returnCode);

// Subtracting Matched value for suppress
$cleanDataArray = array_values(array_diff($chunkDecodedUns, $curroptData));
$cleanData = implode("\n", $cleanDataArray);
$cleanData .= "\n";
file_put_contents($outputFile, $cleanData, LOCK_EX);
?>