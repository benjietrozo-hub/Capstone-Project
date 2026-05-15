<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add missing columns to item_transfers
        Schema::table('item_transfers', function (Blueprint $table) {
            if (!Schema::hasColumn('item_transfers', 'rejection_reason')) {
                $table->text('rejection_reason')->nullable()->after('transfer_reason');
            }
            if (!Schema::hasColumn('item_transfers', 'approved_at')) {
                $table->timestamp('approved_at')->nullable()->after('approved_by');
            }
        });

        // Add missing columns to item_condition_logs
        Schema::table('item_condition_logs', function (Blueprint $table) {
            if (!Schema::hasColumn('item_condition_logs', 'notes')) {
                $table->text('notes')->nullable()->after('description');
            }
            if (!Schema::hasColumn('item_condition_logs', 'cost')) {
                $table->decimal('cost', 10, 2)->nullable()->after('notes');
            }
            if (!Schema::hasColumn('item_condition_logs', 'logged_at')) {
                $table->timestamp('logged_at')->nullable()->after('cost');
            }
            if (!Schema::hasColumn('item_condition_logs', 'metadata')) {
                $table->text('metadata')->nullable()->after('logged_at');
            }
        });

        // Add missing columns to inventory_items for disposal tracking
        Schema::table('inventory_items', function (Blueprint $table) {
            if (!Schema::hasColumn('inventory_items', 'disposal_date')) {
                $table->date('disposal_date')->nullable()->after('condition');
            }
            if (!Schema::hasColumn('inventory_items', 'disposal_reason')) {
                $table->text('disposal_reason')->nullable()->after('disposal_date');
            }
        });
    }

    public function down(): void
    {
        Schema::table('item_transfers', function (Blueprint $table) {
            $table->dropColumn(['rejection_reason', 'approved_at']);
        });

        Schema::table('item_condition_logs', function (Blueprint $table) {
            $table->dropColumn(['notes', 'cost', 'logged_at', 'metadata']);
        });

        Schema::table('inventory_items', function (Blueprint $table) {
            $table->dropColumn(['disposal_date', 'disposal_reason']);
        });
    }
};
