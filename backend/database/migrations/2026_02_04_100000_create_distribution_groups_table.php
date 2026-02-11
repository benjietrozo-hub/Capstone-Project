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
            $table->integer('id', true, true); // unsigned integer auto-increment
            $table->string('group_name');
            $table->string('group_type'); // department, grade_level, role, custom
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Distribution Group Members Table (Many-to-Many)
        Schema::create('distribution_group_members', function (Blueprint $table) {
            $table->integer('id', true, true); // unsigned integer auto-increment
            $table->integer('group_id', false, true); // unsigned integer
            $table->integer('teacher_id', false, true); // unsigned integer
            $table->timestamps();
            
            $table->unique(['group_id', 'teacher_id']);
            $table->foreign('group_id')->references('id')->on('distribution_groups')->onDelete('cascade');
            $table->foreign('teacher_id')->references('id')->on('teachers')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('distribution_group_members');
        Schema::dropIfExists('distribution_groups');
    }
};
