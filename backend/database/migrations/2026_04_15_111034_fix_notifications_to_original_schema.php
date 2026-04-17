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
            // Drop wrong columns only if they exist
            if (Schema::hasColumn('notifications', 'teacher_id')) {
                $table->dropColumn('teacher_id');
            }
            if (Schema::hasColumn('notifications', 'admin_id')) {
                $table->dropColumn('admin_id');
            }
            if (Schema::hasColumn('notifications', 'reference_type')) {
                $table->dropColumn('reference_type');
            }
            if (Schema::hasColumn('notifications', 'read')) {
                $table->dropColumn('read');
            }
            
            // Add original columns only if they don't exist
            if (!Schema::hasColumn('notifications', 'user_id')) {
                $table->unsignedBigInteger('user_id')->after('id');
            }
            if (!Schema::hasColumn('notifications', 'user_type')) {
                $table->enum('user_type', ['admin', 'teacher'])->after('user_id');
            }
            if (!Schema::hasColumn('notifications', 'is_read')) {
                $table->tinyInteger('is_read')->default(0)->after('type');
            }
            if (!Schema::hasColumn('notifications', 'related_table')) {
                $table->string('related_table', 50)->nullable()->after('is_read');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropColumn(['user_id', 'user_type', 'is_read', 'related_table']);
            $table->unsignedBigInteger('teacher_id')->nullable()->after('id');
            $table->unsignedBigInteger('admin_id')->nullable()->after('teacher_id');
            $table->string('reference_type', 50)->nullable()->after('reference_id');
            $table->boolean('read')->default(false)->after('type');
        });
    }
};
