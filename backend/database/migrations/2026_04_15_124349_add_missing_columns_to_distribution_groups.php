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
        Schema::table('distribution_groups', function (Blueprint $table) {
            // Check if columns already exist before adding
            if (!Schema::hasColumn('distribution_groups', 'list_type')) {
                $table->string('list_type')->default('user')->after('group_type');
            }
            if (!Schema::hasColumn('distribution_groups', 'visibility')) {
                $table->string('visibility')->default('private')->after('list_type');
            }
            if (!Schema::hasColumn('distribution_groups', 'created_by')) {
                $table->unsignedBigInteger('created_by')->nullable()->after('visibility');
            }
            if (!Schema::hasColumn('distribution_groups', 'auto_membership')) {
                $table->boolean('auto_membership')->default(false)->after('created_by');
            }
            if (!Schema::hasColumn('distribution_groups', 'department')) {
                $table->string('department')->nullable()->after('auto_membership');
            }
            if (!Schema::hasColumn('distribution_groups', 'deleted_by')) {
                $table->unsignedBigInteger('deleted_by')->nullable()->after('department');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('distribution_groups', function (Blueprint $table) {
            $table->dropColumn(['list_type', 'visibility', 'created_by', 'auto_membership', 'department', 'deleted_by']);
        });
    }
};
