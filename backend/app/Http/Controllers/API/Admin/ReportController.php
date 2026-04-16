<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Report;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Report::with(['teacher', 'item', 'assignedAdmin']);
            
            if ($request->status) {
                $query->where('status', $request->status);
            }
            
            if ($request->priority) {
                $query->where('priority', $request->priority);
            }
            
            if ($request->assigned_to) {
                $query->where('assigned_to', $request->assigned_to);
            }
            
            $reports = $query->orderBy('created_at', 'desc')
                           ->paginate($request->per_page ?? 15);
            
            return response()->json([
                'success' => true,
                'data' => $reports
            ]);
        } catch (\Exception $e) {
            \Log::error('Report index error: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch reports',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $report = Report::with(['teacher', 'item', 'assignedAdmin'])->findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $report
            ]);
        } catch (\Exception $e) {
            \Log::error('Report show error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Report not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $report = Report::findOrFail($id);
            
            $validated = $request->validate([
                'status' => 'sometimes|in:open,in_progress,resolved,closed',
                'priority' => 'sometimes|in:low,medium,high,critical',
                'assigned_to' => 'nullable|exists:admins,id',
                'resolution' => 'nullable|string'
            ]);
            
            $report->update($validated);
            
            return response()->json([
                'success' => true,
                'message' => 'Report updated successfully',
                'data' => $report->load(['teacher', 'item', 'assignedAdmin'])
            ]);
        } catch (\Exception $e) {
            \Log::error('Report update error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update report',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function resolve(Request $request, $id)
    {
        try {
            $report = Report::findOrFail($id);
            
            $validated = $request->validate([
                'admin_notes' => 'required|string',
                'resolution_date' => 'required|date'
            ]);
            
            $report->update([
                'status' => 'resolved',
                'resolution' => $validated['admin_notes'],
                'resolved_at' => $validated['resolution_date'],
                'resolved_by' => auth()->id()
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Report resolved successfully',
                'data' => $report->load(['teacher', 'item', 'assignedAdmin'])
            ]);
        } catch (\Exception $e) {
            \Log::error('Report resolve error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to resolve report',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
