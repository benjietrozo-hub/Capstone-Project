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
        // Drop columns only if they exist
        if (Schema::hasColumn('notifications', 'teacher_id')) {
            Schema::table('notifications', function (Blueprint $table) {
                $table->dropForeign(['teacher_id']);
                $table->dropColumn('teacher_id');
            });
        }
        
        if (Schema::hasColumn('notifications', 'admin_id')) {
            Schema::table('notifications', function (Blueprint $table) {
                $table->dropForeign(['admin_id']);
                $table->dropColumn('admin_id');
            });
        }
        
        if (Schema::hasColumn('notifications', 'reference_type')) {
            Schema::table('notifications', function (Blueprint $table) {
                $table->dropColumn('reference_type');
            });
        }
        
        if (Schema::hasColumn('notifications', 'read')) {
            Schema::table('notifications', function (Blueprint $table) {
                $table->dropColumn('read');
            });
        }
        
        // Add original columns only if they don't exist
        Schema::table('notifications', function (Blueprint $table) {
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
