import re

with open('frontend/src/pages/teacher/BrowseInventoryPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add main viewMode
content = content.replace("const [viewMode, setViewMode] = useState<'categories' | 'items'>('categories');", "const [viewMode, setViewMode] = useState<'main' | 'categories' | 'items'>('main');\n  const [parentCategories, setParentCategories] = useState<any[]>([]);\n  const [selectedParentCategory, setSelectedParentCategory] = useState<string | null>(null);")

# Update fetchCategories
fetch_categories_old = """  const fetchCategories = async () => {
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
  };"""

fetch_categories_new = """  const fetchParentCategories = async () => {
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
        per_page: 50,
      });
      setCategories(response.data.data);
    } catch (error) {
      console.error('Failed to load inventory categories:', error);
    } finally {
      setLoading(false);
    }
  };"""

content = content.replace(fetch_categories_old, fetch_categories_new)

# Update useEffect
use_effect_old = """  useEffect(() => {
    if (viewMode === 'categories') {
      fetchCategories();
    }
  }, [search, sortBy, sortOrder, viewMode]);"""

use_effect_new = """  useEffect(() => {
    if (viewMode === 'main') {
      fetchParentCategories();
    } else if (viewMode === 'categories') {
      fetchCategories();
    }
  }, [search, sortBy, sortOrder, viewMode, selectedParentCategory]);"""

content = content.replace(use_effect_old, use_effect_new)

# Title logic
content = content.replace("viewMode === 'categories' ? \"Browse Inventory\" : selectedCategory?.category_name || \"Category Items\"", "viewMode === 'main' ? \"Browse Inventory\" : viewMode === 'categories' ? selectedParentCategory || \"Category Kinds\" : selectedCategory?.category_name || \"Category Items\"")
content = content.replace("viewMode === 'categories' ? \"View and request available equipment categories\" : \"View specific units available in this category\"", "viewMode === 'main' ? \"View and request available equipment categories\" : viewMode === 'categories' ? \"View available kinds in this category\" : \"View specific units available in this category\"")
content = content.replace("showBackButton={viewMode === 'items'}", "showBackButton={viewMode !== 'main'}")
content = content.replace("onBack={() => setViewMode('categories')}", "onBack={() => { if(viewMode === 'items') setViewMode('categories'); else setViewMode('main'); }}")

# Render logic
main_view = """
        {/* --- MAIN CATEGORIES VIEW --- */}
        {viewMode === 'main' && (
          <Card className="p-4 sm:p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="font-medium">Loading categories...</p>
              </div>
            ) : parentCategories.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-100">
                <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No Categories Found</h3>
                <p className="text-gray-500 mt-1">Check back later for available inventory.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {parentCategories.map((parent) => (
                  <div 
                    key={parent.parent_category} 
                    className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col cursor-pointer group hover:border-blue-300"
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
"""

content = content.replace("{/* --- CATEGORIES VIEW --- */}", main_view + "\n        {/* --- CATEGORIES VIEW --- */}")

with open('frontend/src/pages/teacher/BrowseInventoryPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
