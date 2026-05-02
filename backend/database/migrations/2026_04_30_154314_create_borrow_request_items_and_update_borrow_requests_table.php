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
        Schema::create('borrow_request_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('borrow_request_id')->constrained('borrow_requests')->onDelete('cascade');
            $table->foreignId('inventory_item_id')->constrained('inventory_items')->onDelete('cascade');
            $table->enum('status', ['borrowed', 'returned'])->default('borrowed');
            $table->timestamp('returned_at')->nullable();
            $table->timestamps();
        });

        Schema::table('borrow_requests', function (Blueprint $table) {
            $table->unsignedBigInteger('category_id')->nullable()->after('teacher_id');
            // We keep item_id for now for backward compatibility during transition, will drop later
        });

        // Safe Data Migration
        $requests = DB::table('borrow_requests')->get();
        foreach($requests as $req) {
            $tool = DB::table('tools_equipment')->where('id', $req->item_id)->first();
            if($tool) {
                $category = DB::table('item_categories')->where('category_name', $tool->category)->first();
                if ($category) {
                    DB::table('borrow_requests')->where('id', $req->id)->update(['category_id' => $category->id]);
                    
                    if (in_array($req->status, ['borrowed', 'approved', 'issued'])) {
                        // We use the Legacy ID injected into JSON during Phase 1
                        $items = DB::table('inventory_items')
                                   ->where('custom_attributes', 'like', '%"Legacy ID":'.$tool->id.'%')
                                   ->orWhere('custom_attributes', 'like', '%"Legacy ID": '.$tool->id.'%')
                                   ->limit($req->quantity_requested)
                                   ->get();
                                   
                        foreach($items as $item) {
                            DB::table('borrow_request_items')->insert([
                                'borrow_request_id' => $req->id,
                                'inventory_item_id' => $item->id,
                                'status' => 'borrowed',
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
        Schema::dropIfExists('borrow_request_items_and_update_borrow_requests');
    }
};
