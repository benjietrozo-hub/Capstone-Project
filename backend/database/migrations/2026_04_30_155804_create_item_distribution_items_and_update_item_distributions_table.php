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
        Schema::create('item_distribution_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_distribution_id')->constrained('item_distributions')->onDelete('cascade');
            $table->foreignId('inventory_item_id')->constrained('inventory_items')->onDelete('cascade');
            $table->enum('status', ['distributed', 'returned'])->default('distributed');
            $table->timestamp('returned_at')->nullable();
            $table->timestamps();
        });

        Schema::table('item_distributions', function (Blueprint $table) {
            $table->unsignedBigInteger('category_id')->nullable()->after('teacher_id');
            // We keep item_id for now for backward compatibility during transition
        });

        // Safe Data Migration
        $distributions = DB::table('item_distributions')->get();
        foreach($distributions as $dist) {
            $tool = DB::table('tools_equipment')->where('id', $dist->item_id)->first();
            if($tool) {
                $category = DB::table('item_categories')->where('category_name', $tool->category)->first();
                if ($category) {
                    DB::table('item_distributions')->where('id', $dist->id)->update(['category_id' => $category->id]);
                    
                    if (in_array($dist->status, ['active', 'returned'])) {
                        $items = DB::table('inventory_items')
                                   ->where('custom_attributes', 'like', '%"Legacy ID":'.$tool->id.'%')
                                   ->orWhere('custom_attributes', 'like', '%"Legacy ID": '.$tool->id.'%')
                                   ->limit($dist->quantity_distributed)
                                   ->get();
                                   
                        foreach($items as $item) {
                            DB::table('item_distribution_items')->insert([
                                'item_distribution_id' => $dist->id,
                                'inventory_item_id' => $item->id,
                                'status' => $dist->status === 'returned' ? 'returned' : 'distributed',
                                'returned_at' => $dist->status === 'returned' ? ($dist->actual_return_date ?? now()) : null,
                                'created_at' => now(),
                                'updated_at' => now()
                            ]);
                        }
                    }
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('item_distribution_items_and_update_item_distributions');
    }
};
