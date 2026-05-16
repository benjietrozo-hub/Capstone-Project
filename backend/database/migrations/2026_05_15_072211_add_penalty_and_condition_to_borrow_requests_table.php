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
        Schema::table('borrow_requests', function (Blueprint $table) {
            $table->string('condition_on_return', 50)->nullable()->after('return_notes');
            $table->decimal('penalty_amount', 10, 2)->default(0)->after('condition_on_return');
            $table->date('actual_return_date')->nullable()->after('date_returned');
        });

        Schema::table('borrow_request_items', function (Blueprint $table) {
            $table->string('condition_on_return', 50)->nullable()->after('status');
            $table->decimal('penalty_amount', 10, 2)->default(0)->after('condition_on_return');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('borrow_requests', function (Blueprint $table) {
            $table->dropColumn(['condition_on_return', 'penalty_amount', 'actual_return_date']);
        });

        Schema::table('borrow_request_items', function (Blueprint $table) {
            $table->dropColumn(['condition_on_return', 'penalty_amount']);
        });
    }
};
