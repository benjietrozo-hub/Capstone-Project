<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\Auth\AdminAuthController;
use App\Http\Controllers\API\Auth\TeacherAuthController;
use App\Http\Controllers\API\Auth\UnifiedAuthController;
use App\Http\Controllers\API\ProfileController;
use App\Http\Controllers\API\Admin\InventoryController as AdminInventoryController;
use App\Http\Controllers\API\Admin\BorrowRequestController as AdminBorrowRequestController;
use App\Http\Controllers\API\Admin\TeacherManagementController;
use App\Http\Controllers\API\Admin\AdminManagementController;
use App\Http\Controllers\API\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\API\Admin\ReportController as AdminReportController;
use App\Http\Controllers\API\Admin\SystemLogController;
use App\Http\Controllers\API\Admin\DistributionListController;
use App\Http\Controllers\API\Admin\ArchiveController;
use App\Http\Controllers\API\DistributionGroupController;
use App\Http\Controllers\API\Admin\ItemCategoryController;
use App\Http\Controllers\API\Admin\InventoryItemController;
use App\Http\Controllers\API\Admin\BorrowHistoryController;
use App\Http\Controllers\API\Admin\DepartmentController;
use App\Http\Controllers\API\Admin\ClassroomController;
use App\Http\Controllers\API\Admin\ClubController;
use App\Http\Controllers\API\Teacher\EntityController;
use App\Http\Controllers\API\ItemTransferController;
use App\Http\Controllers\API\ItemConditionLogController;
use App\Http\Controllers\API\Admin\SystemHealthController;

use App\Http\Controllers\API\Teacher\InventoryController as TeacherInventoryController;
use App\Http\Controllers\API\Teacher\BorrowRequestController as TeacherBorrowRequestController;
use App\Http\Controllers\API\Teacher\DashboardController as TeacherDashboardController;
use App\Http\Controllers\API\NotificationController;
use App\Http\Controllers\API\BulkDistributionController;
use App\Http\Controllers\API\DistributionLogController;

// Test route
Route::get('/test', function() {
    return response()->json(['message' => 'API is working']);
});

// Public Auth Routes
Route::prefix('auth')->group(function () {
    // Unified login endpoint
    Route::post('/login', [UnifiedAuthController::class, 'login']);
    
    // Token refresh endpoint (public - uses refresh token)
    Route::post('/refresh-token', [UnifiedAuthController::class, 'refreshToken']);
    
    // Password reset endpoints
    Route::post('/forgot-password', [UnifiedAuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [UnifiedAuthController::class, 'resetPassword']);
    
    // Teacher registration
    Route::post('/teacher/register', [TeacherAuthController::class, 'register']);
    
    // Legacy endpoints (kept for backward compatibility)
    Route::prefix('admin')->group(function () {
        Route::post('/login', [AdminAuthController::class, 'login']);
    });
    
    Route::prefix('teacher')->group(function () {
        Route::post('/login', [TeacherAuthController::class, 'login']);
    });
});

// System routes (Public)
Route::get('/system/maintenance/status', [\App\Http\Controllers\API\SystemSettingController::class, 'getSetting'])->defaults('key', 'maintenance_mode');

// Shared Authenticated Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/settings/{key}', [\App\Http\Controllers\API\SystemSettingController::class, 'getSetting']);
    
    // Profile Management
    Route::post('/profile/update', [ProfileController::class, 'updateProfile']);
    Route::post('/profile/account', [ProfileController::class, 'updateAccount']);
    Route::post('/profile/password', [ProfileController::class, 'changePassword']);
});

