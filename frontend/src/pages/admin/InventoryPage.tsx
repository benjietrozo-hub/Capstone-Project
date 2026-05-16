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
import { Package, Layers, Settings, ArrowLeft, Image as ImageIcon, Archive, Plus, Edit, Folder, LayoutGrid, List, Trash2, Hash, Calendar, Download, Eye, FileText, Info, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Modal } from '../../components/common/Modal';

interface CustomField {
  id: number;
  field_name: string;
  field_type: string;
  is_required: boolean;
}

interface ItemCategory {
  id: number;
  parent_category: string | null;
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
  unit: string | null;
  description: string | null;
  item_image: string | null;
  condition: string;
  status: string;
  date_acquired: string | null;
  unit_price: string | number | null;
  source_of_fund: string | null;
  remarks: string | null;
  lifespan_years: number | null;
  is_approaching_end_of_life?: boolean;
  end_of_life_date?: string | null;
  custom_attributes: Record<string, any>;

}

export function InventoryPage() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'main' | 'category' | 'items'>('main');
  const [parentCategories, setParentCategories] = useState<any[]>([]);
  const [selectedParentCategory, setSelectedParentCategory] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | null>(null);

  // Modals state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ItemCategory | null>(null);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [savingItem, setSavingItem] = useState(false);

  const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  // Rename Master Category state
  const [showRenameMasterModal, setShowRenameMasterModal] = useState(false);
  const [masterToRename, setMasterToRename] = useState('');
  const [newMasterName, setNewMasterName] = useState('');
  const [masterDesc, setMasterDesc] = useState('');
  const [masterImage, setMasterImage] = useState<File | null>(null);
  const [renamingMaster, setRenamingMaster] = useState(false);

  // Item ad-hoc attributes state
  const [newAttrKey, setNewAttrKey] = useState('');
  const [newAttrValue, setNewAttrValue] = useState('');
  const [showAddAttrRow, setShowAddAttrRow] = useState(false);

  // Verification Modal state
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyPassword, setVerifyPassword] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'category' | 'item', id: number } | null>(null);

  // CSV Export state
  const [showExportModal, setShowExportModal] = useState(false);
  const [csvContent, setCsvContent] = useState<string[][]>([]);

  // Display Mode state for items
  const [displayMode, setDisplayMode] = useState<'card' | 'list'>('card');
  const [itemsPage, setItemsPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [itemSearch, setItemSearch] = useState('');

  // --- API Queries ---
  const { data: parentData, isLoading: loadingParents } = useQuery({
    queryKey: ['parent-categories'],
    queryFn: async () => {
      const res = await adminAPI.getParentCategories();
      return res.data;
    }
  });
  const parents = parentData || [];

  const { data: categoriesResponse, isLoading: loadingCategories } = useQuery({
    queryKey: ['item-categories'],
    queryFn: () => adminAPI.getItemCategories()
  });
  const categories: ItemCategory[] = categoriesResponse?.data || [];
  const filteredCategories = selectedParentCategory 
    ? categories.filter((c: any) => {
        const catParent = c.parent_category || 'Uncategorized';
        return catParent === selectedParentCategory;
      }) 
    : categories;

  const { data: itemsResponse, isLoading: loadingItems } = useQuery({
    queryKey: ['inventory-items', selectedCategory?.id, itemsPage, itemsPerPage, itemSearch],
    queryFn: () => adminAPI.getInventoryItems({ 
      category_id: selectedCategory?.id, 
      page: itemsPage, 
      per_page: itemsPerPage, 
      search: itemSearch 
    }),
    enabled: viewMode === 'items' && !!selectedCategory
  });
  const items: InventoryItem[] = itemsResponse?.data?.data || [];
  const totalItemsCount = itemsResponse?.data?.total || 0;
  const lastItemPage = itemsResponse?.data?.last_page || 1;

  const handlePrepareCSV = () => {
    if (!items || items.length === 0) {
      toast.error('No items available to export');
      return;
    }

    const headers = ['ID', 'Item Name', 'Serial Number', 'Property Number', 'Condition', 'Status', 'Date Acquired'];
    const rows = items.map((item: InventoryItem) => [
      item.id.toString(),
      item.item_name,
      item.serial_number,
      item.property_number || 'N/A',
      item.condition,
      item.status,
      item.date_acquired || 'N/A'
    ]);

    setCsvContent([headers, ...rows]);
    setShowExportModal(true);
  };

  const downloadCSV = () => {
    const csvString = csvContent.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `inventory_export_${selectedCategory?.category_name.toLowerCase().replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportModal(false);
  };

  // --- Category Form State ---
  const [catName, setCatName] = useState('');
  const [catParent, setCatParent] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImage, setCatImage] = useState<File | null>(null);
  const [customFields, setCustomFields] = useState<Partial<CustomField>[]>([]);

  // --- Item Form State ---
  const [itemName, setItemName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [propertyNumber, setPropertyNumber] = useState('');
  const [unit, setUnit] = useState('unit');
  const [itemDescription, setItemDescription] = useState('');
  const [condition, setCondition] = useState('good');
  const [status, setStatus] = useState('available');
  const [dateAcquired, setDateAcquired] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [sourceOfFund, setSourceOfFund] = useState('');
  const [remarks, setRemarks] = useState('');
  const [lifespanYears, setLifespanYears] = useState('5');
  const [itemImage, setItemImage] = useState<File | null>(null);
  const [customAttributes, setCustomAttributes] = useState<Record<string, any>>({});

  
  // Bulk Add State
  const [addQuantity, setAddQuantity] = useState(1);
  const [bulkSerials, setBulkSerials] = useState<string[]>(['']);

  useEffect(() => {
    if (addQuantity > 1) {
      setBulkSerials(prev => {
        const newSerials = [...prev];
        if (newSerials.length < addQuantity) {
          return [...newSerials, ...Array(addQuantity - newSerials.length).fill('')];
        }
        return newSerials.slice(0, addQuantity);
      });
    } else {
      setBulkSerials([serialNumber]);
    }
  }, [addQuantity, serialNumber]);

  // --- Category Handlers ---
  const handleMarkForDisposal = async (item: InventoryItem) => {
    if (!confirm(`Are you sure you want to mark ${item.item_name} (SN: ${item.serial_number}) as ready for disposal?`)) return;
    try {
      await adminAPI.updateInventoryItem(item.id, { status: 'ready_for_disposal' });
      toast.success('Item moved to disposal queue');
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['item-categories'] });
    } catch (error) {
      toast.error('Failed to mark item for disposal');
    }
  };

  const handleOpenCategoryModal = (cat: ItemCategory | null = null) => {
    setEditingCategory(cat);
    if (cat) {
      setCatName(cat.category_name);
    setCatParent(cat.parent_category || '');
      setCatDesc(cat.description || '');
      setCustomFields(cat.custom_fields || []);
    } else {
      setCatName('');
      setCatParent(selectedParentCategory || '');
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
    formData.append('parent_category', catParent);
    formData.append('category_name', catName);
    formData.append('description', catDesc);
    if (catImage) formData.append('category_image', catImage);

    // Send custom fields as array
    if (customFields.length > 0) {
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
  const handleOpenItemModal = (item: InventoryItem | null = null, viewOnly = false) => {
    setEditingItem(item);
    setIsViewOnly(viewOnly);
    if (item) {
      setItemName(item.item_name);
      setSerialNumber(item.serial_number);
      setPropertyNumber(item.property_number || '');
      setUnit(item.unit || 'unit');
      setItemDescription(item.description || '');
      setCondition(item.condition);
      setStatus(item.status);
      setDateAcquired(item.date_acquired ? item.date_acquired.split('T')[0] : '');
      setUnitPrice(item.unit_price ? item.unit_price.toString() : '');
      setSourceOfFund(item.source_of_fund || '');
      setRemarks(item.remarks || '');
      setLifespanYears(item.lifespan_years ? item.lifespan_years.toString() : '5');
      setCustomAttributes(item.custom_attributes || {});

    } else {
      setItemName('');
      setSerialNumber('');
      setPropertyNumber('');
      setUnit('unit');
      setItemDescription('');
      setCondition('good');
      setStatus('available');
      setDateAcquired(new Date().toISOString().split('T')[0]);
      setUnitPrice('');
      setSourceOfFund('');
      setRemarks('');
      setLifespanYears('5');
      setCustomAttributes({});

    }
    setItemImage(null);
    setShowItemModal(true);
    setShowAddAttrRow(false);
    setNewAttrKey('');
    setNewAttrValue('');
    setAddQuantity(1);
    setBulkSerials(['']);
  };

  const handleAddAttribute = () => {
    if (!newAttrKey.trim()) return toast.error('Attribute name is required');
    if (customAttributes[newAttrKey]) return toast.error('Attribute already exists');
    
    setCustomAttributes({
      ...customAttributes,
      [newAttrKey]: newAttrValue
    });
    setNewAttrKey('');
    setNewAttrValue('');
    setShowAddAttrRow(false);
  };

  const handleRemoveAttribute = (key: string) => {
    const newAttrs = { ...customAttributes };
    delete newAttrs[key];
    setCustomAttributes(newAttrs);
  };

  const handleSaveItem = async (e?: any) => {
    if (e) e.preventDefault();
    if (!selectedCategory) return;
    if (savingItem) return;
    
    const formData = new FormData();
    formData.append('category_id', selectedCategory.id.toString());
    formData.append('item_name', itemName);
    formData.append('serial_number', serialNumber);
    formData.append('property_number', propertyNumber || '');
    formData.append('unit', unit);
    formData.append('description', itemDescription);
    formData.append('condition', condition);
    formData.append('status', status);
    formData.append('date_acquired', dateAcquired);
    formData.append('unit_price', unitPrice);
    formData.append('source_of_fund', sourceOfFund);
    formData.append('remarks', remarks);
    formData.append('lifespan_years', lifespanYears);
    if (itemImage) formData.append('item_image', itemImage);


    // Append JSON as array logic for custom_attributes
    if (Object.keys(customAttributes).length > 0) {
      Object.entries(customAttributes).forEach(([key, value]) => {
        formData.append(`custom_attributes[${key}]`, value);
      });
    }

    try {
      setSavingItem(true);
      if (editingItem) {
        formData.append('_method', 'PUT');
        await adminAPI.updateInventoryItem(editingItem.id, formData);
        toast.success('Item updated successfully');
      } else {
        if (addQuantity > 1) {
          // Bulk Add Logic
          const filteredSerials = bulkSerials.filter(s => s.trim() !== '');
          if (filteredSerials.length !== addQuantity) {
            return toast.error(`Please provide all ${addQuantity} serial numbers`);
          }
          
          // Remove the single serial_number from formData and add serial_numbers[]
          formData.delete('serial_number');
          filteredSerials.forEach((sn, idx) => {
            formData.append(`serial_numbers[${idx}]`, sn);
          });

          await adminAPI.bulkCreateInventoryItem(formData);
          toast.success(`Successfully added ${addQuantity} units`);
        } else {
          await adminAPI.createInventoryItem(formData);
          toast.success('Item created successfully');
        }
      }
      setShowItemModal(false);
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['item-categories'] });
      queryClient.invalidateQueries({ queryKey: ['parent-categories'] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error saving item');
    } finally {
      setSavingItem(false);
    }
  };

  const handleRenameMaster = async () => {
    if (!newMasterName.trim()) return;
    try {
      setRenamingMaster(true);
      const formData = new FormData();
      formData.append('old_name', masterToRename);
      formData.append('new_name', newMasterName);
      formData.append('description', masterDesc);
      if (masterImage) formData.append('image', masterImage);

      await adminAPI.renameParentCategory(formData);
      toast.success('Master category updated successfully');
      setShowRenameMasterModal(false);
      queryClient.invalidateQueries({ queryKey: ['parent-categories'] });
      queryClient.invalidateQueries({ queryKey: ['item-categories'] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error updating master category');
    } finally {
      setRenamingMaster(false);
    }
  };

  const handleVerifyAndExecute = async () => {
    if (!verifyPassword) return toast.error('Password is required');
    if (!pendingAction) return;

    try {
      setVerifying(true);
      await adminAPI.verifyPassword(verifyPassword);
      
      // If verification succeeds, execute the pending archive action
      if (pendingAction.type === 'category') {
        await adminAPI.deleteItemCategory(pendingAction.id);
        toast.success('Category archived successfully');
        queryClient.invalidateQueries({ queryKey: ['item-categories'] });
        queryClient.invalidateQueries({ queryKey: ['parent-categories'] });
      } else {
        await adminAPI.deleteInventoryItem(pendingAction.id);
        toast.success('Unit archived successfully');
        queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      }
      
      setShowVerifyModal(false);
      setVerifyPassword('');
      setPendingAction(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Password verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleDeleteCategory = (id: number) => {
    setPendingAction({ type: 'category', id });
    setShowVerifyModal(true);
  };

  const handleDeleteItem = (id: number) => {
    setPendingAction({ type: 'item', id });
    setShowVerifyModal(true);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <NavHeader 
        title="Inventory Management" 
        subtitle="Manage categories and serialized tracking"
        showBackButton={viewMode !== 'main'}
        onBack={() => { if(viewMode === 'items') setViewMode('category'); else setViewMode('main'); }}
      >
        <NotificationProfile currentUser={currentUser} />
      </NavHeader>

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        
        
        {/* --- MAIN CATEGORIES VIEW --- */}
        {viewMode === 'main' && (
          <>
            <div className="flex justify-between items-center bg-white p-4 rounded-sm shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded text-primary">
                  <Folder className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Master Inventory</h2>
                  <p className="text-sm text-gray-500">Select a master category to view specific equipment types</p>
                </div>
              </div>
              <Button onClick={() => handleOpenCategoryModal()} className="flex items-center gap-2">
                <Plus className="w-4 h-4" /> New Category
              </Button>
            </div>

            {loadingParents ? (
              <InventorySkeleton />
            ) : parents.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-sm border border-gray-200">
                <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No Master Categories Found</h3>
                <p className="text-gray-500 mt-1 mb-4">Create your first category to start managing inventory.</p>
                <Button onClick={() => handleOpenCategoryModal()}>Create Category</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {parents.map((parent: any) => (
                  <div 
                    key={parent.parent_category} 
                    onClick={() => {
                      setSelectedParentCategory(parent.parent_category);
                      setViewMode('category');
                    }}
                    className="bg-white rounded overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col"
                  >
                    <div className="h-40 bg-gray-100 relative overflow-hidden flex items-center justify-center">
                      {parent.image ? (
                        <img 
                          src={`http://localhost:8000/storage/${parent.image}`} 
                          alt={parent.parent_category} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <Layers className="w-12 h-12 text-gray-300 group-hover:scale-110 transition-transform duration-500" />
                      )}
                      
                      {/* Edit Button */}
                      <div className="absolute top-3 right-3 z-10">
                        <Button 
                          variant="secondary" 
                          className="h-10 px-3 flex items-center gap-2 rounded-sm bg-white shadow-md hover:bg-gray-50 border border-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMasterToRename(parent.parent_category);
                            setNewMasterName(parent.parent_category);
                            setMasterDesc(parent.description || '');
                            setMasterImage(null);
                            setShowRenameMasterModal(true);
                          }}
                        >
                          <Edit className="w-4 h-4 text-primary" />
                          <span className="text-xs font-bold text-gray-700">Edit</span>
                        </Button>
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <span className="text-white font-medium text-sm flex items-center gap-1">
                          Browse Kinds <ArrowLeft className="w-4 h-4 rotate-180" />
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">{parent.parent_category}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                        {parent.description || `Manage all ${parent.parent_category} kinds and serialized units.`}
                      </p>
                      
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Kinds</span>
                          <span className="text-lg font-bold text-primary">{parent.kind_count}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Total Units</span>
                          <span className="text-lg font-bold text-gray-700">{parent.item_count || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* --- CATEGORY VIEW --- */}
        {viewMode === 'category' && (
          <>
            <div className="flex justify-between items-center bg-white p-4 rounded-sm shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded text-primary">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{selectedParentCategory || "All"} Categories</h2>
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
              <div className="text-center py-20 bg-white rounded-sm border border-gray-200">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No Categories Found</h3>
                <p className="text-gray-500 mt-1 mb-4">Create your first category to start managing inventory.</p>
                <Button onClick={() => handleOpenCategoryModal()}>Create Category</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCategories.map((cat) => (
                  <div 
                    key={cat.id} 
                    onClick={() => {
                      setSelectedCategory(cat);
                      setViewMode('items');
                      setItemsPage(1);
                      setItemSearch('');
                    }}
                    className="bg-white rounded overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col"
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
                          className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-sm transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors"
                        >
                          <Archive className="w-4 h-4" />
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
            <div className="bg-white rounded overflow-hidden shadow-md border border-gray-100 flex flex-col md:flex-row">
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
                  <div className="bg-green-50 px-4 py-2 rounded border border-green-100">
                    <span className="block text-xs font-bold text-green-600 uppercase mb-1">Available Units</span>
                    <span className="text-2xl font-black text-green-700">{selectedCategory.available_items}</span>
                  </div>
                  <div className="bg-gray-50 px-4 py-2 rounded border border-gray-200">
                    <span className="block text-xs font-bold text-gray-500 uppercase mb-1">Total Units</span>
                    <span className="text-2xl font-black text-gray-700">{selectedCategory.total_items}</span>
                  </div>
                  <div className="ml-auto flex items-end gap-2">
                    <Button 
                      variant="secondary" 
                      onClick={handlePrepareCSV} 
                      className="flex items-center gap-2 border-gray-200"
                    >
                      <FileText className="w-4 h-4" /> Export CSV
                    </Button>
                    <Button onClick={() => handleOpenItemModal()} className="flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Add New Unit
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Serialized Items List */}
            {/* Units Display Control */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-sm border border-gray-100 shadow-sm gap-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded">
                  <Package className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-bold text-gray-800">
                  Serialized Units ({totalItemsCount})
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
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex items-center bg-gray-100 p-1 rounded-sm w-full sm:w-auto justify-center">
                  <button
                    onClick={() => setDisplayMode('card')}
                    className={`flex flex-1 sm:flex-none justify-center items-center gap-2 px-3 py-1.5 rounded text-xs font-bold transition-all ${
                      displayMode === 'card' 
                        ? 'bg-white text-primary shadow-sm' 
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
                        ? 'bg-white text-primary shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <List className="w-4 h-4" />
                    List
                  </button>
                </div>
              </div>
            </div>

            {loadingItems ? (
              <div className="py-20 text-center bg-white rounded-sm border border-gray-100">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500">Loading units...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-sm border border-gray-100">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No Units Found</h3>
                <p className="text-gray-500 mt-1 mb-4">Add your first unit to this category to start tracking.</p>
                <Button onClick={() => handleOpenItemModal()}>Add Unit</Button>
              </div>
            ) : (
              <div className="space-y-12">
                {Object.entries(
                  items.reduce((acc: Record<string, any[]>, item) => {
                    const year = item.date_acquired ? new Date(item.date_acquired).getFullYear().toString() : 'Unknown Year';
                    if (!acc[year]) acc[year] = [];
                    acc[year].push(item);
                    return acc;
                  }, {})
                )
                .sort((a, b) => b[0].localeCompare(a[0]))
                .map(([year, yearItems]) => (
                  <div key={year} className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="h-px flex-1 bg-gray-200"></div>
                      <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 flex items-center gap-2 shrink-0">
                        <Calendar className="w-4 h-4" />
                        Acquisition Year: {year}
                        <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-[10px]">{yearItems.length} Units</span>
                      </h3>
                      <div className="h-px flex-1 bg-gray-200"></div>
                    </div>

                    {displayMode === 'card' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {yearItems.map((item) => (
                          <div key={item.id} className="bg-white rounded overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all group flex flex-col">
                            <div className="h-40 bg-gray-100 relative overflow-hidden flex items-center justify-center">
                              {item.item_image ? (
                                <img 
                                  src={`http://localhost:8000/storage/${item.item_image}`} 
                                  alt={item.item_name} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              ) : (
                                <ImageIcon className="w-12 h-12 text-gray-300" />
                              )}
                              <div className="absolute top-3 right-3">
                                <StatusBadge label={item.status} status={item.status} />
                              </div>
                            </div>
                            
                            <div className="p-5 flex-1 flex flex-col">
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex flex-col">
                                  <h4 className="font-bold text-gray-900 line-clamp-1">{item.item_name}</h4>
                                  <div className="flex items-center gap-2">
                                    <p className="text-xs font-mono text-primary font-bold">SN: {item.serial_number}</p>
                                    {item.is_approaching_end_of_life && (
                                      <div className="bg-amber-100 text-amber-700 p-1 rounded-full animate-pulse" title={`Approaching End of Life`}>
                                        <Settings className="w-3 h-3" />
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <button 
                                    onClick={() => handleOpenItemModal(item, false)}
                                    className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-sm transition-colors"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors"
                                  >
                                    <Archive className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              <div className="space-y-2 mb-4 flex-1">
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-500">Property No.</span>
                                  <span className="font-medium text-gray-700">{item.property_number || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-500">Condition</span>
                                  <span className="font-medium text-gray-700 capitalize">{item.condition}</span>
                                </div>
                              </div>

                              <div className="pt-4 border-t border-gray-100 flex gap-2">
                                <Button 
                                  variant="secondary" 
                                  className="flex-1 text-[10px] font-black uppercase tracking-widest py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200"
                                  onClick={() => handleOpenItemModal(item, true)}
                                >
                                  Details
                                </Button>
                                {(item.status === 'damaged' || item.condition === 'damaged' || item.is_approaching_end_of_life) && item.status !== 'ready_for_disposal' && item.status !== 'disposed' && (
                                  <Button 
                                    className="flex-1 text-[10px] font-black uppercase tracking-widest py-2 bg-red-600 hover:bg-red-700 text-white shadow-sm"
                                    onClick={() => handleMarkForDisposal(item)}
                                  >
                                    Dispose
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden">
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
                              {yearItems.map((item) => (
                                <tr key={item.id} className="border-b last:border-0 hover:bg-blue-50/30 transition-colors">
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-sm bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                                        {item.item_image ? <img src={`http://localhost:8000/storage/${item.item_image}`} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-4 h-4 text-gray-400" />}
                                      </div>
                                      <div>
                                        <div className="font-bold text-gray-900 flex items-center gap-2">
                                          {item.item_name}
                                          {item.is_approaching_end_of_life && <span className="bg-amber-100 text-amber-700 text-[9px] px-1.5 py-0.5 rounded font-black uppercase">EOL</span>}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 font-mono text-xs">SN: {item.serial_number}</td>
                                  <td className="px-6 py-4 capitalize">{item.condition}</td>
                                  <td className="px-6 py-4"><StatusBadge label={item.status} status={item.status} /></td>
                                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                                    {(item.status === 'damaged' || item.condition === 'damaged' || item.is_approaching_end_of_life) && item.status !== 'ready_for_disposal' && item.status !== 'disposed' && (
                                      <button onClick={() => handleMarkForDisposal(item)} className="text-red-600 hover:text-red-800 font-bold text-xs uppercase tracking-tighter transition-colors">Dispose</button>
                                    )}
                                    <button onClick={() => handleOpenItemModal(item, true)} className="text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors">View</button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls for Items */}
            {!loadingItems && totalItemsCount > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-500 font-medium">
                    Showing <span className="font-bold text-gray-900">{items.length}</span> of <span className="font-bold text-gray-900">{totalItemsCount}</span> units
                  </div>
                  <div className="w-40">
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(parseInt(e.target.value));
                        setItemsPage(1);
                      }}
                      className="w-full px-3 py-2 text-xs font-bold border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                    >
                      <option value={5}>5 per page</option>
                      <option value={10}>10 per page</option>
                      <option value={20}>20 per page</option>
                      <option value={50}>50 per page</option>
                      <option value={100}>100 per page</option>
                      <option value={totalItemsCount}>All ({totalItemsCount})</option>
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
                          className={`h-9 w-9 p-0 text-xs font-bold ${itemsPage === pageNum ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}
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

      </div>

      {/* --- CATEGORY MODAL --- */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
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
                  <FormField label="Master Category" value={catParent} onChange={e => setCatParent(e.target.value)} required placeholder="e.g. Electronics, Furniture" />
                  <FormField label="Category Kind" value={catName} onChange={e => setCatName(e.target.value)} required placeholder="e.g. Laptops, Projectors" />
                  <FormField label="Description" value={catDesc} onChange={e => setCatDesc(e.target.value)} type="textarea" placeholder="Describe the items in this category..." />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category Image</label>
                    <input type="file" accept="image/*" onChange={e => setCatImage(e.target.files?.[0] || null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
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
                    <div key={idx} className="flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-200">
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

      {/* Rename Master Modal */}
      {showRenameMasterModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Rename Master Category</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField 
                label="Master Category Name" 
                value={newMasterName} 
                onChange={(e) => setNewMasterName(e.target.value)}
                placeholder="Enter name..."
                required
              />
              <FormField 
                label="Description" 
                value={masterDesc} 
                onChange={(e) => setMasterDesc(e.target.value)}
                type="textarea"
                placeholder="Describe this master category..."
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Master Category Image</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={e => setMasterImage(e.target.files?.[0] || null)} 
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" 
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button variant="secondary" onClick={() => setShowRenameMasterModal(false)}>Cancel</Button>
                <Button onClick={handleRenameMaster} loading={renamingMaster}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* --- SERIALIZED ITEM MODAL --- */}
      {showItemModal && selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center shrink-0">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                {isViewOnly ? 'View Unit Details' : editingItem ? 'Edit Serialized Unit' : `Add Unit to ${selectedCategory.category_name}`}
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
                  <FormField label="Asset Name / Model" value={itemName} onChange={e => setItemName(e.target.value)} required disabled={isViewOnly} />
                  
                  {!editingItem && (
                    <div className="bg-primary/5 p-4 rounded-sm border border-primary/10 mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Hash className="w-4 h-4 text-primary" />
                        <h5 className="text-sm font-bold text-primary uppercase tracking-tight">Bulk Entry Settings</h5>
                      </div>
                      <FormField 
                        label="Quantity to Add" 
                        type="number" 
                        value={addQuantity} 
                        onChange={e => {
                          const val = parseInt(e.target.value);
                          if (val > 0) setAddQuantity(val);
                        }} 
                        min="1"
                        max="50"
                        helperText="Add multiple units with same specs but unique serials"
                        disabled={isViewOnly}
                      />
                    </div>
                  )}

                  {addQuantity === 1 ? (
                    <FormField label="Unique Serial Number" value={serialNumber} onChange={e => setSerialNumber(e.target.value)} required placeholder="e.g. SN-XYZ-123" disabled={isViewOnly} />
                  ) : (
                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-gray-700">Serial Numbers ({addQuantity})</label>
                      <div className="max-h-60 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                        {bulkSerials.map((sn, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-400 w-6">#{idx + 1}</span>
                            <input 
                              type="text"
                              value={sn}
                              onChange={e => {
                                const newSerials = [...bulkSerials];
                                newSerials[idx] = e.target.value;
                                setBulkSerials(newSerials);
                              }}
                              placeholder={`Serial Number for Unit ${idx + 1}`}
                              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none disabled:bg-gray-50 disabled:text-gray-500"
                              required
                              disabled={isViewOnly}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <FormField label="Property Tag (Optional)" value={propertyNumber} onChange={e => setPropertyNumber(e.target.value)} disabled={isViewOnly} />

                  <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider border-b pb-2 pt-2">Master List Record</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Unit" value={unit} onChange={e => setUnit(e.target.value)} placeholder="e.g. pc, set, box" disabled={isViewOnly} />
                    <FormField label="Unit Price" type="number" value={unitPrice} onChange={e => setUnitPrice(e.target.value)} step="0.01" min="0" disabled={isViewOnly} />
                  </div>
                  <FormField label="Description" type="textarea" rows={3} value={itemDescription} onChange={e => setItemDescription(e.target.value)} disabled={isViewOnly} />
                  <FormField label="Source of Fund" value={sourceOfFund} onChange={e => setSourceOfFund(e.target.value)} placeholder="e.g. MOOE, Donation, PTA" disabled={isViewOnly} />
                  <FormField label="Remarks" type="textarea" rows={3} value={remarks} onChange={e => setRemarks(e.target.value)} disabled={isViewOnly} />
                  
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <FormField label="Condition" type="select" value={condition} onChange={e => setCondition(e.target.value)} disabled={isViewOnly} options={[
                      { value: 'excellent', label: 'Excellent' },
                      { value: 'good', label: 'Good' },
                      { value: 'fair', label: 'Fair' },
                      { value: 'poor', label: 'Poor' },
                      { value: 'damaged', label: 'Damaged' }
                    ]} />
                    <FormField label="Status" type="select" value={status} onChange={e => setStatus(e.target.value)} disabled={isViewOnly} options={[
                      { value: 'available', label: 'Available' },
                      { value: 'borrowed', label: 'Borrowed' },
                      { value: 'distributed', label: 'Distributed' },
                      { value: 'maintenance', label: 'Maintenance' },
                      { value: 'archived', label: 'Archived' },
                      { value: 'disposed', label: 'Disposed' }
                    ]} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <FormField label="Date Acquired" type="date" value={dateAcquired} onChange={e => setDateAcquired(e.target.value)} disabled={isViewOnly} />
                    <FormField label="Lifespan (Years)" type="number" value={lifespanYears} onChange={e => setLifespanYears(e.target.value)} disabled={isViewOnly} min="1" max="20" />
                  </div>
                  
                  {isViewOnly && editingItem?.end_of_life_date && (
                    <div className={`p-3 rounded-sm border flex items-center gap-3 ${editingItem.is_approaching_end_of_life ? 'bg-amber-50 border-amber-100 text-amber-800' : 'bg-gray-50 border-gray-100 text-gray-700'}`}>
                      <Settings className={`w-5 h-5 ${editingItem.is_approaching_end_of_life ? 'animate-spin-slow' : ''}`} />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Expected Retirement</p>
                        <p className="text-sm font-bold">{new Date(editingItem.end_of_life_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                    </div>
                  )}

                  
                  {!isViewOnly && (
                    <div className="pt-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Actual Photo of Unit</label>
                      <input type="file" accept="image/*" onChange={e => setItemImage(e.target.files?.[0] || null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                    </div>
                  )}
                </div>

                {/* Dynamic JSON Fields */}
                <div className="space-y-4">
                  {(() => {
                    const fields = selectedCategory.custom_fields || (selectedCategory as any).customFields;
                    if (!fields || fields.length === 0) return null;
                    return (
                      <>
                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider border-b pb-2">Category Attributes</h4>
                        {fields.map((field: any) => (
                          <FormField 
                            key={field.id}
                            label={field.field_name}
                            type={field.field_type === 'number' ? 'number' : field.field_type === 'date' ? 'date' : 'text'}
                            value={customAttributes[field.field_name] || ''}
                            onChange={e => setCustomAttributes({...customAttributes, [field.field_name]: e.target.value})}
                            required={field.is_required}
                            disabled={isViewOnly}
                          />
                        ))}
                      </>
                    );
                  })()}
                  
                  {/* Ad-hoc Attributes Section */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Unit-Specific Attributes</h4>
                      {!showAddAttrRow && !isViewOnly && (
                        <button 
                          type="button" 
                          onClick={() => setShowAddAttrRow(true)}
                          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add Attribute
                        </button>
                      )}
                    </div>

                    {/* Show existing attributes that are NOT in the category definition */}
                    <div className="space-y-2">
                      {Object.entries(customAttributes).map(([k, v]) => {
                        const categoryFields = selectedCategory.custom_fields || (selectedCategory as any).customFields;
                        const isCategoryField = categoryFields?.some((f: any) => f.field_name === k);
                        if (isCategoryField) return null;

                        return (
                          <div key={k} className="flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-200 group">
                            <div className="flex-1">
                              <span className="text-[10px] font-bold text-gray-400 uppercase block">{k}</span>
                              {isViewOnly ? (
                                <span className="text-sm font-medium text-gray-800">{String(v)}</span>
                              ) : (
                                <input 
                                  type="text" 
                                  value={String(v)} 
                                  onChange={e => setCustomAttributes({...customAttributes, [k]: e.target.value})}
                                  className="w-full bg-transparent border-none p-0 text-sm focus:ring-0 outline-none font-medium"
                                />
                              )}
                            </div>
                            {!isViewOnly && (
                              <button 
                                type="button" 
                                onClick={() => handleRemoveAttribute(k)}
                                className="p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Archive className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {showAddAttrRow && !isViewOnly && (
                      <div className="mt-3 bg-primary/5 p-3 rounded-sm border border-primary/10 animate-in slide-in-from-top-2 duration-200">
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <input 
                            type="text" 
                            placeholder="Attribute Name" 
                            value={newAttrKey}
                            onChange={e => setNewAttrKey(e.target.value)}
                            className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none"
                          />
                          <input 
                            type="text" 
                            placeholder="Value" 
                            value={newAttrValue}
                            onChange={e => setNewAttrValue(e.target.value)}
                            className="px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => setShowAddAttrRow(false)} className="text-xs font-medium text-gray-500 px-2 py-1">Cancel</button>
                          <button type="button" onClick={handleAddAttribute} className="text-xs font-bold text-white bg-primary px-3 py-1 rounded shadow-sm">Add</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>


              </div>
            </form>
            
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
              <Button variant="secondary" onClick={() => setShowItemModal(false)}>{isViewOnly ? 'Close' : 'Cancel'}</Button>
              {!isViewOnly && (
                <Button onClick={handleSaveItem} disabled={savingItem}>
                  {savingItem ? 'Saving...' : 'Save Serialized Unit'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Verification Modal */}
      <Modal
        isOpen={showVerifyModal}
        onClose={() => {
          setShowVerifyModal(false);
          setVerifyPassword('');
          setPendingAction(null);
        }}
        title="Admin Verification Required"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-amber-50 p-3 rounded border border-amber-100 mb-2">
            <Settings className="w-5 h-5 text-amber-600 animate-pulse" />
            <p className="text-xs text-amber-800 font-medium">Please enter your password to confirm this sensitive action.</p>
          </div>
          <FormField
            label="Admin Password"
            type="password"
            value={verifyPassword}
            onChange={(e) => setVerifyPassword(e.target.value)}
            placeholder="Enter password..."
          />
          <div className="flex gap-3 pt-2">
            <Button 
              className="flex-1" 
              onClick={handleVerifyAndExecute}
              disabled={verifying || !verifyPassword}
            >
              {verifying ? 'Verifying...' : 'Confirm Action'}
            </Button>
            <Button 
              variant="secondary" 
              className="flex-1"
              onClick={() => setShowVerifyModal(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* CSV Export Preview Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Data Preview"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded flex items-center gap-3">
            <Info className="w-5 h-5 text-blue-500" />
            <p className="text-xs text-blue-700 font-medium leading-relaxed">
              Below is a preview of the data that will be exported to your CSV file. 
              Confirm the contents before initiating the download.
            </p>
          </div>

          <div className="max-h-[400px] overflow-auto border border-gray-100 rounded shadow-inner bg-gray-50/30">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="sticky top-0 bg-white border-b border-gray-200 z-10 shadow-sm">
                <tr>
                  {csvContent[0]?.map((header, idx) => (
                    <th key={idx} className="px-3 py-2 font-black uppercase text-gray-500 tracking-wider bg-gray-50/50">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {csvContent.slice(1).map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-blue-50/30 transition-colors bg-white">
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className="px-3 py-2 text-gray-600 font-medium whitespace-nowrap">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-100">
            <Button 
              className="flex-1 flex items-center justify-center gap-2 shadow-lg" 
              onClick={downloadCSV}
            >
              <Download className="w-4 h-4" /> Download CSV File
            </Button>
            <Button 
              variant="secondary" 
              className="flex-1 border-gray-200"
              onClick={() => setShowExportModal(false)}
            >
              Close Preview
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
