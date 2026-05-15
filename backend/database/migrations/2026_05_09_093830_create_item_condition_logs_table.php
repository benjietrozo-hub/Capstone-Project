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
        Schema::create('item_condition_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_id')->constrained('inventory_items')->onDelete('cascade');
            $table->foreignId('item_distribution_id')->nullable()->constrained('item_distributions')->onDelete('set null');
            $table->string('reported_by_type')->nullable();
            $table->unsignedBigInteger('reported_by_id')->nullable();
            $table->enum('log_type', ['damage', 'repair', 'disposal', 'inspection']);
            $table->string('condition_before', 50)->nullable();
            $table->string('condition_after', 50)->nullable();
            $table->text('description')->nullable();
            $table->decimal('repair_cost', 10, 2)->nullable();
            $table->date('repair_date')->nullable();
            $table->text('disposal_reason')->nullable();
            $table->date('disposal_date')->nullable();
            $table->json('images')->nullable();
            $table->timestamps();
            
            $table->index('item_id');
            $table->index('item_distribution_id');
            $table->index(['reported_by_type', 'reported_by_id'], 'idx_reported_by');
            $table->index('log_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('item_condition_logs');
    }
};
