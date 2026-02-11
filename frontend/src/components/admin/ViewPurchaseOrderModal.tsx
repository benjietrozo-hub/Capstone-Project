import React, { useState, useEffect } from 'react';
import { X, Download, Printer } from 'lucide-react';
import axios from '../../api/axios';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { toast } from 'sonner';

interface ViewPurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  poId: number;
}

const ViewPurchaseOrderModal: React.FC<ViewPurchaseOrderModalProps> = ({
  isOpen,
  onClose,
  poId,
}) => {
  const [loading, setLoading] = useState(true);
  const [po, setPO] = useState<any>(null);

  useEffect(() => {
    if (isOpen && poId) {
      fetchPODetails();
    }
  }, [isOpen, poId]);

  const fetchPODetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/admin/purchase-orders/${poId}`);
      setPO(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch purchase order details');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <div className="flex justify-center items-center py-8">
            <p>Loading...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!po) return null;

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
      approved: { label: 'Approved', className: 'bg-blue-100 text-blue-800' },
      partially_received: { label: 'Partially Received', className: 'bg-purple-100 text-purple-800' },
      completed: { label: 'Completed', className: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Purchase Order Details</DialogTitle>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header */}
          <div className="border-b pb-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">{po.po_number}</h2>
                <p className="text-gray-600">
                  Date: {new Date(po.po_date).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                {getStatusBadge(po.status)}
                {po.expected_delivery_date && (
                  <p className="text-sm text-gray-600 mt-2">
                    Expected: {new Date(po.expected_delivery_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Company & Supplier Info */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Buyer Information</h3>
              <div className="text-sm space-y-1">
                <p className="font-medium">{po.company_name || 'School Inventory System'}</p>
                {po.company_address && <p>{po.company_address}</p>}
                {po.company_contact_person && <p>Contact: {po.company_contact_person}</p>}
                {po.company_email && <p>Email: {po.company_email}</p>}
                {po.company_phone && <p>Phone: {po.company_phone}</p>}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Supplier Information</h3>
              <div className="text-sm space-y-1">
                <p className="font-medium">{po.supplier_name}</p>
                {po.supplier_address && <p>{po.supplier_address}</p>}
                {po.supplier_contact_person && <p>Contact: {po.supplier_contact_person}</p>}
                {po.supplier_email && <p>Email: {po.supplier_email}</p>}
                {po.supplier_phone && <p>Phone: {po.supplier_phone}</p>}
              </div>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="font-semibold mb-3">Items</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Item
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Description
                    </th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                      Qty Ordered
                    </th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                      Qty Received
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Unit Price
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {po.items?.map((item: any) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        <p className="font-medium">{item.item_name}</p>
                        {item.item_code && (
                          <p className="text-xs text-gray-500">{item.item_code}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">{item.description || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        {item.quantity_ordered} {item.unit_of_measure}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {item.quantity_received} {item.unit_of_measure}
                      </td>
                      <td className="px-4 py-3 text-right">₱{item.unit_price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-medium">
                        ₱{item.line_total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cost Summary */}
          <div className="border-t pt-4">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>₱{po.subtotal.toFixed(2)}</span>
                </div>
                {po.discount > 0 && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span>Discount:</span>
                    <span>-₱{po.discount.toFixed(2)}</span>
                  </div>
                )}
                {po.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Tax:</span>
                    <span>₱{po.tax.toFixed(2)}</span>
                  </div>
                )}
                {po.shipping_fee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Shipping:</span>
                    <span>₱{po.shipping_fee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span className="text-green-600">₱{po.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery & Payment */}
          <div className="grid grid-cols-2 gap-6 border-t pt-4">
            <div>
              <h3 className="font-semibold mb-2">Delivery Information</h3>
              <div className="text-sm space-y-1">
                {po.delivery_method && <p>Method: {po.delivery_method}</p>}
                {po.delivery_address && <p>Address: {po.delivery_address}</p>}
                {po.shipping_terms && <p>Terms: {po.shipping_terms}</p>}
                {po.receiving_instructions && <p>Instructions: {po.receiving_instructions}</p>}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Payment Information</h3>
              <div className="text-sm space-y-1">
                {po.payment_method && <p>Method: {po.payment_method}</p>}
                {po.payment_terms && <p>Terms: {po.payment_terms}</p>}
                {po.reference && <p>Reference: {po.reference}</p>}
              </div>
            </div>
          </div>

          {/* Authorization */}
          {(po.requested_by || po.approved_by) && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Authorization</h3>
              <div className="grid grid-cols-2 gap-6 text-sm">
                {po.requested_by && (
                  <div>
                    <p className="text-gray-600">Requested by:</p>
                    <p className="font-medium">{po.requested_by}</p>
                  </div>
                )}
                {po.approved_by && (
                  <div>
                    <p className="text-gray-600">Approved by:</p>
                    <p className="font-medium">{po.approved_by}</p>
                    {po.approval_date && (
                      <p className="text-xs text-gray-500">
                        {new Date(po.approval_date).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {po.notes && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Notes</h3>
              <p className="text-sm text-gray-700">{po.notes}</p>
            </div>
          )}

          {/* Terms & Conditions */}
          {po.terms_conditions && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Terms & Conditions</h3>
              <p className="text-sm text-gray-700">{po.terms_conditions}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end border-t pt-4">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewPurchaseOrderModal;
