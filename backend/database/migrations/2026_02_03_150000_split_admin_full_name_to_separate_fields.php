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
     * Split full_name into first_name, middle_name, and last_name
     */
    public function up(): void
    {
        // Add new columns
        Schema::table('admins', function (Blueprint $table) {
            $table->string('first_name')->nullable()->after('password');
            $table->string('middle_name')->nullable()->after('first_name');
            $table->string('last_name')->nullable()->after('middle_name');
        });
        
        // Migrate existing data
        $admins = DB::table('admins')->get();
        
        foreach ($admins as $admin) {
            if ($admin->full_name) {
                // Split full name into parts
                $nameParts = explode(' ', trim($admin->full_name));
                
                $firstName = $nameParts[0] ?? '';
                $lastName = count($nameParts) > 1 ? array_pop($nameParts) : '';
                $middleName = count($nameParts) > 1 ? implode(' ', array_slice($nameParts, 1)) : '';
                
                DB::table('admins')
                    ->where('id', $admin->id)
                    ->update([
                        'first_name' => $firstName,
                        'middle_name' => $middleName ?: null,
                        'last_name' => $lastName ?: null,
                    ]);
            }
        }
        
        // Make first_name and last_name required after migration
        Schema::table('admins', function (Blueprint $table) {
            $table->string('first_name')->nullable(false)->change();
            $table->string('last_name')->nullable(false)->change();
        });
        
        // Drop old full_name column
        Schema::table('admins', function (Blueprint $table) {
            $table->dropColumn('full_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Add back full_name column
        Schema::table('admins', function (Blueprint $table) {
            $table->string('full_name')->nullable()->after('password');
        });
        
        // Migrate data back
        $admins = DB::table('admins')->get();
        
        foreach ($admins as $admin) {
            $fullName = trim(
                ($admin->first_name ?? '') . ' ' . 
                ($admin->middle_name ?? '') . ' ' . 
                ($admin->last_name ?? '')
            );
            
            DB::table('admins')
                ->where('id', $admin->id)
                ->update(['full_name' => $fullName]);
        }
        
        // Drop the separate name columns
        Schema::table('admins', function (Blueprint $table) {
            $table->dropColumn(['first_name', 'middle_name', 'last_name']);
        });
    }
};
