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
    po_date: new Date().toISOString().split('T')[0],
    expected_delivery_date: '',
    supplier_id: '',
    supplier_name: '',
    supplier_address: '',
    supplier_contact_person: '',
    supplier_email: '',
    supplier_phone: '',
    company_name: 'School Inventory System',
    company_address: '',
    company_contact_person: '',
    company_email: '',
    company_phone: '',
    delivery_address: '',
    delivery_method: 'courier',
    shipping_terms: '',
    receiving_instructions: '',
    payment_method: 'bank_transfer',
    payment_terms: 'Net 30',
    reference: '',
    discount: 0,
    tax: 0,
    shipping_fee: 0,
    notes: '',
    terms_conditions: '',
  });

  const [items, setItems] = useState<POItem[]>([
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
    return items.reduce((sum, item) => sum + item.quantity_ordered * item.unit_price, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal - formData.discount + formData.tax + formData.shipping_fee;
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>PO Date *</Label>
              <Input
                type="date"
                value={formData.po_date}
                onChange={(e) => setFormData({ ...formData, po_date: e.target.value })}
                required
              />
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

          {/* Supplier Information */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Supplier Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Select Supplier *</Label>
                <Select value={formData.supplier_id} onValueChange={handleSupplierChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id.toString()}>
                        {supplier.name} ({supplier.supplier_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Supplier Name *</Label>
                <Input
                  value={formData.supplier_name}
                  onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Contact Person</Label>
                <Input
                  value={formData.supplier_contact_person}
                  onChange={(e) => setFormData({ ...formData, supplier_contact_person: e.target.value })}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.supplier_email}
                  onChange={(e) => setFormData({ ...formData, supplier_email: e.target.value })}
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={formData.supplier_phone}
                  onChange={(e) => setFormData({ ...formData, supplier_phone: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label>Address</Label>
                <Textarea
                  value={formData.supplier_address}
                  onChange={(e) => setFormData({ ...formData, supplier_address: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Items</h3>
              <Button type="button" onClick={handleAddItem} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="border p-4 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Item {index + 1}</span>
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
                      <Label>Item Code</Label>
                      <Input
                        value={item.item_code}
                        onChange={(e) => handleItemChange(index, 'item_code', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Item Name *</Label>
                      <Input
                        value={item.item_name}
                        onChange={(e) => handleItemChange(index, 'item_name', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-span-3">
                      <Label>Description</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Input
                        value={item.category}
                        onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Quantity *</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity_ordered}
                        onChange={(e) => handleItemChange(index, 'quantity_ordered', parseInt(e.target.value))}
                        required
                      />
                    </div>
                    <div>
                      <Label>Unit</Label>
                      <Select
                        value={item.unit_of_measure}
                        onValueChange={(value) => handleItemChange(index, 'unit_of_measure', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pcs">Pieces</SelectItem>
                          <SelectItem value="box">Box</SelectItem>
                          <SelectItem value="kg">Kilogram</SelectItem>
                          <SelectItem value="liter">Liter</SelectItem>
                          <SelectItem value="set">Set</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Unit Price *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value))}
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Line Total</Label>
                      <Input
                        value={`₱${(item.quantity_ordered * item.unit_price).toFixed(2)}`}
                        disabled
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cost Summary */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Cost Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Discount</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Tax</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.tax}
                  onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Shipping Fee</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.shipping_fee}
                  onChange={(e) => setFormData({ ...formData, shipping_fee: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <Label>Total Amount</Label>
                <p className="text-2xl font-bold text-green-600">₱{calculateTotal().toFixed(2)}</p>
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
