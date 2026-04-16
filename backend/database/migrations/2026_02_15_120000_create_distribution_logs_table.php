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
        Schema::create('distribution_logs', function (Blueprint $table) {
            $table->id();
            $table->morphs('distributable'); // Can be BulkDistribution or ItemDistribution
            $table->integer('teacher_id');
            $table->integer('item_id');
            $table->integer('quantity');
            $table->enum('action', ['created', 'processed', 'cancelled', 'returned', 'modified']);
            $table->text('description')->nullable();
            $table->text('old_values')->nullable(); // JSON of previous values
            $table->text('new_values')->nullable(); // JSON of new values
            $table->unsignedBigInteger('performed_by');
            $table->string('performed_by_type'); // 'admin' or 'teacher'
            $table->ipAddress('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();
            
            // Foreign keys
            $table->foreign('teacher_id')->references('id')->on('teachers')->onDelete('cascade');
            $table->foreign('item_id')->references('id')->on('tools_equipment')->onDelete('cascade');
            $table->foreign('performed_by')->references('id')->on('admins')->onDelete('cascade');
            
            // Indexes
            $table->index(['distributable_type', 'distributable_id']);
            $table->index('action');
            $table->index('teacher_id');
            $table->index('item_id');
            $table->index('performed_by');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('distribution_logs');
    }
};
