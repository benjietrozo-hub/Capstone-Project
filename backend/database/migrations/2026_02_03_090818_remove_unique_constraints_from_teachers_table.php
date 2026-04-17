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
            // Drop unique constraints to allow soft delete reuse
            $table->dropUnique(['username']);
            $table->dropUnique(['email']);
            if (Schema::hasColumn('teachers', 'employee_id')) {
                $table->dropUnique(['employee_id']);
            }
            $table->dropUnique(['teacher_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('teachers', function (Blueprint $table) {
            // Restore unique constraints
            $table->unique('username');
            $table->unique('email');
            $table->unique('employee_id');
            $table->unique('teacher_id');
        });
    }
};
