<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('distribution_requests', function (Blueprint $table) {
            $table->unsignedBigInteger('category_id')->nullable()->after('teacher_id');
        });

        // Safe Data Migration
        $requests = DB::table('distribution_requests')->get();
        foreach($requests as $req) {
            $tool = DB::table('tools_equipment')->where('id', $req->item_id)->first();
            if($tool) {
                $category = DB::table('item_categories')->where('category_name', $tool->category)->first();
                if ($category) {
                    DB::table('distribution_requests')->where('id', $req->id)->update(['category_id' => $category->id]);
                }
            }
        }
    }

    public function down(): void
    {
        Schema::table('distribution_requests', function (Blueprint $table) {
            $table->dropColumn('category_id');
        });
    }
};
