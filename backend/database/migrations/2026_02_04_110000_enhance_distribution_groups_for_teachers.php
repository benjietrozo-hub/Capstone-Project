<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add new columns to distribution_groups table
        Schema::table('distribution_groups', function (Blueprint $table) {
            $table->string('list_type')->default('system')->after('group_type'); // system / user
            $table->string('visibility')->default('shared')->after('list_type'); // private / shared
            $table->integer('created_by')->nullable()->after('visibility'); // teacher_id who created it
            $table->boolean('auto_membership')->default(false)->after('created_by'); // future-proofing
            $table->string('department')->nullable()->after('auto_membership'); // for department-based lists
            
            // Add foreign key for created_by
            $table->foreign('created_by')->references('id')->on('teachers')->onDelete('set null');
        });

        // Create system default distribution groups
        $this->createSystemGroups();
    }

    public function down(): void
    {
        Schema::table('distribution_groups', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->dropColumn(['list_type', 'visibility', 'created_by', 'auto_membership', 'department']);
        });
    }

    private function createSystemGroups(): void
    {
        $systemGroups = [
            // 1. All Inventory Users
            [
                'group_name' => 'All Inventory Users',
                'group_type' => 'all_users',
                'list_type' => 'system',
                'visibility' => 'shared',
                'description' => 'All teachers with inventory access. Used for system-wide announcements, policy updates, and scheduled inventory audits.',
                'is_active' => true,
            ],
            
            // 2. Inventory Administrators
            [
                'group_name' => 'Inventory Administrators',
                'group_type' => 'role',
                'list_type' => 'system',
                'visibility' => 'shared',
                'description' => 'Inventory admin teachers and system supervisors. Receives approval notifications, exception handling alerts, and system configuration changes.',
                'is_active' => true,
            ],
            
            // 3. Department-Based Lists
            [
                'group_name' => 'Science Department',
                'group_type' => 'department',
                'list_type' => 'system',
                'visibility' => 'shared',
                'department' => 'Science',
                'description' => 'Science department teachers. Receives equipment availability, department-specific stock updates, and tool sharing coordination.',
                'is_active' => true,
            ],
            [
                'group_name' => 'ICT Department',
                'group_type' => 'department',
                'list_type' => 'system',
                'visibility' => 'shared',
                'department' => 'ICT',
                'description' => 'ICT department teachers. Receives equipment availability, department-specific stock updates, and tool sharing coordination.',
                'is_active' => true,
            ],
            [
                'group_name' => 'TLE / Workshop Department',
                'group_type' => 'department',
                'list_type' => 'system',
                'visibility' => 'shared',
                'department' => 'TLE',
                'description' => 'TLE/Workshop department teachers. Receives equipment availability, department-specific stock updates, and tool sharing coordination.',
                'is_active' => true,
            ],
            [
                'group_name' => 'Engineering / Lab Department',
                'group_type' => 'department',
                'list_type' => 'system',
                'visibility' => 'shared',
                'department' => 'Engineering',
                'description' => 'Engineering/Lab department teachers. Receives equipment availability, department-specific stock updates, and tool sharing coordination.',
                'is_active' => true,
            ],
            
            // 4. Equipment Custodians
            [
                'group_name' => 'Equipment Custodians',
                'group_type' => 'role',
                'list_type' => 'system',
                'visibility' => 'shared',
                'description' => 'Teachers assigned as custodians of tools/equipment. Receives maintenance reminders, calibration schedules, and asset condition updates.',
                'is_active' => true,
            ],
            
            // 5. Borrowing & Issuance Officers
            [
                'group_name' => 'Borrowing & Issuance Officers',
                'group_type' => 'role',
                'list_type' => 'system',
                'visibility' => 'shared',
                'description' => 'Teachers authorized to issue or receive equipment. Receives pending borrow requests, overdue item alerts, and return confirmations.',
                'is_active' => true,
            ],
            
            // 6. Inventory Audit Committee
            [
                'group_name' => 'Inventory Audit Committee',
                'group_type' => 'role',
                'list_type' => 'system',
                'visibility' => 'shared',
                'description' => 'Assigned auditing teachers. Receives audit schedules, discrepancy reports, and inventory reconciliation notices.',
                'is_active' => true,
            ],
            
            // 7. Maintenance & Repair Coordinators
            [
                'group_name' => 'Maintenance & Repair Coordinators',
                'group_type' => 'role',
                'list_type' => 'system',
                'visibility' => 'shared',
                'description' => 'Teachers overseeing repairs or maintenance. Receives damaged equipment alerts, repair status updates, and replacement recommendations.',
                'is_active' => true,
            ],
            
            // 8. Emergency / Critical Assets Group
            [
                'group_name' => 'Emergency / Critical Assets Group',
                'group_type' => 'role',
                'list_type' => 'system',
                'visibility' => 'shared',
                'description' => 'Teachers responsible for high-value or safety-critical assets. Receives immediate alerts for loss, damage, safety issues, and high-priority notifications.',
                'is_active' => true,
            ],
        ];

        foreach ($systemGroups as $group) {
            DB::table('distribution_groups')->insert(array_merge($group, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }
};
