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
        Schema::table('distribution_requests', function (Blueprint $table) {
            // Drop the foreign key first
            $table->dropForeign(['item_id']);
            
            // Make item_id nullable
            $table->unsignedBigInteger('item_id')->nullable()->change();
            
            // Re-add the foreign key
            $table->foreign('item_id')->references('id')->on('tools_equipment')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('distribution_requests', function (Blueprint $table) {
            // Drop the foreign key
            $table->dropForeign(['item_id']);
            
            // Make item_id required again
            $table->unsignedBigInteger('item_id')->nullable(false)->change();
            
            // Re-add the foreign key
            $table->foreign('item_id')->references('id')->on('tools_equipment')->onDelete('cascade');
        });
    }
};
