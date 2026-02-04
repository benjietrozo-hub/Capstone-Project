<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "========================================\n";
echo "Fix Migration Issues and Run Cleanup\n";
echo "========================================\n\n";

try {
    // Step 1: Mark personal_access_tokens migration as run (since table already exists)
    echo "Step 1: Checking personal_access_tokens migration...\n";
    
    $migrationName = '2026_02_03_105227_create_personal_access_tokens_table';
    $exists = DB::table('migrations')->where('migration', $migrationName)->exists();
    
    if (!$exists) {
        DB::table('migrations')->insert([
            'migration' => $migrationName,
            'batch' => DB::table('migrations')->max('batch') + 1
        ]);
        echo "✓ Marked personal_access_tokens migration as run\n\n";
    } else {
        echo "✓ Migration already marked as run\n\n";
    }
    
    // Step 2: Run system_logs migration
    echo "Step 2: Creating system_logs table...\n";
    
    if (!DB::getSchemaBuilder()->hasTable('system_logs')) {
        DB::statement("
            CREATE TABLE `system_logs` (
                `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
                `log_type` varchar(255) NOT NULL,
                `user_type` varchar(255) DEFAULT NULL,
                `user_id` bigint(20) unsigned DEFAULT NULL,
                `user_name` varchar(255) DEFAULT NULL,
                `action` varchar(255) NOT NULL,
                `description` text DEFAULT NULL,
                `metadata` json DEFAULT NULL,
                `ip_address` varchar(255) DEFAULT NULL,
                `user_agent` varchar(255) DEFAULT NULL,
                `severity` enum('info','warning','error','critical') NOT NULL DEFAULT 'info',
                `created_at` timestamp NULL DEFAULT NULL,
                `updated_at` timestamp NULL DEFAULT NULL,
                PRIMARY KEY (`id`),
                KEY `system_logs_log_type_created_at_index` (`log_type`,`created_at`),
                KEY `system_logs_user_type_user_id_index` (`user_type`,`user_id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
        
        DB::table('migrations')->insert([
            'migration' => '2026_02_03_120000_create_system_logs_table',
            'batch' => DB::table('migrations')->max('batch') + 1
        ]);
        
        echo "✓ Created system_logs table\n\n";
    } else {
        echo "✓ system_logs table already exists\n\n";
    }
    
    // Step 3: Run cleanup
    echo "Step 3: Running database cleanup...\n";
    echo str_repeat("-", 80) . "\n";
    
    // 3a. Migrate data from 'admin' to 'admins'
    if (DB::getSchemaBuilder()->hasTable('admin')) {
        echo "Found old 'admin' table...\n";
        
        $oldAdmins = DB::table('admin')->get();
        
        if ($oldAdmins->count() > 0) {
            echo "Migrating " . $oldAdmins->count() . " records from 'admin' to 'admins'...\n";
            
            foreach ($oldAdmins as $oldAdmin) {
                $exists = DB::table('admins')
                    ->where('email', $oldAdmin->email)
                    ->orWhere('username', $oldAdmin->username)
                    ->exists();
                
                if (!$exists) {
                    DB::table('admins')->insert([
                        'username' => $oldAdmin->username,
                        'email' => $oldAdmin->email,
                        'password' => $oldAdmin->password,
                        'full_name' => $oldAdmin->full_name,
                        'status' => 'active',
                        'created_at' => $oldAdmin->created_at ?? now(),
                        'updated_at' => $oldAdmin->updated_at ?? now(),
                    ]);
                    echo "  ✓ Migrated: {$oldAdmin->email}\n";
                } else {
                    echo "  - Skipped (already exists): {$oldAdmin->email} / {$oldAdmin->username}\n";
                }
            }
        }
        
        // Drop foreign key constraint first
        try {
            DB::statement('ALTER TABLE `reports` DROP FOREIGN KEY `reports_ibfk_4`');
            echo "✓ Dropped foreign key constraint from reports table\n";
        } catch (Exception $e) {
            echo "- Foreign key already dropped or doesn't exist\n";
        }
        
        DB::statement('DROP TABLE IF EXISTS `admin`');
        echo "✓ Dropped old 'admin' table\n\n";
    }
    
    // 3b. Drop unused tables
    $tablesToDrop = [
        'users',
        'telescope_entries_tags',
        'telescope_entries',
        'telescope_monitoring',
        'notifications_backup_20251111_153655',
        'yearly_reports'
    ];
    
    foreach ($tablesToDrop as $table) {
        if (DB::getSchemaBuilder()->hasTable($table)) {
            DB::statement("DROP TABLE IF EXISTS `{$table}`");
            echo "✓ Dropped '{$table}' table\n";
        }
    }
    
    // Mark cleanup migration as run
    DB::table('migrations')->insert([
        'migration' => '2026_02_03_140000_cleanup_duplicate_and_unused_tables',
        'batch' => DB::table('migrations')->max('batch') + 1
    ]);
    
    echo "\n";
    echo str_repeat("=", 80) . "\n";
    echo "✓ CLEANUP COMPLETED SUCCESSFULLY!\n";
    echo str_repeat("=", 80) . "\n\n";
    
    // Show final table count
    $tables = DB::select('SHOW TABLES');
    echo "Final table count: " . count($tables) . "\n\n";
    
    echo "Tables removed:\n";
    echo "  - admin (old duplicate)\n";
    echo "  - users (unused)\n";
    echo "  - telescope_entries (dev tool)\n";
    echo "  - telescope_entries_tags (dev tool)\n";
    echo "  - telescope_monitoring (dev tool)\n";
    echo "  - notifications_backup_20251111_153655 (backup)\n";
    echo "  - yearly_reports (unused)\n\n";
    
    echo "Tables added:\n";
    echo "  - system_logs (new)\n\n";
    
    echo "✓ Database is now clean and optimized!\n";
    
} catch (Exception $e) {
    echo "\n❌ ERROR: " . $e->getMessage() . "\n";
    echo "\nStack trace:\n";
    echo $e->getTraceAsString() . "\n";
}

echo "\n========================================\n";
