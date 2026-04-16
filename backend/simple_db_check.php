<?php

// Direct database connection check
$host = '127.0.0.1';
$database = 'inventory_system';
$username = 'root';
$password = '';

try {
    $conn = new PDO("mysql:host=$host;dbname=$database", $username, $password);
    echo "✅ Connected to database successfully\n\n";
    
    // Check table structure
    $stmt = $conn->prepare("DESCRIBE tools_equipment");
    $stmt->execute();
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "=== tools_equipment table structure ===\n";
    foreach ($columns as $column) {
        echo "Column: {$column['Field']} | Type: {$column['Type']} | Null: {$column['Null']} | Key: {$column['Key']}\n";
    }
    
    echo "\n=== Sample data check ===\n";
    $stmt = $conn->prepare("SELECT * FROM tools_equipment LIMIT 3");
    $stmt->execute();
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($items as $item) {
        echo "Item: {$item['item_name']}\n";
        echo "  Category: '{$item['category']}' (Length: " . strlen($item['category']) . ")\n";
        echo "  Item Code: {$item['item_code']}\n";
        echo "  Quantity: {$item['quantity_total']}\n";
        echo "  ---\n";
    }
    
} catch (PDOException $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "\n";
}
?>
