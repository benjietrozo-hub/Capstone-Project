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
        Schema::create('custom_fields', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('item_categories')->onDelete('cascade');
            $table->string('field_name');
            $table->string('field_type'); // text, number, date, etc.
            $table->boolean('is_required')->default(false);
            $table->timestamps();
            
            // A category cannot have two fields with the same exact name
            $table->unique(['category_id', 'field_name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('custom_fields');
    }
};
