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
        Schema::table('item_distributions', function (Blueprint $table) {
            $table->unsignedBigInteger('bulk_distribution_id')->nullable()->after('distributed_by');
            
            $table->foreign('bulk_distribution_id')->references('id')->on('bulk_distributions')->onDelete('cascade');
            $table->index('bulk_distribution_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('item_distributions', function (Blueprint $table) {
            $table->dropForeign(['bulk_distribution_id']);
            $table->dropIndex(['bulk_distribution_id']);
            $table->dropColumn('bulk_distribution_id');
        });
    }
};
