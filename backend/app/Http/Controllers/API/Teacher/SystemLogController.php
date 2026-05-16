<?php

namespace App\Http\Controllers\API\Teacher;

use App\Http\Controllers\Controller;
use App\Models\SystemLog;
use Illuminate\Http\Request;

class SystemLogController extends Controller
{
    public function index(Request $request)
    {
        $teacher = $request->user();

        $query = SystemLog::query()
            ->where("user_id", $teacher->id)
            ->where("user_type", "teacher")
            ->orderBy("created_at", "desc");

        // Filter by action
        if ($request->has("action") && $request->action) {
            $query->where("action", $request->action);
        }

        // Filter by date range
        if ($request->has("date_from") && $request->date_from) {
            $query->whereDate("created_at", ">=", $request->date_from);
        }

        if ($request->has("date_to") && $request->date_to) {
            $query->whereDate("created_at", "<=", $request->date_to);
        }

        // Search
        if ($request->has("search") && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where("action", "like", "%{$search}%")
                  ->orWhere("description", "like", "%{$search}%")
                  ->orWhere("ip_address", "like", "%{$search}%");
            });
        }

        $perPage = $request->get("per_page", 50);
        $logs = $query->paginate($perPage);

        return response()->json($logs);
    }
}

