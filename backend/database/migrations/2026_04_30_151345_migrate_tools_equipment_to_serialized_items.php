<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Get all unique categories from tools_equipment
        $oldCategories = DB::table('tools_equipment')->distinct()->pluck('category');
        
        $categoryMap = []; // old category name => new category_id
        
        foreach ($oldCategories as $catName) {
            if (!$catName) continue;
            
            $catId = DB::table('item_categories')->insertGetId([
                'category_name' => $catName,
                'description' => "Migrated category for $catName",
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            
            $categoryMap[$catName] = $catId;
        }

        // 2. Migrate items
        $tools = DB::table('tools_equipment')->get();
        
        foreach ($tools as $tool) {
            $catName = $tool->category;
            
            if (!$catName || !isset($categoryMap[$catName])) {
                if (!isset($categoryMap['Uncategorized'])) {
                    $catId = DB::table('item_categories')->insertGetId([
                        'category_name' => 'Uncategorized',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    $categoryMap['Uncategorized'] = $catId;
                }
                $categoryId = $categoryMap['Uncategorized'];
            } else {
                $categoryId = $categoryMap[$catName];
            }

            // The quantity_total tells us how many physical items to generate
            $quantity = $tool->quantity_total;
            
            for ($i = 1; $i <= $quantity; $i++) {
                $serialNumber = strtoupper($tool->item_code) . '-' . str_pad($i, 3, '0', STR_PAD_LEFT) . '-' . strtoupper(Str::random(4));
                
                // Determine status
                $status = ($i <= $tool->quantity_available) ? 'available' : 'borrowed';

                $customAttributes = json_encode([
                    'Old Item Code' => $tool->item_code,
                    'Description' => $tool->description,
                    'Location' => $tool->location,
                    'Notes' => $tool->notes,
                    'Legacy Unit Price' => $tool->unit_price,
                    'Legacy ID' => $tool->id // Critical for updating relationships later
                ]);

                DB::table('inventory_items')->insert([
                    'category_id' => $categoryId,
                    'item_name' => $tool->item_name,
                    'serial_number' => $serialNumber,
                    'property_number' => $tool->item_code . '-' . $i,
                    'item_image' => $tool->image,
                    'condition' => $tool->condition ?? 'good',
                    'status' => $status,
                    'date_acquired' => $tool->acquisition_date,
                    'custom_attributes' => $customAttributes,
                    'created_at' => $tool->created_at,
                    'updated_at' => $tool->updated_at,
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('serialized_items', function (Blueprint $table) {
            //
        });
    }
};
