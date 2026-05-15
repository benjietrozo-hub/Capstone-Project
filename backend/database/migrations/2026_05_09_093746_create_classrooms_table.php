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
        Schema::create('classrooms', function (Blueprint $table) {
            $table->id();
            $table->string('room_number', 50);
            $table->string('building', 100)->nullable();
            $table->string('floor', 50)->nullable();
            $table->integer('capacity')->nullable();
            $table->string('room_type', 100)->nullable()->comment('Lab, Lecture, Workshop, etc.');
            $table->foreignId('assigned_teacher_id')->nullable()->constrained('teachers')->onDelete('set null');
            $table->foreignId('department_id')->nullable()->constrained('departments')->onDelete('set null');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('room_number');
            $table->index('assigned_teacher_id');
            $table->index('department_id');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('classrooms');
    }
};
