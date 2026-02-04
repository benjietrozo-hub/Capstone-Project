<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Report;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $q = Report::with(['teacher', 'item', 'assignedAdmin']);
        if ($request->status) $q->where('status', $request->status);
        if ($request->priority) $q->where('priority', $request->priority);
        if ($request->assigned_to) $q->where('assigned_to', $request->assigned_to);
        return response()->json($q->paginate($request->per_page ?? 15));
    }

    public function show($id)
    {
        return response()->json(Report::with(['teacher', 'item', 'assignedAdmin'])->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $r = Report::findOrFail($id);
        $v = $request->validate(['status' => 'sometimes|in:open,in_progress,resolved,closed', 'priority' => 'sometimes|in:low,medium,high,critical', 'assigned_to' => 'nullable|exists:admins,id', 'resolution' => 'nullable']);
        $r->update($v);
        return response()->json($r->load(['teacher', 'item', 'assignedAdmin']));
    }
}
