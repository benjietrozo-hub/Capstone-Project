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
        Schema::table('reports', function (Blueprint $table) {
            // Add missing fields if they don't exist
            if (!Schema::hasColumn('reports', 'resolved_at')) {
                $table->timestamp('resolved_at')->nullable();
            }
            if (!Schema::hasColumn('reports', 'resolved_by')) {
                $table->foreignId('resolved_by')->nullable()->constrained('admins');
            }
            if (!Schema::hasColumn('reports', 'date_reported')) {
                $table->timestamp('date_reported')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->dropColumn(['resolved_at', 'resolved_by', 'date_reported']);
        });
    }
};
