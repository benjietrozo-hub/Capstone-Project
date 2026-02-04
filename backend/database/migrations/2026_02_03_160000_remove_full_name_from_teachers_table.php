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
     * Remove full_name column from teachers table since we're using
     * first_name, middle_initial, and last_name instead
     */
    public function up(): void
    {
        // Before dropping, migrate any data from full_name to separate fields if needed
        $teachers = DB::table('teachers')->whereNotNull('full_name')->get();
        
        if ($teachers->count() > 0) {
            echo "Migrating {$teachers->count()} teacher(s) with full_name data...\n";
            
            foreach ($teachers as $teacher) {
                // Only migrate if first_name and last_name are empty
                if (empty($teacher->first_name) && empty($teacher->last_name)) {
                    $nameParts = explode(' ', trim($teacher->full_name));
                    
                    $firstName = $nameParts[0] ?? '';
                    $lastName = count($nameParts) > 1 ? array_pop($nameParts) : '';
                    $middleInitial = count($nameParts) > 1 ? substr($nameParts[1], 0, 1) . '.' : '';
                    
                    DB::table('teachers')
                        ->where('id', $teacher->id)
                        ->update([
                            'first_name' => $firstName,
                            'middle_initial' => $middleInitial ?: null,
                            'last_name' => $lastName ?: null,
                        ]);
                    
                    echo "  ✓ Migrated: {$teacher->full_name}\n";
                }
            }
        }
        
        // Drop the full_name column
        Schema::table('teachers', function (Blueprint $table) {
            $table->dropColumn('full_name');
        });
        
        echo "✓ Removed full_name column from teachers table\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Add back full_name column
        Schema::table('teachers', function (Blueprint $table) {
            $table->string('full_name')->nullable()->after('password');
        });
        
        // Migrate data back
        $teachers = DB::table('teachers')->get();
        
        foreach ($teachers as $teacher) {
            $fullName = trim(
                ($teacher->first_name ?? '') . ' ' . 
                ($teacher->middle_initial ?? '') . ' ' . 
                ($teacher->last_name ?? '')
            );
            
            if ($fullName) {
                DB::table('teachers')
                    ->where('id', $teacher->id)
                    ->update(['full_name' => $fullName]);
            }
        }
    }
};