// Protected Admin Routes
Route::prefix('admin')->middleware(['auth:sanctum', \App\Http\Middleware\LogAuthAttempt::class])->group(function () {
    Route::post('/logout', [AdminAuthController::class, 'logout']);
    Route::get('/me', [AdminAuthController::class, 'me']);
    Route::post('/refresh-token', [AdminAuthController::class, 'refreshToken']); // Add refresh endpoint
    Route::post('/verify-password', [UnifiedAuthController::class, 'verifyPassword']);
    Route::post('/send-otp', [UnifiedAuthController::class, 'sendOTP']);
    Route::post('/verify-otp', [UnifiedAuthController::class, 'verifyOTP']);
    Route::post('/reset-forced-password', [UnifiedAuthController::class, 'resetForcedPassword']);
    
    Route::get('/dashboard', [AdminDashboardController::class, 'index']);
    Route::get('/dashboard/statistics', [AdminDashboardController::class, 'statistics']);
    
    // System Settings Updates (including Maintenance)
    Route::post('/settings/{key}', [\App\Http\Controllers\API\SystemSettingController::class, 'updateSetting']);
    
    Route::apiResource('inventory', AdminInventoryController::class);
    Route::get('/inventory-categories', [AdminInventoryController::class, 'categories']);
    
    // New Serialized Category System
    Route::get('/item-categories/parent-categories', [ItemCategoryController::class, 'parentCategories']);
    Route::post('/item-categories/rename-parent', [ItemCategoryController::class, 'renameParentCategory']);
    Route::apiResource('item-categories', ItemCategoryController::class);
    Route::post('/item-categories/{id}/custom-fields', [ItemCategoryController::class, 'addCustomField']);
    Route::delete('/item-categories/{id}/custom-fields/{fieldId}', [ItemCategoryController::class, 'deleteCustomField']);
    
    // New Serialized Individual Items
    Route::post('/inventory-items/bulk', [InventoryItemController::class, 'bulkStore']);
    Route::get('/inventory-master-list', [InventoryItemController::class, 'masterList']);
    Route::put('/inventory-master-list', [InventoryItemController::class, 'updateMasterListGroup']);
    Route::apiResource('inventory-items', InventoryItemController::class);
    
    Route::get('/requests', [AdminBorrowRequestController::class, 'index']);
    Route::get('/requests/statistics', [AdminBorrowRequestController::class, 'statistics']);
    Route::post('/requests/{id}/approve', [AdminBorrowRequestController::class, 'approve']);
    Route::post('/requests/{id}/reject', [AdminBorrowRequestController::class, 'reject']);
    Route::post('/requests/{id}/issue', [AdminBorrowRequestController::class, 'issue']);
    Route::post('/requests/{id}/return', [AdminBorrowRequestController::class, 'return']);
    
    Route::get('/teachers/validate-unique', [TeacherManagementController::class, 'validateUnique']);
    Route::apiResource('teachers', TeacherManagementController::class);
    Route::get('/teacher-departments', [TeacherManagementController::class, 'departments']);
    
    Route::post('/admins/{id}/demote', [AdminManagementController::class, 'demote']);
    Route::apiResource('admins', AdminManagementController::class);
    
    Route::apiResource('reports', AdminReportController::class);
    Route::put('/reports/{id}/resolve', [AdminReportController::class, 'resolve']);
    
    Route::get('/logs', [SystemLogController::class, 'index']);
    Route::get('/logs/statistics', [SystemLogController::class, 'statistics']);
    Route::get('/logs/{id}', [SystemLogController::class, 'show']);
    

    
    // Distribution List
    Route::get('/distribution', [DistributionListController::class, 'index']);
    Route::get('/distribution/statistics', [DistributionListController::class, 'statistics']);
    Route::get('/distribution/departments', [DistributionListController::class, 'departments']);
    Route::get('/distribution/groups', [DistributionListController::class, 'groups']);
    Route::get('/distribution/groups/{id}', [DistributionListController::class, 'showGroup']);
    Route::post('/distribution/groups', [DistributionGroupController::class, 'store']);
    Route::put('/distribution/groups/{id}', [DistributionListController::class, 'updateGroup']);
    Route::delete('/distribution/groups/{id}', [DistributionListController::class, 'deleteGroup']);
    Route::post('/distribution/groups/{id}/add-teachers', [DistributionGroupController::class, 'addTeachers']);
    Route::post('/distribution/groups/{id}/remove-teachers', [DistributionGroupController::class, 'removeTeachers']);
    Route::get('/distribution/export', [DistributionListController::class, 'export']);

    
    // Archive Management
    Route::get('/archive', [ArchiveController::class, 'index']);
    Route::get('/archive/stats', [ArchiveController::class, 'stats']);
    Route::delete('/archive/empty', [ArchiveController::class, 'emptyArchive']);
    Route::post('/archive/{type}/{id}/restore', [ArchiveController::class, 'restore']);
    Route::delete('/archive/{type}/{id}', [ArchiveController::class, 'forceDelete']);
    
    // Borrow History & Reports
    Route::get('/borrow-history', [BorrowHistoryController::class, 'index']);
    Route::get('/borrow-history/stats', [BorrowHistoryController::class, 'stats']);
    Route::get('/borrow-history/years', [BorrowHistoryController::class, 'years']);
    
    // Item Distributions
    Route::get('/distributions', [\App\Http\Controllers\API\Admin\ItemDistributionController::class, 'index']);
    Route::post('/distributions', [\App\Http\Controllers\API\Admin\ItemDistributionController::class, 'store']);
    Route::post('/distributions/bulk', [\App\Http\Controllers\API\Admin\ItemDistributionController::class, 'bulkDistribute']);
    Route::get('/distributions/statistics', [\App\Http\Controllers\API\Admin\ItemDistributionController::class, 'statistics']);
    Route::get('/distributions/{id}', [\App\Http\Controllers\API\Admin\ItemDistributionController::class, 'show']);
    Route::put('/distributions/{id}', [\App\Http\Controllers\API\Admin\ItemDistributionController::class, 'update']);
    Route::post('/distributions/{id}/return', [\App\Http\Controllers\API\Admin\ItemDistributionController::class, 'markAsReturned']);
    Route::post('/distributions/{id}/cancel', [\App\Http\Controllers\API\Admin\ItemDistributionController::class, 'cancel']);
    Route::delete('/distributions/{id}', [\App\Http\Controllers\API\Admin\ItemDistributionController::class, 'destroy']);
    
    // Distribution Requests (Admin)
    Route::get('/distribution-requests', [\App\Http\Controllers\API\Admin\DistributionRequestController::class, 'index']);
    Route::get('/distribution-requests/statistics', [\App\Http\Controllers\API\Admin\DistributionRequestController::class, 'statistics']);
    Route::get('/distribution-requests/{id}', [\App\Http\Controllers\API\Admin\DistributionRequestController::class, 'show']);
    Route::post('/distribution-requests/{id}/approve', [\App\Http\Controllers\API\Admin\DistributionRequestController::class, 'approve']);
    Route::post('/distribution-requests/{id}/reject', [\App\Http\Controllers\API\Admin\DistributionRequestController::class, 'reject']);
    
    // Bulk Distributions
    Route::get('/bulk-distributions', [BulkDistributionController::class, 'index']);
    Route::post('/bulk-distributions', [BulkDistributionController::class, 'store']);
    Route::get('/bulk-distributions/statistics', [BulkDistributionController::class, 'statistics']);
    Route::get('/bulk-distributions/{id}', [BulkDistributionController::class, 'show']);
    Route::post('/bulk-distributions/{id}/process', [BulkDistributionController::class, 'process']);
    Route::post('/bulk-distributions/{id}/cancel', [BulkDistributionController::class, 'cancel']);
    
    // Distribution Logs
    Route::get('/distribution-logs', [DistributionLogController::class, 'index']);
    Route::get('/distribution-logs/statistics', [DistributionLogController::class, 'statistics']);
    Route::get('/distribution-logs/export', [DistributionLogController::class, 'export']);
    Route::get('/distribution-logs/{id}', [DistributionLogController::class, 'show']);
    
    // Notifications (Admin)
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
    Route::delete('/notifications/read/all', [NotificationController::class, 'deleteAllRead']);

    // System Settings
    Route::put('/settings/{key}', [\App\Http\Controllers\API\SystemSettingController::class, 'updateSetting']);

    // Entity Management - Departments
    Route::get('/departments/statistics', [DepartmentController::class, 'statistics']);
    Route::get('/departments/{id}/inventory', [DepartmentController::class, 'inventory']);
    Route::apiResource('departments', DepartmentController::class);

    // Entity Management - Classrooms
    Route::get('/classrooms/statistics', [ClassroomController::class, 'statistics']);
    Route::get('/classrooms/{id}/inventory', [ClassroomController::class, 'inventory']);
    Route::apiResource('classrooms', ClassroomController::class);

    // Entity Management - Clubs
    Route::get('/clubs/statistics', [ClubController::class, 'statistics']);
    Route::get('/clubs/categories', [ClubController::class, 'categories']);
    Route::get('/clubs/{id}/inventory', [ClubController::class, 'inventory']);
    Route::apiResource('clubs', ClubController::class);

    // Item Transfers (Admin)
    Route::get('/item-transfers', [ItemTransferController::class, 'index']);
    Route::post('/item-transfers', [ItemTransferController::class, 'store']);
    Route::get('/item-transfers/{id}', [ItemTransferController::class, 'show']);
    Route::post('/item-transfers/{id}/approve', [ItemTransferController::class, 'approve']);
    Route::post('/item-transfers/{id}/reject', [ItemTransferController::class, 'reject']);
    Route::post('/item-transfers/{id}/complete', [ItemTransferController::class, 'complete']);
    Route::post('/item-transfers/{id}/cancel', [ItemTransferController::class, 'cancel']);

    // Item Condition Logs (Admin)
    Route::get('/item-condition-logs', [ItemConditionLogController::class, 'index']);
    Route::post('/item-condition-logs', [ItemConditionLogController::class, 'store']);
    Route::get('/item-condition-logs/{id}', [ItemConditionLogController::class, 'show']);
    Route::post('/item-condition-logs/report-damage', [ItemConditionLogController::class, 'reportDamage']);
    Route::post('/item-condition-logs/log-repair', [ItemConditionLogController::class, 'logRepair']);
    Route::post('/item-condition-logs/record-disposal', [ItemConditionLogController::class, 'recordDisposal']);
    
    // System Health & Uptime
    Route::get('/system/health', [SystemHealthController::class, 'getStatus']);
});

