<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\SystemLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class PurchaseOrderController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = PurchaseOrder::with(['items', 'supplier', 'admin']);

            // Filter by status
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            // Search
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('po_number', 'like', "%{$search}%")
                      ->orWhere('supplier_name', 'like', "%{$search}%")
                      ->orWhere('reference', 'like', "%{$search}%");
                });
            }

            // Date range filter
            if ($request->has('start_date')) {
                $query->where('po_date', '>=', $request->start_date);
            }
            if ($request->has('end_date')) {
                $query->where('po_date', '<=', $request->end_date);
            }

            $purchaseOrders = $query->orderBy('created_at', 'desc')->paginate(15);

            return response()->json($purchaseOrders);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch purchase orders',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'po_date' => 'required|date',
            'expected_delivery_date' => 'nullable|date',
            'supplier_name' => 'required|string',
            'items' => 'required|array|min:1',
            'items.*.item_name' => 'required|string',
            'items.*.quantity_ordered' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $poData = $request->except('items');
            $poData['admin_id'] = auth()->id();
            $poData['requested_by'] = auth()->user()->first_name . ' ' . auth()->user()->last_name;

            $purchaseOrder = PurchaseOrder::create($poData);

            // Create items
            foreach ($request->items as $itemData) {
                $itemData['line_total'] = $itemData['quantity_ordered'] * $itemData['unit_price'];
                $purchaseOrder->items()->create($itemData);
            }

            // Recalculate totals
            $this->recalculateTotals($purchaseOrder);

            // Log activity
            SystemLog::create([
                'log_type' => 'purchase_order',
                'action' => 'created',
                'description' => "Purchase Order {$purchaseOrder->po_number} created",
                'user_type' => 'admin',
                'user_id' => auth()->id(),
                'reference_id' => $purchaseOrder->id
            ]);

            // Notify all admins about new purchase order
            \App\Services\NotificationService::notifyPurchaseOrderCreated($purchaseOrder);

            DB::commit();

            return response()->json([
                'message' => 'Purchase order created successfully',
                'data' => $purchaseOrder->load(['items', 'supplier'])
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create purchase order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        \Log::info("PurchaseOrderController@show called with ID: {$id}");
        
        try {
            \Log::info("Attempting to find purchase order with ID: {$id}");
            $purchaseOrder = PurchaseOrder::with(['items', 'supplier', 'admin'])->findOrFail($id);
            \Log::info("Found purchase order: " . $purchaseOrder->po_number);
            return response()->json($purchaseOrder);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            \Log::error("Purchase order not found: {$id}");
            return response()->json([
                'message' => 'Purchase order not found',
                'error' => "Purchase order with ID {$id} not found"
            ], 404);
        } catch (\Exception $e) {
            // Log the error for debugging
            \Log::error("Error fetching purchase order {$id}: " . $e->getMessage());
            
            return response()->json([
                'message' => 'Error fetching purchase order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'po_date' => 'sometimes|date',
            'expected_delivery_date' => 'nullable|date',
            'supplier_name' => 'sometimes|string',
            'items' => 'sometimes|array|min:1',
            'items.*.item_name' => 'required_with:items|string',
            'items.*.quantity_ordered' => 'required_with:items|integer|min:1',
            'items.*.unit_price' => 'required_with:items|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $purchaseOrder = PurchaseOrder::findOrFail($id);
            
            // Update PO data
            $purchaseOrder->update($request->except('items'));

            // Update items if provided
            if ($request->has('items')) {
                // Delete old items
                $purchaseOrder->items()->delete();
                
                // Create new items
                foreach ($request->items as $itemData) {
                    $itemData['line_total'] = $itemData['quantity_ordered'] * $itemData['unit_price'];
                    $purchaseOrder->items()->create($itemData);
                }

                // Recalculate totals
                $this->recalculateTotals($purchaseOrder);
            }

            // Log activity
            SystemLog::create([
                'log_type' => 'purchase_order',
                'action' => 'updated',
                'description' => "Purchase Order {$purchaseOrder->po_number} updated",
                'user_type' => 'admin',
                'user_id' => auth()->id(),
                'reference_id' => $purchaseOrder->id
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Purchase order updated successfully',
                'data' => $purchaseOrder->load(['items', 'supplier'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to update purchase order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $purchaseOrder = PurchaseOrder::findOrFail($id);
            $poNumber = $purchaseOrder->po_number;
            
            // Set deleted_by before soft deleting
            $purchaseOrder->deleted_by = auth()->id();
            $purchaseOrder->save();
            $purchaseOrder->delete();

            // Log activity
            SystemLog::create([
                'log_type' => 'purchase_order',
                'action' => 'deleted',
                'description' => "Purchase Order {$poNumber} moved to trash",
                'user_type' => 'admin',
                'user_id' => auth()->id(),
                'reference_id' => $id
            ]);

            return response()->json([
                'message' => 'Purchase order moved to trash successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete purchase order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function approve($id, Request $request)
    {
        try {
            $purchaseOrder = PurchaseOrder::findOrFail($id);
            
            $purchaseOrder->update([
                'status' => 'approved',
                'approved_by' => auth()->user()->first_name . ' ' . auth()->user()->last_name,
                'approval_date' => now()
            ]);

            SystemLog::create([
                'log_type' => 'purchase_order',
                'action' => 'approved',
                'description' => "Purchase Order {$purchaseOrder->po_number} approved",
                'user_type' => 'admin',
                'user_id' => auth()->id(),
                'reference_id' => $purchaseOrder->id
            ]);

            return response()->json([
                'message' => 'Purchase order approved successfully',
                'data' => $purchaseOrder->load(['items', 'supplier'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to approve purchase order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function cancel($id, Request $request)
    {
        try {
            $purchaseOrder = PurchaseOrder::findOrFail($id);
            
            $purchaseOrder->update([
                'status' => 'cancelled'
            ]);

            SystemLog::create([
                'log_type' => 'purchase_order',
                'action' => 'cancelled',
                'description' => "Purchase Order {$purchaseOrder->po_number} cancelled. Reason: " . ($request->reason ?? 'No reason provided'),
                'user_type' => 'admin',
                'user_id' => auth()->id(),
                'reference_id' => $purchaseOrder->id
            ]);

            return response()->json([
                'message' => 'Purchase order cancelled successfully',
                'data' => $purchaseOrder->load(['items', 'supplier'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to cancel purchase order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function receiveItems($id, Request $request)
    {
        $validator = Validator::make($request->all(), [
            'items' => 'required|array',
            'items.*.id' => 'required|exists:purchase_order_items,id',
            'items.*.quantity_received' => 'required|integer|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $purchaseOrder = PurchaseOrder::findOrFail($id);

            foreach ($request->items as $itemData) {
                $item = PurchaseOrderItem::findOrFail($itemData['id']);
                $item->update([
                    'quantity_received' => $item->quantity_received + $itemData['quantity_received']
                ]);
            }

            // Check if all items are fully received
            $allReceived = $purchaseOrder->items()->get()->every(function ($item) {
                return $item->quantity_received >= $item->quantity_ordered;
            });

            $purchaseOrder->update([
                'status' => $allReceived ? 'completed' : 'partially_received'
            ]);

            SystemLog::create([
                'log_type' => 'purchase_order',
                'action' => 'items_received',
                'description' => "Items received for Purchase Order {$purchaseOrder->po_number}",
                'user_type' => 'admin',
                'user_id' => auth()->id(),
                'reference_id' => $purchaseOrder->id
            ]);

            // Notify all admins about received items
            \App\Services\NotificationService::notifyPurchaseOrderReceived($purchaseOrder);

            DB::commit();

            return response()->json([
                'message' => 'Items received successfully',
                'data' => $purchaseOrder->load(['items', 'supplier'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to receive items',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function statistics()
    {
        try {
            $stats = [
                'total' => PurchaseOrder::count(),
                'pending' => PurchaseOrder::where('status', 'pending')->count(),
                'approved' => PurchaseOrder::where('status', 'approved')->count(),
                'partially_received' => PurchaseOrder::where('status', 'partially_received')->count(),
                'completed' => PurchaseOrder::where('status', 'completed')->count(),
                'cancelled' => PurchaseOrder::where('status', 'cancelled')->count(),
                'total_amount' => PurchaseOrder::whereIn('status', ['approved', 'partially_received', 'completed'])->sum('total_amount'),
                'this_month' => PurchaseOrder::whereMonth('po_date', date('m'))->whereYear('po_date', date('Y'))->count(),
            ];

            return response()->json($stats);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function exportPDF($id)
    {
        try {
            $purchaseOrder = PurchaseOrder::with(['items', 'supplier', 'admin'])->findOrFail($id);
            
            // Generate HTML for PDF using structured format
            $html = $this->generatePurchaseOrderHTML($purchaseOrder);
            
            // Create PDF using DOMPDF or similar
            $pdf = new \Dompdf\Dompdf();
            $pdf->loadHtml($html);
            $pdf->setPaper('A4', 'portrait');
            $pdf->render();
            
            // Download the PDF
            return response($pdf->output())
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', 'attachment; filename="PO-' . $purchaseOrder->po_number . '.pdf"');
                
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to generate PDF',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    private function generatePurchaseOrderHTML($purchaseOrder)
    {
        $poDate = date('m/d/Y', strtotime($purchaseOrder->po_date));
        $deliveryDate = $purchaseOrder->expected_delivery_date ? date('m/d/Y', strtotime($purchaseOrder->expected_delivery_date)) : '';
        
        $html = '
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; font-weight: bold; margin-bottom: 20px; }
            .section { margin-bottom: 20px; }
            .section-title { font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .full-width { grid-column: 1 / -1; }
            .items-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .items-table th, .items-table td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            .items-table th { background-color: #f5f5f5; }
            .total-section { margin-top: 20px; text-align: right; }
            .signature-section { margin-top: 40px; }
        </style>
        
        <div class="header">
            <h2>PURCHASE ORDER FORM (Structured Data)</h2>
        </div>
        
        <div class="section">
            <div class="section-title">Basic Information</div>
            <div class="grid">
                <div><strong>PO Number:</strong> ' . $purchaseOrder->po_number . '</div>
                <div><strong>Date:</strong> ' . $poDate . '</div>
                <div><strong>Mode of Procurement:</strong> ' . ($purchaseOrder->mode_of_procurement ?? 'SHOPPING') . '</div>
                <div><strong>Expected Delivery Date:</strong> ' . $deliveryDate . '</div>
            </div>
        </div>
        
        <div class="section">
            <div class="section-title">Supplier Information</div>
            <div class="grid">
                <div class="full-width"><strong>Supplier Name:</strong> ' . $purchaseOrder->supplier_name . '</div>
                <div class="full-width"><strong>Address:</strong> ' . ($purchaseOrder->supplier_address ?? 'N/A') . '</div>
                <div><strong>TIN:</strong> ' . ($purchaseOrder->supplier_tin ?? 'N/A') . '</div>
            </div>
        </div>
        
        <div class="section">
            <div class="section-title">Items List</div>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Stock/Property No.</th>
                        <th>Unit</th>
                        <th>Description</th>
                        <th>Quantity</th>
                        <th>Unit Cost</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>';
        
        foreach ($purchaseOrder->items as $index => $item) {
            $html .= '
                    <tr>
                        <td>' . ($index + 1) . '</td>
                        <td>' . ($item->unit_of_measure ?? 'unit') . '</td>
                        <td>' . $item->item_name . '</td>
                        <td>' . $item->quantity_ordered . '</td>
                        <td>PHP ' . number_format($item->unit_price, 2) . '</td>
                        <td>PHP ' . number_format($item->quantity_ordered * $item->unit_price, 2) . '</td>
                    </tr>';
        }
        
        $html .= '
                </tbody>
            </table>
        </div>
        
        <div class="section">
            <div class="section-title">Delivery Details</div>
            <div class="grid">
                <div><strong>Place of Delivery:</strong> ' . ($purchaseOrder->delivery_place ?? 'N/A') . '</div>
                <div><strong>Date of Delivery:</strong> ' . ($purchaseOrder->delivery_date ?? 'N/A') . '</div>
                <div><strong>Delivery Term:</strong> ' . ($purchaseOrder->delivery_term ?? 'N/A') . '</div>
                <div><strong>Payment Term:</strong> ' . ($purchaseOrder->payment_term ?? 'N/A') . '</div>
            </div>
        </div>
        
        <div class="section">
            <div class="section-title">Summary</div>
            <div class="total-section">
                <p><strong>Total Amount:</strong> PHP ' . number_format($purchaseOrder->total_amount, 2) . '</p>
                <p><strong>Amount in Words:</strong> ' . ($purchaseOrder->amount_in_words ?? 'N/A') . '</p>
            </div>
        </div>
        
        <div class="signature-section">
            <div class="grid">
                <div style="text-align: center;">
                    <p>_________________________</p>
                    <p>Authorized Signature</p>
                </div>
                <div style="text-align: center;">
                    <p>_________________________</p>
                    <p>Supplier Signature</p>
                </div>
            </div>
        </div>';
        
        return $html;
    }

    private function recalculateTotals($purchaseOrder)
    {
        $subtotal = $purchaseOrder->items()->sum('line_total');
        $total = $subtotal - $purchaseOrder->discount + $purchaseOrder->tax + $purchaseOrder->shipping_fee;

        $purchaseOrder->update([
            'subtotal' => $subtotal,
            'total_amount' => $total
        ]);
    }
}
