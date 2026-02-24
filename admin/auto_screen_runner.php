<?php
$commandFile = '/var/www/html/screenout/auto_screen_cron.txt';

if (!file_exists($commandFile)) {
    error_log("Command file not found: $commandFile");
    exit;
}

$commands = file($commandFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

if (empty($commands)) {
    exit;
}

$remainingCommands = [];

foreach ($commands as $cmd) {
    $cmd = trim($cmd);
    if ($cmd === '') {
        continue;
    }

    // Extract screen name
    preg_match('/screen -dmS ([^\s]+)/', $cmd, $matches);
    $screenName = isset($matches[1]) ? $matches[1] : null;

    if ($screenName) {
        $existingScreens = shell_exec('/usr/bin/screen -ls');
        if (strpos($existingScreens, $screenName) !== false) {
            continue;
        } else {
        // Run command
        shell_exec($cmd);
        }   
    }
}

file_put_contents($commandFile, implode("\n", $remainingCommands));