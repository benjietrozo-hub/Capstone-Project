<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Club;
use App\Models\SystemLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ClubController extends Controller
{
    /**
     * Get all clubs
     */
    public function index(Request $request)
    {
        try {
            $query = Club::with('advisorTeacher');

            // Filter by status
            if ($request->has('status')) {
                if ($request->status === 'active') {
                    $query->active();
                } elseif ($request->status === 'inactive') {
                    $query->where('is_active', false);
                }
            }

            // Filter by category
            if ($request->has('category')) {
                $query->byCategory($request->category);
            }

            // Filter by advisor
            if ($request->has('advisor_id')) {
                $query->byAdvisor($request->advisor_id);
            }

            // Search
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('code', 'like', "%{$search}%")
                      ->orWhere('category', 'like', "%{$search}%");
                });
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'name');
            $sortOrder = $request->get('sort_order', 'asc');
            $query->orderBy($sortBy, $sortOrder);

            $clubs = $query->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $clubs
            ]);
        } catch (\Exception $e) {
            \Log::error('Club index error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch clubs',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get club statistics
     */
    public function statistics()
    {
        try {
            $stats = [
                'total_clubs' => Club::count(),
                'active_clubs' => Club::active()->count(),
                'inactive_clubs' => Club::where('is_active', false)->count(),
                'clubs_with_advisor' => Club::whereNotNull('advisor_teacher_id')->count(),
                'by_category' => Club::select('category', DB::raw('count(*) as count'))
                    ->whereNotNull('category')
                    ->groupBy('category')
                    ->get()
                    ->pluck('count', 'category'),
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
     * Get a single club
     */
    public function show($id)
    {
        try {
            $club = Club::with(['advisorTeacher', 'distributions'])
                ->withCount('distributions')
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $club
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Club not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Create a new club
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50|unique:clubs,code',
            'advisor_teacher_id' => 'nullable|exists:teachers,id',
            'category' => 'nullable|string|max:100',
            'meeting_schedule' => 'nullable|string|max:255',
            'meeting_location' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $club = Club::create($request->all());

            SystemLog::create([
                'log_type' => 'club',
                'action' => 'created',
                'description' => "Created club: {$club->name}",
                'user_type' => 'admin',
                'user_id' => auth()->id(),
                'reference_id' => $club->id
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Club created successfully',
                'data' => $club->load('advisorTeacher')
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create club',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a club
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'code' => 'nullable|string|max:50|unique:clubs,code,' . $id,
            'advisor_teacher_id' => 'nullable|exists:teachers,id',
            'category' => 'nullable|string|max:100',
            'meeting_schedule' => 'nullable|string|max:255',
            'meeting_location' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $club = Club::findOrFail($id);
            $club->update($request->all());

            SystemLog::create([
                'log_type' => 'club',
                'action' => 'updated',
                'description' => "Updated club: {$club->name}",
                'user_type' => 'admin',
                'user_id' => auth()->id(),
                'reference_id' => $club->id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Club updated successfully',
                'data' => $club->load('advisorTeacher')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update club',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a club
     */
    public function destroy($id)
    {
        try {
            $club = Club::findOrFail($id);
            
            // Check if club has active distributions
            if ($club->distributions()->whereIn('status', ['pending_acceptance', 'assigned'])->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete club with active item assignments. Please recall or transfer items first.'
                ], 422);
            }

            $clubName = $club->name;
            $club->delete();

            SystemLog::create([
                'log_type' => 'club',
                'action' => 'deleted',
                'description' => "Deleted club: {$clubName}",
                'user_type' => 'admin',
                'user_id' => auth()->id(),
                'reference_id' => $id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Club deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete club',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get club inventory
     */
    public function inventory($id)
    {
        try {
            $club = Club::findOrFail($id);
            
            $inventory = $club->distributions()
                ->with(['inventoryItems', 'distributedBy'])
                ->whereIn('status', ['pending_acceptance', 'assigned'])
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'club' => $club,
                    'inventory' => $inventory,
                    'total_items' => $inventory->sum('quantity_distributed')
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch club inventory',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available club categories
     */
    public function categories()
    {
        try {
            $categories = Club::select('category')
                ->distinct()
                ->whereNotNull('category')
                ->orderBy('category')
                ->pluck('category');

            return response()->json([
                'success' => true,
                'data' => $categories
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch categories',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
