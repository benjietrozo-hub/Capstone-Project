import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Table } from '../../components/common/Table';
import { FormField } from '../../components/common/FormElements';
import { Badge } from '../../components/common/Badge';
import { PageLoader } from '../../components/common/Loader';
import { Modal } from '../../components/common/Modal';
import { teacherAPI } from '../../api';
import { formatDate } from '../../utils/formatters';
import { toast } from '@/hooks/use-toast';
import NavHeader from '@/components/NavHeader';
import NotificationProfile from '@/components/NotificationProfile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, ClipboardList } from 'lucide-react';

interface BorrowRequest {
  id: number;
  item?: {
    item_name: string;
  };
  quantity_requested: number;
  quantity_approved?: number;
  purpose?: string;
  status: string;
  date_requested: string;
  expected_return_date?: string;
  actual_return_date?: string;
  admin_notes?: string;
}

export function MyReservationsPage() {
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [borrowedItems, setBorrowedItems] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestStatus, setRequestStatus] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<BorrowRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState('borrowed');

  useEffect(() => {
    fetchData();
  }, [requestStatus]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all requests
      const requestsResponse = await teacherAPI.getBorrowRequests({
        status: requestStatus || undefined,
        per_page: 50,
      });
      setRequests(requestsResponse.data.data);

      // Fetch borrowed items (status: borrowed)
      const borrowedResponse = await teacherAPI.getBorrowRequests({
        status: 'borrowed',
        per_page: 50,
      });
      setBorrowedItems(borrowedResponse.data.data);
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
    { key: 'id', label: 'Request ID', render: (value: number) => `#${value}` },
    { key: 'item.item_name', label: 'Item', render: (_: any, row: BorrowRequest) => row.item?.item_name },
    { key: 'quantity_approved', label: 'Quantity', render: (value: number) => value || '—' },
    { key: 'date_requested', label: 'Borrowed Date', render: (value: string) => formatDate(value) },
    {
      key: 'expected_return_date',
      label: 'Expected Return',
      render: (value: string) => value ? formatDate(value) : '—',
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => <Badge label={value} status={value} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: BorrowRequest) => (
        <button
          onClick={() => {
            setSelectedRequest(row);
            setShowDetailModal(true);
          }}
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
        >
          View Details
        </button>
      ),
    },
  ];

  const requestColumns = [
    { key: 'id', label: 'Request ID', render: (value: number) => `#${value}` },
    { key: 'item.item_name', label: 'Item', render: (_: any, row: BorrowRequest) => row.item?.item_name },
    { key: 'quantity_requested', label: 'Quantity' },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => <Badge label={value} status={value} />,
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
      >
        <NotificationProfile 
          notifications={[]}
          unreadCount={0}
          currentUser={currentUser}
          onMarkAsRead={() => {}}
          onMarkAllAsRead={() => {}}
        />
      </NavHeader>
      
      <div className="p-6">
        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="borrowed" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                My Borrowed Items
              </TabsTrigger>
              <TabsTrigger value="requests" className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4" />
                My Borrow Requests
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
                    { value: 'borrowed', label: 'Borrowed' },
                    { value: 'returned', label: 'Returned' },
                    { value: 'rejected', label: 'Rejected' },
                  ]}
                />
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
                <label className="font-semibold text-gray-700">Item</label>
                <p className="text-gray-600">{selectedRequest.item?.item_name}</p>
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
                <Badge label={selectedRequest.status} status={selectedRequest.status} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-gray-700">Date Requested</label>
                  <p className="text-gray-600">{formatDate(selectedRequest.date_requested)}</p>
                </div>
                <div>
                  <label className="font-semibold text-gray-700">Expected Return</label>
                  <p className="text-gray-600">
                    {selectedRequest.expected_return_date ? formatDate(selectedRequest.expected_return_date) : '—'}
                  </p>
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
