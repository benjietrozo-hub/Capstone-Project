<?php

echo "=== Testing XAMPP Inventory Endpoint ===\n\n";

$baseUrl = 'http://localhost/OlineIMS/backend/public/api';

// Step 1: Login
echo "Step 1: Logging in...\n";
$loginData = json_encode([
    'username' => 'benjie.trozo',
    'password' => 'p@ssw0rd',
]);

$ch = curl_init($baseUrl . '/auth/login');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $loginData);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json',
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    echo "Login failed! HTTP Code: $httpCode\n";
    exit(1);
}

$loginResponse = json_decode($response, true);
$token = $loginResponse['token'];
echo "✅ Login successful!\n\n";

// Step 2: Fetch Inventory
echo "Step 2: Fetching inventory...\n";
$ch = curl_init($baseUrl . '/admin/inventory?per_page=50');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $token,
    'Accept: application/json',
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpCode\n";

if ($httpCode !== 200) {
    echo "❌ Inventory fetch failed!\n";
    echo "Response: $response\n";
    exit(1);
}

$inventoryResponse = json_decode($response, true);
echo "✅ Inventory fetched successfully!\n";
echo "Total items: " . ($inventoryResponse['total'] ?? 0) . "\n";
echo "Items on page: " . count($inventoryResponse['data'] ?? []) . "\n\n";

if (!empty($inventoryResponse['data'])) {
    echo "Items:\n";
    foreach ($inventoryResponse['data'] as $item) {
        echo "  - {$item['item_code']}: {$item['item_name']}\n";
    }
} else {
    echo "❌ No items in response!\n";
}

echo "\n=== Done ===\n";
