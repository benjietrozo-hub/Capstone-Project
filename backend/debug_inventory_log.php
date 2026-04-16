<?php

$host = '127.0.0.1';
$port = '3306';
$dbname = 'inventory_system';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "=== Debugging InventoryLog Issue ===\n\n";
    
    // Check current table structure
    echo "1. Current inventory_logs table structure:\n";
    $stmt = $pdo->query("DESCRIBE inventory_logs");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Columns:\n";
    $requiredColumns = [];
    $nullableColumns = [];
    foreach ($columns as $column) {
        echo "- " . $column['Field'] . " (" . $column['Type'] . ") " . ($column['Null'] == 'NO' ? 'NOT NULL' : 'NULL');
        if ($column['Null'] == 'NO') {
            echo " [REQUIRED]";
            $requiredColumns[] = $column['Field'];
        } else {
            $nullableColumns[] = $column['Field'];
        }
        echo "\n";
    }
    
    echo "\n2. Required columns (NOT NULL):\n";
    foreach ($requiredColumns as $column) {
        echo "- $column\n";
    }
    
    echo "\n3. Nullable columns:\n";
    foreach ($nullableColumns as $column) {
        echo "- $column\n";
    }
    
    echo "\n4. What Laravel is trying to insert:\n";
    echo "Based on the code, Laravel is trying to insert:\n";
    echo "- item_id (from controller)\n";
    echo "- action (from controller)\n";
    echo "- user_id (from controller)\n";
    echo "- user_type (from controller)\n";
    echo "- details (from controller)\n";
    echo "- created_at (Laravel auto-adds because \$timestamps = true)\n";
    echo "- updated_at (Laravel auto-adds because \$timestamps = true)\n";
    
    echo "\n5. Checking for missing required columns:\n";
    $laravelColumns = ['item_id', 'action', 'user_id', 'user_type', 'details', 'created_at', 'updated_at'];
    $missingRequired = [];
    
    foreach ($requiredColumns as $required) {
        if (!in_array($required, $laravelColumns)) {
            $missingRequired[] = $required;
            echo "MISSING REQUIRED: $required\n";
        }
    }
    
    if (empty($missingRequired)) {
        echo "All required columns are provided by Laravel\n";
    }
    
    echo "\n6. Testing actual insert:\n";
    try {
        $testQuery = "INSERT INTO inventory_logs (item_id, action, user_id, user_type, details, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())";
        $stmt = $pdo->prepare($testQuery);
        $stmt->execute([999, 'test', 1, 'admin', 'Test entry']);
        echo "SUCCESS: Test insert worked\n";
        
        // Clean up
        $pdo->exec("DELETE FROM inventory_logs WHERE item_id = 999 AND action = 'test'");
        echo "Test entry cleaned up\n";
    } catch (PDOException $e) {
        echo "ERROR: " . $e->getMessage() . "\n";
    }
    
} catch (PDOException $e) {
    echo "Database Error: " . $e->getMessage() . "\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

echo "\n=== End ===\n";
?>
