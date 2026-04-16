<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Supplier;

class CreateTestPurchaseOrder extends Command
{
    protected $signature = 'create:test-po';
    protected $description = 'Create a test purchase order';

    public function handle()
    {
        // Create a test supplier if none exists
        if (!Supplier::exists()) {
            Supplier::create([
                'name' => 'Test Supplier',
                'contact_person' => 'John Doe',
                'email' => 'test@supplier.com',
                'phone' => '123-456-7890',
                'address' => '123 Test St'
            ]);
            $this->info('Created test supplier');
        }

        // Create a test purchase order
        $poNumber = 'PO-' . str_pad(PurchaseOrder::count() + 1, 3, '0', STR_PAD_LEFT);
        $po = PurchaseOrder::create([
            'po_number' => $poNumber,
            'supplier_id' => 1,
            'supplier_name' => 'Test Supplier',
            'po_date' => now(),
            'expected_delivery_date' => now()->addDays(7),
            'status' => 'approved',
            'total_amount' => 1500.00,
            'admin_id' => null
        ]);

        // Add items to the purchase order
        PurchaseOrderItem::create([
            'purchase_order_id' => $po->id,
            'item_name' => 'Test Item 1',
            'item_code' => 'TEST001',
            'quantity_ordered' => 10,
            'quantity_received' => 0,
            'unit_price' => 100.00,
            'total_price' => 1000.00,
            'unit_of_measure' => 'pcs'
        ]);

        PurchaseOrderItem::create([
            'purchase_order_id' => $po->id,
            'item_name' => 'Test Item 2',
            'item_code' => 'TEST002',
            'quantity_ordered' => 5,
            'quantity_received' => 0,
            'unit_price' => 100.00,
            'total_price' => 500.00,
            'unit_of_measure' => 'pcs'
        ]);

        $this->info("Created Purchase Order ID: {$po->id}");
        $this->info("PO Number: {$po->po_number}");
        $this->info("Status: {$po->status}");
        $this->info('Test purchase order created successfully!');
    }
}
