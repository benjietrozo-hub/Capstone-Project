import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Printer, Package, Calendar, User, Building, DollarSign } from 'lucide-react';
import { adminAPI } from '@/api';
import toast from 'react-hot-toast';

interface PurchaseOrderItem {
  id: number;
  item_name: string;
  item_code: string;
  quantity_ordered: number;
  quantity_received: number;
  unit_price: number;
  total_price: number;
  unit_of_measure: string;
}

interface PurchaseOrder {
  id: number;
  po_number: string;
  po_date: string;
  expected_delivery_date: string;
  status: string;
  supplier_name: string;
  supplier_address?: string;
  supplier_contact_person?: string;
  supplier_email?: string;
  supplier_phone?: string;
  subtotal: number;
  discount: number;
  tax: number;
  shipping_fee: number;
  total_amount: number;
  items: PurchaseOrderItem[];
  admin?: {
    full_name: string;
  };
}

export default function PurchaseOrderPrint() {
  const { id } = useParams();
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPurchaseOrder = async () => {
      if (!id) {
        setError('No purchase order ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('Fetching purchase order with ID:', id);
        const response = await adminAPI.getPurchaseOrder(parseInt(id));
        console.log('Purchase order response:', response);
        setPurchaseOrder(response.data);
      } catch (error: any) {
        console.error('Error fetching purchase order:', error);
        setError(error?.message || 'Failed to load purchase order');
      } finally {
        setLoading(false);
      }
    };

    fetchPurchaseOrder();
  }, [id]);

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
      approved: { label: 'Approved', className: 'bg-blue-100 text-blue-800' },
      partially_received: { label: 'Partially Received', className: 'bg-purple-100 text-purple-800' },
      completed: { label: 'Completed', className: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800' },
    };
    
    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  // Auto-print effect
  useEffect(() => {
    if (purchaseOrder) {
      const timer = setTimeout(() => {
        window.print();
      }, 1000);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [purchaseOrder]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-semibold">Loading purchase order...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 text-lg font-semibold mb-4">Error: {error}</p>
          <Button onClick={() => window.history.back()} className="mt-4">
            Back to Purchase Orders
          </Button>
        </div>
      </div>
    );
  }

  if (!purchaseOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 text-lg font-semibold">Purchase order not found</p>
          <Button onClick={() => window.history.back()} className="mt-4">
            Back to Purchase Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white shadow-sm border border-gray-300">
          {/* Header */}
          <div className="border-b-2 border-gray-800 pb-3 mb-4">
            <div className="flex justify-between items-start">
              <div className="text-left">
                <div className="mb-1">
                  <h1 className="text-xl font-bold text-gray-900">SCHOOL DEPARTMENT PURCHASE ORDER</h1>
                  <div className="text-sm font-semibold text-gray-700">Online Inventory Management System</div>
                  <div className="text-xs text-gray-600">Division of General Services</div>
                </div>
              </div>
              <div className="text-right">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-300">
                  <img 
                    src="/Logo_n.jpg" 
                    alt="Online IMS Logo" 
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* PO Details */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <div className="border border-gray-300 rounded p-3 bg-gray-50">
                <h3 className="text-sm font-bold text-gray-900 mb-2">PURCHASE ORDER INFORMATION</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-xs text-gray-600">PO Number:</span>
                    <p className="font-bold text-sm">{purchaseOrder.po_number}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-600">Date:</span>
                    <p className="font-semibold text-xs">{formatDate(purchaseOrder.po_date)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <span className="text-xs text-gray-600">Expected Delivery:</span>
                    <p className="font-semibold text-xs">{formatDate(purchaseOrder.expected_delivery_date)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-600">Status:</span>
                    <div className="mt-1">{getStatusBadge(purchaseOrder.status)}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="border border-gray-300 rounded p-3 bg-gray-50">
                <h3 className="text-sm font-bold text-gray-900 mb-2">SUPPLIER INFORMATION</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-xs text-gray-600">Supplier Name:</span>
                    <p className="font-bold text-sm">{purchaseOrder.supplier_name}</p>
                  </div>
                  {purchaseOrder.supplier_address && (
                    <div>
                      <span className="text-xs text-gray-600">Address:</span>
                      <p className="text-xs text-gray-700">{purchaseOrder.supplier_address}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <span className="text-xs text-gray-600">Contact Person:</span>
                      <p className="text-xs text-gray-700">{purchaseOrder.supplier_contact_person}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-600">Phone:</span>
                      <p className="text-xs text-gray-700">{purchaseOrder.supplier_phone}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-4">
            <h2 className="text-sm font-bold text-gray-900 mb-2 border-b border-gray-300 pb-1">ORDERED ITEMS</h2>
            <div className="border border-gray-300 rounded overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 py-1 text-left text-xs font-bold text-gray-700 border-b border-gray-300">ITEM CODE</th>
                    <th className="px-2 py-1 text-left text-xs font-bold text-gray-700 border-b border-gray-300">DESCRIPTION</th>
                    <th className="px-2 py-1 text-center text-xs font-bold text-gray-700 border-b border-gray-300">QUANTITY</th>
                    <th className="px-2 py-1 text-center text-xs font-bold text-gray-700 border-b border-gray-300">UNIT PRICE</th>
                    <th className="px-2 py-1 text-right text-xs font-bold text-gray-700 border-b border-gray-300">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrder.items.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-2 py-1 text-xs border-b border-gray-200">{item.item_code}</td>
                      <td className="px-2 py-1 text-xs border-b border-gray-200">
                        <div className="font-medium text-gray-900">{item.item_name}</div>
                      </td>
                      <td className="px-2 py-1 text-xs text-center border-b border-gray-200">{item.quantity_ordered}</td>
                      <td className="px-2 py-1 text-xs text-right border-b border-gray-200">{formatCurrency(item.unit_price)}</td>
                      <td className="px-2 py-1 text-xs font-semibold text-right border-b border-gray-200">{formatCurrency(item.total_price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="space-y-1">
              <div>
                <span className="text-xs text-gray-500">Prepared By</span>
                <p className="font-semibold text-xs text-gray-900">{purchaseOrder.admin?.full_name || 'N/A'}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Terms</span>
                <p className="text-xs text-gray-700">NET 30 DAYS</p>
              </div>
            </div>

            <div className="space-y-1">
              <div className="border-t border-gray-300 pt-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">SUBTOTAL</span>
                    <span className="font-semibold text-xs">{formatCurrency(purchaseOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">DISCOUNT</span>
                    <span className="font-semibold text-xs">{formatCurrency(purchaseOrder.discount)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">TAX (12%)</span>
                    <span className="font-semibold text-xs">{formatCurrency(purchaseOrder.tax)}</span>
                  </div>
                  <div className="border-t border-gray-800 pt-1">
                    <div className="flex justify-between">
                      <span className="text-sm font-bold text-gray-900">TOTAL</span>
                      <span className="text-sm font-bold text-gray-900">{formatCurrency(purchaseOrder.total_amount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div>
                <span className="text-xs text-gray-500">Notes</span>
                <p className="text-xs text-gray-700">Please deliver items to the main office. All items must be inspected upon receipt.</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-800 pt-3 mt-4">
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="border border-gray-300 rounded p-2">
                <p className="font-semibold text-gray-900 mb-1 text-xs">SUPPLIER SIGNATURE</p>
                <p className="text-xs text-gray-500 mb-2">Over Printed Name & Title</p>
                <div className="border-b border-gray-400 h-8"></div>
                <p className="text-xs text-gray-500 mt-1">Date</p>
              </div>
              <div className="border border-gray-300 rounded p-2">
                <p className="font-semibold text-gray-900 mb-1 text-xs">RECEIVED BY</p>
                <p className="text-xs text-gray-500 mb-2">Over Printed Name & Title</p>
                <div className="border-b border-gray-400 h-8"></div>
                <p className="text-xs text-gray-500 mt-1">Date</p>
              </div>
              <div className="border border-gray-300 rounded p-2">
                <p className="font-semibold text-gray-900 mb-1 text-xs">APPROVED BY</p>
                <p className="text-xs text-gray-500 mb-2">Over Printed Name & Title</p>
                <div className="border-b border-gray-400 h-8"></div>
                <p className="text-xs text-gray-500 mt-1">Date</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page {
            margin: 0.25in;
            size: A4;
          }
          
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
            font-size: 10pt;
            line-height: 1.2;
          }
          
          .min-h-screen {
            min-height: auto;
          }
          
          .max-w-4xl {
            max-width: 100%;
            margin: 0;
            padding: 0;
          }
          
          .p-4 {
            padding: 0.25in;
          }
          
          .no-print {
            display: none !important;
          }
          
          .border-gray-300 {
            border-color: #d1d5db !important;
          }
          
          .text-xs {
            font-size: 8pt !important;
          }
          
          .text-sm {
            font-size: 9pt !important;
          }
        }
      `}</style>
    </div>
  );
}
