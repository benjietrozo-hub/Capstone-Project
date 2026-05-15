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
        Schema::create('item_transfers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_distribution_id')->constrained('item_distributions')->onDelete('cascade');
            $table->string('from_assignable_type')->nullable();
            $table->unsignedBigInteger('from_assignable_id')->nullable();
            $table->string('to_assignable_type');
            $table->unsignedBigInteger('to_assignable_id');
            $table->text('transfer_reason')->nullable();
            $table->string('requested_by_type')->nullable();
            $table->unsignedBigInteger('requested_by_id')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('admins')->onDelete('set null');
            $table->enum('status', ['pending', 'approved', 'rejected', 'completed', 'cancelled'])->default('pending');
            $table->date('transfer_date')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index(['from_assignable_type', 'from_assignable_id'], 'idx_from_assignable');
            $table->index(['to_assignable_type', 'to_assignable_id'], 'idx_to_assignable');
            $table->index('status');
            $table->index('approved_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('item_transfers');
    }
};
