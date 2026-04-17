<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Distribution Groups Table
        Schema::create('distribution_groups', function (Blueprint $table) {
            $table->id(); // bigint unsigned auto-increment
            $table->string('group_name');
            $table->string('group_type'); // department, grade_level, role, custom
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Distribution Group Members Table (Many-to-Many)
        Schema::create('distribution_group_members', function (Blueprint $table) {
            $table->id(); // bigint unsigned auto-increment
            $table->foreignId('group_id')->constrained('distribution_groups')->onDelete('cascade');
            $table->foreignId('teacher_id')->constrained('teachers')->onDelete('cascade');
            $table->timestamps();
            
            $table->unique(['group_id', 'teacher_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('distribution_group_members');
        Schema::dropIfExists('distribution_groups');
    }
};
