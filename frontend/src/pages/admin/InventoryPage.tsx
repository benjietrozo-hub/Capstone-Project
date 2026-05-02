import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, FormField } from '../../components/common/FormElements';
import { StatusBadge } from '../../components/common/StatusBadge';
import { toast } from 'sonner';
import NavHeader from '@/components/NavHeader';
import NotificationProfile from '@/components/NotificationProfile';
import { InventorySkeleton } from '../../components/common/Skeleton';
import { Package, Layers, Settings, ArrowLeft, Image as ImageIcon, Trash2, Plus, Edit } from 'lucide-react';

interface CustomField {
  id: number;
  field_name: string;
  field_type: string;
  is_required: boolean;
}

interface ItemCategory {
  id: number;
  category_name: string;
  description: string;
  category_image: string | null;
  total_items: number;
  available_items: number;
  custom_fields: CustomField[];
}

interface InventoryItem {
  id: number;
  category_id: number;
  item_name: string;
  serial_number: string;
  property_number: string | null;
  item_image: string | null;
  condition: string;
  status: string;
  date_acquired: string | null;
  custom_attributes: Record<string, any>;
}

export function InventoryPage() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'categories' | 'items'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | null>(null);

  // Modals state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ItemCategory | null>(null);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  // --- API Queries ---
  const { data: categoriesResponse, isLoading: loadingCategories } = useQuery({
    queryKey: ['item-categories'],
    queryFn: () => adminAPI.getItemCategories()
  });
  const categories: ItemCategory[] = categoriesResponse?.data || [];

  const { data: itemsResponse, isLoading: loadingItems } = useQuery({
    queryKey: ['inventory-items', selectedCategory?.id],
    queryFn: () => adminAPI.getInventoryItems({ category_id: selectedCategory?.id, per_page: 100 }),
    enabled: viewMode === 'items' && !!selectedCategory
  });
  const items: InventoryItem[] = itemsResponse?.data?.data || [];

  // --- Category Form State ---
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImage, setCatImage] = useState<File | null>(null);
  const [customFields, setCustomFields] = useState<Partial<CustomField>[]>([]);

  // --- Item Form State ---
  const [itemName, setItemName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [propertyNumber, setPropertyNumber] = useState('');
  const [condition, setCondition] = useState('good');
  const [status, setStatus] = useState('available');
  const [itemImage, setItemImage] = useState<File | null>(null);
  const [customAttributes, setCustomAttributes] = useState<Record<string, any>>({});

  // --- Category Handlers ---
  const handleOpenCategoryModal = (cat: ItemCategory | null = null) => {
    setEditingCategory(cat);
    if (cat) {
      setCatName(cat.category_name);
      setCatDesc(cat.description || '');
      setCustomFields(cat.custom_fields || []);
    } else {
      setCatName('');
      setCatDesc('');
      setCustomFields([]);
    }
    setCatImage(null);
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async (e?: any) => {
    if (e) e.preventDefault();
    if (!catName.trim()) return toast.error('Category name is required');

    const formData = new FormData();
    formData.append('category_name', catName);
    formData.append('description', catDesc);
    if (catImage) formData.append('category_image', catImage);

    // If new category, we can send custom fields as array. If editing, we add/remove them separately via other endpoints
    if (!editingCategory && customFields.length > 0) {
      customFields.forEach((field, index) => {
        formData.append(`custom_fields[${index}][field_name]`, field.field_name!);
        formData.append(`custom_fields[${index}][field_type]`, field.field_type || 'text');
        formData.append(`custom_fields[${index}][is_required]`, field.is_required ? '1' : '0');
      });
    }

    try {
      if (editingCategory) {
        formData.append('_method', 'PUT'); // Laravel workaround for multipart PUT
        await adminAPI.updateItemCategory(editingCategory.id, formData);
        toast.success('Category updated successfully');
      } else {
        await adminAPI.createItemCategory(formData);
        toast.success('Category created successfully');
      }
      setShowCategoryModal(false);
      queryClient.invalidateQueries({ queryKey: ['item-categories'] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error saving category');
    }
  };

  // --- Item Handlers ---
  const handleOpenItemModal = (item: InventoryItem | null = null) => {
    setEditingItem(item);
    if (item) {
      setItemName(item.item_name);
      setSerialNumber(item.serial_number);
      setPropertyNumber(item.property_number || '');
      setCondition(item.condition);
      setStatus(item.status);
      setCustomAttributes(item.custom_attributes || {});
    } else {
      setItemName('');
      setSerialNumber('');
      setPropertyNumber('');
      setCondition('good');
      setStatus('available');
      setCustomAttributes({});
    }
    setItemImage(null);
    setShowItemModal(true);
  };

  const handleSaveItem = async (e?: any) => {
    if (e) e.preventDefault();
    if (!selectedCategory) return;
    
    const formData = new FormData();
    formData.append('category_id', selectedCategory.id.toString());
    formData.append('item_name', itemName);
    formData.append('serial_number', serialNumber);
    if (propertyNumber) formData.append('property_number', propertyNumber);
    formData.append('condition', condition);
    formData.append('status', status);
    if (itemImage) formData.append('item_image', itemImage);

    // Append JSON as array logic for custom_attributes
    if (Object.keys(customAttributes).length > 0) {
      Object.entries(customAttributes).forEach(([key, value]) => {
        formData.append(`custom_attributes[${key}]`, value);
      });
    }

    try {
      if (editingItem) {
        formData.append('_method', 'PUT');
        await adminAPI.updateInventoryItem(editingItem.id, formData);
        toast.success('Item updated successfully');
      } else {
        await adminAPI.createInventoryItem(formData);
        toast.success('Item created successfully');
      }
      setShowItemModal(false);
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['item-categories'] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error saving item');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <NavHeader 
        title="Inventory Management" 
        subtitle="Manage categories and serialized tracking"
        showBackButton={viewMode === 'items'}
        onBack={() => setViewMode('categories')}
      >
        <NotificationProfile currentUser={currentUser} />
      </NavHeader>

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        
        {/* --- CATEGORY VIEW --- */}
        {viewMode === 'categories' && (
          <>
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Item Categories</h2>
                  <p className="text-sm text-gray-500">Select a category to view individual items</p>
                </div>
              </div>
              <Button onClick={() => handleOpenCategoryModal()} className="flex items-center gap-2">
                <Plus className="w-4 h-4" /> New Category
              </Button>
            </div>

            {loadingCategories ? (
              <InventorySkeleton />
            ) : categories.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No Categories Found</h3>
                <p className="text-gray-500 mt-1 mb-4">Create your first category to start managing inventory.</p>
                <Button onClick={() => handleOpenCategoryModal()}>Create Category</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categories.map((cat) => (
                  <div 
                    key={cat.id} 
                    onClick={() => {
                      setSelectedCategory(cat);
                      setViewMode('items');
                    }}
                    className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col"
                  >
                    <div className="h-40 bg-gray-100 relative overflow-hidden flex items-center justify-center">
                      {cat.category_image ? (
                        <img 
                          src={`http://localhost:8000/storage/${cat.category_image}`} 
                          alt={cat.category_name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <Layers className="w-12 h-12 text-gray-300" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <span className="text-white font-medium text-sm flex items-center gap-1">
                          View Items <ArrowLeft className="w-4 h-4 rotate-180" />
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">{cat.category_name}</h3>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleOpenCategoryModal(cat); }}
                          className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                        {cat.description || 'No description provided.'}
                      </p>
                      
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Available</span>
                          <span className="text-lg font-bold text-green-600">{cat.available_items}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total</span>
                          <span className="text-lg font-bold text-gray-700">{cat.total_items}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* --- ITEMS VIEW --- */}
        {viewMode === 'items' && selectedCategory && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            
            {/* Category Header Card */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 flex flex-col md:flex-row">
              <div className="w-full md:w-48 h-48 md:h-auto bg-gray-100 flex items-center justify-center shrink-0">
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
              <div className="p-6 flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wide">Category</span>
                  <h2 className="text-2xl font-black text-gray-900">{selectedCategory.category_name}</h2>
                </div>
                <p className="text-gray-600 mb-6 max-w-3xl">{selectedCategory.description}</p>
                
                <div className="flex flex-wrap gap-6 mt-auto">
                  <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-100">
                    <span className="block text-xs font-bold text-green-600 uppercase mb-1">Available Units</span>
                    <span className="text-2xl font-black text-green-700">{selectedCategory.available_items}</span>
                  </div>
                  <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                    <span className="block text-xs font-bold text-gray-500 uppercase mb-1">Total Units</span>
                    <span className="text-2xl font-black text-gray-700">{selectedCategory.total_items}</span>
                  </div>
                  <div className="ml-auto flex items-end">
                    <Button onClick={() => handleOpenItemModal()} className="flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Add New Unit
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Serialized Items List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" /> Serialized Units
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Asset Info</th>
                      <th className="px-6 py-3 font-semibold">Identifiers</th>
                      <th className="px-6 py-3 font-semibold">Condition</th>
                      <th className="px-6 py-3 font-semibold">Status</th>
                      <th className="px-6 py-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingItems ? (
                      <tr><td colSpan={5} className="p-4 text-center text-gray-500">Loading units...</td></tr>
                    ) : items.length === 0 ? (
                      <tr><td colSpan={5} className="p-8 text-center text-gray-500">No specific units registered in this category yet.</td></tr>
                    ) : (
                      items.map((item) => (
                        <tr key={item.id} className="border-b last:border-0 hover:bg-blue-50/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                                {item.item_image ? (
                                  <img src={`http://localhost:8000/storage/${item.item_image}`} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <ImageIcon className="w-4 h-4 text-gray-400" />
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-gray-900">{item.item_name}</div>
                                {Object.entries(item.custom_attributes || {}).slice(0, 2).map(([k, v]) => (
                                  <div key={k} className="text-xs text-gray-500">{k}: {String(v)}</div>
                                ))}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-mono text-xs font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded inline-block border border-gray-200 mb-1">
                              SN: {item.serial_number}
                            </div>
                            {item.property_number && (
                              <div className="text-xs text-gray-500">PN: {item.property_number}</div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="capitalize text-gray-700 font-medium">{item.condition}</span>
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge label={item.status} status={item.status} />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => handleOpenItemModal(item)}
                              className="text-primary hover:text-blue-800 font-medium text-sm transition-colors"
                            >
                              Edit Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* --- CATEGORY MODAL --- */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center shrink-0">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSaveCategory} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider border-b pb-2">Basic Info</h4>
                <div className="grid grid-cols-1 gap-4">
                  <FormField label="Category Name" value={catName} onChange={e => setCatName(e.target.value)} required placeholder="e.g. Laptops, Projectors" />
                  <FormField label="Description" value={catDesc} onChange={e => setCatDesc(e.target.value)} type="textarea" placeholder="Describe the items in this category..." />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category Image</label>
                    <input type="file" accept="image/*" onChange={e => setCatImage(e.target.files?.[0] || null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                  </div>
                </div>
              </div>

              {!editingCategory && (
                <div className="space-y-4 pt-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Dynamic Attributes</h4>
                    <button type="button" onClick={() => setCustomFields([...customFields, { field_name: '', field_type: 'text', is_required: false }])} className="text-xs font-bold text-primary hover:underline">
                      + Add Field
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">Define fields specific to this category (e.g. "RAM Size", "Color").</p>
                  
                  {customFields.map((field, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                      <input type="text" value={field.field_name} onChange={e => { const newFields = [...customFields]; newFields[idx].field_name = e.target.value; setCustomFields(newFields); }} placeholder="Field Name" className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none" required />
                      <select value={field.field_type} onChange={e => { const newFields = [...customFields]; newFields[idx].field_type = e.target.value; setCustomFields(newFields); }} className="w-32 px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none">
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                        <option value="boolean">Yes/No</option>
                      </select>
                      <button type="button" onClick={() => { const newFields = [...customFields]; newFields.splice(idx, 1); setCustomFields(newFields); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </form>
            
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
              <Button variant="secondary" onClick={() => setShowCategoryModal(false)}>Cancel</Button>
              <Button onClick={handleSaveCategory}>Save Category</Button>
            </div>
          </div>
        </div>
      )}

      {/* --- SERIALIZED ITEM MODAL --- */}
      {showItemModal && selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center shrink-0">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                {editingItem ? 'Edit Serialized Unit' : `Add Unit to ${selectedCategory.category_name}`}
              </h3>
              <button onClick={() => setShowItemModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSaveItem} className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Fixed Fields */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider border-b pb-2">Core Identifiers</h4>
                  <FormField label="Asset Name / Model" value={itemName} onChange={e => setItemName(e.target.value)} required />
                  <FormField label="Unique Serial Number" value={serialNumber} onChange={e => setSerialNumber(e.target.value)} required placeholder="e.g. SN-XYZ-123" />
                  <FormField label="Property Tag (Optional)" value={propertyNumber} onChange={e => setPropertyNumber(e.target.value)} />
                  
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <FormField label="Condition" type="select" value={condition} onChange={e => setCondition(e.target.value)} options={[
                      { value: 'excellent', label: 'Excellent' },
                      { value: 'good', label: 'Good' },
                      { value: 'fair', label: 'Fair' },
                      { value: 'poor', label: 'Poor' },
                      { value: 'damaged', label: 'Damaged' }
                    ]} />
                    <FormField label="Status" type="select" value={status} onChange={e => setStatus(e.target.value)} options={[
                      { value: 'available', label: 'Available' },
                      { value: 'borrowed', label: 'Borrowed' },
                      { value: 'maintenance', label: 'Maintenance' },
                      { value: 'archived', label: 'Archived' }
                    ]} />
                  </div>
                  
                  <div className="pt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Actual Photo of Unit</label>
                    <input type="file" accept="image/*" onChange={e => setItemImage(e.target.files?.[0] || null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                  </div>
                </div>

                {/* Dynamic JSON Fields */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider border-b pb-2">Category Attributes</h4>
                  {selectedCategory.custom_fields && selectedCategory.custom_fields.length > 0 ? (
                    selectedCategory.custom_fields.map(field => (
                      <FormField 
                        key={field.id}
                        label={field.field_name}
                        type={field.field_type === 'number' ? 'number' : field.field_type === 'date' ? 'date' : 'text'}
                        value={customAttributes[field.field_name] || ''}
                        onChange={e => setCustomAttributes({...customAttributes, [field.field_name]: e.target.value})}
                        required={field.is_required}
                      />
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      No custom attributes defined for this category.
                    </div>
                  )}
                  
                  {/* For migrated Legacy IDs we should show them readonly if they exist */}
                  {editingItem && editingItem.custom_attributes && Object.entries(editingItem.custom_attributes).map(([k, v]) => {
                    // Skip if it's a known custom field, as we render them above
                    if (selectedCategory.custom_fields?.find(f => f.field_name === k)) return null;
                    return (
                      <div key={k} className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                        <span className="block text-xs font-bold text-blue-800 uppercase mb-1">Legacy: {k}</span>
                        <span className="text-sm text-blue-900">{String(v)}</span>
                      </div>
                    );
                  })}
                </div>

              </div>
            </form>
            
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
              <Button variant="secondary" onClick={() => setShowItemModal(false)}>Cancel</Button>
              <Button onClick={handleSaveItem}>Save Serialized Unit</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
