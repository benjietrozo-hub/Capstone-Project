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
        Schema::table('login_attempts', function (Blueprint $table) {
            $table->integer('total_attempts_today')->default(0)->after('attempts_in_batch');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('login_attempts', function (Blueprint $table) {
            $table->dropColumn('total_attempts_today');
        });
    }
};
