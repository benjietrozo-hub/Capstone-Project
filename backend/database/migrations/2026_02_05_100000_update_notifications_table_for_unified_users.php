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
            // Drop old columns if they exist
            if (Schema::hasColumn('notifications', 'teacher_id')) {
                $table->dropForeign(['teacher_id']);
                $table->dropColumn('teacher_id');
            }
            if (Schema::hasColumn('notifications', 'admin_id')) {
                $table->dropForeign(['admin_id']);
                $table->dropColumn('admin_id');
            }
            if (Schema::hasColumn('notifications', 'reference_type')) {
                $table->dropColumn('reference_type');
            }
            if (Schema::hasColumn('notifications', 'reference_id')) {
                $table->dropColumn('reference_id');
            }
            if (Schema::hasColumn('notifications', 'read')) {
                $table->dropColumn('read');
            }

            // Add new unified columns
            if (!Schema::hasColumn('notifications', 'user_id')) {
                $table->unsignedBigInteger('user_id')->after('id');
            }
            if (!Schema::hasColumn('notifications', 'user_type')) {
                $table->enum('user_type', ['admin', 'teacher'])->after('user_id');
            }
            if (!Schema::hasColumn('notifications', 'related_id')) {
                $table->unsignedBigInteger('related_id')->nullable()->after('message');
            }
            if (!Schema::hasColumn('notifications', 'related_type')) {
                $table->string('related_type')->nullable()->after('related_id');
            }
            if (!Schema::hasColumn('notifications', 'is_read')) {
                $table->boolean('is_read')->default(false)->after('related_type');
            }

            // Add index for better query performance
            $table->index(['user_id', 'user_type', 'is_read']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            // Remove new columns
            $table->dropIndex(['user_id', 'user_type', 'is_read']);
            $table->dropColumn(['user_id', 'user_type', 'related_id', 'related_type', 'is_read']);

            // Restore old columns
            $table->unsignedBigInteger('teacher_id')->nullable();
            $table->unsignedBigInteger('admin_id')->nullable();
            $table->string('reference_type')->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->boolean('read')->default(false);

            $table->foreign('teacher_id')->references('id')->on('teachers')->onDelete('cascade');
            $table->foreign('admin_id')->references('id')->on('admins')->onDelete('cascade');
        });
    }
};
