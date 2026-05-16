import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Table } from '../../components/common/Table';
import { FormField } from '../../components/common/FormElements';
import { PageLoader } from '../../components/common/Loader';
import { Modal } from '../../components/common/Modal';
import { teacherAPI } from '../../api';
import { formatDate } from '../../utils/formatters';
import { toast } from '@/hooks/use-toast';
import NavHeader from '@/components/NavHeader';
import NotificationProfile from '@/components/NotificationProfile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, ClipboardList, Calendar, Clock, AlertCircle, Info, ChevronRight, Filter, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

import { useSearchParams } from 'react-router-dom';

interface BorrowRequest {
  id: number;
  category?: {
    category_name: string;
  };
  quantity_requested: number;
  quantity_approved?: number;
  purpose?: string;
  status: string;
  date_requested: string;
  borrow_date?: string;
  expected_return_date?: string;
  actual_return_date?: string;
  admin_notes?: string;
}

export function MyReservationsPage() {
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [borrowedItems, setBorrowedItems] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestStatus, setRequestStatus] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<BorrowRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'borrowed');

  // Update active tab when URL parameter changes
  useEffect(() => {
    if (tabFromUrl && (tabFromUrl === 'borrowed' || tabFromUrl === 'requests')) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  useEffect(() => {
    fetchData();
  }, [requestStatus]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch borrowed items (status: borrowed)
      const borrowedResponse = await teacherAPI.getBorrowRequests({
        status: 'borrowed',
        per_page: 50,
      });
      setBorrowedItems(borrowedResponse.data.data);

      // Fetch all requests EXCEPT borrowed ones (they're in the borrowed tab)
      const requestsResponse = await teacherAPI.getBorrowRequests({
        status: requestStatus || undefined,
        per_page: 50,
      });
      
      // Filter out borrowed items from requests list
      const filteredRequests = requestsResponse.data.data.filter(
        (req: BorrowRequest) => req.status !== 'borrowed'
      );
      setRequests(filteredRequests);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this request?')) return;

    try {
      await teacherAPI.cancelBorrowRequest(id);
      toast({
        title: 'Success',
        description: 'Request cancelled successfully',
      });
      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel request',
        variant: 'destructive',
      });
    }
  };

  const borrowedColumns = [
    { key: 'id', label: 'Request ID', width: '100px', render: (value: number) => `#${value}` },
    { key: 'category.category_name', label: 'Category', width: '150px', render: (_: any, row: BorrowRequest) => row.category?.category_name || 'N/A' },
    { 
      key: 'quantity_requested', 
      label: 'Quantity',
      width: '100px',
      render: (_: any, row: BorrowRequest) => row.quantity_approved || row.quantity_requested || '—' 
    },
    { 
      key: 'borrow_date', 
      label: 'Borrowed Date',
      width: '130px',
      render: (_: any, row: BorrowRequest) => {
        const date = row.borrow_date || row.date_requested;
        return date ? formatDate(date) : '—';
      }
    },
    {
      key: 'expected_return_date',
      label: 'Expected Return',
      width: '200px',
      render: (value: string, row: BorrowRequest) => {
        if (!value) return '—';
        
        const returnDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        returnDate.setHours(0, 0, 0, 0);
        const isOverdue = returnDate.getTime() < today.getTime();
        const isDueToday = returnDate.getTime() === today.getTime();
        
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            borderRadius: '6px',
            fontWeight: '600',
            fontSize: '11px',
            backgroundColor: isOverdue ? '#ffe0e0' : isDueToday ? '#fff3cd' : '#d4edda',
            color: isOverdue ? '#dc3545' : isDueToday ? '#856404' : '#155724',
            border: `2px solid ${isOverdue ? '#dc3545' : isDueToday ? '#ffc107' : '#28a745'}`,
            whiteSpace: 'nowrap'
          }}>
            {isOverdue && '🔴'}
            {isDueToday && '⚠️'}
            {!isOverdue && !isDueToday && '✓'}
            {formatDate(value)}
            {isOverdue && ' (OVERDUE)'}
            {isDueToday && ' (DUE TODAY)'}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      width: '120px',
      render: (value: string) => <StatusBadge label={value} status={value} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '130px',
      render: (_: any, row: BorrowRequest) => (
        <button
          onClick={() => {
            setSelectedRequest(row);
            setShowDetailModal(true);
          }}
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          View Details
        </button>
      ),
    },
  ];

  const requestColumns = [
    { key: 'id', label: 'Request ID', render: (value: number) => `#${value}` },
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
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
          >
            View
          </button>
          {row.status === 'pending' && (
            <button
              onClick={() => handleCancelRequest(row.id)}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
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
        title="My Reservations" 
        subtitle="Track your equipment requests and manage borrowed items"
        showBackButton={true}
        showHomeButton={true}
        showMenuButton={true}
      >
        <NotificationProfile 
          currentUser={currentUser}
        />
      </NavHeader>
      
      {/* Mobile Title Section */}
      <div className="sm:hidden bg-white border-b px-4 py-4 mb-4">
        <h1 className="text-xl font-black text-gray-900 tracking-tight">My Reservations</h1>
        <p className="text-sm text-gray-500 font-medium">Manage items and track requests</p>
      </div>
      
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded shadow-sm border border-blue-50 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-sm flex items-center justify-center text-blue-600">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Borrowed</p>
              <p className="text-2xl font-black text-gray-900">{borrowedItems.length}</p>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded shadow-sm border border-amber-50 flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 rounded-sm flex items-center justify-center text-amber-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending</p>
              <p className="text-2xl font-black text-gray-900">
                {requests.filter(r => r.status === 'pending').length}
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow-sm border border-red-50 flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 rounded-sm flex items-center justify-center text-red-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Overdue</p>
              <p className="text-2xl font-black text-red-600">
                {borrowedItems.filter(item => {
                  if (!item.expected_return_date) return false;
                  const returnDate = new Date(item.expected_return_date);
                  returnDate.setHours(0, 0, 0, 0);
                  return returnDate.getTime() < new Date().setHours(0, 0, 0, 0);
                }).length}
              </p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          <div className="bg-white p-1.5 rounded shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
            <TabsList className="flex flex-col sm:grid sm:grid-cols-2 w-full max-w-md bg-transparent border-0 p-0 h-auto gap-1 sm:gap-0">
              <TabsTrigger 
                value="borrowed" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-sm transition-all duration-300 py-2.5 font-bold text-sm"
              >
                <Package className="w-4 h-4 mr-2" />
                Borrowed Items
              </TabsTrigger>
              <TabsTrigger 
                value="requests" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-sm transition-all duration-300 py-2.5 font-bold text-sm"
              >
                <ClipboardList className="w-4 h-4 mr-2" />
                Borrow Requests
              </TabsTrigger>
            </TabsList>

            <div className="hidden sm:flex items-center gap-2 px-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                Live Status
              </span>
            </div>
          </div>

          <TabsContent value="borrowed" className="mt-0 focus-visible:outline-none">
            <Card className="border-0 shadow-sm overflow-hidden rounded">
              <CardHeader className="bg-white border-b border-gray-50 py-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                      <Package className="w-5 h-5 text-blue-600" />
                      Items in Your Possession
                    </CardTitle>
                    <p className="text-sm text-gray-500 font-medium mt-1">These items are currently issued to you</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-blue-50/50 text-blue-700 border-blue-100 font-bold px-3 py-1">
                      Total: {borrowedItems.length}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {borrowedItems.length === 0 ? (
                  <div className="text-center py-20 bg-white">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                      <Package className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">No Borrowed Items</h3>
                    <p className="text-gray-500 max-w-xs mx-auto mt-2">
                      You don't have any items currently in your possession.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table 
                      columns={borrowedColumns} 
                      data={borrowedItems} 
                      loading={loading}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="mt-0 focus-visible:outline-none">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 w-full sm:w-auto">
                <div className="relative group w-full">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <Filter className="w-4 h-4" />
                  </div>
                  <select
                    className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block pl-10 pr-4 py-2.5 font-bold transition-all outline-none"
                    value={requestStatus}
                    onChange={(e) => setRequestStatus(e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">⏳ Pending Review</option>
                    <option value="approved">✅ Approved</option>
                    <option value="returned">🔙 Returned</option>
                    <option value="rejected">❌ Rejected</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-blue-50/50 px-4 py-2 rounded-sm border border-blue-100/50">
                <Info className="w-4 h-4 text-blue-600" />
                <p className="text-xs text-blue-800 font-bold tracking-tight">
                  Borrowed items are managed in the main tab
                </p>
              </div>
            </div>

            <Card className="border-0 shadow-sm overflow-hidden rounded">
              <CardHeader className="bg-white border-b border-gray-50 py-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-blue-600" />
                      Request History
                    </CardTitle>
                    <p className="text-sm text-gray-500 font-medium mt-1">Track the progress of your borrow requests</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-gray-50/50 text-gray-700 border-gray-200 font-bold px-3 py-1">
                      Results: {requests.length}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {requests.length === 0 ? (
                  <div className="text-center py-20 bg-white">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                      <ClipboardList className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">No Requests Found</h3>
                    <p className="text-gray-500 max-w-xs mx-auto mt-2">
                      No borrow requests match your current filters.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table columns={requestColumns} data={requests} loading={loading} />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Improved Detail Modal */}
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Request Details"
        >
          {selectedRequest && (
            <div className="space-y-6">
              {/* Status Header */}
              <div className={`p-4 rounded flex items-center justify-between ${
                selectedRequest.status === 'borrowed' ? 'bg-blue-50' :
                selectedRequest.status === 'approved' ? 'bg-green-50' :
                selectedRequest.status === 'pending' ? 'bg-amber-50' :
                'bg-gray-50'
              }`}>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Current Status</p>
                  <StatusBadge label={selectedRequest.status.toUpperCase()} status={selectedRequest.status} />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Request ID</p>
                  <p className="text-sm font-black text-gray-900">#{selectedRequest.id}</p>
                </div>
              </div>

              {/* Grid Content */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</label>
                  <p className="text-base font-bold text-gray-900">{selectedRequest.category?.category_name || 'N/A'}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Quantity</label>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-bold text-gray-900">{selectedRequest.quantity_requested} Requested</p>
                    {selectedRequest.quantity_approved && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100 font-bold">
                        {selectedRequest.quantity_approved} Approved
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Purpose</label>
                  <p className="text-sm font-medium text-gray-700 bg-gray-50/50 p-3 rounded-sm border border-gray-100 italic leading-relaxed">
                    "{selectedRequest.purpose || 'No purpose specified'}"
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Requested On</label>
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {formatDate(selectedRequest.date_requested)}
                  </div>
                </div>

                {selectedRequest.borrow_date && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Borrowed On</label>
                    <div className="flex items-center gap-2 text-sm font-bold text-blue-600">
                      <Clock className="w-4 h-4" />
                      {formatDate(selectedRequest.borrow_date)}
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Return Timeline</label>
                  {selectedRequest.expected_return_date ? (() => {
                    const returnDate = new Date(selectedRequest.expected_return_date);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    returnDate.setHours(0, 0, 0, 0);
                    const isOverdue = returnDate.getTime() < today.getTime();
                    const isDueToday = returnDate.getTime() === today.getTime();
                    
                    return (
                      <div className={`flex items-center gap-2 p-2 rounded border font-bold text-xs ${
                        isOverdue ? 'bg-red-50 text-red-700 border-red-100' : 
                        isDueToday ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                        'bg-blue-50 text-blue-700 border-blue-100'
                      }`}>
                        {isOverdue ? <AlertCircle className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                        {formatDate(selectedRequest.expected_return_date)}
                        {isOverdue && ' (OVERDUE)'}
                        {isDueToday && ' (DUE TODAY)'}
                      </div>
                    );
                  })() : <p className="text-gray-400 font-bold text-sm">Not specified</p>}
                </div>

                {selectedRequest.actual_return_date && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Actually Returned</label>
                    <div className="flex items-center gap-2 text-sm font-bold text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      {formatDate(selectedRequest.actual_return_date)}
                    </div>
                  </div>
                )}
              </div>

              {selectedRequest.admin_notes && (
                <div className="space-y-2 pt-4 border-t border-gray-100">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Administrator Feedback</label>
                  <div className="bg-blue-50/30 p-4 rounded border border-blue-100/50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Info className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="text-sm font-bold text-blue-900 leading-relaxed">
                      {selectedRequest.admin_notes}
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="bg-gray-900 text-white font-black px-8 py-3 rounded-sm hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-95 text-sm uppercase tracking-widest"
                >
                  Close View
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}

