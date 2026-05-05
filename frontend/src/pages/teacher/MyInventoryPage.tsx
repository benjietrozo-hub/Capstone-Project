import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Table } from '../../components/common/Table';
import { Button, FormField } from '../../components/common/FormElements';
import { PageLoader } from '../../components/common/Loader';
import { Modal } from '../../components/common/Modal';
import { teacherAPI } from '../../api';
import { Package, LayoutGrid, List, Eye, Info, Calendar, MapPin, Tag, ClipboardList, ChevronRight, Filter, Folder, Search } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';
import NavHeader from '@/components/NavHeader';
import NotificationProfile from '@/components/NotificationProfile';

interface InventoryItem {
  id: number;
  item_code: string;
  item_name: string;
  description?: string;
  parent_category: string | null;
  category: string;
  quantity: number;
  condition: string;
  location?: string;
  unit_price?: number;
  acquisition_date?: string;
  notes?: string;
  status: string;
}

interface ParentCategory {
  parent_category: string;
  kind_count: number;
  item_count: number;
}

interface KindCategory {
  category: string;
  item_count: number;
}

interface FormData {
  parent_category: string;
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
  const [parentCategories, setParentCategories] = useState<ParentCategory[]>([]);
  const [kinds, setKinds] = useState<KindCategory[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  
  const [viewMode, setViewMode] = useState<'main' | 'category' | 'items'>('main');
  const [selectedParentCategory, setSelectedParentCategory] = useState<string | null>(null);
  const [selectedKind, setSelectedKind] = useState<string | null>(null);
  
  const [displayMode, setDisplayMode] = useState<'card' | 'list'>('list');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState<string>('');
  
  const [formData, setFormData] = useState<FormData>({
    parent_category: '',
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
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (viewMode === 'main') {
      fetchParentCategories();
    } else if (viewMode === 'category' && selectedParentCategory) {
      fetchKinds(selectedParentCategory);
    } else if (viewMode === 'items') {
      fetchItems();
    }
  }, [viewMode, selectedParentCategory, selectedKind, debouncedSearch, statusFilter, sortBy, sortOrder]);

  const fetchParentCategories = async () => {
    try {
      setLoading(true);
      const response = await teacherAPI.getMyInventoryParentCategories();
      setParentCategories(response.data || []);
    } catch (error) {
      console.error('Failed to load parent categories:', error);
      toast.error('Failed to load inventory structure');
    } finally {
      setLoading(false);
    }
  };

  const fetchKinds = async (parentCat: string) => {
    try {
      setLoading(true);
      const response = await teacherAPI.getMyInventoryCategories({ parent_category: parentCat });
      setKinds(response.data || []);
    } catch (error) {
      console.error('Failed to load kinds:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await teacherAPI.getMyInventory({
        search: debouncedSearch,
        parent_category: selectedParentCategory === 'Uncategorized' ? '' : (selectedParentCategory || undefined),
        category: selectedKind || undefined,
        status: statusFilter || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      setItems(response.data.data || []);
    } catch (error) {
      console.error('Failed to load inventory:', error);
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
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
      
      // Refresh current view
      if (viewMode === 'main') fetchParentCategories();
      else if (viewMode === 'category') fetchKinds(selectedParentCategory!);
      else fetchItems();
      
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
      parent_category: item.parent_category || '',
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
  
  const handleView = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowViewModal(true);
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
      parent_category: '',
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

  const openAddModal = (mode: 'main' | 'category' | 'items') => {
    let parent = '';
    let cat = '';
    
    if (mode === 'category' || mode === 'items') {
      parent = selectedParentCategory === 'Uncategorized' ? '' : (selectedParentCategory || '');
    }
    if (mode === 'items') {
      cat = selectedKind || '';
    }
    
    setFormData({
      parent_category: parent,
      item_code: '',
      item_name: '',
      description: '',
      category: cat,
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
    setShowModal(true);
  };

  const columns = [
    { key: 'item_code', label: 'Code' },
    { key: 'item_name', label: 'Name' },
    { key: 'category', label: 'Kind' },
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
        <Button variant="secondary" onClick={() => handleView(item)}>
          <Eye className="w-4 h-4 mr-1" /> View
        </Button>
        <Button onClick={() => handleEdit(item)}>Edit</Button>
        <Button onClick={() => handleDelete(item.id)} variant="danger">Delete</Button>
      </div>
    ),
  });

  const handleParentClick = (parentName: string) => {
    setSelectedParentCategory(parentName);
    setSearch('');
    setViewMode('category');
  };

  const handleKindClick = (kindName: string) => {
    setSelectedKind(kindName);
    setSearch('');
    setViewMode('items');
  };

  const handleBackToMain = () => {
    setSelectedParentCategory(null);
    setSelectedKind(null);
    setSearch('');
    setViewMode('main');
  };

  const handleBackToCategory = () => {
    setSelectedKind(null);
    setSearch('');
    setViewMode('category');
  };

  const filteredParentCategories = parentCategories.filter(p => 
    p.parent_category.toLowerCase().includes(search.toLowerCase())
  );
  
  const filteredKinds = kinds.filter(k => 
    k.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <NavHeader 
        title={viewMode === 'main' ? "My Inventory" : (viewMode === 'category' ? selectedParentCategory : selectedKind) || "My Inventory"} 
        subtitle={
          viewMode === 'main' ? "Manage your institutional assets by category" : 
          viewMode === 'category' ? `Manage sub-categories in ${selectedParentCategory}` :
          `Viewing items in ${selectedParentCategory} > ${selectedKind}`
        }
        showBackButton={viewMode !== 'main'}
        onBack={viewMode === 'items' ? handleBackToCategory : handleBackToMain}
      />
      
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Breadcrumbs */}
          <nav className="flex items-center flex-wrap gap-2 text-[11px] font-black uppercase tracking-widest mb-4">
            <button 
              onClick={handleBackToMain}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${viewMode === 'main' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white text-gray-500 border border-gray-100 hover:text-blue-600 hover:border-blue-200'}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Inventory
            </button>
            
            {(viewMode === 'category' || viewMode === 'items') && (
              <>
                <ChevronRight className="w-3 h-3 text-gray-300" />
                <button 
                  onClick={handleBackToCategory}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${viewMode === 'category' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white text-gray-500 border border-gray-100 hover:text-blue-600 hover:border-blue-200'}`}
                >
                  <Folder className="w-3.5 h-3.5" />
                  {selectedParentCategory}
                </button>
              </>
            )}
            
            {viewMode === 'items' && (
              <>
                <ChevronRight className="w-3 h-3 text-gray-300" />
                <span className="bg-white px-3 py-1.5 rounded-lg border border-gray-100 text-gray-900 shadow-sm flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-blue-600" />
                  {selectedKind}
                </span>
                <ChevronRight className="w-3 h-3 text-gray-300" />
                <span className="text-blue-600 font-black">Items List</span>
              </>
            )}
          </nav>

          {/* Level 1: Main View (Parent Categories) */}
          {viewMode === 'main' && (
            <>
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="flex-1 relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <Filter className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 block pl-11 pr-4 py-3.5 font-bold transition-all outline-none shadow-sm"
                    placeholder="Search master categories..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              
              {loading ? (
                <PageLoader />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredParentCategories.map((cat) => (
                    <div 
                      key={cat.parent_category}
                      onClick={() => handleParentClick(cat.parent_category)}
                      className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer group relative overflow-hidden"
                    >
                      <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                        <Folder className="w-32 h-32" />
                      </div>
                      
                      <div className="flex items-start justify-between mb-6">
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                          <Folder className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{cat.item_count} Items</span>
                          </div>
                          <div className="px-3 py-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{cat.kind_count} Kinds</span>
                          </div>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight group-hover:text-blue-600 transition-colors">
                        {cat.parent_category}
                      </h3>
                      
                      <div className="mt-6 flex items-center text-blue-600 font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all">
                        View Sub-Categories <ChevronRight className="w-3 h-3 ml-1" />
                      </div>
                    </div>
                  ))}
                  
                  <div 
                    onClick={() => openAddModal('main')}
                    className="bg-gray-50 p-6 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center hover:bg-white hover:border-blue-300 transition-all cursor-pointer group min-h-[220px]"
                  >
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-blue-600 shadow-sm mb-4">
                      <Folder className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">New Category</h3>
                    <p className="text-xs text-gray-500 font-medium mt-1">Create a new master category</p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Level 2: Category View (Kinds) */}
          {viewMode === 'category' && (
            <>
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="flex-1 relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <Filter className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 block pl-11 pr-4 py-3.5 font-bold transition-all outline-none shadow-sm"
                    placeholder={`Search kinds in ${selectedParentCategory}...`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              {loading ? (
                <PageLoader />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredKinds.map((kind) => (
                    <div 
                      key={kind.category}
                      onClick={() => handleKindClick(kind.category)}
                      className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer group relative overflow-hidden"
                    >
                      <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                        <Package className="w-32 h-32" />
                      </div>
                      
                      <div className="flex items-start justify-between mb-6">
                        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                          <Tag className="w-6 h-6" />
                        </div>
                        <div className="bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{kind.item_count} Units</span>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight group-hover:text-indigo-600 transition-colors">
                        {kind.category}
                      </h3>
                      
                      <div className="mt-6 flex items-center text-indigo-600 font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all">
                        View Items <ChevronRight className="w-3 h-3 ml-1" />
                      </div>
                    </div>
                  ))}
                  
                  <div 
                    onClick={() => openAddModal('category')}
                    className="bg-gray-50 p-6 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center hover:bg-white hover:border-indigo-300 transition-all cursor-pointer group min-h-[220px]"
                  >
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-indigo-600 shadow-sm mb-4">
                      <Tag className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">New Kind</h3>
                    <p className="text-xs text-gray-500 font-medium mt-1">Add a new equipment type</p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Level 3: Items View */}
          {viewMode === 'items' && (
            <Card className="rounded-3xl border-0 shadow-sm overflow-hidden">
              <CardHeader className="bg-white border-b border-gray-50 py-6 px-8">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-black text-gray-900 tracking-tight">
                        {selectedKind}
                      </CardTitle>
                      <p className="text-sm text-gray-500 font-medium mt-0.5">Manage individual units and specifications</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
                      <button 
                        onClick={() => setDisplayMode('card')}
                        className={`p-2 rounded-lg transition-all ${displayMode === 'card' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
                      >
                        <LayoutGrid className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setDisplayMode('list')}
                        className={`p-2 rounded-lg transition-all ${displayMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] h-10 px-6 rounded-xl shadow-lg shadow-blue-100"
                      onClick={() => openAddModal('items')}
                    >
                      Add Item
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <div className="flex-1">
                    <FormField
                      label="Search Items"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by code, name or description..."
                    />
                  </div>
                  <div className="w-full sm:w-56">
                    <FormField
                      label="Sort By"
                      type="select"
                      value={`${sortBy}-${sortOrder}`}
                      onChange={(e) => {
                        const [field, order] = e.target.value.split('-');
                        setSortBy(field);
                        setSortOrder(order);
                      }}
                      options={[
                        { value: 'created_at-desc', label: 'Newest First' },
                        { value: 'item_name-asc', label: 'Name (A-Z)' },
                        { value: 'item_name-desc', label: 'Name (Z-A)' },
                        { value: 'item_code-asc', label: 'Code (Asc)' },
                        { value: 'quantity-desc', label: 'Highest Quantity' },
                        { value: 'quantity-asc', label: 'Lowest Quantity' },
                      ]}
                    />
                  </div>
                  <div className="w-full sm:w-48">
                    <FormField
                      label="Status Filter"
                      type="select"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      options={[
                        { value: '', label: 'All Statuses' },
                        { value: 'available', label: 'Available' },
                        { value: 'in_use', label: 'In Use' },
                        { value: 'maintenance', label: 'Maintenance' },
                        { value: 'retired', label: 'Retired' }
                      ]}
                    />
                  </div>
                </div>

                {loading ? (
                  <PageLoader />
                ) : displayMode === 'list' ? (
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <Table
                      columns={columns}
                      data={items.map(item => renderRow(item))}
                    />
                    {items.length === 0 && (
                      <div className="p-8 text-center text-gray-500">No items found matching your filters.</div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.length === 0 ? (
                      <div className="col-span-full p-8 text-center text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        No items found matching your filters.
                      </div>
                    ) : items.map((item) => (
                      <div key={item.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col group p-6 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-6">
                          <div className="p-4 bg-blue-50 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                            <Package className="w-6 h-6" />
                          </div>
                          <StatusBadge label={item.status} status={item.status} />
                        </div>
                        
                        <div className="flex-1 space-y-4">
                          <div>
                            <h3 className="text-lg font-black text-gray-900 group-hover:text-blue-600 transition-colors tracking-tight">{item.item_name}</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Code: {item.item_code}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-50">
                             <div className="flex flex-col">
                               <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Condition</span>
                               <span className="text-xs font-bold text-gray-700 capitalize">{item.condition}</span>
                             </div>
                             <div className="flex flex-col items-end">
                               <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Available</span>
                               <span className="text-xs font-black text-gray-900">{item.quantity} Unit(s)</span>
                             </div>
                          </div>
                        </div>

                        <div className="mt-6 flex flex-col gap-3">
                          <Button 
                            className="w-full text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 h-11 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 border-0"
                            onClick={() => handleView(item)}
                          >
                            <Eye className="w-4 h-4" />
                            View Unit
                          </Button>
                          <div className="grid grid-cols-2 gap-3">
                            <Button 
                              className="h-11 text-[10px] font-black uppercase tracking-widest rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all border-0" 
                              onClick={() => handleEdit(item)}
                            >
                              Edit
                            </Button>
                            <Button 
                              className="h-11 text-[10px] font-black uppercase tracking-widest rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all border-0" 
                              onClick={() => handleDelete(item.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
              <FormField
                label="Master Category (e.g. Electronics)"
                value={formData.parent_category}
                onChange={(e) => setFormData({ ...formData, parent_category: e.target.value })}
                error={formErrors.parent_category?.[0]}
                placeholder="Leave blank for Uncategorized"
                disabled={viewMode === 'category' || viewMode === 'items'}
              />

              <FormField
                label="Kind / Sub-Category (e.g. Laptops)"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                error={formErrors.category?.[0]}
                placeholder="Required"
                required
                disabled={viewMode === 'items'}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            <FormField
              label="Description"
              type="textarea"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              error={formErrors.description?.[0]}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

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

            <div className="flex justify-end gap-2 pt-4">
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

      {showViewModal && selectedItem && (
        <Modal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          title="Item Details"
        >
          <div className="space-y-6 py-2">
            <div className="flex items-center gap-4 border-b pb-4">
              <div className="p-4 bg-blue-50 rounded-2xl">
                <Package className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedItem.item_name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge label={selectedItem.status} status={selectedItem.status} />
                  <span className="text-xs text-gray-500 font-mono">Code: {selectedItem.item_code}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Info className="w-3 h-3" /> Basic Information
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Master Category</span>
                    <span className="font-bold text-gray-900">{selectedItem.parent_category || 'Uncategorized'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Kind / Sub-Category</span>
                    <span className="font-bold text-gray-900">{selectedItem.category}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Quantity</span>
                    <span className="font-bold text-gray-900">{selectedItem.quantity}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Condition</span>
                    <span className="capitalize font-bold text-gray-900">{selectedItem.condition}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <MapPin className="w-3 h-3" /> Location & Acquisition
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Location</span>
                    <span className="font-bold text-gray-900">{selectedItem.location || 'Not Set'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Price</span>
                    <span className="font-bold text-gray-900">{selectedItem.unit_price ? formatCurrency(selectedItem.unit_price) : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Acquired</span>
                    <span className="font-bold text-gray-900">{selectedItem.acquisition_date ? formatDate(selectedItem.acquisition_date) : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <ClipboardList className="w-3 h-3" /> Description & Notes
              </h4>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Description</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{selectedItem.description || 'No description provided.'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Notes</p>
                  <p className="text-sm text-gray-700 leading-relaxed italic">{selectedItem.notes || 'No notes.'}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <Button className="flex-1 rounded-xl font-bold" onClick={() => { setShowViewModal(false); handleEdit(selectedItem); }}>
                Edit Item
              </Button>
              <Button variant="secondary" onClick={() => setShowViewModal(false)} className="px-6 rounded-xl font-bold">
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
        </div>
      </div>
    </div>
  );
}

export default MyInventoryPage;
