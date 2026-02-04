<?php

echo "=== Testing Both API URLs ===\n\n";

$urls = [
    'Laravel Serve' => 'http://localhost:8000/api/auth/login',
    'XAMPP' => 'http://localhost/OlineIMS/backend/public/api/auth/login',
];

$loginData = json_encode([
    'username' => 'benjie.trozo',
    'password' => 'p@ssw0rd',
]);

foreach ($urls as $name => $url) {
    echo "Testing $name: $url\n";
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $loginData);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Accept: application/json',
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        echo "  ❌ Error: $error\n";
    } else {
        echo "  HTTP Code: $httpCode\n";
        if ($httpCode === 200) {
            $data = json_decode($response, true);
            echo "  ✅ Success! Token received: " . (isset($data['token']) ? 'Yes' : 'No') . "\n";
        } else {
            echo "  ❌ Failed\n";
            echo "  Response: " . substr($response, 0, 200) . "\n";
        }
    }
    echo "\n";
}

echo "=== Done ===\n";
