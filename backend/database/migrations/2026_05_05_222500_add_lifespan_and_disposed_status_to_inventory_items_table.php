<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('inventory_items', function (Blueprint $table) {
            $table->integer('lifespan_years')->nullable()->after('date_acquired')->default(5);
            
            // For status, it's safer to change to string then update constraints if needed,
            // or just use DB::statement if it's an ENUM on MySQL
            if (config('database.default') === 'mysql') {
                DB::statement("ALTER TABLE inventory_items MODIFY COLUMN status ENUM('available', 'borrowed', 'distributed', 'maintenance', 'damaged', 'archived', 'disposed') DEFAULT 'available'");
            } else {
                $table->string('status')->default('available')->change();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inventory_items', function (Blueprint $table) {
            $table->dropColumn('lifespan_years');
            
            if (config('database.default') === 'mysql') {
                DB::statement("ALTER TABLE inventory_items MODIFY COLUMN status ENUM('available', 'borrowed', 'maintenance', 'damaged', 'archived') DEFAULT 'available'");
            }
        });
    }
};
