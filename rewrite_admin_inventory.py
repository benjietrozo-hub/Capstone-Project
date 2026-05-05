import re

with open('frontend/src/pages/admin/InventoryPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add main viewMode state
content = content.replace("const [viewMode, setViewMode] = useState<'categories' | 'items'>('categories');", "const [viewMode, setViewMode] = useState<'main' | 'category' | 'items'>('main');\n  const [parentCategories, setParentCategories] = useState<any[]>([]);\n  const [selectedParentCategory, setSelectedParentCategory] = useState<string | null>(null);")

# Update queries
content = content.replace("const { data: categoriesData, isLoading: loadingCategories } = useQuery({", "const { data: parentData, isLoading: loadingParents } = useQuery({\n    queryKey: ['parent-categories'],\n    queryFn: async () => {\n      const res = await adminAPI.getParentCategories();\n      return res.data;\n    }\n  });\n\n  const { data: categoriesData, isLoading: loadingCategories } = useQuery({")

# Update categories processing
content = content.replace("const categories = categoriesData?.data || [];", "const categories = categoriesData?.data || [];\n  const filteredCategories = selectedParentCategory ? categories.filter((c: any) => c.parent_category === selectedParentCategory) : categories;\n  const parents = parentData || [];")

# Add render logic for MAIN view above CATEGORIES view
main_view = """
        {/* --- MAIN CATEGORIES VIEW --- */}
        {viewMode === 'main' && (
          <>
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
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
              <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
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
                    className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col"
                  >
                    <div className="h-40 bg-gray-100 relative overflow-hidden flex items-center justify-center">
                      <Layers className="w-12 h-12 text-gray-300 group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <span className="text-white font-medium text-sm flex items-center gap-1">
                          Browse Kinds <ArrowLeft className="w-4 h-4 rotate-180" />
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">{parent.parent_category}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                        Migrated category for {parent.parent_category}
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
"""

content = content.replace("{/* --- CATEGORY VIEW --- */}", main_view + "\n        {/* --- CATEGORY VIEW --- */}")

# Replace viewMode === 'categories' with 'category'
content = content.replace("viewMode === 'categories'", "viewMode === 'category'")
content = content.replace("setViewMode('categories')", "setViewMode('category')")

# In the render of CATEGORY VIEW, replace categories.map with filteredCategories.map
content = content.replace("{categories.map((cat)", "{filteredCategories.map((cat)")

# Change the title in NavHeader
content = content.replace("onBack={() => setViewMode('category')}", "onBack={() => { if(viewMode === 'items') setViewMode('category'); else setViewMode('main'); }}")
content = content.replace("showBackButton={viewMode === 'items'}", "showBackButton={viewMode !== 'main'}")

# Update parent_category in forms
form_old = """                  <FormField label="Category Name" value={catName} onChange={e => setCatName(e.target.value)} required placeholder="e.g. Laptops, Projectors" />"""
form_new = """                  <FormField label="Master Category" value={catParent} onChange={e => setCatParent(e.target.value)} required placeholder="e.g. Electronics, Furniture" />\n                  <FormField label="Category Kind" value={catName} onChange={e => setCatName(e.target.value)} required placeholder="e.g. Laptops, Projectors" />"""
content = content.replace(form_old, form_new)

# Add state for parent_category
content = content.replace("const [catName, setCatName] = useState('');", "const [catName, setCatName] = useState('');\n  const [catParent, setCatParent] = useState('');")

# Reset states
content = content.replace("setCatName('');\n      setCatDesc('');", "setCatName('');\n      setCatParent(selectedParentCategory || '');\n      setCatDesc('');")

# Fill form on edit
content = content.replace("setCatName(cat.category_name);", "setCatName(cat.category_name);\n    setCatParent(cat.parent_category || '');")

# formData save
content = content.replace("formData.append('category_name', catName);", "formData.append('parent_category', catParent);\n    formData.append('category_name', catName);")

# Update the ItemCategories page header
content = content.replace("<h2 className=\"text-xl font-bold text-gray-800\">Item Categories</h2>", "<h2 className=\"text-xl font-bold text-gray-800\">{selectedParentCategory} Kinds</h2>")

with open('frontend/src/pages/admin/InventoryPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
