import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button, FormField } from '../../components/common/FormElements';
import { Modal } from '../../components/common/Modal';
import { teacherAPI } from '../../api';
import { toast } from '@/hooks/use-toast';
import NavHeader from '@/components/NavHeader';
import NotificationProfile from '@/components/NotificationProfile';
import { Package, Layers, Search, Filter, Calendar, Clock, AlertCircle, ArrowRight, ArrowLeft, X, Check, FileText, Image as ImageIcon, Plus, Trash2, Folder, LayoutGrid, List, Info, ClipboardCheck, Eye, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { STORAGE_BASE_URL } from '../../utils/constants';
import RequestDistributionModal from '@/components/teacher/RequestDistributionModal';

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
    item_image: string | null;
    condition: string;
    status: string;
    pending_requests_count?: number;
  }>;
}

interface RequestForm {
  inventory_item_id?: number;
  quantity: number;
  purpose: string;
  expected_return_date: string;
}

export function BrowseInventoryPage() {
  const [viewMode, setViewMode] = useState<'main' | 'categories' | 'items'>('main');
  const [parentCategories, setParentCategories] = useState<any[]>([]);
  const [selectedParentCategory, setSelectedParentCategory] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<'card' | 'list'>('card');
  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('category_name');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Item-level filtering and pagination
  const [itemSearch, setItemSearch] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [itemsPage, setItemsPage] = useState(1);
  
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | null>(null);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const calculateSuggestedDate = (qty: number) => {
    const days = Math.max(1, qty * 3); // Suggest 3 days per item
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  };

  const [requestForm, setRequestForm] = useState<RequestForm>({
    quantity: 1,
    purpose: '',
    expected_return_date: calculateSuggestedDate(1),
  });
  const [requestType, setRequestType] = useState<'borrow' | 'distribution'>('borrow');
  const [showPolymorphicRequestModal, setShowPolymorphicRequestModal] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [perPage, setPerPage] = useState(12);
  const [totalItems, setTotalItems] = useState(0);


  const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    if (viewMode === 'main') {
      fetchParentCategories();
    } else if (viewMode === 'categories') {
      fetchCategories();
    }
  }, [search, sortBy, sortOrder, viewMode, selectedParentCategory, currentPage, perPage]);

  const fetchParentCategories = async () => {
    try {
      setLoading(true);
      const response = await teacherAPI.getInventoryParentCategories();
      setParentCategories(response.data);
    } catch (error) {
      console.error('Failed to load parent categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await teacherAPI.getInventory({
        search,
        sort_by: sortBy,
        sort_order: sortOrder,
        parent_category: selectedParentCategory,
        page: currentPage,
        per_page: perPage,
      });
      setCategories(response.data.data);
      setTotalItems(response.data.total || 0);
      setLastPage(response.data.last_page || 1);
    } catch (error) {
      console.error('Failed to load inventory categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCategoryItems = async (id: number) => {
    try {
      setLoadingDetails(true);
      setViewMode('items');
      setItemSearch('');
      setItemsPage(1);
      const response = await teacherAPI.getCategoryDetails(id);
      setSelectedCategory(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load category details',
        variant: 'destructive',
      });
      setViewMode('categories');
    } finally {
      setLoadingDetails(false);
    }
  };

  
  const handleOpenDistributionModal = (cat: ItemCategory, item?: any) => {
    setSelectedCategory(cat);
    setSelectedItem(item || null);
    setShowPolymorphicRequestModal(true);
  };

  const handleOpenBorrowModal = (cat: ItemCategory, item?: any) => {
    setSelectedCategory(cat);
    setSelectedItem(item || null);
    setRequestType('borrow');
    const initialQty = 1;
    setRequestForm({
      inventory_item_id: item?.id,
      quantity: initialQty,
      purpose: '',
      expected_return_date: calculateSuggestedDate(initialQty),
    });
    setShowRequestModal(true);
  };

  
  const handleOpenDetailsModal = (item: any) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
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
      
      const response = requestType === 'borrow' 
        ? await teacherAPI.createBorrowRequest(requestData)
        : await teacherAPI.createDistributionRequest(requestData);
      
      if (response?.data?.success) {
        toast({
          title: 'Request Submitted Successfully!',
          description: response?.data?.message || `Your ${requestType} request for ${selectedItem?.item_name || selectedCategory.category_name} has been submitted. Please wait for admin approval.`,
          duration: 5000,
        });

        
        setShowRequestModal(false);
        setSelectedItem(null);
        setRequestForm({ 
          quantity: 1, 
          purpose: '', 
          expected_return_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
        
        if (viewMode === 'categories') {
          await fetchCategories();
        }
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

  // Client-side items filtering and pagination
  const filteredItems = selectedCategory?.inventory_items?.filter(item => 
    item.item_name.toLowerCase().includes(itemSearch.toLowerCase()) ||
    item.serial_number.toLowerCase().includes(itemSearch.toLowerCase()) ||
    (item.property_number && item.property_number.toLowerCase().includes(itemSearch.toLowerCase()))
  ) || [];
  
  const totalFilteredItems = filteredItems.length;
  const lastItemPage = Math.ceil(totalFilteredItems / itemsPerPage) || 1;
  const paginatedItems = filteredItems.slice((itemsPage - 1) * itemsPerPage, itemsPage * itemsPerPage);

  return (
    <div className="bg-gray-50 min-h-screen pb-10">
      <NavHeader 
        title={viewMode === 'main' ? "Browse Inventory" : viewMode === 'categories' ? selectedParentCategory || "Category Kinds" : selectedCategory?.category_name || "Category Items"} 
        subtitle={viewMode === 'main' ? "View and request available equipment categories" : viewMode === 'categories' ? "View available kinds in this category" : "View specific units available in this category"}
        showBackButton={viewMode !== 'main'}
        onBack={() => { if(viewMode === 'items') setViewMode('categories'); else setViewMode('main'); }}
        showHomeButton={true}
        showMenuButton={true}
      >
        <NotificationProfile currentUser={currentUser} />
      </NavHeader>
      
      <div className="sm:hidden bg-white border-b px-4 py-3">
        <h1 className="text-lg font-bold text-gray-900 mb-1">
          {viewMode === 'categories' ? "Browse Inventory" : selectedCategory?.category_name}
        </h1>
        <p className="text-sm text-gray-600">
          {viewMode === 'categories' ? "View and request available equipment categories" : "View specific units available"}
        </p>
      </div>
      
      <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
        
        
        {/* --- MAIN CATEGORIES VIEW --- */}
        {viewMode === 'main' && (
          <Card className="p-4 sm:p-6 bg-white rounded shadow-sm border border-gray-100">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="font-medium">Loading categories...</p>
              </div>
            ) : parentCategories.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-sm border border-gray-100">
                <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No Categories Found</h3>
                <p className="text-gray-500 mt-1">Check back later for available inventory.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {parentCategories.map((parent) => (
                  <div 
                    key={parent.parent_category} 
                    className="bg-white rounded overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col cursor-pointer group hover:border-blue-300"
                    onClick={() => {
                      setSelectedParentCategory(parent.parent_category);
                      setViewMode('categories');
                    }}
                  >
                    <div className="h-40 bg-gray-100 relative overflow-hidden flex items-center justify-center">
                      <Layers className="w-12 h-12 text-gray-300 group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <span className="text-white font-medium text-sm flex items-center gap-2">
                          Browse Kinds <ArrowLeft className="w-4 h-4 rotate-180" />
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{parent.parent_category}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                        Migrated category for {parent.parent_category}
                      </p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">AVAILABLE</span>
                          <span className="text-lg font-black text-green-600">{parent.kind_count}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">TOTAL UNITS</span>
                          <span className="text-lg font-black text-gray-700">{parent.item_count || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* --- CATEGORIES VIEW --- */}
        {viewMode === 'categories' && (
          <Card className="p-4 sm:p-6 bg-white rounded shadow-sm border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="font-medium">Loading categories...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-sm border border-gray-100">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No Categories Found</h3>
                <p className="text-gray-500 mt-1">Check back later for available inventory.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {categories.map((cat) => (
                    <div 
                      key={cat.id} 
                      className={`bg-white rounded overflow-hidden border border-gray-200 shadow-sm transition-all flex flex-col cursor-pointer group ${
                        cat.available_items > 0 
                          ? 'hover:shadow-md hover:border-blue-300' 
                          : 'opacity-80 grayscale-[0.3] cursor-not-allowed bg-slate-50 border-slate-200'
                      }`}
                      onClick={() => cat.available_items > 0 ? handleViewCategoryItems(cat.id) : toast({ title: "Currently Unavailable", description: "All units in this category are currently borrowed or distributed.", variant: "destructive" })}
                    >
                      <div className="h-40 bg-gray-100 relative overflow-hidden flex items-center justify-center">
                        {cat.category_image ? (
                          <img 
                            src={`${STORAGE_BASE_URL}/${cat.category_image}`} 
                            alt={cat.category_name} 
                            className={`w-full h-full object-cover transition-transform duration-500 ${cat.available_items > 0 ? 'group-hover:scale-105' : ''}`}
                          />
                        ) : (
                          <Layers className="w-12 h-12 text-gray-300" />
                        )}
                        
                        {cat.available_items > 0 ? (
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                            <span className="text-white font-medium text-sm flex items-center gap-2">
                              View Units <ArrowLeft className="w-4 h-4 rotate-180" />
                            </span>
                          </div>
                        ) : (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-sm shadow-xl">
                              All Units Out
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-5 flex-1 flex flex-col">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{cat.category_name}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                          {cat.description || 'No description provided.'}
                        </p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Available</span>
                            <span className={`text-lg font-black ${cat.available_items > 0 ? 'text-green-600' : 'text-red-500'}`}>
                              {cat.available_items}
                            </span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Units</span>
                            <span className="text-lg font-black text-gray-700">{cat.total_items}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {!loading && viewMode === 'categories' && totalItems > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-gray-500 font-medium">
                        Showing <span className="font-bold text-gray-900">{categories.length}</span> of <span className="font-bold text-gray-900">{totalItems}</span> categories
                      </div>
                      <div className="w-40">
                        <select
                          value={perPage}
                          onChange={(e) => {
                            setPerPage(parseInt(e.target.value));
                            setCurrentPage(1);
                          }}
                          className="w-full px-3 py-2 text-xs font-bold border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          <option value={5}>5 per page</option>
                          <option value={10}>10 per page</option>
                          <option value={20}>20 per page</option>
                          <option value={50}>50 per page</option>
                          <option value={totalItems}>All ({totalItems})</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(1)}
                        className="h-9 w-9 p-0 flex items-center justify-center"
                      >
                        <ChevronsLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        className="h-9 w-9 p-0 flex items-center justify-center"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, lastPage) }, (_, i) => {
                          let pageNum;
                          if (lastPage <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= lastPage - 2) {
                            pageNum = lastPage - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? 'primary' : 'ghost'}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className={`h-9 w-9 p-0 text-xs font-bold ${currentPage === pageNum ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={currentPage === lastPage}
                        onClick={() => setCurrentPage(prev => Math.min(lastPage, prev + 1))}
                        className="h-9 w-9 p-0 flex items-center justify-center"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={currentPage === lastPage}
                        onClick={() => setCurrentPage(lastPage)}
                        className="h-9 w-9 p-0 flex items-center justify-center"
                      >
                        <ChevronsRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </Card>
        )}

        {/* --- ITEMS VIEW (PAGE) --- */}
        {viewMode === 'items' && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            {/* Category Header Card */}
            <div className="bg-white rounded-sm overflow-hidden shadow-md border border-gray-100 flex flex-col md:flex-row">
              <div className="w-full md:w-56 h-56 md:h-auto bg-gray-100 flex items-center justify-center shrink-0">
                {selectedCategory?.category_image ? (
                  <img 
                    src={`${STORAGE_BASE_URL}/${selectedCategory.category_image}`} 
                    alt={selectedCategory.category_name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Layers className="w-16 h-16 text-gray-300" />
                )}
              </div>
              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-blue-100">Category</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">{selectedCategory?.category_name}</h2>
                </div>
                <p className="text-gray-600 mb-6 max-w-3xl text-sm sm:text-base leading-relaxed">
                  {selectedCategory?.description || "No description available for this category."}
                </p>
                
                <div className="flex flex-wrap items-center gap-4 sm:gap-8">
                  <div className="bg-green-50 px-5 py-3 rounded border border-green-100 flex items-center gap-4">
                    <div className="p-2 bg-green-100 rounded-sm">
                      <Package className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-black text-green-600 uppercase tracking-widest">Available</span>
                      <span className="text-2xl font-black text-green-700 leading-none">{selectedCategory?.available_items}</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 px-5 py-3 rounded border border-gray-200 flex items-center gap-4">
                    <div className="p-2 bg-gray-200 rounded-sm">
                      <Layers className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Units</span>
                      <span className="text-2xl font-black text-gray-700 leading-none">{selectedCategory?.total_items}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Units Display Control */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded border border-gray-100 shadow-sm gap-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded">
                  <Package className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-800">
                  Serialized Units ({totalFilteredItems})
                </h3>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, SN, property no..."
                    value={itemSearch}
                    onChange={(e) => {
                      setItemSearch(e.target.value);
                      setItemsPage(1);
                    }}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center bg-gray-100 p-1 rounded-sm w-full sm:w-auto justify-center">
                  <button
                    onClick={() => setDisplayMode('card')}
                    className={`flex flex-1 sm:flex-none justify-center items-center gap-2 px-3 py-1.5 rounded text-xs font-bold transition-all ${
                      displayMode === 'card' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                    Cards
                  </button>
                  <button
                    onClick={() => setDisplayMode('list')}
                    className={`flex flex-1 sm:flex-none justify-center items-center gap-2 px-3 py-1.5 rounded text-xs font-bold transition-all ${
                      displayMode === 'list' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <List className="w-4 h-4" />
                    List
                  </button>
                </div>
              </div>
            </div>

            {loadingDetails ? (
              <div className="py-20 text-center text-gray-500 flex flex-col items-center">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p>Loading available units...</p>
              </div>
            ) : (!selectedCategory?.inventory_items || selectedCategory.inventory_items.length === 0) ? (
              <div className="p-20 bg-white rounded-sm border border-gray-100 text-center flex flex-col items-center shadow-sm">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Package className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No individual units available</h3>
                <p className="text-gray-500 max-w-sm">
                  There are no specific units currently registered or available for individual viewing in this category.
                </p>
              </div>
            ) : displayMode === 'card' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedItems.map((item) => (
                  <div key={item.id} className="bg-white p-5 rounded border border-gray-100 shadow-sm hover:border-blue-300 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-full h-40 bg-gray-100 rounded-sm overflow-hidden border border-gray-100 flex items-center justify-center relative">
                          {item.item_image ? (
                            <img 
                              src={`${STORAGE_BASE_URL}/${item.item_image}`} 
                              alt={item.item_name} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <Package className="w-10 h-10 text-gray-300" />
                          )}
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Serial Number</p>
                          <p className="font-mono text-sm font-bold text-blue-600">{item.serial_number}</p>
                        </div>
                        <StatusBadge label={item.status} status={item.status} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Property Number</p>
                        <p className="text-sm font-medium text-gray-700">{item.property_number || 'Not Assigned'}</p>
                      </div>

                      {/* Request Indicator */}
                      {item.pending_requests_count !== undefined && item.pending_requests_count > 0 && (
                        <div className="bg-amber-50 border border-amber-100 rounded p-2 flex items-center gap-2">
                          <Info className="w-3 h-3 text-amber-600" />
                          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-tight">Currently Requested by someone</span>
                        </div>
                      )}

                        <div className="pt-3 border-t border-gray-50 flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Condition</span>
                            <span className="text-sm font-bold text-gray-700 capitalize">{item.condition}</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <Button 
                              className="text-[10px] h-9 font-black uppercase tracking-widest flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                              disabled={item.status !== 'available' || (item.pending_requests_count !== undefined && item.pending_requests_count > 0)}
                              onClick={() => selectedCategory && handleOpenBorrowModal(selectedCategory, item)}
                            >
                              <ClipboardCheck className="w-3.5 h-3.5" />
                              Borrow
                            </Button>
                            <Button 
                              className="text-[10px] h-9 font-black uppercase tracking-widest flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
                              disabled={item.status !== 'available' || (item.pending_requests_count !== undefined && item.pending_requests_count > 0)}
                              onClick={() => selectedCategory && handleOpenDistributionModal(selectedCategory, item)}
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Distribute
                            </Button>
                          </div>

                          
                          <Button 
                            variant="secondary"
                            className="w-full text-xs h-9 font-bold flex items-center gap-2 border-gray-200"
                            onClick={() => handleOpenDetailsModal(item)}
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </Button>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-sm border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Unit Info</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Serial Number</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Property Number</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Condition</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-4 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {paginatedItems.map((item) => (
                        <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-100 shrink-0">
                                {item.item_image ? (
                                  <img src={`${STORAGE_BASE_URL}/${item.item_image}`} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <Package className="w-4 h-4 text-gray-400" />
                                )}
                              </div>
                              <div className="flex flex-col">
                                <div className="font-bold text-gray-900">{item.item_name}</div>
                                <div className="flex gap-2 items-center mt-1">
                                  {item.pending_requests_count !== undefined && item.pending_requests_count > 0 && (
                                    <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-black uppercase tracking-wider flex items-center gap-1">
                                      <Info className="w-2 h-2" /> Requested
                                    </span>
                                  )}
                                  {item.status === 'borrowed' && (
                                    <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">Already Borrowed</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-mono text-sm font-bold text-blue-600">{item.serial_number}</span>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-700">
                            {item.property_number || 'N/A'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider ${
                              item.condition === 'excellent' ? 'bg-green-100 text-green-700' :
                              item.condition === 'good' ? 'bg-blue-100 text-blue-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {item.condition}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge label={item.status} status={item.status} />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="secondary"
                                className="text-[9px] font-black uppercase tracking-widest h-8 px-3"
                                disabled={item.status !== 'available' || (item.pending_requests_count !== undefined && item.pending_requests_count > 0)}
                                onClick={() => selectedCategory && handleOpenBorrowModal(selectedCategory, item)}
                              >
                                Borrow
                              </Button>
                              <Button 
                                className="text-[9px] font-black uppercase tracking-widest h-8 px-3 bg-indigo-600 hover:bg-indigo-700 text-white border-0"
                                disabled={item.status !== 'available' || (item.pending_requests_count !== undefined && item.pending_requests_count > 0)}
                                onClick={() => selectedCategory && handleOpenDistributionModal(selectedCategory, item)}
                              >
                                Distribute
                              </Button>
                            </div>
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pagination Controls for Items */}
            {!loadingDetails && totalFilteredItems > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-500 font-medium">
                    Showing <span className="font-bold text-gray-900">{paginatedItems.length}</span> of <span className="font-bold text-gray-900">{totalFilteredItems}</span> units
                  </div>
                  <div className="w-40">
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(parseInt(e.target.value));
                        setItemsPage(1);
                      }}
                      className="w-full px-3 py-2 text-xs font-bold border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value={5}>5 per page</option>
                      <option value={10}>10 per page</option>
                      <option value={20}>20 per page</option>
                      <option value={50}>50 per page</option>
                      <option value={selectedCategory?.inventory_items?.length || 0}>All ({selectedCategory?.inventory_items?.length || 0})</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={itemsPage === 1}
                    onClick={() => setItemsPage(1)}
                    className="h-9 w-9 p-0 flex items-center justify-center"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={itemsPage === 1}
                    onClick={() => setItemsPage(prev => Math.max(1, prev - 1))}
                    className="h-9 w-9 p-0 flex items-center justify-center"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, lastItemPage) }, (_, i) => {
                      let pageNum;
                      if (lastItemPage <= 5) {
                        pageNum = i + 1;
                      } else if (itemsPage <= 3) {
                        pageNum = i + 1;
                      } else if (itemsPage >= lastItemPage - 2) {
                        pageNum = lastItemPage - 4 + i;
                      } else {
                        pageNum = itemsPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={itemsPage === pageNum ? 'primary' : 'ghost'}
                          size="sm"
                          onClick={() => setItemsPage(pageNum)}
                          className={`h-9 w-9 p-0 text-xs font-bold ${itemsPage === pageNum ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={itemsPage === lastItemPage}
                    onClick={() => setItemsPage(prev => Math.min(lastItemPage, prev + 1))}
                    className="h-9 w-9 p-0 flex items-center justify-center"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={itemsPage === lastItemPage}
                    onClick={() => setItemsPage(lastItemPage)}
                    className="h-9 w-9 p-0 flex items-center justify-center"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Borrow Request Modal */}
        <Modal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          title={`Borrow Request - ${selectedItem?.item_name || selectedCategory?.category_name}`}
        >

          <form onSubmit={handleSubmitRequest} className="space-y-6 py-2">
            <div className="bg-blue-50 p-5 rounded border border-blue-100 flex gap-4 items-start">
              <div className="p-2 bg-blue-100 rounded-sm shrink-0">
                <Info className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-sm text-blue-800 leading-relaxed">
                {selectedItem ? (
                  <>You are requesting to borrow <strong>{selectedItem.item_name}</strong> (SN: {selectedItem.serial_number}).</>
                ) : (
                  <>You are requesting units for temporary use from the <strong>{selectedCategory?.category_name}</strong> category.</>
                )}
              </p>
            </div>
            
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4`}>

              {!selectedItem && (
                <FormField
                  label={`Quantity (Max: ${selectedCategory?.available_items})`}
                  type="number"
                  value={requestForm.quantity.toString()}
                  onChange={(e) => {
                    const qty = parseInt(e.target.value) || 1;
                    setRequestForm({ 
                      ...requestForm, 
                      quantity: qty,
                      expected_return_date: calculateSuggestedDate(qty)
                    });
                  }}
                  required
                  min="1"
                  max={selectedCategory?.available_items?.toString()}
                />
              )}
              <div className="space-y-1">
                <FormField
                  label="Expected Return Date"
                  type="date"
                  value={requestForm.expected_return_date}
                  onChange={(e) => setRequestForm({ ...requestForm, expected_return_date: e.target.value })}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest pl-1">
                  * Suggested based on quantity (3 days/item)
                </p>
              </div>
            </div>


            <FormField
              label={`Purpose of Borrow`}

              type="textarea"
              value={requestForm.purpose}
              onChange={(e) => setRequestForm({ ...requestForm, purpose: e.target.value })}
              placeholder="Please provide details on why you need this equipment..."
              required
            />

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => setShowRequestModal(false)} className="flex-1 py-4 rounded-sm font-bold">
                Discard
              </Button>
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-sm font-bold shadow-lg shadow-blue-100">
                Submit Request
              </Button>
            </div>
          </form>
        </Modal>

        {/* Distribution Request Modal (Polymorphic) */}
        {showPolymorphicRequestModal && selectedCategory && (
          <RequestDistributionModal
            onClose={() => setShowPolymorphicRequestModal(false)}
            onSuccess={() => {
              setShowPolymorphicRequestModal(false);
              if (viewMode === 'categories') fetchCategories();
            }}
            initialCategoryId={selectedCategory.id}
            initialItemCode={selectedItem?.item_code || selectedItem?.serial_number}
          />
        )}

        {/* Details Modal */}
        <Modal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          title="Item Details"
          wide={true}
        >
          {selectedItem && (
            <div className="space-y-8 py-2">
              <div className="flex flex-col lg:flex-row gap-10">
                {/* Item Image Section */}
                <div className="w-full lg:w-72 h-72 bg-gray-50 rounded overflow-hidden border border-gray-100 shrink-0 shadow-sm">
                  {selectedItem.item_image ? (
                    <img 
                      src={`${STORAGE_BASE_URL}/${selectedItem.item_image}`} 
                      alt={selectedItem.item_name} 
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" 
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50">
                      <Package className="w-16 h-16 text-gray-200 mb-2" />
                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">No Image Available</span>
                    </div>
                  )}
                </div>

                {/* Primary Information Section */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <StatusBadge label={selectedItem.status} status={selectedItem.status} />
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-mono font-bold rounded uppercase tracking-tighter">
                        SN: {selectedItem.serial_number}
                      </span>
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 tracking-tight leading-tight mb-2">
                      {selectedItem.item_name}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium mb-8">
                      Detailed unit overview and specifications for institutional property tracking.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-5">
                    <div className="bg-white p-4 rounded-sm border border-gray-100 shadow-sm group hover:border-blue-200 transition-colors">
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <FileText className="w-3 h-3" /> Property Number
                      </p>
                      <p className="text-base font-bold text-gray-800">{selectedItem.property_number || 'Not Assigned'}</p>
                    </div>
                    <div className="bg-white p-4 rounded-sm border border-gray-100 shadow-sm group hover:border-blue-200 transition-colors">
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <Check className="w-3 h-3" /> Unit Condition
                      </p>
                      <p className="text-base font-bold text-gray-800 capitalize">{selectedItem.condition}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Specifications Grid */}
              {selectedItem.custom_attributes && Object.keys(selectedItem.custom_attributes).length > 0 && (
                <div className="space-y-4 pt-6 border-t border-gray-50">
                  <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-600" /> Additional Specifications
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(selectedItem.custom_attributes).map(([key, value]) => (
                      <div key={key} className="flex flex-col p-4 bg-gray-50/50 rounded-sm border border-gray-100 hover:bg-white hover:border-blue-100 transition-all">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">{key}</span>
                        <span className="text-sm font-bold text-gray-900">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Footer */}
              <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
                <div className="flex gap-3 flex-1">
                  <Button 
                    className="flex-1 py-6 rounded-sm font-black uppercase tracking-widest text-[11px] bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95 disabled:opacity-50"
                    disabled={selectedItem.status !== 'available'}
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleOpenBorrowModal(selectedCategory!, selectedItem);
                    }}
                  >
                    <ClipboardCheck className="w-4 h-4 mr-2" />
                    Request to Borrow
                  </Button>
                  <Button 
                    className="flex-1 py-6 rounded-sm font-black uppercase tracking-widest text-[11px] bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
                    disabled={selectedItem.status !== 'available'}
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleOpenDistributionModal(selectedCategory!, selectedItem);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Request Distribution
                  </Button>
                </div>

                <Button 
                  variant="secondary" 
                  onClick={() => setShowDetailsModal(false)} 
                  className="px-8 py-6 rounded-sm font-black uppercase tracking-widest text-[11px] border-gray-200 hover:bg-gray-50"
                >
                  Close Panel
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
