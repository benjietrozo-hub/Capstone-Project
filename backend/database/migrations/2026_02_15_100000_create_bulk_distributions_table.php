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
        Schema::create('bulk_distributions', function (Blueprint $table) {
            $table->id();
            $table->integer('group_id');
            $table->integer('item_id');
            $table->unsignedBigInteger('distributed_by');
            $table->integer('total_quantity');
            $table->integer('quantity_per_member');
            $table->enum('status', ['pending', 'processing', 'completed', 'cancelled'])->default('pending');
            $table->text('purpose')->nullable();
            $table->text('notes')->nullable();
            $table->date('distribution_date');
            $table->date('expected_return_date')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            // Foreign keys
            $table->foreign('group_id')->references('id')->on('distribution_groups')->onDelete('cascade');
            $table->foreign('item_id')->references('id')->on('tools_equipment')->onDelete('cascade');
            $table->foreign('distributed_by')->references('id')->on('admins')->onDelete('cascade');
            
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
        Schema::dropIfExists('bulk_distributions');
    }
};
