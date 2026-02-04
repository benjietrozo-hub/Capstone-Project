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
        Schema::table('teachers', function (Blueprint $table) {
            // Add missing columns if they don't exist
            if (!Schema::hasColumn('teachers', 'phone')) {
                $table->string('phone')->nullable()->after('department');
            }
            if (!Schema::hasColumn('teachers', 'profile_image')) {
                $table->string('profile_image')->nullable()->after('phone');
            }
            if (!Schema::hasColumn('teachers', 'teacher_id')) {
                $table->string('teacher_id')->nullable()->unique()->after('id');
            }
            if (!Schema::hasColumn('teachers', 'remember_token')) {
                $table->rememberToken();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('teachers', function (Blueprint $table) {
            $table->dropColumn(['phone', 'profile_image', 'teacher_id', 'remember_token']);
        });
    }
};
