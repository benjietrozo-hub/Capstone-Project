<?php

namespace App\Http\Controllers\API\Teacher;

use App\Http\Controllers\Controller;
use App\Models\BorrowRequest;
use App\Models\ItemCategory;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class BorrowRequestController extends Controller
{
    public function index(Request $request)
    {
        $q = BorrowRequest::with(['category'])->where('teacher_id', $request->user()->id);
        if ($request->status) $q->where('status', $request->status);
        $q->orderBy($request->sort_by ?? 'created_at', $request->sort_order ?? 'desc');
        return response()->json($q->paginate($request->per_page ?? 15));
    }

    public function store(Request $request)
    {
        // Simple test log
        \Log::info('Borrow request store method called');
        
        // Debug logging
        \Log::info('=== BORROW REQUEST DEBUG START ===');
        \Log::info('Controller hit: TeacherBorrowRequestController@store');
        \Log::info('Request method:', ['method' => $request->method()]);
        \Log::info('Request URL:', ['url' => $request->fullUrl()]);
        \Log::info('Request data:', $request->all());
        \Log::info('Headers:', $request->headers->all());
        \Log::info('Authenticated user:', ['user' => $request->user()]);
        \Log::info('User ID:', ['id' => $request->user()?->id]);
        \Log::info('Auth check:', ['check' => auth()->check()]);
        \Log::info('Auth ID:', ['id' => auth()->id()]);
        
        // Check if user is authenticated
        if (!auth()->check()) {
            \Log::error('User not authenticated for borrow request');
            return response()->json([
                'success' => false,
                'message' => 'Authentication required. Please login again.'
            ], 401);
        }
        
        // Check if user is a teacher
        $user = $request->user();
        if (!$user || get_class($user) !== 'App\\Models\\Teacher') {
            \Log::error('User is not a teacher', ['user_class' => $user ? get_class($user) : 'null']);
            return response()->json([
                'success' => false,
                'message' => 'Only teachers can create borrow requests.'
            ], 403);
        }
        
        \Log::info('User authenticated as teacher, proceeding with validation');
        
        $v = $request->validate([
            'category_id' => 'required|exists:item_categories,id',
            'inventory_item_id' => 'nullable|exists:inventory_items,id',
            'quantity' => 'required|integer|min:1',
            'expected_return_date' => 'required|date|after_or_equal:today',
            'purpose' => 'nullable|max:500'
        ]);
        
        $category = ItemCategory::findOrFail($v['category_id']);
        
        if ($category->available_items < $v['quantity']) {
            return response()->json([
                'success' => false,
                'message' => "Only {$category->available_items} available in this category"
            ], 422);
        }
        
        \Log::info('Validation passed, preparing to create borrow request');
        
        // Generate unique request code using timestamp and random number
        $requestCode = 'REQ-' . date('Ymd') . '-' . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);
        
        $requestData = [
            'request_code' => $requestCode,
            'teacher_id' => $user->id,
            'category_id' => $v['category_id'],
            'quantity_requested' => $v['quantity'],
            'date_requested' => now()->toDateString(),
            'date_needed' => now()->toDateString(), // Use today's date as needed date
            'expected_return_date' => $v['expected_return_date'],
            'purpose' => $v['purpose'] ?? null,
            'status' => 'pending'
        ];
        
        \Log::info('Creating borrow request with data:', $requestData);
        
        $br = BorrowRequest::create($requestData);
        
        \Log::info('Borrow request created successfully with ID:', ['id' => $br->id]);
        
        // Link specific item if provided
        if (isset($v['inventory_item_id'])) {
            $br->inventoryItems()->attach($v['inventory_item_id'], [
                'status' => 'borrowed',
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
        
        // Load relationships for notification
        $br->load(['category', 'teacher', 'inventoryItems']);
        
        // Notify all admins about new borrow request
        NotificationService::notifyBorrowRequestCreated($br);
        
        return response()->json([
            'success' => true,
            'message' => 'Borrow request submitted successfully',
            'data' => $br
        ], 201);
    }

    public function show($id)
    {
        return response()->json(BorrowRequest::with(['category'])->where('teacher_id', auth()->id())->findOrFail($id));
    }

    public function cancel($id)
    {
        $br = BorrowRequest::where('teacher_id', auth()->id())->findOrFail($id);
        if (!in_array($br->status, ['pending', 'approved'])) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot cancel'
            ], 422);
        }
        $br->update(['status' => 'cancelled']);
        if ($br->status === 'approved') {
            // Unlink any reserved items if there were any, handled by pivot table
        }
        return response()->json([
            'success' => true,
            'message' => 'Borrow request cancelled successfully',
            'data' => $br
        ]);
    }

    public function statistics()
    {
        $tid = auth()->id();
        return response()->json(['pending' => BorrowRequest::where('teacher_id', $tid)->where('status', 'pending')->count(), 'approved' => BorrowRequest::where('teacher_id', $tid)->where('status', 'approved')->count(), 'borrowed' => BorrowRequest::where('teacher_id', $tid)->where('status', 'borrowed')->count(), 'total_borrowed' => BorrowRequest::where('teacher_id', $tid)->whereIn('status', ['borrowed', 'returned'])->count()]);
    }
}
