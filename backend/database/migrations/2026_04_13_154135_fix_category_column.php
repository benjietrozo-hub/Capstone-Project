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
            // Modify category column to ensure it can handle our values
            $table->string('category', 50)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tools_equipment', function (Blueprint $table) {
            // Revert to original string length
            $table->string('category')->change();
        });
    }
};
