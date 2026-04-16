import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Table } from '../../components/common/Table';
import { Button, FormField } from '../../components/common/FormElements';
import { PageLoader } from '../../components/common/Loader';
import { Modal } from '../../components/common/Modal';
import { teacherAPI } from '../../api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';
import NavHeader from '@/components/NavHeader';
import NotificationProfile from '@/components/NotificationProfile';

interface InventoryItem {
  id: number;
  item_code: string;
  item_name: string;
  description?: string;
  category: string;
  quantity: number;
  condition: string;
  location?: string;
  unit_price?: number;
  acquisition_date?: string;
  notes?: string;
  status: string;
}

interface FormData {
  item_code: string;
  item_name: string;
  description: string;
  category: string;
  quantity: number;
  condition: string;
  location: string;
  unit_price: string;
  acquisition_date: string;
  notes: string;
  status: string;
}

interface FormErrors {
  [key: string]: string[];
}

export function MyInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({
    item_code: '',
    item_name: '',
    description: '',
    category: '',
    quantity: 1,
    condition: 'good',
    location: '',
    unit_price: '',
    acquisition_date: '',
    notes: '',
    status: 'available',
  });

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, [search, category]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await teacherAPI.getMyInventory({
        search,
        category,
      });
      setItems(response.data.data || []);
    } catch (error) {
      console.error('Failed to load inventory:', error);
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await teacherAPI.getMyInventoryCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setGeneralError('');

    try {
      if (editingId) {
        await teacherAPI.updateMyInventoryItem(editingId, formData);
        toast.success('Item updated successfully');
      } else {
        await teacherAPI.createMyInventoryItem(formData);
        toast.success('Item added successfully');
      }
      setShowModal(false);
      resetForm();
      fetchItems();
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      } else {
        setGeneralError(error.response?.data?.message || 'Failed to save item');
      }
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setFormData({
      item_code: item.item_code,
      item_name: item.item_name,
      description: item.description || '',
      category: item.category,
      quantity: item.quantity,
      condition: item.condition,
      location: item.location || '',
      unit_price: item.unit_price?.toString() || '',
      acquisition_date: item.acquisition_date || '',
      notes: item.notes || '',
      status: item.status,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await teacherAPI.deleteMyInventoryItem(id);
      toast.success('Item deleted successfully');
      fetchItems();
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const resetForm = () => {
    setFormData({
      item_code: '',
      item_name: '',
      description: '',
      category: '',
      quantity: 1,
      condition: 'good',
      location: '',
      unit_price: '',
      acquisition_date: '',
      notes: '',
      status: 'available',
    });
    setEditingId(null);
    setFormErrors({});
    setGeneralError('');
  };

  const columns = [
    { key: 'item_code', label: 'Code' },
    { key: 'item_name', label: 'Name' },
    { key: 'category', label: 'Category' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'condition', label: 'Condition' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' },
  ];

  const renderRow = (item: InventoryItem) => ({
    item_code: item.item_code,
    item_name: item.item_name,
    category: item.category,
    quantity: item.quantity,
    condition: <StatusBadge label={item.condition} condition={item.condition} />,
    status: <StatusBadge label={item.status} status={item.status} />,
    actions: (
      <div className="flex gap-2">
        <Button onClick={() => handleEdit(item)}>Edit</Button>
        <Button onClick={() => handleDelete(item.id)} variant="danger">Delete</Button>
      </div>
    ),
  });

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader title="My Inventory" />
      <div className="flex">
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Inventory</h1>
                <p className="text-gray-600 mt-1">Manage your personal inventory items</p>
              </div>
              <NotificationProfile />
            </div>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Inventory Items</CardTitle>
                  <Button onClick={() => { resetForm(); setShowModal(true); }}>
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-4">
                  <FormField
                    label="Search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search items..."
                  />
                  <FormField
                    label="Category"
                    type="select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    options={[
                      { value: '', label: 'All Categories' },
                      ...categories.map(cat => ({ value: cat, label: cat }))
                    ]}
                  />
                </div>

                <Table
                  columns={columns}
                  data={items}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => { setShowModal(false); resetForm(); }}
          title={editingId ? 'Edit Item' : 'Add Item'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {generalError && (
              <div className="bg-red-50 text-red-600 p-3 rounded">{generalError}</div>
            )}

            <FormField
              label="Item Code"
              value={formData.item_code}
              onChange={(e) => setFormData({ ...formData, item_code: e.target.value })}
              error={formErrors.item_code?.[0]}
              required
            />

            <FormField
              label="Item Name"
              value={formData.item_name}
              onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
              error={formErrors.item_name?.[0]}
              required
            />

            <FormField
              label="Description"
              type="textarea"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              error={formErrors.description?.[0]}
            />

            <FormField
              label="Category"
              type="select"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={[
                { value: '', label: 'Select Category' },
                ...categories.map(cat => ({ value: cat, label: cat }))
              ]}
              error={formErrors.category?.[0]}
              required
            />

            <FormField
              label="Quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
              error={formErrors.quantity?.[0]}
              required
            />

            <FormField
              label="Condition"
              type="select"
              value={formData.condition}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              options={[
                { value: 'excellent', label: 'Excellent' },
                { value: 'good', label: 'Good' },
                { value: 'fair', label: 'Fair' },
                { value: 'poor', label: 'Poor' },
              ]}
              error={formErrors.condition?.[0]}
              required
            />

            <FormField
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              error={formErrors.location?.[0]}
            />

            <FormField
              label="Unit Price"
              type="number"
              step="0.01"
              value={formData.unit_price}
              onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
              error={formErrors.unit_price?.[0]}
            />

            <FormField
              label="Acquisition Date"
              type="date"
              value={formData.acquisition_date}
              onChange={(e) => setFormData({ ...formData, acquisition_date: e.target.value })}
              error={formErrors.acquisition_date?.[0]}
            />

            <FormField
              label="Notes"
              type="textarea"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              error={formErrors.notes?.[0]}
            />

            <FormField
              label="Status"
              type="select"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'available', label: 'Available' },
                { value: 'in_use', label: 'In Use' },
                { value: 'maintenance', label: 'Maintenance' },
                { value: 'retired', label: 'Retired' },
              ]}
              error={formErrors.status?.[0]}
              required
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => { setShowModal(false); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit">
                {editingId ? 'Update' : 'Add'} Item
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default MyInventoryPage;
