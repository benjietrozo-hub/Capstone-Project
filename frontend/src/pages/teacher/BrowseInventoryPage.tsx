import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Table } from '../../components/common/Table';
import { Button, FormField } from '../../components/common/FormElements';
import { PageLoader } from '../../components/common/Loader';
import { Modal } from '../../components/common/Modal';
import { teacherAPI } from '../../api';
import { formatCurrency } from '../../utils/formatters';
import { toast } from '@/hooks/use-toast';
import NavHeader from '@/components/NavHeader';
import NotificationProfile from '@/components/NotificationProfile';

interface InventoryItem {
  id: number;
  item_code: string;
  item_name: string;
  description?: string;
  category: string;
  quantity_available: number;
  quantity_total: number;
  condition: string;
  location?: string;
  unit_price?: number;
}

interface RequestForm {
  quantity: number;
  purpose: string;
  expected_return_date: string;
}

export function BrowseInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card'); // Default to card view
  const [requestForm, setRequestForm] = useState<RequestForm>({
    quantity: 1,
    purpose: '',
    expected_return_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
  });

  // Sorting state variables
  const [sortBy, setSortBy] = useState('item_name');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, [search, category, sortBy, sortOrder]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await teacherAPI.getInventory({
        search,
        category,
        available_only: true,
        per_page: 50,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      setItems(response.data.data);
    } catch (error) {
      console.error('Failed to load inventory:', error);
      // Don't show error toast to avoid confusing users after successful operations
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await teacherAPI.getInventoryCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to load categories');
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    
    // 🔍 Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("🔥 NO TOKEN - User not logged in");
      toast({
        title: 'Authentication Required',
        description: 'Please login to submit borrow requests.',
        variant: 'destructive',
        duration: 5000,
      });
      return;
    }
    
    console.log("🔍 User Token:", token ? 'Present' : 'Missing');

    // Test API connectivity first
    try {
      console.log("Testing API connectivity...");
      const testResponse = await teacherAPI.getBorrowRequests({ per_page: 1 });
      console.log("API Test Response:", testResponse);
    } catch (testError) {
      console.error("API Test Failed:", testError);
      toast({
        title: 'API Connection Error',
        description: 'Cannot connect to the server. Please check your connection.',
        variant: 'destructive',
        duration: 5000,
      });
      return;
    }

    try {
      // 🔍 DEBUG: Log the data being sent
      const requestData = {
        item_id: selectedItem.id,
        ...requestForm
      };
      console.log("🔍 Sending request data:", requestData);
      console.log("🔍 Selected item:", selectedItem);
      console.log("🔍 Request form:", requestForm);
      console.log("🔍 Today's date:", new Date().toISOString().split('T')[0]);
      
      // Step 1: Submit borrow request
      const response = await teacherAPI.createBorrowRequest(requestData);
      
      // 🔥 IMPORTANT CHECK - Verify success response format
      console.log("🔍 API Response:", response);
      
      if (response?.data?.success) {
        // Success message for borrow request submission
        toast({
          title: 'Request Submitted Successfully!',
          description: response?.data?.message || `Your borrow request for ${selectedItem.item_name} has been submitted. Please wait for admin approval.`,
          duration: 5000,
        });
        
        // Close modal and reset form
        setShowRequestModal(false);
        setRequestForm({ 
          quantity: 1, 
          purpose: '', 
          expected_return_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
        
        // Step 2: Refresh inventory list (separate from main success)
        await fetchItems(); // Silent refresh - no error toast shown
      } else {
        throw new Error(response?.data?.message || "Unknown error occurred");
      }
      
    } catch (error: any) {
      // 🔍 DEBUG LOG - Add detailed error logging
      console.error("🚨 FULL ERROR:", error);
      console.error("🚨 Error Response:", error.response);
      console.error("🚨 Error Data:", error.response?.data);
      console.error("🚨 Error Status:", error.response?.status);
      console.error("🚨 Error Code:", error.code);
      
      // Check specific error types
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        console.error("🔥 NETWORK ERROR - Backend might be down");
        toast({
          title: 'Network Error',
          description: 'Cannot connect to server. Please check if backend is running.',
          variant: 'destructive',
          duration: 5000,
        });
      } else if (error.response?.status === 401) {
        console.error("🔥 AUTH ERROR - User not logged in");
        toast({
          title: 'Authentication Error',
          description: 'Please login to submit borrow requests.',
          variant: 'destructive',
          duration: 5000,
        });
      } else if (error.response?.status === 422) {
        console.error("🔥 VALIDATION ERROR:", error.response?.data);
        toast({
          title: 'Validation Error',
          description: error.response?.data?.message || 'Please check your input.',
          variant: 'destructive',
          duration: 5000,
        });
      } else {
        // Error message for borrow request submission only
        toast({
          title: 'Failed to Submit Request',
          description: 
            error.response?.data?.message || 
            error.message || 
            'An error occurred while submitting your request. Please try again.',
          variant: 'destructive',
          duration: 5000,
        });
      }
    }
  };

  const columns = [
    { key: 'item_code', label: 'Code', width: '80px' },
    { key: 'item_name', label: 'Name' },
    { key: 'category', label: 'Category' },
    {
      key: 'quantity_available',
      label: 'Available',
      render: (value: number) => value > 0 ? <span className="text-green-600 font-semibold">{value}</span> : <span className="text-red-600">0</span>,
    },
    {
      key: 'unit_price',
      label: 'Unit Price',
      render: (value: number) => formatCurrency(value),
    },
    {
      key: 'condition',
      label: 'Condition',
      render: (value: string) => <StatusBadge label={value} status={value} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: InventoryItem) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedItem(row);
              setShowDetailModal(true);
            }}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
          >
            Details
          </button>
          {row.quantity_available > 0 && (
            <button
              onClick={() => {
                setSelectedItem(row);
                setRequestForm({
                  quantity: Math.min(1, row.quantity_available),
                  purpose: '',
                  expected_return_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                });
                setShowRequestModal(true);
              }}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
            >
              Borrow
            </button>
          )}
        </div>
      ),
    },
  ];

  const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  return (
    <div>
      <NavHeader 
        title="Browse Inventory" 
        subtitle="View and request available equipment"
        showBackButton={true}
        showHomeButton={true}
        showMenuButton={true}
      >
        <NotificationProfile 
          currentUser={currentUser}
        />
      </NavHeader>
      
      {/* Mobile Subtitle */}
      <div className="sm:hidden bg-white border-b px-4 py-3">
        <h1 className="text-lg font-bold text-gray-900 mb-1">Browse Inventory</h1>
        <p className="text-sm text-gray-600">View and request available equipment</p>
      </div>
      
      <div className="p-6">
        <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
              ...categories.map(c => ({ value: c, label: c }))
            ]}
          />
          <FormField
            label="Sort By"
            type="select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={[
              { value: 'item_name', label: 'Item Name (A-Z)' },
              { value: 'acquisition_year', label: 'Acquisition Year (Newest First)' },
              { value: 'name_year', label: 'Name (A-Z)' },
              { value: 'category', label: 'Category' },
              { value: 'quantity_available', label: 'Available Quantity' }
            ]}
          />
          <FormField
            label="Order"
            type="select"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            options={[
              { value: 'asc', label: 'Ascending' },
              { value: 'desc', label: 'Descending' }
            ]}
          />
          <div className="pt-6">
            {/* View Mode Toggle */}
            <div className="flex gap-1 border rounded-lg p-1 bg-gray-50 w-fit">
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
          </div>
        </div>

        {viewMode === 'card' ? (
          // Card View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item) => (
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
                  <StatusBadge label={item.condition} status={item.condition} />
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
                  {item.location && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">{item.location}</span>
                    </div>
                  )}
                  {item.unit_price && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-medium">{formatCurrency(item.unit_price)}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 pt-3 border-t">
                  <button
                    onClick={() => {
                      setSelectedItem(item);
                      setShowDetailModal(true);
                    }}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    Details
                  </button>
                  {item.quantity_available > 0 && (
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setRequestForm({
                          quantity: Math.min(1, item.quantity_available),
                          purpose: '',
                          expected_return_date: '',
                        });
                        setShowRequestModal(true);
                      }}
                      className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 transition-colors"
                    >
                      Borrow
                    </button>
                  )}
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                No items found
              </div>
            )}
          </div>
        ) : (
          // List View
          <Table columns={columns} data={items} loading={loading} />
        )}
      </Card>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Item Details"
      >
        {selectedItem && (
          <div className="space-y-4">
            <div>
              <label className="font-semibold text-gray-700">Item Code</label>
              <p className="text-gray-600">{selectedItem.item_code}</p>
            </div>
            <div>
              <label className="font-semibold text-gray-700">Item Name</label>
              <p className="text-gray-600">{selectedItem.item_name}</p>
            </div>
            <div>
              <label className="font-semibold text-gray-700">Description</label>
              <p className="text-gray-600">{selectedItem.description}</p>
            </div>
            <div>
              <label className="font-semibold text-gray-700">Category</label>
              <p className="text-gray-600">{selectedItem.category}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-gray-700">Available</label>
                <p className="text-gray-600">{selectedItem.quantity_available} / {selectedItem.quantity_total}</p>
              </div>
              <div>
                <label className="font-semibold text-gray-700">Condition</label>
                <StatusBadge label={selectedItem.condition} status={selectedItem.condition} />
              </div>
            </div>
            <div>
              <label className="font-semibold text-gray-700">Location</label>
              <p className="text-gray-600">{selectedItem.location}</p>
            </div>
            <div>
              <label className="font-semibold text-gray-700">Unit Price</label>
              <p className="text-gray-600">{selectedItem.unit_price ? formatCurrency(selectedItem.unit_price) : 'N/A'}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Request Modal */}
      <Modal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        title={`Borrow Request - ${selectedItem?.item_name}`}
      >
        <form onSubmit={handleSubmitRequest} className="space-y-4">
          <div>
            <label className="font-semibold text-gray-700">Item Name</label>
            <p className="text-gray-600 bg-gray-50 p-2 rounded">{selectedItem?.item_name}</p>
          </div>
          <FormField
            label="Quantity"
            type="number"
            value={requestForm.quantity}
            onChange={(e) => setRequestForm({ ...requestForm, quantity: parseInt(e.target.value) || 1 })}
            required
            min="1"
          />
          <FormField
            label="Purpose"
            type="textarea"
            value={requestForm.purpose}
            onChange={(e) => setRequestForm({ ...requestForm, purpose: e.target.value })}
            placeholder="State your purpose for borrowing this item"
          />
          <FormField
            label="Expected Return Date"
            type="date"
            value={requestForm.expected_return_date}
            onChange={(e) => setRequestForm({ ...requestForm, expected_return_date: e.target.value })}
            required
            min={new Date().toISOString().split('T')[0]}
          />
          <div className="flex gap-4">
            <Button type="submit">Submit Request</Button>
            <Button variant="secondary" onClick={() => setShowRequestModal(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
      </div>
    </div>
  );
}

