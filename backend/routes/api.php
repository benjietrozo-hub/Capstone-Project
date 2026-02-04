<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\Auth\AdminAuthController;
use App\Http\Controllers\API\Auth\TeacherAuthController;
use App\Http\Controllers\API\Auth\UnifiedAuthController;
use App\Http\Controllers\API\Admin\InventoryController as AdminInventoryController;
use App\Http\Controllers\API\Admin\BorrowRequestController as AdminBorrowRequestController;
use App\Http\Controllers\API\Admin\TeacherManagementController;
use App\Http\Controllers\API\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\API\Admin\ReportController as AdminReportController;
use App\Http\Controllers\API\Admin\SystemLogController;
use App\Http\Controllers\API\Teacher\InventoryController as TeacherInventoryController;
use App\Http\Controllers\API\Teacher\BorrowRequestController as TeacherBorrowRequestController;
use App\Http\Controllers\API\Teacher\DashboardController as TeacherDashboardController;

// Test route
Route::get('/test', function() {
    return response()->json(['message' => 'API is working']);
});

// Public Auth Routes
Route::prefix('auth')->group(function () {
    // Unified login endpoint
    Route::post('/login', [UnifiedAuthController::class, 'login']);
    
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

// Protected Admin Routes
Route::prefix('admin')->middleware(['auth:sanctum', \App\Http\Middleware\LogAuthAttempt::class])->group(function () {
    Route::post('/logout', [AdminAuthController::class, 'logout']);
    Route::get('/me', [AdminAuthController::class, 'me']);
    
    Route::get('/dashboard', [AdminDashboardController::class, 'index']);
    Route::get('/dashboard/statistics', [AdminDashboardController::class, 'statistics']);
    
    Route::apiResource('inventory', AdminInventoryController::class);
    Route::get('/inventory-categories', [AdminInventoryController::class, 'categories']);
    
    Route::get('/requests', [AdminBorrowRequestController::class, 'index']);
    Route::get('/requests/statistics', [AdminBorrowRequestController::class, 'statistics']);
    Route::post('/requests/{id}/approve', [AdminBorrowRequestController::class, 'approve']);
    Route::post('/requests/{id}/reject', [AdminBorrowRequestController::class, 'reject']);
    Route::post('/requests/{id}/issue', [AdminBorrowRequestController::class, 'issue']);
    Route::post('/requests/{id}/return', [AdminBorrowRequestController::class, 'return']);
    
    Route::apiResource('teachers', TeacherManagementController::class);
    Route::get('/teacher-departments', [TeacherManagementController::class, 'departments']);
    
    Route::apiResource('reports', AdminReportController::class);
    
    Route::get('/logs', [SystemLogController::class, 'index']);
    Route::get('/logs/statistics', [SystemLogController::class, 'statistics']);
    Route::get('/logs/{id}', [SystemLogController::class, 'show']);
});

// Protected Teacher Routes
Route::prefix('teacher')->middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [TeacherAuthController::class, 'logout']);
    Route::get('/me', [TeacherAuthController::class, 'me']);
    
    Route::get('/dashboard', [TeacherDashboardController::class, 'index']);
    
    Route::get('/inventory', [TeacherInventoryController::class, 'index']);
    Route::get('/inventory/{id}', [TeacherInventoryController::class, 'show']);
    Route::get('/inventory-categories', [TeacherInventoryController::class, 'categories']);
    
    // Teacher's Personal Inventory
    Route::get('/my-inventory', [\App\Http\Controllers\API\Teacher\TeacherInventoryController::class, 'index']);
    Route::post('/my-inventory', [\App\Http\Controllers\API\Teacher\TeacherInventoryController::class, 'store']);
    Route::get('/my-inventory/statistics', [\App\Http\Controllers\API\Teacher\TeacherInventoryController::class, 'statistics']);
    Route::get('/my-inventory/categories', [\App\Http\Controllers\API\Teacher\TeacherInventoryController::class, 'categories']);
    Route::get('/my-inventory/{id}', [\App\Http\Controllers\API\Teacher\TeacherInventoryController::class, 'show']);
    Route::put('/my-inventory/{id}', [\App\Http\Controllers\API\Teacher\TeacherInventoryController::class, 'update']);
    Route::delete('/my-inventory/{id}', [\App\Http\Controllers\API\Teacher\TeacherInventoryController::class, 'destroy']);
    
    Route::get('/requests', [TeacherBorrowRequestController::class, 'index']);
    Route::post('/requests', [TeacherBorrowRequestController::class, 'store']);
    Route::get('/requests/statistics', [TeacherBorrowRequestController::class, 'statistics']);
    Route::get('/requests/{id}', [TeacherBorrowRequestController::class, 'show']);
    Route::post('/requests/{id}/cancel', [TeacherBorrowRequestController::class, 'cancel']);
});
