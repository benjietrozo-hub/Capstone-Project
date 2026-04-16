<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('purchase_orders', function (Blueprint $table) {
            // Add new columns that match the modal structure
            $table->string('mode_of_procurement')->nullable()->after('po_date')->comment('Mode of procurement (SHOPPING, BIDDING, etc.)');
            $table->string('supplier_tin')->nullable()->after('supplier_phone')->comment('Supplier Tax Identification Number');
            $table->string('delivery_place')->nullable()->after('delivery_address')->comment('Place of delivery');
            $table->date('delivery_date')->nullable()->after('delivery_place')->comment('Date of delivery');
            $table->string('delivery_term')->nullable()->after('delivery_date')->comment('Delivery term (PICK-UP, DELIVERY, etc.)');
            $table->text('amount_in_words')->nullable()->after('total_amount')->comment('Total amount written in words');
            $table->string('payment_term')->nullable()->after('payment_terms')->comment('Payment term details');
            
            // Add indexes for better performance
            $table->index('mode_of_procurement');
            $table->index('delivery_place');
            $table->index('delivery_term');
            $table->index('payment_term');
        });
        
        // Update existing records with default values
        DB::table('purchase_orders')->whereNull('mode_of_procurement')->update(['mode_of_procurement' => 'SHOPPING']);
        DB::table('purchase_orders')->whereNull('supplier_tin')->update(['supplier_tin' => 'N/A']);
        DB::table('purchase_orders')->whereNull('delivery_place')->update(['delivery_place' => 'N/A']);
        DB::table('purchase_orders')->whereNull('delivery_term')->update(['delivery_term' => 'PICK-UP']);
        DB::table('purchase_orders')->whereNull('payment_term')->update(['payment_term' => '(Not specified)']);
        DB::table('purchase_orders')->whereNull('amount_in_words')->update(['amount_in_words' => 'N/A']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('purchase_orders', function (Blueprint $table) {
            // Drop the new columns
            $table->dropIndex(['mode_of_procurement']);
            $table->dropIndex(['delivery_place']);
            $table->dropIndex(['delivery_term']);
            $table->dropIndex(['payment_term']);
            $table->dropColumn([
                'mode_of_procurement',
                'supplier_tin',
                'delivery_place',
                'delivery_date',
                'delivery_term',
                'amount_in_words',
                'payment_term'
            ]);
        });
    }
};
