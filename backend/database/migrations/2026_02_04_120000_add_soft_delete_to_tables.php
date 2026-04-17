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
        // distribution_groups already has both columns, skip

        // Add soft delete to distribution_group_members
        Schema::table('distribution_group_members', function (Blueprint $table) {
            $table->softDeletes();
        });

        // suppliers already has deleted_at, just add deleted_by
        Schema::table('suppliers', function (Blueprint $table) {
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->foreign('deleted_by')->references('id')->on('admins')->onDelete('set null');
        });

        // borrow_requests already has deleted_at, just add deleted_by
        Schema::table('borrow_requests', function (Blueprint $table) {
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->foreign('deleted_by')->references('id')->on('admins')->onDelete('set null');
        });

        // tools_equipment already has deleted_at, just add deleted_by
        Schema::table('tools_equipment', function (Blueprint $table) {
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->foreign('deleted_by')->references('id')->on('admins')->onDelete('set null');
        });

        // purchase_orders already has deleted_at, just add deleted_by
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->foreign('deleted_by')->references('id')->on('admins')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // distribution_groups - only drop deleted_by since it was already there
        Schema::table('distribution_groups', function (Blueprint $table) {
            if (Schema::hasColumn('distribution_groups', 'deleted_by')) {
                $table->dropForeign(['deleted_by']);
                $table->dropColumn('deleted_by');
            }
        });

        Schema::table('distribution_group_members', function (Blueprint $table) {
            $table->dropColumn('deleted_at');
        });

        Schema::table('suppliers', function (Blueprint $table) {
            $table->dropForeign(['deleted_by']);
            $table->dropColumn('deleted_by');
        });

        Schema::table('borrow_requests', function (Blueprint $table) {
            $table->dropForeign(['deleted_by']);
            $table->dropColumn('deleted_by');
        });

        Schema::table('tools_equipment', function (Blueprint $table) {
            $table->dropForeign(['deleted_by']);
            $table->dropColumn('deleted_by');
        });

        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->dropForeign(['deleted_by']);
            $table->dropColumn('deleted_by');
        });
    }
};
