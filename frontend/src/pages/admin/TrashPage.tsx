import { useState, useEffect } from 'react';
import { Trash2, RefreshCw, AlertTriangle, Search, Filter, Archive } from 'lucide-react';
import { adminAPI } from '@/api';

interface TrashItem {
  id: number;
  type: string;
  name: string;
  code: string;
  category?: string;
  deleted_at: string;
  deleted_by: string;
  details: Record<string, any>;
}

interface TrashStats {
  inventory: number;
  suppliers: number;
  purchase_orders: number;
  borrow_requests: number;
  distribution_groups: number;
  total: number;
}

const TrashPage = () => {
  const [trashedItems, setTrashedItems] = useState<TrashItem[]>([]);
  const [stats, setStats] = useState<TrashStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);

  const typeLabels: Record<string, string> = {
    all: 'All Items',
    inventory: 'Inventory',
    supplier: 'Suppliers',
    purchase_order: 'Purchase Orders',
    borrow_request: 'Borrow Requests',
    distribution_group: 'Distribution Groups',
  };

  const typeBadgeColors: Record<string, string> = {
    inventory: 'bg-blue-100 text-blue-800',
    supplier: 'bg-green-100 text-green-800',
    purchase_order: 'bg-purple-100 text-purple-800',
    borrow_request: 'bg-orange-100 text-orange-800',
    distribution_group: 'bg-pink-100 text-pink-800',
  };

  useEffect(() => {
    fetchTrashData();
    fetchStats();
  }, [selectedType, searchQuery]);

  const fetchTrashData = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getTrash({
        type: selectedType,
        search: searchQuery
      });
      setTrashedItems(response.data.data || []);
    } catch (error) {
      console.error('Error fetching trash:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getTrashStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleRestore = async (type: string, id: number) => {
    if (!confirm('Are you sure you want to restore this item?')) return;

    try {
      await adminAPI.restoreFromTrash(type, id);
      fetchTrashData();
      fetchStats();
    } catch (error) {
      console.error('Error restoring item:', error);
      alert('Failed to restore item');
    }
  };

  const handlePermanentDelete = async (type: string, id: number) => {
    if (!confirm('Are you sure you want to permanently delete this item? This action cannot be undone!')) return;

    try {
      await adminAPI.deleteFromTrash(type, id);
      fetchTrashData();
      fetchStats();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
  };

  const handleEmptyTrash = async () => {
    if (!confirm('Are you sure you want to empty the entire trash? This will permanently delete all items and cannot be undone!')) return;

    try {
      await adminAPI.emptyTrash(selectedType);
      setShowEmptyConfirm(false);
      fetchTrashData();
      fetchStats();
    } catch (error) {
      console.error('Error emptying trash:', error);
      alert('Failed to empty trash');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Trash2 className="w-6 h-6 text-white" />
                </div>
                Trash
              </h1>
              <p className="text-gray-600 mt-2">Manage deleted items and restore or permanently delete them</p>
            </div>
            {stats && stats.total > 0 && (
              <button
                onClick={() => setShowEmptyConfirm(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Empty Trash
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600">Total Items</div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600">Inventory</div>
              <div className="text-2xl font-bold text-blue-600">{stats.inventory}</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600">Suppliers</div>
              <div className="text-2xl font-bold text-green-600">{stats.suppliers}</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600">Purchase Orders</div>
              <div className="text-2xl font-bold text-purple-600">{stats.purchase_orders}</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600">Borrow Requests</div>
              <div className="text-2xl font-bold text-orange-600">{stats.borrow_requests}</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600">Distribution Groups</div>
              <div className="text-2xl font-bold text-pink-600">{stats.distribution_groups}</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search deleted items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="inventory">Inventory</option>
                <option value="suppliers">Suppliers</option>
                <option value="purchase_orders">Purchase Orders</option>
                <option value="borrow_requests">Borrow Requests</option>
                <option value="distribution_groups">Distribution Groups</option>
              </select>
            </div>
          </div>
        </div>

        {/* Trash Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading trash...</p>
            </div>
          ) : trashedItems.length === 0 ? (
            <div className="p-12 text-center">
              <Archive className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Trash is empty</h3>
              <p className="text-gray-600">No deleted items found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deleted At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deleted By
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {trashedItems.map((item) => (
                    <tr key={`${item.type}-${item.id}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeBadgeColors[item.type]}`}>
                          {typeLabels[item.type] || item.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        {item.category && (
                          <div className="text-sm text-gray-500">{item.category}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.code}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(item.deleted_at)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.deleted_by}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleRestore(item.type, item.id)}
                          className="text-green-600 hover:text-green-900 mr-4"
                          title="Restore"
                        >
                          <RefreshCw className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(item.type, item.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Permanently Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Empty Trash Confirmation Modal */}
      {showEmptyConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Empty Trash?</h3>
            </div>
            <p className="text-gray-600 mb-6">
              This will permanently delete all items in the trash. This action cannot be undone!
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEmptyConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEmptyTrash}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Empty Trash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrashPage;
