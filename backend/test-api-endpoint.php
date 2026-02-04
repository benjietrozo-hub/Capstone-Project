<?php

// Test the actual API endpoint
$baseUrl = 'http://localhost:8000/api';

echo "=== Testing Admin Inventory API Endpoint ===\n\n";

// First, login to get a token
echo "Step 1: Logging in as admin...\n";
$loginData = [
    'username' => 'benjie.trozo',
    'password' => 'p@ssw0rd',
];

$ch = curl_init($baseUrl . '/auth/login');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($loginData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json',
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Login response code: $httpCode\n";

if ($httpCode !== 200) {
    echo "Login failed!\n";
    echo "Response: $response\n";
    exit(1);
}

$loginResponse = json_decode($response, true);
$token = $loginResponse['token'] ?? null;

if (!$token) {
    echo "No token received!\n";
    echo "Response: $response\n";
    exit(1);
}

echo "Login successful! Token received.\n";
echo "User: {$loginResponse['user']['username']}\n";
echo "Role: {$loginResponse['user']['role']}\n\n";

// Now test the inventory endpoint
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

echo "Inventory response code: $httpCode\n";

if ($httpCode !== 200) {
    echo "Inventory fetch failed!\n";
    echo "Response: $response\n";
    exit(1);
}

$inventoryResponse = json_decode($response, true);
echo "Inventory fetched successfully!\n";
echo "Total items: " . ($inventoryResponse['total'] ?? 0) . "\n";
echo "Items on page: " . count($inventoryResponse['data'] ?? []) . "\n\n";

if (!empty($inventoryResponse['data'])) {
    echo "Sample items:\n";
    foreach (array_slice($inventoryResponse['data'], 0, 5) as $item) {
        echo "- {$item['item_code']}: {$item['item_name']} (Status: {$item['status']})\n";
    }
} else {
    echo "No items in response!\n";
}

echo "\n=== Full Response Structure ===\n";
echo json_encode($inventoryResponse, JSON_PRETTY_PRINT);

echo "\n\n=== Done ===\n";
