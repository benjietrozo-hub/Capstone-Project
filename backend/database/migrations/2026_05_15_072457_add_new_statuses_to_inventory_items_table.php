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
        if (config('database.default') === 'mysql') {
            DB::statement("ALTER TABLE inventory_items MODIFY COLUMN status ENUM('available', 'borrowed', 'distributed', 'maintenance', 'damaged', 'archived', 'disposed', 'lost', 'ready_for_disposal') DEFAULT 'available'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (config('database.default') === 'mysql') {
            DB::statement("ALTER TABLE inventory_items MODIFY COLUMN status ENUM('available', 'borrowed', 'distributed', 'maintenance', 'damaged', 'archived', 'disposed') DEFAULT 'available'");
        }
    }
};
