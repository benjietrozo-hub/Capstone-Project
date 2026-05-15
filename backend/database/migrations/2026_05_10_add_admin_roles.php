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
        Schema::table('admins', function (Blueprint $table) {
            // Add admin type and permissions
            $table->enum('admin_type', ['super_admin', 'root_admin', 'regular_admin'])->default('regular_admin')->after('status');
            $table->json('permissions')->default('{}')->after('admin_type'); // Store custom permissions
            $table->boolean('can_manage_all_admins')->default(false)->after('permissions');
            $table->boolean('can_manage_own_profile_only')->default(false)->after('can_manage_all_admins');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('admins', function (Blueprint $table) {
            $table->dropColumn(['admin_type', 'permissions', 'can_manage_all_admins', 'can_manage_own_profile_only']);
        });
    }
};
