import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button, FormField } from '../../components/common/FormElements';
import { adminAPI } from '../../api';
import toast from 'react-hot-toast';
import NavHeader from '@/components/NavHeader';
import NotificationProfile from '@/components/NotificationProfile';

interface InventoryItem {
  id: number;
  item_code: string;
  item_name: string;
  description?: string;
  category: string;
  quantity_total: number;
  quantity_available: number;
  condition: string;
  status: string;
  location?: string;
  unit_price?: number;
  acquisition_date?: string;
  notes?: string;
}

interface FormData {
  item_code: string;
  item_name: string;
  description: string;
  category: string;
  quantity_total: string | number;
  condition: string;
  location: string;
  unit_price: string | number;
  acquisition_date: string;
  notes: string;
}

export function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card'); // Default to card view
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({
    item_code: '',
    item_name: '',
    description: '',
    category: '',
    quantity_total: '',
    condition: 'good',
    location: '',
    unit_price: '',
    acquisition_date: '',
    notes: '',
  });

  const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, [search, category]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      
      // Log everything
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      console.log('=== FETCH INVENTORY DEBUG ===');
      console.log('Token exists:', !!token);
      console.log('Token value:', token?.substring(0, 20) + '...');
      console.log('User:', user);
      console.log('API Base URL:', import.meta.env.VITE_API_URL);
      console.log('Request params:', { search, category, per_page: 50 });
      
      const response = await adminAPI.getInventory({
        search,
        category,
        per_page: 50,
      });
      
      console.log('Response received:', response);
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      console.log('Response data:', response.data);
      console.log('Response data.data:', response.data.data);
      console.log('Response data.data type:', typeof response.data.data);
      console.log('Response data.data is array:', Array.isArray(response.data.data));
      console.log('Response data.data length:', response.data.data?.length);
      
      // Ensure we're setting an array
      const itemsData = response.data.data || [];
      console.log('Items to set:', itemsData);
      console.log('Items to set length:', itemsData.length);
      
      setItems(itemsData);
      
      if (itemsData.length === 0) {
        setErrorMessage('No items found in database. The API returned an empty array.');
        console.error('❌ Empty array received from API');
      } else {
        console.log('✅ Items set successfully:', itemsData.length, 'items');
      }
    } catch (error: any) {
      console.error('=== FETCH INVENTORY ERROR ===');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      console.error('Error response headers:', error.response?.headers);
      console.error('Error config:', error.config);
      console.error('Error config url:', error.config?.url);
      console.error('Error config headers:', error.config?.headers);
      
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error occurred';
      setErrorMessage(`Failed to load inventory: ${errorMsg}`);
      toast.error('Failed to load inventory');
      setItems([]); // Set empty array on error
    } finally {
      setLoading(false);
      console.log('=== FETCH INVENTORY COMPLETE ===');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await adminAPI.getInventoryCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to load categories');
    }
  };

  const handleOpenModal = (item: InventoryItem | null = null) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        item_code: item.item_code,
        item_name: item.item_name,
        description: item.description || '',
        category: item.category,
        quantity_total: item.quantity_total,
        condition: item.condition,
        location: item.location || '',
        unit_price: item.unit_price || '',
        acquisition_date: item.acquisition_date || '',
        notes: item.notes || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        item_code: '',
        item_name: '',
        description: '',
        category: '',
        quantity_total: '',
        condition: 'good',
        location: '',
        unit_price: '',
        acquisition_date: '',
        notes: '',
      });
    }
    setShowModal(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await adminAPI.updateInventory(editingId, formData);
        toast.success('Item updated successfully');
      } else {
        await adminAPI.createInventory(formData);
        toast.success('Item created successfully');
      }
      setShowModal(false);
      fetchItems();
    } catch (error) {
      toast.error('Failed to save item');
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await adminAPI.deleteInventory(id);
      toast.success('Item deleted successfully');
      fetchItems();
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  return (
    <div>
      <NavHeader 
        title="Inventory Management" 
        subtitle="Manage all equipment and tools in the system"
        showBackButton={true}
        showHomeButton={true}
        showMenuButton={true}
      >
        <NotificationProfile 
          notifications={[]}
          unreadCount={0}
          currentUser={currentUser}
          onMarkAsRead={() => {}}
          onMarkAllAsRead={() => {}}
        />
      </NavHeader>
      
      {/* Mobile Subtitle */}
      <div className="sm:hidden bg-white border-b px-4 py-3">
        <h1 className="text-lg font-bold text-gray-900 mb-1">Inventory Management</h1>
        <p className="text-sm text-gray-600">Manage all equipment and tools in the system</p>
      </div>
      
      <div className="p-6">
        {/* Debug Panel */}
        <div style={{
          marginBottom: '20px',
          padding: '15px',
          background: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          <strong>🔍 Debug Info:</strong>
          <div style={{ marginTop: '10px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            <div>Loading: <strong>{loading ? 'Yes' : 'No'}</strong></div>
            <div>Items Count: <strong>{items.length}</strong></div>
            <div>Error: <strong>{errorMessage || 'None'}</strong></div>
            <div>Search: <strong>{search || 'None'}</strong></div>
            <div>Category: <strong>{category || 'All'}</strong></div>
          </div>
        </div>
        
        <Card>
          <div className="flex justify-between items-start mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 mr-4">
              <FormField
                label="Search Items"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or code..."
              />
              <FormField
                label="Category"
                type="select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={[{ value: '', label: 'All Categories' }, ...categories.map(c => ({ value: c, label: c }))]}
              />
            </div>
            <div className="pt-6 flex gap-2">
              {/* View Mode Toggle */}
              <div className="flex gap-1 border rounded-lg p-1 bg-gray-50">
                <button
                  onClick={() => setViewMode('card')}
                  className={`px-3 py-1 rounded text-sm transition-all ${
                    viewMode === 'card'
                      ? 'bg-white shadow text-primary font-semibold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Card View"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded text-sm transition-all ${
                    viewMode === 'list'
                      ? 'bg-white shadow text-primary font-semibold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="List View"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
              <Button onClick={() => handleOpenModal()}>+ Add New Item</Button>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
              Loading inventory...
            </div>
          ) : errorMessage ? (
            <div style={{ 
              padding: '20px', 
              background: '#fee', 
              border: '2px solid #f00', 
              borderRadius: '8px',
              color: '#c00',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: '0 0 10px 0' }}>⚠️ Error Loading Inventory</h3>
              <p style={{ margin: 0 }}>{errorMessage}</p>
              <p style={{ margin: '10px 0 0 0', fontSize: '14px' }}>
                Check the browser console (F12) for more details.
              </p>
            </div>
          ) : items.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 0', 
              background: '#fff3cd',
              border: '2px solid #ffc107',
              borderRadius: '8px',
              color: '#856404'
            }}>
              <h3>No Items Found</h3>
              <p>There are no inventory items in the system.</p>
              <p>Click "Add New Item" to create your first item.</p>
            </div>
          ) : viewMode === 'card' ? (
            // Card View
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {items.length > 0 ? items.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 hover:shadow-lg transition-all bg-white"
                  style={{ borderLeft: '4px solid #2d7a3e' }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{item.item_name}</h3>
                      <p className="text-sm text-primary font-medium">{item.item_code}</p>
                    </div>
                    <StatusBadge label={item.status} status={item.status} />
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium">{item.category}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Available:</span>
                      <span className={`font-semibold ${item.quantity_available > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.quantity_available}/{item.quantity_total}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Condition:</span>
                      <StatusBadge label={item.condition} status={item.condition} />
                    </div>
                    {item.location && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium">{item.location}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 pt-3 border-t">
                    <button
                      onClick={() => handleOpenModal(item)}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )) : (
                <div className="col-span-full text-center py-12 text-gray-500">
                  No items found (items array is empty)
                </div>
              )}
            </div>
          ) : (
            // List View
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%' }}>
                <thead>
                  <tr style={{
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: 'white',
                    fontWeight: '600'
                  }}>
                    <th style={{ padding: '12px', textAlign: 'left', borderRadius: '10px 0 0 0' }}>Code</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Category</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Condition</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderRadius: '0 10px 0 0' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} style={{
                      borderBottom: '1px solid #e9ecef',
                      transition: 'background 0.3s ease'
                    }} onMouseOver={(e) => e.currentTarget.style.background = '#f8f9fa'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '12px', fontWeight: '600', color: '#667eea' }}>{item.item_code}</td>
                      <td style={{ padding: '12px' }}>{item.item_name}</td>
                      <td style={{ padding: '12px' }}>{item.category}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span style={{ color: item.quantity_available > 0 ? '#40c057' : '#ff6b6b' }}>
                          {item.quantity_available}/{item.quantity_total}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span className={`badge badge-${item.condition === 'excellent' ? 'success' : item.condition === 'good' ? 'info' : item.condition === 'fair' ? 'warning' : 'danger'}`}>
                          {item.condition}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span className={`badge badge-${item.status === 'active' ? 'success' : 'danger'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleOpenModal(item)}
                            className="btn btn-info"
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="btn btn-danger"
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {items.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
                  No items found
                </div>
              )}
            </div>
          )}
        </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#5B8DEF] to-[#0063F7] text-white px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                {editingId ? (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Item
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add New Item
                  </>
                )}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <form onSubmit={handleSaveItem} className="space-y-5">
                {/* Item Code */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Item Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    value={formData.item_code}
                    onChange={(e) => setFormData({ ...formData, item_code: e.target.value })}
                    placeholder="e.g., TOOL-001"
                    required
                    disabled={!!editingId}
                  />
                  {editingId && (
                    <p className="text-xs text-gray-500 mt-1">Item code cannot be changed</p>
                  )}
                </div>

                {/* Item Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Item Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={formData.item_name}
                    onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                    placeholder="Enter item name"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="Enter item description"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Tools, Equipment, Supplies"
                    required
                  />
                </div>

                {/* Quantity and Condition */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      value={formData.quantity_total}
                      onChange={(e) => setFormData({ ...formData, quantity_total: e.target.value })}
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Condition
                    </label>
                    <select
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                      value={formData.condition}
                      onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    >
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="poor">Poor</option>
                      <option value="damaged">Damaged</option>
                    </select>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Room 101, Storage A"
                  />
                </div>

                {/* Unit Price and Acquisition Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Unit Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
                      <input
                        type="number"
                        className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        value={formData.unit_price}
                        onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Acquisition Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      value={formData.acquisition_date}
                      onChange={(e) => setFormData({ ...formData, acquisition_date: e.target.value })}
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSaveItem}
                className="px-6 py-2.5 bg-gradient-to-r from-[#5B8DEF] to-[#0063F7] text-white rounded-lg hover:shadow-lg transition-all font-medium"
              >
                {editingId ? 'Update Item' : 'Save Item'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

