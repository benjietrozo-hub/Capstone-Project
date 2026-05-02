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
import { Package, ClipboardList } from 'lucide-react';

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
        const isOverdue = returnDate < today;
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
    <div className="min-h-screen bg-gray-50">
      <NavHeader 
        title="My Reservations" 
        subtitle="Manage your borrowed items and track your requests"
        showBackButton={true}
        showHomeButton={true}
        showMenuButton={true}
      >
        <NotificationProfile 
          currentUser={currentUser}
        />
      </NavHeader>
      
      {/* Mobile Subtitle */}
      <div className="sm:hidden bg-white border-b px-4 py-3">
        <h1 className="text-lg font-bold text-gray-900 mb-1">My Reservations</h1>
        <p className="text-sm text-gray-600">Manage your borrowed items and track your requests</p>
      </div>
      
      <div className="p-3 sm:p-6 pt-4">
        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6">
              <TabsTrigger value="borrowed" className="flex items-center gap-2 text-xs sm:text-sm">
                <Package className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">My Borrowed Items</span>
                <span className="sm:hidden">Borrowed</span>
              </TabsTrigger>
              <TabsTrigger value="requests" className="flex items-center gap-2 text-xs sm:text-sm">
                <ClipboardList className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">My Borrow Requests</span>
                <span className="sm:hidden">Requests</span>
              </TabsTrigger>
            </TabsList>

            {/* My Borrowed Items Tab */}
            <TabsContent value="borrowed" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Currently Borrowed Items
                </h3>
                <span className="text-sm text-gray-600">
                  Total: {borrowedItems.length} item(s)
                </span>
              </div>
              
              {borrowedItems.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">You don't have any borrowed items at the moment</p>
                </div>
              ) : (
                <Table columns={borrowedColumns} data={borrowedItems} loading={loading} />
              )}
            </TabsContent>

            {/* My Borrow Requests Tab */}
            <TabsContent value="requests" className="space-y-4">
              <div className="mb-4">
                <FormField
                  label="Filter by Status"
                  type="select"
                  value={requestStatus}
                  onChange={(e) => setRequestStatus(e.target.value)}
                  options={[
                    { value: '', label: 'All Requests' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'approved', label: 'Approved' },
                    { value: 'returned', label: 'Returned' },
                    { value: 'rejected', label: 'Rejected' },
                  ]}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Note: Borrowed items are shown in the "My Borrowed Items" tab
                </p>
              </div>

              {requests.length === 0 ? (
                <div className="text-center py-12">
                  <ClipboardList className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No requests found</p>
                </div>
              ) : (
                <Table columns={requestColumns} data={requests} loading={loading} />
              )}
            </TabsContent>
          </Tabs>
        </Card>

        {/* Detail Modal */}
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Request Details"
        >
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <label className="font-semibold text-gray-700">Request ID</label>
                <p className="text-gray-600">#{selectedRequest.id}</p>
              </div>
              <div>
                <label className="font-semibold text-gray-700">Category</label>
                <p className="text-gray-600">{selectedRequest.category?.category_name || 'N/A'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-gray-700">Quantity Requested</label>
                  <p className="text-gray-600">{selectedRequest.quantity_requested}</p>
                </div>
                <div>
                  <label className="font-semibold text-gray-700">Quantity Approved</label>
                  <p className="text-gray-600">{selectedRequest.quantity_approved || '—'}</p>
                </div>
              </div>
              <div>
                <label className="font-semibold text-gray-700">Purpose</label>
                <p className="text-gray-600">{selectedRequest.purpose || '—'}</p>
              </div>
              <div>
                <label className="font-semibold text-gray-700">Status</label>
                <StatusBadge label={selectedRequest.status} status={selectedRequest.status} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-gray-700">Date Requested</label>
                  <p className="text-gray-600">{formatDate(selectedRequest.date_requested)}</p>
                </div>
                {selectedRequest.borrow_date && (
                  <div>
                    <label className="font-semibold text-gray-700">Borrowed Date</label>
                    <p className="text-gray-600">{formatDate(selectedRequest.borrow_date)}</p>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-gray-700">Expected Return</label>
                  {selectedRequest.expected_return_date ? (() => {
                    const returnDate = new Date(selectedRequest.expected_return_date);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    returnDate.setHours(0, 0, 0, 0);
                    const isOverdue = returnDate < today;
                    const isDueToday = returnDate.getTime() === today.getTime();
                    
                    return (
                      <p style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontWeight: '600',
                        fontSize: '12px',
                        backgroundColor: isOverdue ? '#ffe0e0' : isDueToday ? '#fff3cd' : '#d4edda',
                        color: isOverdue ? '#dc3545' : isDueToday ? '#856404' : '#155724',
                        border: `2px solid ${isOverdue ? '#dc3545' : isDueToday ? '#ffc107' : '#28a745'}`
                      }}>
                        {isOverdue && '🔴'}
                        {isDueToday && '⚠️'}
                        {!isOverdue && !isDueToday && '✓'}
                        {formatDate(selectedRequest.expected_return_date)}
                        {isOverdue && ' (OVERDUE)'}
                        {isDueToday && ' (DUE TODAY)'}
                      </p>
                    );
                  })() : <p className="text-gray-600">—</p>}
                </div>
              </div>
              {selectedRequest.actual_return_date && (
                <div>
                  <label className="font-semibold text-gray-700">Actual Return Date</label>
                  <p className="text-gray-600">{formatDate(selectedRequest.actual_return_date)}</p>
                </div>
              )}
              {selectedRequest.admin_notes && (
                <div>
                  <label className="font-semibold text-gray-700">Admin Notes</label>
                  <p className="text-gray-600">{selectedRequest.admin_notes}</p>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}

