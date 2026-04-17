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
        Schema::table('inventory_logs', function (Blueprint $table) {
            // Remove performed_by column (wasn't in original schema)
            $table->dropColumn('performed_by');
            
            // Add missing columns from original schema
            $table->text('old_values')->nullable()->after('details');
            $table->text('new_values')->nullable()->after('old_values');
            $table->string('ip_address', 45)->nullable()->after('new_values');
            $table->text('user_agent')->nullable()->after('ip_address');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inventory_logs', function (Blueprint $table) {
            $table->unsignedBigInteger('performed_by')->nullable()->after('action');
            $table->dropColumn(['old_values', 'new_values', 'ip_address', 'user_agent']);
        });
    }
};
