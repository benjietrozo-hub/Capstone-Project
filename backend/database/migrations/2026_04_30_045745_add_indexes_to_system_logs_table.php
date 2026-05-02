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
        Schema::table('system_logs', function (Blueprint $table) {
            $table->index('log_type');
            $table->index('action');
            $table->index('user_type');
            $table->index('severity');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('system_logs', function (Blueprint $table) {
            $table->dropIndex(['log_type']);
            $table->dropIndex(['action']);
            $table->dropIndex(['user_type']);
            $table->dropIndex(['severity']);
            $table->dropIndex(['created_at']);
        });
    }
};
