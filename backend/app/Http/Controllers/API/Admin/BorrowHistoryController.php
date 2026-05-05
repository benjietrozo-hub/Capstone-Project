<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\BorrowRequest;
use Illuminate\Http\Request;

class BorrowHistoryController extends Controller
{
    /**
     * Get all borrow request history
     */
    public function index(Request $request)
    {
        try {
            $status = $request->query('status');
            $search = $request->query('search');
            $year = $request->query('year');

            $query = BorrowRequest::with(['teacher', 'category', 'inventoryItems'])
                ->whereIn('status', ['returned', 'issued', 'borrowed', 'approved', 'rejected', 'cancelled']);

            if ($status) {
                $query->where('status', $status);
            }

            if ($year) {
                $query->whereYear('created_at', $year);
            }

            if ($search) {
                $query->where(function($q) use ($search) {
                    $q->whereHas('teacher', function($t) use ($search) {
                        $t->where('first_name', 'like', "%{$search}%")
                          ->orWhere('last_name', 'like', "%{$search}%")
                          ->orWhere('teacher_id', 'like', "%{$search}%");
                    })
                    ->orWhere('request_code', 'like', "%{$search}%")
                    ->orWhereHas('category', function($c) use ($search) {
                        $c->where('category_name', 'like', "%{$search}%");
                    });
                });
            }

            $history = $query->orderBy('created_at', 'desc')
                ->paginate($request->query('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $history
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch borrow history',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get statistics for borrow history
     */
    public function stats()
    {
        try {
            $stats = [
                'total_transactions' => BorrowRequest::count(),
                'returned' => BorrowRequest::where('status', 'returned')->count(),
                'currently_borrowed' => BorrowRequest::where('status', 'borrowed')->count(),
                'rejected_cancelled' => BorrowRequest::whereIn('status', ['rejected', 'cancelled'])->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch history stats'
            ], 500);
        }
    }

    /**
     * Get distinct years of borrow history
     */
    public function years()
    {
        try {
            // Fetch distinct years from the created_at column
            $years = BorrowRequest::selectRaw('YEAR(created_at) as year')
                ->whereNotNull('created_at')
                ->distinct()
                ->orderBy('year', 'desc')
                ->pluck('year');

            return response()->json([
                'success' => true,
                'data' => $years
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch history years',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
