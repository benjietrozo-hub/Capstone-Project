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
        Schema::table('distribution_requests', function (Blueprint $table) {
            // Add entity request fields
            $table->string('requested_for_type')->nullable()->after('teacher_id')->comment('Entity type: Teacher, Classroom, Club, Department');
            $table->unsignedBigInteger('requested_for_id')->nullable()->after('requested_for_type')->comment('Entity ID');
            $table->foreignId('requested_by')->nullable()->after('requested_for_id')->comment('Teacher who made the request')->constrained('teachers')->onDelete('cascade');
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal')->after('notes');
            
            // Add indexes
            $table->index(['requested_for_type', 'requested_for_id'], 'idx_requested_for');
            $table->index('requested_by');
            $table->index(['status', 'priority'], 'idx_status_priority');
        });
        
        // Update existing data: set requested_for to teacher and requested_by to teacher_id
        DB::statement("
            UPDATE distribution_requests 
            SET requested_for_type = 'App\\\\Models\\\\Teacher',
                requested_for_id = teacher_id,
                requested_by = teacher_id
            WHERE requested_for_type IS NULL
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('distribution_requests', function (Blueprint $table) {
            $table->dropIndex('idx_requested_for');
            $table->dropIndex('idx_status_priority');
            $table->dropForeign(['requested_by']);
            
            $table->dropColumn([
                'requested_for_type',
                'requested_for_id',
                'requested_by',
                'priority'
            ]);
        });
    }
};
