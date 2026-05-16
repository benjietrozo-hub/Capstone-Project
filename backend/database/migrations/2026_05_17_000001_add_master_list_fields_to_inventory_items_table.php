<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inventory_items', function (Blueprint $table) {
            if (!Schema::hasColumn('inventory_items', 'unit')) {
                $table->string('unit')->nullable()->after('property_number');
            }
            if (!Schema::hasColumn('inventory_items', 'description')) {
                $table->text('description')->nullable()->after('unit');
            }
            if (!Schema::hasColumn('inventory_items', 'unit_price')) {
                $table->decimal('unit_price', 12, 2)->nullable()->after('date_acquired');
            }
            if (!Schema::hasColumn('inventory_items', 'source_of_fund')) {
                $table->string('source_of_fund')->nullable()->after('unit_price');
            }
            if (!Schema::hasColumn('inventory_items', 'remarks')) {
                $table->text('remarks')->nullable()->after('source_of_fund');
            }
        });
    }

    public function down(): void
    {
        Schema::table('inventory_items', function (Blueprint $table) {
            $columns = [];

            foreach (['unit', 'description', 'unit_price', 'source_of_fund', 'remarks'] as $column) {
                if (Schema::hasColumn('inventory_items', $column)) {
                    $columns[] = $column;
                }
            }

            if (!empty($columns)) {
                $table->dropColumn($columns);
            }
        });
    }
};
