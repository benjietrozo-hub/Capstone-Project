import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import axios from '../../api/axios';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { toast } from 'sonner';

interface CreatePurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface POItem {
  item_code: string;
  item_name: string;
  description: string;
  category: string;
  quantity_ordered: number;
  unit_of_measure: string;
  unit_price: number;
}

interface Supplier {
  id: number;
  supplier_code: string;
  name: string;
  email: string;
  phone: string;
}

const CreatePurchaseOrderModal: React.FC<CreatePurchaseOrderModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [formData, setFormData] = useState({
    po_number: '08-2025-16',
    po_date: '',
    expected_delivery_date: '',
    mode_of_procurement: '',
    supplier_name: '',
    supplier_address: '',
    supplier_tin: '',
    delivery_place: '',
    delivery_date: '',
    delivery_term: '',
    payment_term: '',
    delivery_method: 'courier',
    payment_method: 'bank_transfer',
    payment_terms: '',
    reference: '',
    notes: '',
    total_amount: 0,
    amount_in_words: ''
  });

  const [items, setItems] = useState<POItem[]>([
    {
      item_code: '',
      item_name: '',
      description: '',
      category: '',
      quantity_ordered: 1,
      unit_of_measure: '',
      unit_price: 0,
    },
  ]);

  useEffect(() => {
    if (isOpen) {
      fetchSuppliers();
    }
  }, [isOpen]);

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get('/admin/suppliers/list');
      setSuppliers(response.data);
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
    }
  };

  const handleSupplierChange = (supplierId: string) => {
    const supplier = suppliers.find((s) => s.id === parseInt(supplierId));
    if (supplier) {
      setFormData({
        ...formData,
        supplier_id: supplierId,
        supplier_name: supplier.name,
        supplier_email: supplier.email || '',
        supplier_phone: supplier.phone || '',
      });
    }
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        item_code: '',
        item_name: '',
        description: '',
        category: '',
        quantity_ordered: 1,
        unit_of_measure: 'pcs',
        unit_price: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: keyof POItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity_ordered * item.unit_price), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.supplier_name) {
      toast.error('Please select a supplier');
      return;
    }

    if (items.some((item) => !item.item_name || item.quantity_ordered <= 0 || item.unit_price <= 0)) {
      toast.error('Please fill in all item details correctly');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/admin/purchase-orders', {
        ...formData,
        items,
      });
      toast.success('Purchase order created successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create purchase order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Purchase Order</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* PO Header */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">🔹 Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>PO Number</Label>
                <Input
                  type="text"
                  value={formData.po_number}
                  readOnly
                  placeholder="Auto-generated"
                />
              </div>
              <div>
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={formData.po_date}
                  onChange={(e) => setFormData({ ...formData, po_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Mode of Procurement *</Label>
                <Select value={formData.mode_of_procurement} onValueChange={(value) => setFormData({ ...formData, mode_of_procurement: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SHOPPING">SHOPPING</SelectItem>
                    <SelectItem value="BIDDING">BIDDING</SelectItem>
                    <SelectItem value="NEGOTIATED">NEGOTIATED</SelectItem>
                    <SelectItem value="DIRECT">DIRECT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Expected Delivery Date</Label>
                <Input
                  type="date"
                  value={formData.expected_delivery_date}
                  onChange={(e) => setFormData({ ...formData, expected_delivery_date: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Supplier Information */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">🔹 Supplier Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Supplier Name *</Label>
                <Input
                  value={formData.supplier_name}
                  onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                  placeholder="Enter supplier name"
                  required
                />
              </div>
              <div className="col-span-2">
                <Label>Address *</Label>
                <Textarea
                  value={formData.supplier_address}
                  onChange={(e) => setFormData({ ...formData, supplier_address: e.target.value })}
                  placeholder="Enter supplier address"
                  rows={2}
                  required
                />
              </div>
              <div>
                <Label>TIN</Label>
                <Input
                  value={formData.supplier_tin}
                  onChange={(e) => setFormData({ ...formData, supplier_tin: e.target.value })}
                  placeholder="Enter TIN number"
                />
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">🔹 Items List</h3>
              <Button type="button" onClick={handleAddItem} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="border p-4 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Stock/Property No. {index + 1}</span>
                    {items.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        size="sm"
                        variant="ghost"
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label>Unit</Label>
                      <Select
                        value={item.unit_of_measure}
                        onValueChange={(value) => handleItemChange(index, 'unit_of_measure', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unit">unit</SelectItem>
                          <SelectItem value="pcs">Pieces</SelectItem>
                          <SelectItem value="box">Box</SelectItem>
                          <SelectItem value="kg">Kilogram</SelectItem>
                          <SelectItem value="liter">Liter</SelectItem>
                          <SelectItem value="set">Set</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label>Description *</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        placeholder="Enter item description"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label>Quantity *</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity_ordered}
                        onChange={(e) => handleItemChange(index, 'quantity_ordered', parseInt(e.target.value))}
                        placeholder="0"
                        required
                      />
                    </div>
                    <div>
                      <Label>Unit Cost *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value))}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div>
                      <Label>Amount</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={(item.quantity_ordered * item.unit_price).toFixed(2)}
                        disabled
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Details */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">🔹 Delivery Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Place of Delivery *</Label>
                <Input
                  type="text"
                  value={formData.delivery_place}
                  onChange={(e) => setFormData({ ...formData, delivery_place: e.target.value })}
                  placeholder="Enter delivery location"
                  required
                />
              </div>
              <div>
                <Label>Date of Delivery</Label>
                <Input
                  type="date"
                  value={formData.delivery_date}
                  onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Delivery Term *</Label>
                <Select value={formData.delivery_term} onValueChange={(value) => setFormData({ ...formData, delivery_term: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select delivery term" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PICK-UP">PICK-UP</SelectItem>
                    <SelectItem value="DELIVERY">DELIVERY</SelectItem>
                    <SelectItem value="COURIER">COURIER</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Payment Term</Label>
                <Input
                  type="text"
                  value={formData.payment_term}
                  onChange={(e) => setFormData({ ...formData, payment_term: e.target.value })}
                  placeholder="Enter payment terms"
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">🔹 Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Total Amount</Label>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-2xl font-bold text-green-600">₱{calculateTotal().toFixed(2)}</p>
                </div>
              </div>
              <div className="col-span-2">
                <Label>Amount in Words</Label>
                <Textarea
                  value={formData.amount_in_words}
                  onChange={(e) => setFormData({ ...formData, amount_in_words: e.target.value })}
                  placeholder="Enter amount in words"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Delivery & Payment */}
          <div className="border-t pt-4 grid grid-cols-2 gap-4">
            <div>
              <Label>Delivery Method</Label>
              <Select value={formData.delivery_method} onValueChange={(value) => setFormData({ ...formData, delivery_method: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="courier">Courier</SelectItem>
                  <SelectItem value="pickup">Pickup</SelectItem>
                  <SelectItem value="freight">Freight</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Payment Method</Label>
              <Select value={formData.payment_method} onValueChange={(value) => setFormData({ ...formData, payment_method: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Payment Terms</Label>
              <Input
                value={formData.payment_terms}
                onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
              />
            </div>
            <div>
              <Label>Reference</Label>
              <Input
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="border-t pt-4">
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? 'Creating...' : 'Create Purchase Order'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePurchaseOrderModal;
