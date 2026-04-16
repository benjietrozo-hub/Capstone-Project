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
        Schema::table('notifications', function (Blueprint $table) {
            // Drop foreign keys first
            $table->dropForeign(['teacher_id']);
            $table->dropForeign(['admin_id']);
            
            // Drop indexes
            $table->dropIndex(['teacher_id']);
            $table->dropIndex(['admin_id']);
            
            // Drop wrong columns
            $table->dropColumn(['teacher_id', 'admin_id', 'reference_type', 'read']);
            
            // Add original columns
            $table->integer('user_id')->after('id');
            $table->enum('user_type', ['admin', 'teacher'])->after('user_id');
            $table->tinyInteger('is_read')->default(0)->after('type');
            $table->string('related_table', 50)->nullable()->after('is_read');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropColumn(['user_id', 'user_type', 'is_read', 'related_table']);
            $table->integer('teacher_id')->nullable()->after('id');
            $table->integer('admin_id')->nullable()->after('teacher_id');
            $table->string('reference_type', 50)->nullable()->after('reference_id');
            $table->boolean('read')->default(false)->after('type');
        });
    }
};
