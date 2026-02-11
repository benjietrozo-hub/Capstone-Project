<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id();
            $table->string('po_number')->unique();
            $table->date('po_date');
            $table->date('expected_delivery_date')->nullable();
            $table->enum('status', ['pending', 'approved', 'partially_received', 'completed', 'cancelled'])->default('pending');
            
            // Buyer/Company Information
            $table->string('company_name')->nullable();
            $table->text('company_address')->nullable();
            $table->string('company_contact_person')->nullable();
            $table->string('company_email')->nullable();
            $table->string('company_phone')->nullable();
            
            // Supplier Information
            $table->foreignId('supplier_id')->nullable()->constrained()->onDelete('set null');
            $table->string('supplier_name');
            $table->text('supplier_address')->nullable();
            $table->string('supplier_contact_person')->nullable();
            $table->string('supplier_email')->nullable();
            $table->string('supplier_phone')->nullable();
            
            // Cost Summary
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('tax', 12, 2)->default(0);
            $table->decimal('shipping_fee', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2)->default(0);
            
            // Delivery & Logistics
            $table->text('delivery_address')->nullable();
            $table->string('delivery_method')->nullable();
            $table->string('shipping_terms')->nullable();
            $table->text('receiving_instructions')->nullable();
            
            // Payment Information
            $table->string('payment_method')->nullable();
            $table->string('payment_terms')->nullable();
            $table->string('reference')->nullable();
            
            // Authorization & Approval
            $table->string('requested_by')->nullable();
            $table->string('approved_by')->nullable();
            $table->timestamp('approval_date')->nullable();
            
            // Notes & Terms
            $table->text('notes')->nullable();
            $table->text('terms_conditions')->nullable();
            
            $table->foreignId('admin_id')->nullable()->constrained()->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_orders');
    }
};
