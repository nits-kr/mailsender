<?php
// ...existing code above foreach($emailJsonData as $email)...

function generate_dkim_header($headers, $body, $domain, $selector, $private_key_path, $identity) {
    // Canonicalize headers and body (simple canonicalization)
    $dkim_headers = [
        'From',
        'To',
        'Subject',
        'Message-ID',
        // Add more if needed
    ];
    $header_lines = [];
    foreach ($dkim_headers as $h) {
        if (preg_match('/^'.$h.':\s.*$/mi', $headers, $matches)) {
            $header_lines[] = trim($matches[0]);
        }
    }
    $canonicalized_headers = implode("\r\n", $header_lines);

    // Canonicalize body (simple: remove trailing CRLFs)
    $canonicalized_body = rtrim($body, "\r\n") . "\r\n";

    // Build DKIM-Signature header (without signature)
    $dkim_header = "v=1; a=rsa-sha256; c=simple/simple; d=$domain; s=$selector; ".
                   "h=" . strtolower(implode(':', $dkim_headers)) . "; ".
                   "bh=" . base64_encode(hash('sha256', $canonicalized_body, true)) . "; ".
                   "b=";

    // Prepare data to sign
    $signing_string = $canonicalized_headers . "\r\n" .
                      "DKIM-Signature: " . $dkim_header;

    // Load private key
    $private_key = file_get_contents($private_key_path);
    $pkeyid = openssl_pkey_get_private($private_key);

    // Sign
    openssl_sign($signing_string, $signature, $pkeyid, OPENSSL_ALGO_SHA256);
    openssl_free_key($pkeyid);

    // Final DKIM-Signature header
    $dkim_signature = $dkim_header . chunk_split(base64_encode($signature), 73, "\r\n ");

    return "DKIM-Signature: " . $dkim_signature;
}

// ...inside your foreach($emailJsonData as $email) loop...

// Prepare headers and body for DKIM
list($headers, $body_content) = explode("\r\n\r\n", $body, 2);

// DKIM settings
$dkim_domain = $from_domain;
$dkim_selector = 'default'; // Change to your selector
$dkim_private_key_path = '/path/to/private.key'; // Change to your key path
$dkim_identity = $from_email;

// Generate DKIM header
$dkim_header = generate_dkim_header($headers, $body_content, $dkim_domain, $dkim_selector, $dkim_private_key_path, $dkim_identity);

// Prepend DKIM header to $body
$body = $dkim_header . "\r\n" . $body;

// ...existing SMTP sending code...