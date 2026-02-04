<?php

// Test Sanctum authentication with a real token

$baseUrl = 'http://localhost/OlineIMS/backend/public/api';

echo "=== TESTING SANCTUM AUTHENTICATION ===\n\n";

// Step 1: Login
echo "Step 1: Logging in...\n";
$ch = curl_init($baseUrl . '/auth/login');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'username' => 'benjie.trozo',
    'password' => 'p@ssw0rd',
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json',
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    echo "❌ Login failed! HTTP Code: $httpCode\n";
    echo "Response: $response\n";
    exit(1);
}

$loginData = json_decode($response, true);
$token = $loginData['token'];
$user = $loginData['user'];

echo "✅ Login successful!\n";
echo "User: {$user['username']}\n";
echo "Role: {$loginData['role']}\n";
echo "Token: " . substr($token, 0, 20) . "...\n\n";

// Step 2: Test inventory endpoint
echo "Step 2: Testing inventory endpoint...\n";
$ch = curl_init($baseUrl . '/admin/inventory?per_page=50');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $token,
    'Accept: application/json',
    'Content-Type: application/json',
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

echo "HTTP Code: $httpCode\n";

if ($curlError) {
    echo "❌ CURL Error: $curlError\n";
}

if ($httpCode !== 200) {
    echo "❌ Request failed!\n";
    echo "Response: $response\n";
    exit(1);
}

$inventoryData = json_decode($response, true);

echo "✅ Request successful!\n";
echo "Total items: " . ($inventoryData['total'] ?? 0) . "\n";
echo "Items on page: " . count($inventoryData['data'] ?? []) . "\n\n";

if (empty($inventoryData['data'])) {
    echo "❌ NO ITEMS IN RESPONSE!\n\n";
    echo "Full response:\n";
    echo json_encode($inventoryData, JSON_PRETTY_PRINT) . "\n";
} else {
    echo "✅ Items found:\n";
    foreach ($inventoryData['data'] as $item) {
        echo "  - {$item['item_code']}: {$item['item_name']}\n";
    }
}

echo "\n=== DONE ===\n";
