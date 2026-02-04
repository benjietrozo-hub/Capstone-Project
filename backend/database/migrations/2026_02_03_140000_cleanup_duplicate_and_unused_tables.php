<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * This migration cleans up duplicate and unused tables:
     * 1. Migrates data from 'admin' to 'admins' if needed
     * 2. Drops old 'admin' table
     * 3. Drops unused 'users' table
     * 4. Drops Telescope tables
     * 5. Drops backup tables
     * 6. Drops unknown 'yearly_reports' table
     */
    public function up(): void
    {
        // 1. Check if old 'admin' table exists and has data
        if (Schema::hasTable('admin')) {
            echo "Found old 'admin' table...\n";
            
            // Get data from old admin table
            $oldAdmins = DB::table('admin')->get();
            
            if ($oldAdmins->count() > 0) {
                echo "Migrating " . $oldAdmins->count() . " records from 'admin' to 'admins'...\n";
                
                foreach ($oldAdmins as $oldAdmin) {
                    // Check if admin already exists in new table by email
                    $exists = DB::table('admins')
                        ->where('email', $oldAdmin->email)
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
                        echo "  - Skipped (already exists): {$oldAdmin->email}\n";
                    }
                }
            }
            
            // Drop old admin table
            Schema::dropIfExists('admin');
            echo "✓ Dropped old 'admin' table\n";
        }
        
        // 2. Drop unused 'users' table
        if (Schema::hasTable('users')) {
            Schema::dropIfExists('users');
            echo "✓ Dropped unused 'users' table\n";
        }
        
        // 3. Drop Telescope tables
        $telescopeTables = ['telescope_entries_tags', 'telescope_entries', 'telescope_monitoring'];
        foreach ($telescopeTables as $table) {
            if (Schema::hasTable($table)) {
                Schema::dropIfExists($table);
                echo "✓ Dropped '{$table}' table\n";
            }
        }
        
        // 4. Drop backup tables
        if (Schema::hasTable('notifications_backup_20251111_153655')) {
            Schema::dropIfExists('notifications_backup_20251111_153655');
            echo "✓ Dropped backup table 'notifications_backup_20251111_153655'\n";
        }
        
        // 5. Drop yearly_reports if it exists and is not being used
        if (Schema::hasTable('yearly_reports')) {
            Schema::dropIfExists('yearly_reports');
            echo "✓ Dropped unused 'yearly_reports' table\n";
        }
        
        echo "\n✓ Database cleanup completed!\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Recreate old admin table structure (for rollback only)
        if (!Schema::hasTable('admin')) {
            Schema::create('admin', function (Blueprint $table) {
                $table->id();
                $table->string('username', 50);
                $table->string('email', 100)->unique();
                $table->string('password');
                $table->string('full_name', 100);
                $table->timestamps();
            });
        }
        
        // Recreate users table
        if (!Schema::hasTable('users')) {
            Schema::create('users', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('email')->unique();
                $table->timestamp('email_verified_at')->nullable();
                $table->string('password');
                $table->rememberToken();
                $table->timestamps();
            });
        }
        
        // Note: Telescope tables and backup tables are not recreated in rollback
        // If you need them, reinstall telescope package
    }
};
