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
            $table->morphs('distributable'); // Can be BulkDistribution or ItemDistribution (already creates index)
            $table->foreignId('teacher_id')->constrained('teachers')->onDelete('cascade');
            $table->foreignId('item_id')->constrained('tools_equipment')->onDelete('cascade');
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
            
            // Foreign key for performed_by (polymorphic, so we don't use constrained)
            $table->foreign('performed_by')->references('id')->on('admins')->onDelete('cascade');
            
            // Indexes (morphs() already creates index for distributable_type and distributable_id)
            $table->index('action');
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
