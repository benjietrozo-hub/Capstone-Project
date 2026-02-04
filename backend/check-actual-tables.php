<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "========================================\n";
echo "ACTUAL DATABASE TABLES\n";
echo "========================================\n\n";

try {
    $databaseName = env('DB_DATABASE');
    echo "Database: {$databaseName}\n\n";
    
    $tables = DB::select('SHOW TABLES');
    $tableKey = "Tables_in_{$databaseName}";
    
    echo "Total Tables: " . count($tables) . "\n\n";
    echo "List of all tables:\n";
    echo str_repeat("-", 80) . "\n";
    
    $tableList = [];
    foreach ($tables as $index => $table) {
        $tableName = $table->$tableKey;
        $tableList[] = $tableName;
        printf("%2d. %s\n", $index + 1, $tableName);
    }
    
    echo "\n";
    echo str_repeat("-", 80) . "\n";
    
    // Check for suspicious duplicates
    echo "\nChecking for potential issues:\n";
    echo str_repeat("-", 80) . "\n";
    
    $issues = [];
    
    // Check for admin/admins
    if (in_array('admin', $tableList) && in_array('admins', $tableList)) {
        $issues[] = "⚠️  DUPLICATE: Both 'admin' and 'admins' tables exist!";
    } elseif (in_array('admin', $tableList)) {
        $issues[] = "⚠️  Found 'admin' table (should be 'admins')";
    }
    
    // Check for teacher/teachers
    if (in_array('teacher', $tableList) && in_array('teachers', $tableList)) {
        $issues[] = "⚠️  DUPLICATE: Both 'teacher' and 'teachers' tables exist!";
    } elseif (in_array('teacher', $tableList)) {
        $issues[] = "⚠️  Found 'teacher' table (should be 'teachers')";
    }
    
    // Check for users
    if (in_array('users', $tableList)) {
        $issues[] = "⚠️  'users' table exists (should be removed)";
    }
    
    // Check for telescope
    $telescopeTables = array_filter($tableList, function($table) {
        return strpos($table, 'telescope') !== false;
    });
    if (!empty($telescopeTables)) {
        $issues[] = "⚠️  Telescope tables exist: " . implode(', ', $telescopeTables);
    }
    
    if (empty($issues)) {
        echo "✓ No issues found!\n";
    } else {
        foreach ($issues as $issue) {
            echo $issue . "\n";
        }
    }
    
    // Show table details for admin-related tables
    echo "\n";
    echo "ADMIN-RELATED TABLES DETAILS:\n";
    echo str_repeat("-", 80) . "\n";
    
    foreach (['admin', 'admins'] as $tableName) {
        if (in_array($tableName, $tableList)) {
            echo "\nTable: {$tableName}\n";
            $columns = DB::select("DESCRIBE {$tableName}");
            echo "Columns:\n";
            foreach ($columns as $column) {
                printf("  - %-20s %s\n", $column->Field, $column->Type);
            }
            
            $count = DB::table($tableName)->count();
            echo "Row count: {$count}\n";
            
            if ($count > 0 && $count <= 5) {
                echo "Sample data:\n";
                $rows = DB::table($tableName)->limit(5)->get();
                foreach ($rows as $row) {
                    echo "  ID: {$row->id}, Email: " . ($row->email ?? 'N/A') . "\n";
                }
            }
        }
    }
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}

echo "\n========================================\n";
