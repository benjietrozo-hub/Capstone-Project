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
        Schema::create('item_distributions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_id')->constrained('tools_equipment')->onDelete('cascade');
            $table->foreignId('teacher_id')->constrained('teachers')->onDelete('cascade');
            $table->foreignId('distributed_by')->constrained('admins')->onDelete('cascade');
            $table->integer('quantity_distributed');
            $table->enum('status', ['active', 'returned', 'cancelled'])->default('active');
            $table->date('distribution_date');
            $table->date('expected_return_date')->nullable();
            $table->date('actual_return_date')->nullable();
            $table->text('purpose')->nullable();
            $table->text('notes')->nullable();
            $table->text('admin_notes')->nullable();
            $table->enum('condition_on_distribution', ['excellent', 'good', 'fair', 'poor'])->default('good');
            $table->enum('condition_on_return', ['excellent', 'good', 'fair', 'poor'])->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index('status');
            $table->index('distribution_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('item_distributions');
    }
};
