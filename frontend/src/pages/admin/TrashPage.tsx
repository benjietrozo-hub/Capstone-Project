import { useState, useEffect } from 'react';
import { Archive, RefreshCw, AlertTriangle, Search, Filter, Trash2 } from 'lucide-react';
import { adminAPI } from '@/api';

interface ArchivedItem {
  id: number;
  type: string;
  name: string;
  code: string;
  category?: string;
  archived_at: string;
  archived_by: string;
  details: Record<string, any>;
}

interface ArchiveStats {
  inventory: number;
  borrow_requests: number;
  distribution_groups: number;
  teachers: number;
  total: number;
}

const TrashPage = () => {
  const [archivedItems, setArchivedItems] = useState<ArchivedItem[]>([]);
  const [stats, setStats] = useState<ArchiveStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const typeLabels: Record<string, string> = {
    all: 'All Items',
    inventory: 'Legacy Inventory',
    inventory_item: 'Unit (Serialized)',
    item_category: 'Category',
    borrow_request: 'Borrow Requests',
    distribution_group: 'Distribution Groups',
    item_distribution: 'Individual Distribution',
    bulk_distribution: 'Bulk Distribution',
    teacher: 'Teachers',
  };


  const typeBadgeColors: Record<string, string> = {
    inventory: 'bg-blue-100 text-blue-800',
    inventory_item: 'bg-indigo-100 text-indigo-800',
    item_category: 'bg-purple-100 text-purple-800',
    borrow_request: 'bg-orange-100 text-orange-800',
    distribution_group: 'bg-pink-100 text-pink-800',
    item_distribution: 'bg-emerald-100 text-emerald-800',
    bulk_distribution: 'bg-cyan-100 text-cyan-800',
    teacher: 'bg-teal-100 text-teal-800',
  };


  useEffect(() => {
    fetchArchiveData();
    fetchStats();
  }, [selectedType, searchQuery]);

  const fetchArchiveData = async () => {
    try {
      setLoading(true);
      const response = await (adminAPI as any).getArchive({
        type: selectedType,
        search: searchQuery,
      });
      setArchivedItems(response.data.data || []);
    } catch (error) {
      console.error('Error fetching archive:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await (adminAPI as any).getArchiveStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleRestore = async (type: string, id: number) => {
    if (!confirm('Are you sure you want to restore this item?')) return;
    try {
      await (adminAPI as any).restoreFromArchive(type, id);
      fetchArchiveData();
      fetchStats();
    } catch (error) {
      console.error('Error restoring item:', error);
      alert('Failed to restore item');
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
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Archive className="w-6 h-6 text-white" />
                </div>
                Archive
              </h1>
              <p className="text-gray-600 mt-2">Manage archived items — restore them to their original location</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600">Total</div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600">Inventory</div>
              <div className="text-2xl font-bold text-blue-600">{stats.inventory}</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600">Borrow Requests</div>
              <div className="text-2xl font-bold text-orange-600">{stats.borrow_requests}</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600">Groups</div>
              <div className="text-2xl font-bold text-pink-600">{stats.distribution_groups}</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600">Teachers</div>
              <div className="text-2xl font-bold text-teal-600">{stats.teachers}</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600">Distributions</div>
              <div className="text-2xl font-bold text-emerald-600">
                {(stats as any).item_distribution + (stats as any).bulk_distribution}
              </div>
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
                  placeholder="Search archived items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="inventory">Inventory</option>
                <option value="borrow_requests">Borrow Requests</option>
                <option value="distribution_groups">Distribution Groups</option>
                <option value="item_distribution">Individual Distributions</option>
                <option value="bulk_distribution">Bulk Distributions</option>
                <option value="teachers">Teachers</option>

              </select>
            </div>
          </div>
        </div>

        {/* Archived Items Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading archive...</p>
            </div>
          ) : archivedItems.length === 0 ? (
            <div className="p-12 text-center">
              <Archive className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Archive is empty</h3>
              <p className="text-gray-600">No archived items found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Archived At</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Archived By</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {archivedItems.map((item) => (
                    <tr key={`${item.type}-${item.id}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeBadgeColors[item.type] || 'bg-gray-100 text-gray-800'}`}>
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
                        <div className="text-sm text-gray-900">{formatDate(item.archived_at)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.archived_by}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleRestore(item.type, item.id)}
                          className="inline-flex items-center gap-1 text-green-600 hover:text-green-900 mr-4 px-2 py-1 rounded hover:bg-green-50 transition-colors"
                          title="Restore"
                        >
                          <RefreshCw className="w-4 h-4" />
                          <span className="text-xs">Restore</span>
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
    </div>
  );
};

export default TrashPage;
