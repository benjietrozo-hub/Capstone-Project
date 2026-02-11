<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use App\Models\SystemLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Supplier::query();

            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('supplier_code', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            $suppliers = $query->orderBy('name')->paginate(15);

            return response()->json($suppliers);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch suppliers',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $supplier = Supplier::create($request->all());

            SystemLog::create([
                'log_type' => 'supplier',
                'action' => 'created',
                'description' => "Supplier {$supplier->name} created",
                'user_type' => 'admin',
                'user_id' => auth()->id(),
                'reference_id' => $supplier->id
            ]);

            return response()->json([
                'message' => 'Supplier created successfully',
                'data' => $supplier
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create supplier',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $supplier = Supplier::with('purchaseOrders')->findOrFail($id);
            return response()->json($supplier);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Supplier not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $supplier = Supplier::findOrFail($id);
            $supplier->update($request->all());

            SystemLog::create([
                'log_type' => 'supplier',
                'action' => 'updated',
                'description' => "Supplier {$supplier->name} updated",
                'user_type' => 'admin',
                'user_id' => auth()->id(),
                'reference_id' => $supplier->id
            ]);

            return response()->json([
                'message' => 'Supplier updated successfully',
                'data' => $supplier
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update supplier',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $supplier = Supplier::findOrFail($id);
            $supplierName = $supplier->name;
            
            // Set deleted_by before soft deleting
            $supplier->deleted_by = auth()->id();
            $supplier->save();
            $supplier->delete();

            SystemLog::create([
                'log_type' => 'supplier',
                'action' => 'deleted',
                'description' => "Supplier {$supplierName} moved to trash",
                'user_type' => 'admin',
                'user_id' => auth()->id(),
                'reference_id' => $id
            ]);

            return response()->json([
                'message' => 'Supplier moved to trash successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete supplier',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function list()
    {
        try {
            $suppliers = Supplier::where('status', 'active')
                ->select('id', 'supplier_code', 'name', 'email', 'phone')
                ->orderBy('name')
                ->get();

            return response()->json($suppliers);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch suppliers list',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
