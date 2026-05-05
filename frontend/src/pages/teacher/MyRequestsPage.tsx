import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Table } from '../../components/common/Table';
import { FormField } from '../../components/common/FormElements';
import { PageLoader } from '../../components/common/Loader';
import { Modal } from '../../components/common/Modal';
import { teacherAPI } from '../../api';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';
import { Package, ClipboardList, Calendar, Clock, AlertCircle, Info, ChevronRight, Filter, Eye, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import NavHeader from '@/components/NavHeader';
import NotificationProfile from '@/components/NotificationProfile';

interface BorrowRequest {
  id: number;
  request_code: string;
  category?: {
    category_name: string;
  };
  quantity_requested: number;
  quantity_approved?: number;
  purpose?: string;
  status: string;
  date_requested: string;
  expected_return_date?: string;
  admin_notes?: string;
}

export function MyRequestsPage() {
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<BorrowRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [status]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await teacherAPI.getBorrowRequests({
        status: status || undefined,
        per_page: 50,
      });
      
      // Filter out borrowed items - they should be in "My Reservations" page
      const filteredRequests = response.data.data.filter(
        (req: BorrowRequest) => req.status !== 'borrowed'
      );
      setRequests(filteredRequests);
    } catch (error) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this request?')) return;

    try {
      await teacherAPI.cancelBorrowRequest(id);
      toast.success('Request cancelled successfully');
      fetchRequests();
    } catch (error) {
      toast.error('Failed to cancel request');
    }
  };

  const columns = [
    { key: 'request_code', label: 'Request Code' },
    { key: 'category.category_name', label: 'Category', render: (_: any, row: BorrowRequest) => row.category?.category_name || 'N/A' },
    { key: 'quantity_requested', label: 'Quantity' },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => <StatusBadge label={value} status={value} />,
    },
    { key: 'date_requested', label: 'Date Requested', render: (value: string) => formatDate(value) },
    {
      key: 'expected_return_date',
      label: 'Expected Return',
      render: (value: string) => value ? formatDate(value) : '—',
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: BorrowRequest) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedRequest(row);
              setShowDetailModal(true);
            }}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
          >
            View
          </button>
          {row.status === 'pending' && (
            <button
              onClick={() => handleCancelRequest(row.id)}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
            >
              Cancel
            </button>
          )}
        </div>
      ),
    },
  ];

  const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <NavHeader 
        title="My Borrow Requests" 
        subtitle="Track and manage your equipment requests"
        showBackButton={true}
        showHomeButton={true}
        showMenuButton={true}
      >
        <NotificationProfile currentUser={currentUser} />
      </NavHeader>
      
      <div className="sm:hidden bg-white border-b px-4 py-4 mb-4">
        <h1 className="text-xl font-black text-gray-900 tracking-tight">My Borrow Requests</h1>
        <p className="text-sm text-gray-500 font-medium tracking-tight">Track and manage your requests</p>
      </div>
      
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest mb-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-100">
            <ClipboardList className="w-3.5 h-3.5" />
            Requests
          </div>
          <ChevronRight className="w-3 h-3 text-gray-300" />
          <span className="text-gray-400">Borrow History</span>
        </nav>

        {/* Statistics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', count: requests.length, color: 'blue', icon: ClipboardList },
            { label: 'Pending', count: requests.filter(r => r.status === 'pending').length, color: 'amber', icon: Clock },
            { label: 'Approved', count: requests.filter(r => r.status === 'approved').length, color: 'green', icon: Info },
            { label: 'Rejected', count: requests.filter(r => r.status === 'rejected').length, color: 'red', icon: AlertCircle },
          ].map((stat) => (
            <div key={stat.label} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className={`w-10 h-10 bg-${stat.color}-50 rounded-xl flex items-center justify-center text-${stat.color}-600`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                <p className="text-xl font-black text-gray-900 leading-none">{stat.count}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 block pl-11 pr-4 py-3 font-bold transition-all outline-none shadow-sm"
                placeholder="Search requests by code or category..."
                // Logic for client-side search could go here if needed
              />
            </div>
          </div>
          <div className="w-full sm:w-64">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <Filter className="w-4 h-4" />
              </div>
              <select
                className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 block pl-11 pr-4 py-3 font-bold transition-all outline-none shadow-sm appearance-none"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="pending">⏳ Pending Review</option>
                <option value="approved">✅ Approved</option>
                <option value="returned">🔙 Returned</option>
                <option value="rejected">❌ Rejected</option>
              </select>
            </div>
          </div>
        </div>

        <Card className="rounded-3xl border-0 shadow-sm overflow-hidden">
          <CardHeader className="bg-white border-b border-gray-50 py-6 px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <CardTitle className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                  <ClipboardList className="w-6 h-6 text-blue-600" />
                  Borrowing History
                </CardTitle>
                <p className="text-sm text-gray-500 font-medium mt-1">Detailed history of all your equipment requests</p>
              </div>
              <Badge variant="outline" className="bg-blue-50/50 text-blue-700 border-blue-100 font-bold px-4 py-1.5 rounded-xl">
                Total Records: {requests.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0 sm:p-2">
            <div className="overflow-x-auto">
              <Table columns={columns} data={requests} loading={loading} />
            </div>
          </CardContent>
        </Card>

        {/* Detail Modal */}
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Request Details"
        >
          {selectedRequest && (
            <div className="space-y-6 py-2">
              {/* Status Header */}
              <div className={`p-5 rounded-3xl flex items-center justify-between ${
                selectedRequest.status === 'approved' ? 'bg-green-50' :
                selectedRequest.status === 'pending' ? 'bg-amber-50' :
                selectedRequest.status === 'rejected' ? 'bg-red-50' :
                'bg-gray-50'
              }`}>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Request Status</p>
                  <StatusBadge label={selectedRequest.status.toUpperCase()} status={selectedRequest.status} />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Code</p>
                  <p className="text-sm font-black text-gray-900">{selectedRequest.request_code}</p>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</label>
                  <p className="text-base font-bold text-gray-900">{selectedRequest.category?.category_name || 'N/A'}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Quantities</label>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-bold text-gray-900">{selectedRequest.quantity_requested} Requested</p>
                    {selectedRequest.quantity_approved && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100 font-bold">
                        {selectedRequest.quantity_approved} Approved
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Requested On</label>
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {formatDate(selectedRequest.date_requested)}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Return Date</label>
                  <div className="flex items-center gap-2 text-sm font-bold text-blue-600">
                    <Clock className="w-4 h-4" />
                    {selectedRequest.expected_return_date ? formatDate(selectedRequest.expected_return_date) : 'Not specified'}
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Purpose of Borrowing</label>
                  <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 italic text-sm text-gray-700 leading-relaxed">
                    "{selectedRequest.purpose || 'No purpose specified'}"
                  </div>
                </div>

                {selectedRequest.admin_notes && (
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Administrator Feedback</label>
                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 text-sm font-bold text-blue-900">
                      {selectedRequest.admin_notes}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="bg-gray-900 text-white font-black px-10 py-3.5 rounded-2xl hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-95 text-[10px] uppercase tracking-widest"
                >
                  Close Details
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}

