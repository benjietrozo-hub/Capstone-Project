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
            $table->string('list_type')->default('user')->after('group_type');
            $table->string('visibility')->default('private')->after('list_type');
            $table->integer('created_by')->nullable()->after('visibility');
            $table->boolean('auto_membership')->default(false)->after('created_by');
            $table->string('department')->nullable()->after('auto_membership');
            $table->integer('deleted_by')->nullable()->after('department');
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