// Protected Teacher Routes
Route::prefix('teacher')->middleware(['auth:sanctum'])->group(function () {
    // Test route for debugging
    Route::get('/test', function() {
        return response()->json([
            'message' => 'Teacher routes working',
            'user' => auth()->user(),
            'authenticated' => auth()->check()
        ]);
    });
    
    Route::post('/logout', [TeacherAuthController::class, 'logout']);
    Route::get('/me', [TeacherAuthController::class, 'me']);
    Route::post('/refresh-token', [TeacherAuthController::class, 'refreshToken']); // Add refresh endpoint
    Route::post('/verify-password', [UnifiedAuthController::class, 'verifyPassword']);
    Route::post('/send-otp', [UnifiedAuthController::class, 'sendOTP']);
    Route::post('/verify-otp', [UnifiedAuthController::class, 'verifyOTP']);
    Route::post('/reset-forced-password', [UnifiedAuthController::class, 'resetForcedPassword']);
    
    Route::get('/dashboard', [TeacherDashboardController::class, 'index']);
    
    Route::get('/inventory/parent-categories', [TeacherInventoryController::class, 'parentCategories']);
    Route::get('/inventory', [TeacherInventoryController::class, 'index']);
    Route::get('/inventory/{id}', [TeacherInventoryController::class, 'show']);
    Route::get('/inventory-categories', [TeacherInventoryController::class, 'categories']);
    
    // Teacher's Personal Inventory — 3-level hierarchy
    Route::get('/my-inventory/parent-categories', [\App\Http\Controllers\API\Teacher\TeacherInventoryController::class, 'parentCategories']);
    Route::get('/my-inventory/statistics', [\App\Http\Controllers\API\Teacher\TeacherInventoryController::class, 'statistics']);
    Route::get('/my-inventory/categories', [\App\Http\Controllers\API\Teacher\TeacherInventoryController::class, 'categories']);
    Route::get('/my-inventory', [\App\Http\Controllers\API\Teacher\TeacherInventoryController::class, 'index']);
    Route::post('/my-inventory', [\App\Http\Controllers\API\Teacher\TeacherInventoryController::class, 'store']);
    Route::get('/my-inventory/{id}', [\App\Http\Controllers\API\Teacher\TeacherInventoryController::class, 'show']);
    Route::put('/my-inventory/{id}', [\App\Http\Controllers\API\Teacher\TeacherInventoryController::class, 'update']);
    Route::delete('/my-inventory/{id}', [\App\Http\Controllers\API\Teacher\TeacherInventoryController::class, 'destroy']);
    
    Route::get('/requests', [TeacherBorrowRequestController::class, 'index']);
    Route::post('/requests', [TeacherBorrowRequestController::class, 'store']);
    Route::get('/requests/statistics', [TeacherBorrowRequestController::class, 'statistics']);
    Route::get('/requests/{id}', [TeacherBorrowRequestController::class, 'show']);
    Route::post('/requests/{id}/cancel', [TeacherBorrowRequestController::class, 'cancel']);
    
    // Distribution Groups (Teacher Access)
    Route::get('/distribution-groups', [DistributionGroupController::class, 'index']);
    Route::post('/distribution-groups', [DistributionGroupController::class, 'store']);
    Route::get('/distribution-groups/my-groups', [DistributionGroupController::class, 'teacherGroups']);
    Route::get('/distribution-groups/{id}', [DistributionGroupController::class, 'show']);
    Route::put('/distribution-groups/{id}', [DistributionGroupController::class, 'update']);
    Route::delete('/distribution-groups/{id}', [DistributionGroupController::class, 'destroy']);
    Route::post('/distribution-groups/{id}/add-teachers', [DistributionGroupController::class, 'addTeachers']);
    Route::post('/distribution-groups/{id}/remove-teachers', [DistributionGroupController::class, 'removeTeachers']);
    
    // Distribution Requests (Teacher)
    Route::get('/distribution-requests', [\App\Http\Controllers\API\Teacher\DistributionRequestController::class, 'index']);
    Route::post('/distribution-requests', [\App\Http\Controllers\API\Teacher\DistributionRequestController::class, 'store']);
    Route::get('/distribution-requests/statistics', [\App\Http\Controllers\API\Teacher\DistributionRequestController::class, 'statistics']);
    Route::get('/distribution-requests/available-items', [\App\Http\Controllers\API\Teacher\DistributionRequestController::class, 'availableItems']);
    Route::delete('/distribution-requests/{id}', [\App\Http\Controllers\API\Teacher\DistributionRequestController::class, 'cancel']);
    
    // Item Distributions (Teacher Acceptance Flow)
    Route::get('/distributions', [\App\Http\Controllers\API\Teacher\ItemDistributionController::class, 'index']);
    Route::post('/distributions/{id}/accept', [\App\Http\Controllers\API\Teacher\ItemDistributionController::class, 'accept']);
    Route::post('/distributions/{id}/reject', [\App\Http\Controllers\API\Teacher\ItemDistributionController::class, 'reject']);
    
    // Teacher Activity Logs
    Route::get('/logs', [\App\Http\Controllers\API\Teacher\SystemLogController::class, 'index']);
    
    // Notifications (Teacher)
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
    Route::delete('/notifications/read/all', [NotificationController::class, 'deleteAllRead']);

    // Teacher Entity Access
    Route::get('/my-entities', [EntityController::class, 'myEntities']);
    Route::get('/my-classrooms', [EntityController::class, 'myClassrooms']);
    Route::get('/my-clubs', [EntityController::class, 'myClubs']);
    Route::get('/my-departments', [EntityController::class, 'myDepartments']);
    Route::get('/classroom/{id}/inventory', [EntityController::class, 'classroomInventory']);
    Route::get('/club/{id}/inventory', [EntityController::class, 'clubInventory']);
    Route::get('/department/{id}/inventory', [EntityController::class, 'departmentInventory']);
    
    // Teachers listing for groups
    Route::get('/teachers', [\App\Http\Controllers\API\Admin\TeacherManagementController::class, 'index']);
});
