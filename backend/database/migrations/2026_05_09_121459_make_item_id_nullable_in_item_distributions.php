<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Drop the foreign key constraint first, then alter the column
        Schema::table('item_distributions', function (Blueprint $table) {
            // Drop foreign key if it exists
            try {
                $table->dropForeign(['item_id']);
            } catch (\Exception $e) {
                // Foreign key may not exist, continue
            }
        });

        // Make item_id nullable
        DB::statement('ALTER TABLE item_distributions MODIFY item_id BIGINT UNSIGNED NULL');

        // Re-add foreign key as nullable
        Schema::table('item_distributions', function (Blueprint $table) {
            $table->foreign('item_id')
                  ->references('id')
                  ->on('tools_equipment')
                  ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('item_distributions', function (Blueprint $table) {
            try {
                $table->dropForeign(['item_id']);
            } catch (\Exception $e) {}
        });

        DB::statement('ALTER TABLE item_distributions MODIFY item_id BIGINT UNSIGNED NOT NULL');

        Schema::table('item_distributions', function (Blueprint $table) {
            $table->foreign('item_id')
                  ->references('id')
                  ->on('tools_equipment')
                  ->onDelete('cascade');
        });
    }
};
