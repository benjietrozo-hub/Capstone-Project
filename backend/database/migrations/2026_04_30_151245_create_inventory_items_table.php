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
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('item_categories')->onDelete('cascade');
            $table->string('item_name'); // e.g. "Dell XPS 15"
            $table->string('serial_number')->unique();
            $table->string('property_number')->unique()->nullable();
            $table->string('item_image')->nullable();
            $table->enum('condition', ['excellent', 'good', 'fair', 'poor', 'damaged'])->default('good');
            $table->enum('status', ['available', 'borrowed', 'maintenance', 'damaged', 'archived'])->default('available');
            $table->date('date_acquired')->nullable();
            $table->json('custom_attributes')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->unsignedBigInteger('deleted_by')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_items');
    }
};
