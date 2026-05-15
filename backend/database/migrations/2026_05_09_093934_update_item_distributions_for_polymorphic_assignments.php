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
        Schema::table('item_distributions', function (Blueprint $table) {
            // Add polymorphic relationship fields
            $table->string('assignable_type')->nullable()->after('teacher_id');
            $table->unsignedBigInteger('assignable_id')->nullable()->after('assignable_type');
            
            // Add assignment type
            $table->enum('assignment_type', ['permanent', 'temporary', 'transfer'])->default('permanent')->after('assignable_id');
            
            // Add transfer tracking fields
            $table->date('transfer_date')->nullable()->after('assignment_type');
            $table->string('transferred_from_type')->nullable()->after('transfer_date');
            $table->unsignedBigInteger('transferred_from_id')->nullable()->after('transferred_from_type');
            
            // Add recall tracking fields
            $table->date('recalled_date')->nullable()->after('transferred_from_id');
            $table->text('recall_reason')->nullable()->after('recalled_date');
            
            // Add disposal tracking fields
            $table->date('disposal_date')->nullable()->after('recall_reason');
            $table->text('disposal_reason')->nullable()->after('disposal_date');
            
            // Add indexes
            $table->index(['assignable_type', 'assignable_id'], 'idx_assignable');
            $table->index(['status', 'assignable_type', 'assignable_id'], 'idx_status_assignable');
            $table->index(['transferred_from_type', 'transferred_from_id'], 'idx_transferred_from');
        });
        
        // Update existing data: set assignable_type and assignable_id from teacher_id
        DB::statement("
            UPDATE item_distributions 
            SET assignable_type = 'App\\\\Models\\\\Teacher',
                assignable_id = teacher_id,
                assignment_type = 'permanent'
            WHERE assignable_type IS NULL
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('item_distributions', function (Blueprint $table) {
            $table->dropIndex('idx_assignable');
            $table->dropIndex('idx_status_assignable');
            $table->dropIndex('idx_transferred_from');
            
            $table->dropColumn([
                'assignable_type',
                'assignable_id',
                'assignment_type',
                'transfer_date',
                'transferred_from_type',
                'transferred_from_id',
                'recalled_date',
                'recall_reason',
                'disposal_date',
                'disposal_reason'
            ]);
        });
    }
};
