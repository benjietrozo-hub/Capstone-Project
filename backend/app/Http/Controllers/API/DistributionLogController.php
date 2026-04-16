<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\DistributionLog;
use App\Models\Teacher;
use App\Models\ToolEquipment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DistributionLogController extends Controller
{
    /**
     * Get all distribution logs with filtering
     */
    public function index(Request $request)
    {
        try {
            $query = DistributionLog::with([
                'distributable',
                'teacher',
                'item',
                'performedBy'
            ]);

            // Filter by action
            if ($request->has('action')) {
                $query->action($request->action);
            }

            // Filter by teacher
            if ($request->has('teacher_id')) {
                $query->forTeacher($request->teacher_id);
            }

            // Filter by item
            if ($request->has('item_id')) {
                $query->forItem($request->item_id);
            }

            // Filter by date range
            if ($request->has('date_from') && $request->has('date_to')) {
                $query->inDateRange($request->date_from, $request->date_to);
            }

            // Search by description or item name
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('description', 'like', "%{$search}%")
                      ->orWhereHas('item', function($itemQuery) use ($search) {
                          $itemQuery->where('item_name', 'like', "%{$search}%")
                                   ->orWhere('item_code', 'like', "%{$search}%");
                      })
                      ->orWhereHas('teacher', function($teacherQuery) use ($search) {
                          $teacherQuery->where('full_name', 'like', "%{$search}%")
                                     ->orWhere('email', 'like', "%{$search}%");
                      });
                });
            }

            $logs = $query->orderBy('created_at', 'desc')
                          ->paginate(20);

            return response()->json([
                'success' => true,
                'data' => $logs
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch distribution logs',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get distribution statistics
     */
    public function statistics(Request $request)
    {
        try {
            $query = DistributionLog::query();

            // Apply date filters if provided
            if ($request->has('date_from') && $request->has('date_to')) {
                $query->inDateRange($request->date_from, $request->date_to);
            }

            $stats = [
                'total_logs' => $query->count(),
                'action_counts' => $query->selectRaw('action, COUNT(*) as count')
                                       ->groupBy('action')
                                       ->pluck('count', 'action')
                                       ->toArray(),
                'top_items' => $query->selectRaw('item_id, COUNT(*) as count, SUM(quantity) as total_quantity')
                                   ->with('item')
                                   ->groupBy('item_id')
                                   ->orderBy('count', 'desc')
                                   ->limit(10)
                                   ->get(),
                'top_teachers' => $query->selectRaw('teacher_id, COUNT(*) as count, SUM(quantity) as total_quantity')
                                      ->with('teacher')
                                      ->whereNotNull('teacher_id')
                                      ->groupBy('teacher_id')
                                      ->orderBy('count', 'desc')
                                      ->limit(10)
                                      ->get(),
                'recent_activity' => $query->with(['teacher', 'item', 'performedBy'])
                                          ->orderBy('created_at', 'desc')
                                          ->limit(5)
                                          ->get(),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export distribution logs to CSV
     */
    public function export(Request $request)
    {
        try {
            $query = DistributionLog::with([
                'distributable',
                'teacher',
                'item',
                'performedBy'
            ]);

            // Apply filters
            if ($request->has('action')) {
                $query->action($request->action);
            }

            if ($request->has('teacher_id')) {
                $query->forTeacher($request->teacher_id);
            }

            if ($request->has('item_id')) {
                $query->forItem($request->item_id);
            }

            if ($request->has('date_from') && $request->has('date_to')) {
                $query->inDateRange($request->date_from, $request->date_to);
            }

            $logs = $query->orderBy('created_at', 'desc')->get();

            // Build CSV
            $csvLines = [];
            $csvLines[] = "Distribution Logs Export";
            $csvLines[] = "Generated: " . now()->toLocaleString();
            $csvLines[] = "Total Records: " . $logs->count();
            $csvLines[] = "";
            $csvLines[] = "";

            // Headers
            $headers = [
                'ID',
                'Date/Time',
                'Action',
                'Type',
                'Teacher',
                'Item',
                'Quantity',
                'Description',
                'Performed By',
                'IP Address'
            ];
            $csvLines[] = implode(',', $headers);

            // Data rows
            foreach ($logs as $log) {
                $row = [
                    $log->id,
                    $log->created_at->format('Y-m-d H:i:s'),
                    $log->action,
                    class_basename($log->distributable_type),
                    $log->teacher ? $log->teacher->full_name : 'N/A',
                    $log->item ? $log->item->item_name : 'N/A',
                    $log->quantity,
                    $log->description ?? '',
                    $log->performedBy ? $log->performedBy->full_name : 'N/A',
                    $log->ip_address ?? 'N/A'
                ];
                $csvLines[] = implode(',', array_map(function($field) {
                    return '"' . str_replace('"', '""', $field) . '"';
                }, $row));
            }

            $csv = implode("\n", $csvLines);

            // Create response
            $filename = 'distribution_logs_' . now()->format('Y-m-d_H-i-s') . '.csv';
            
            return response($csv)
                ->header('Content-Type', 'text/csv')
                ->header('Content-Disposition', "attachment; filename=\"{$filename}\"");

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to export logs',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get detailed log information
     */
    public function show($id)
    {
        try {
            $log = DistributionLog::with([
                'distributable',
                'teacher',
                'item',
                'performedBy'
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $log
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Log entry not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }
}
