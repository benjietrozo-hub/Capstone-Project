<?php

namespace App\Http\Controllers\API\Teacher;

use App\Http\Controllers\Controller;
use App\Models\BorrowRequest;
use App\Models\ToolEquipment;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class BorrowRequestController extends Controller
{
    public function index(Request $request)
    {
        $q = BorrowRequest::with(['item'])->where('teacher_id', $request->user()->id);
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
            'item_id' => 'required|exists:tools_equipment,id',
            'quantity' => 'required|integer|min:1',
            'expected_return_date' => 'required|date|after_or_equal:today',
            'purpose' => 'nullable|max:500'
        ]);
        
        $item = ToolEquipment::findOrFail($v['item_id']);
        
        if ($item->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Item not available'
            ], 422);
        }
        
        if ($item->quantity_available < $v['quantity']) {
            return response()->json([
                'success' => false,
                'message' => "Only {$item->quantity_available} available"
            ], 422);
        }
        
        \Log::info('Validation passed, preparing to create borrow request');
        
        // Generate unique request code using timestamp and random number
        $requestCode = 'REQ-' . date('Ymd') . '-' . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);
        
        $requestData = [
            'request_code' => $requestCode,
            'teacher_id' => $request->user()->id,
            'item_id' => $v['item_id'],
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
        
        // Load relationships for notification
        $br->load(['item', 'teacher']);
        
        // Notify all admins about new borrow request
        // TEMPORARILY DISABLED TO FIX CORS ISSUE
        // NotificationService::notifyBorrowRequestCreated($br);
        
        return response()->json([
            'success' => true,
            'message' => 'Borrow request submitted successfully',
            'data' => $br
        ], 201);
    }

    public function show($id)
    {
        return response()->json(BorrowRequest::with(['item'])->where('teacher_id', auth()->id())->findOrFail($id));
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
        if ($br->status === 'approved') $br->item->updateQuantities();
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
