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
            $table->dropIndex('username');
            $table->dropIndex('email');
            $table->dropIndex('employee_id');
            $table->dropUnique('teachers_teacher_id_unique');
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
