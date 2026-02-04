<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tools_equipment', function (Blueprint $table) {
            // Add missing columns if they don't exist
            if (!Schema::hasColumn('tools_equipment', 'item_code')) {
                $table->string('item_code')->nullable()->after('id');
            }
            if (!Schema::hasColumn('tools_equipment', 'status')) {
                $table->enum('status', ['active', 'inactive', 'maintenance'])->default('active')->after('notes');
            }
            if (!Schema::hasColumn('tools_equipment', 'image')) {
                $table->string('image')->nullable()->after('unit_price');
            }
            if (!Schema::hasColumn('tools_equipment', 'acquisition_date')) {
                $table->date('acquisition_date')->nullable()->after('image');
            }
        });
        
        // Generate item codes for existing items
        DB::statement("UPDATE tools_equipment SET item_code = CONCAT('ITEM', LPAD(id, 4, '0')) WHERE item_code IS NULL");
        
        // Make item_code unique after populating
        Schema::table('tools_equipment', function (Blueprint $table) {
            $table->unique('item_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tools_equipment', function (Blueprint $table) {
            $table->dropUnique(['item_code']);
            $table->dropColumn(['item_code', 'status', 'image', 'acquisition_date']);
        });
    }
};
