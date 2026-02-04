<?php

namespace App\Http\Controllers\API\Teacher;

use App\Http\Controllers\Controller;
use App\Models\BorrowRequest;
use App\Models\ToolEquipment;
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
        $v = $request->validate([
            'item_id' => 'required|exists:tools_equipment,id',
            'quantity' => 'required|integer|min:1',
            'expected_return_date' => 'required|date|after_or_equal:today',
            'purpose' => 'nullable|max:500'
        ]);
        
        $item = ToolEquipment::findOrFail($v['item_id']);
        
        if ($item->status !== 'active') {
            return response()->json(['message' => 'Item not available'], 422);
        }
        
        if ($item->quantity_available < $v['quantity']) {
            return response()->json(['message' => "Only {$item->quantity_available} available"], 422);
        }
        
        $br = BorrowRequest::create([
            'teacher_id' => $request->user()->id,
            'item_id' => $v['item_id'],
            'quantity_requested' => $v['quantity'],
            'borrow_date' => now()->toDateString(),
            'expected_return_date' => $v['expected_return_date'],
            'purpose' => $v['purpose'] ?? null,
            'status' => 'pending'
        ]);
        
        return response()->json($br->load(['item', 'teacher']), 201);
    }

    public function show($id)
    {
        return response()->json(BorrowRequest::with(['item'])->where('teacher_id', auth()->id())->findOrFail($id));
    }

    public function cancel($id)
    {
        $br = BorrowRequest::where('teacher_id', auth()->id())->findOrFail($id);
        if (!in_array($br->status, ['pending', 'approved'])) return response()->json(['message' => 'Cannot cancel'], 422);
        $br->update(['status' => 'cancelled']);
        if ($br->status === 'approved') $br->item->updateQuantities();
        return response()->json($br);
    }

    public function statistics()
    {
        $tid = auth()->id();
        return response()->json(['pending' => BorrowRequest::where('teacher_id', $tid)->where('status', 'pending')->count(), 'approved' => BorrowRequest::where('teacher_id', $tid)->where('status', 'approved')->count(), 'borrowed' => BorrowRequest::where('teacher_id', $tid)->where('status', 'borrowed')->count(), 'total_borrowed' => BorrowRequest::where('teacher_id', $tid)->whereIn('status', ['borrowed', 'returned'])->count()]);
    }
}
