import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button, FormField } from '../../components/common/FormElements';
import { Modal } from '../../components/common/Modal';
import { teacherAPI } from '../../api';
import { toast } from '@/hooks/use-toast';
import NavHeader from '@/components/NavHeader';
import NotificationProfile from '@/components/NotificationProfile';
import { Package, Layers } from 'lucide-react';

interface ItemCategory {
  id: number;
  category_name: string;
  description: string;
  category_image: string | null;
  total_items: number;
  available_items: number;
  inventory_items?: Array<{
    id: number;
    item_name: string;
    serial_number: string;
    property_number: string | null;
    condition: string;
    status: string;
  }>;
}

interface RequestForm {
  quantity: number;
  purpose: string;
  expected_return_date: string;
}

export function BrowseInventoryPage() {
  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('category_name');
  const [sortOrder, setSortOrder] = useState('asc');
  
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [requestForm, setRequestForm] = useState<RequestForm>({
    quantity: 1,
    purpose: '',
    expected_return_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
  });

  const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    fetchCategories();
  }, [search, sortBy, sortOrder]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await teacherAPI.getInventory({
        search,
        sort_by: sortBy,
        sort_order: sortOrder,
        per_page: 50,
      });
      setCategories(response.data.data);
    } catch (error) {
      console.error('Failed to load inventory categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (id: number) => {
    try {
      setLoadingDetails(true);
      setShowDetailsModal(true);
      const response = await teacherAPI.getCategoryDetails(id);
      setSelectedCategory(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load category details',
        variant: 'destructive',
      });
      setShowDetailsModal(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: 'Authentication Required',
        description: 'Please login to submit borrow requests.',
        variant: 'destructive',
        duration: 5000,
      });
      return;
    }

    try {
      const requestData = {
        category_id: selectedCategory.id,
        ...requestForm
      };
      
      const response = await teacherAPI.createBorrowRequest(requestData);
      
      if (response?.data?.success) {
        toast({
          title: 'Request Submitted Successfully!',
          description: response?.data?.message || `Your borrow request for ${selectedCategory.category_name} has been submitted. Please wait for admin approval.`,
          duration: 5000,
        });
        
        setShowRequestModal(false);
        setRequestForm({ 
          quantity: 1, 
          purpose: '', 
          expected_return_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
        
        await fetchCategories();
      } else {
        throw new Error(response?.data?.message || "Unknown error occurred");
      }
      
    } catch (error: any) {
      if (error.response?.status === 422) {
        toast({
          title: 'Validation Error',
          description: error.response?.data?.message || 'Please check your input.',
          variant: 'destructive',
          duration: 5000,
        });
      } else {
        toast({
          title: 'Failed to Submit Request',
          description: error.response?.data?.message || 'An error occurred while submitting your request. Please try again.',
          variant: 'destructive',
          duration: 5000,
        });
      }
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <NavHeader 
        title="Browse Inventory" 
        subtitle="View and request available equipment categories"
        showBackButton={true}
        showHomeButton={true}
        showMenuButton={true}
      >
        <NotificationProfile currentUser={currentUser} />
      </NavHeader>
      
      <div className="sm:hidden bg-white border-b px-4 py-3">
        <h1 className="text-lg font-bold text-gray-900 mb-1">Browse Inventory</h1>
        <p className="text-sm text-gray-600">View and request available equipment categories</p>
      </div>
      
      <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <Card className="p-4 sm:p-6 bg-white rounded-2xl shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <FormField
              label="Search Categories"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="e.g. Projectors, Laptops..."
            />
            <FormField
              label="Sort By"
              type="select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={[
                { value: 'category_name', label: 'Category Name' },
                { value: 'available_items', label: 'Available Quantity' }
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
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-500">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-100">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No Categories Found</h3>
              <p className="text-gray-500 mt-1">Check back later for available inventory.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((cat) => (
                <div 
                  key={cat.id} 
                  className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col cursor-pointer group"
                  onClick={() => handleViewDetails(cat.id)}
                >
                  <div className="h-40 bg-gray-100 relative overflow-hidden flex items-center justify-center">
                    {cat.category_image ? (
                      <img 
                        src={`http://localhost:8000/storage/${cat.category_image}`} 
                        alt={cat.category_name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Layers className="w-12 h-12 text-gray-300" />
                    )}
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{cat.category_name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                      {cat.description || 'No description provided.'}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4 pt-4 border-t border-gray-100">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 font-medium uppercase">Available</span>
                        <span className={`text-lg font-bold ${cat.available_items > 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {cat.available_items}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-gray-500 font-medium uppercase">Total</span>
                        <span className="text-lg font-bold text-gray-700">{cat.total_items}</span>
                      </div>
                    </div>

                    <Button 
                      className="w-full"
                      disabled={cat.available_items === 0}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent opening details modal
                        setSelectedCategory(cat);
                        setRequestForm({
                          quantity: 1,
                          purpose: '',
                          expected_return_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        });
                        setShowRequestModal(true);
                      }}
                    >
                      {cat.available_items > 0 ? 'Request to Borrow' : 'Out of Stock'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Request Modal */}
        <Modal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          title={`Borrow Request - ${selectedCategory?.category_name}`}
        >
          <form onSubmit={handleSubmitRequest} className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
              <p className="text-sm text-blue-800">
                You are requesting units from the <strong>{selectedCategory?.category_name}</strong> category. 
                The administrator will allocate specific serial numbers upon approval.
              </p>
            </div>
            
            <FormField
              label={`Quantity (Max: ${selectedCategory?.available_items})`}
              type="number"
              value={requestForm.quantity.toString()}
              onChange={(e) => setRequestForm({ ...requestForm, quantity: parseInt(e.target.value) || 1 })}
              required
              min="1"
              max={selectedCategory?.available_items?.toString()}
            />
            <FormField
              label="Purpose"
              type="textarea"
              value={requestForm.purpose}
              onChange={(e) => setRequestForm({ ...requestForm, purpose: e.target.value })}
              placeholder="State your purpose for borrowing this equipment"
            />
            <FormField
              label="Expected Return Date"
              type="date"
              value={requestForm.expected_return_date}
              onChange={(e) => setRequestForm({ ...requestForm, expected_return_date: e.target.value })}
              required
              min={new Date().toISOString().split('T')[0]}
            />
            <div className="flex gap-4 pt-4">
              <Button type="button" variant="secondary" onClick={() => setShowRequestModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                Submit Request
              </Button>
            </div>
          </form>
        </Modal>

        {/* Details Modal */}
        <Modal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            if (!showRequestModal) setSelectedCategory(null);
          }}
          title={`Category Details: ${selectedCategory?.category_name || 'Loading...'}`}
        >
          {loadingDetails ? (
            <div className="py-10 text-center text-gray-500">Loading details...</div>
          ) : selectedCategory && (
            <div className="space-y-6">
              <div className="flex gap-6 items-start">
                <div className="w-32 h-32 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {selectedCategory.category_image ? (
                    <img 
                      src={`http://localhost:8000/storage/${selectedCategory.category_image}`} 
                      alt={selectedCategory.category_name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Layers className="w-12 h-12 text-gray-300" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedCategory.category_name}</h3>
                  <p className="text-gray-600 mt-2">{selectedCategory.description || 'No description available.'}</p>
                  <div className="flex gap-4 mt-4">
                    <div className="bg-green-50 px-3 py-1 rounded-full border border-green-100">
                      <span className="text-xs text-green-600 font-bold uppercase">Available: {selectedCategory.available_items}</span>
                    </div>
                    <div className="bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                      <span className="text-xs text-gray-600 font-bold uppercase">Total: {selectedCategory.total_items}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-500" />
                  Available Units ({selectedCategory.inventory_items?.length || 0})
                </h4>
                
                {(!selectedCategory.inventory_items || selectedCategory.inventory_items.length === 0) ? (
                  <div className="p-8 bg-gray-50 rounded-xl text-center text-gray-500 italic">
                    No individual units are currently available for this category.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {selectedCategory.inventory_items.map((item) => (
                      <div key={item.id} className="p-3 bg-white border border-gray-200 rounded-xl flex justify-between items-center hover:border-blue-300 transition-colors">
                        <div>
                          <p className="font-mono text-sm font-bold text-blue-600">{item.serial_number}</p>
                          <p className="text-xs text-gray-500">Property #: {item.property_number || 'N/A'}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            item.condition === 'excellent' ? 'bg-green-100 text-green-700' :
                            item.condition === 'good' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {item.condition}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <Button 
                  variant="secondary" 
                  onClick={() => setShowDetailsModal(false)} 
                  className="flex-1"
                >
                  Close
                </Button>
                <Button 
                  disabled={selectedCategory.available_items === 0}
                  className="flex-1"
                  onClick={() => {
                    setShowDetailsModal(false);
                    setShowRequestModal(true);
                  }}
                >
                  Request Units
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
