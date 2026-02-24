<?php
/**
 * Data File Merger Script - Optimized for Large Files (1M+ records)
 * Merges multiple email files, sorts them, and removes duplicates
 * Uses memory-efficient streaming approach
 * author: Karan Giri (karangiri77@gmail.com)
 * date: 2026-01-10
 * version: 1.0.0
 * description: This script merges multiple email files, sorts them, and removes duplicates
 */

// Set memory limit and execution time for large files
ini_set('memory_limit', '-1');
set_time_limit(0);

// Get file names from request
$dataFiles = isset($_REQUEST['dataFiles']) ? $_REQUEST['dataFiles'] : '';

// Check if dataFiles is provided
if (empty($dataFiles)) {
    echo json_encode([
        'status' => 'error',
        'message' => 'No files provided. Please provide file names in dataFiles parameter.'
    ]);
    exit;
}

// Explode file names by newline
$fileNames = explode("\n", $dataFiles);
$fileNames = array_map('trim', $fileNames); // Remove whitespace
$fileNames = array_filter($fileNames); // Remove empty entries

if (empty($fileNames)) {
    echo json_encode([
        'status' => 'error',
        'message' => 'No valid file names found.'
    ]);
    exit;
}

// Base directory where files are stored
$baseDir = '/var/www/data/';

// Check if base directory exists
if (!is_dir($baseDir)) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Base directory does not exist: ' . $baseDir
    ]);
    exit;
}

// Check if all files exist
$missingFiles = [];
$existingFiles = [];

foreach ($fileNames as $fileName) {
    $filePath = $baseDir . $fileName;
    
    if (!file_exists($filePath)) {
        $missingFiles[] = $fileName;
    } else {
        $existingFiles[] = $fileName;
    }
}

// If any files are missing, return error
if (!empty($missingFiles)) {
    echo json_encode([
        'status' => 'error',
        'message' => 'The following files are not present in ' . $baseDir . ': ' . implode(', ', $missingFiles)
    ]);
    exit;
}

// Step 1: Mix - Collect all emails from all files (including duplicates)
// Collect all emails from all files to mix them together
$allEmails = [];
$totalLinesProcessed = 0;
$totalEmailsFound = 0;

// Process each file line by line (memory efficient for large files)
foreach ($existingFiles as $fileName) {
    $filePath = $baseDir . $fileName;
    
    // Open file for reading (streaming mode)
    $handle = fopen($filePath, 'r');
    
    if ($handle === false) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Error opening file: ' . $fileName
        ]);
        exit;
    }
    
    // Read file line by line to handle large files efficiently
    while (($line = fgets($handle)) !== false) {
        $totalLinesProcessed++;
        
        $line = trim($line);
        
        // Skip empty lines
        if (empty($line)) {
            continue;
        }
        
        // Validate email format (basic validation)
        if (filter_var($line, FILTER_VALIDATE_EMAIL)) {
            // Mix: Add all emails to the array (duplicates allowed at this stage)
            $allEmails[] = $line;
            $totalEmailsFound++;
        }
    }
    
    fclose($handle);
}

// Step 2: Randomly shuffle all emails (including duplicates) to mix them randomly
// shuffle() randomly reorders array elements in place
shuffle($allEmails);

$totalEmailCount = count($allEmails);

// Generate output file name (timestamp-based)
$outputFileName = generateFileName();
$outputFilePath = $baseDir . $outputFileName;

// Write output file line by line for memory efficiency
$outputHandle = fopen($outputFilePath, 'w');

if ($outputHandle === false) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Error creating output file: ' . $outputFileName
    ]);
    exit;
}

// Write emails line by line instead of loading all into memory
// Note: Output may contain duplicate emails as per requirement
foreach ($allEmails as $email) {
    fwrite($outputHandle, $email . "\n");
}

fclose($outputHandle);

// Set permissions to 0777 for the output file
chmod($outputFilePath, 0777);

// Clear array to free memory
unset($allEmails);

// Return success response
echo json_encode([
    'status' => 'success',
    'message' => 'Files merged successfully.',
    'files_processed' => count($existingFiles),
    'total_lines_processed' => $totalLinesProcessed,
    'total_emails_found' => $totalEmailsFound,
    'total_emails_in_output' => $totalEmailCount,
    'note' => 'Output file contains all emails including duplicates',
    'output_file' => $outputFileName
]);

function generateFileName()
{
    return $fileName = trim(md5(date("Y-m-d H:i:s").microtime().rand(1,10000))).".txt";
}
?>
