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
import NavHeader from '@/components/NavHeader';
import NotificationProfile from '@/components/NotificationProfile';

interface BorrowRequest {
  id: number;
  request_code: string;
  item?: {
    item_name: string;
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
    { key: 'item.item_name', label: 'Item', render: (_: any, row: BorrowRequest) => row.item?.item_name },
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
    <div>
      <NavHeader 
        title="My Borrow Requests" 
        subtitle="Track and manage your equipment requests"
        showBackButton={true}
        showHomeButton={true}
        showMenuButton={true}
      >
        <NotificationProfile 
          notifications={[]}
          unreadCount={0}
          currentUser={currentUser}
          onMarkAsRead={() => {}}
          onMarkAllAsRead={() => {}}
        />
      </NavHeader>
      
      {/* Mobile Subtitle */}
      <div className="sm:hidden bg-white border-b px-4 py-3">
        <h1 className="text-lg font-bold text-gray-900 mb-1">My Borrow Requests</h1>
        <p className="text-sm text-gray-600">Track and manage your equipment requests</p>
      </div>
      
      <div className="p-6">
        <Card>
        <div className="mb-6">
          <FormField
            label="Filter by Status"
            type="select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: '', label: 'All Requests' },
              { value: 'pending', label: 'Pending' },
              { value: 'approved', label: 'Approved' },
              { value: 'returned', label: 'Returned' },
              { value: 'rejected', label: 'Rejected' },
            ]}
          />
          <p className="text-xs text-gray-500 mt-1">
            Note: Borrowed items are shown in "My Reservations" page
          </p>
        </div>

        <Table columns={columns} data={requests} loading={loading} />
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
              <label className="font-semibold text-gray-700">Request Code</label>
              <p className="text-gray-600">{selectedRequest.request_code}</p>
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
              <StatusBadge label={selectedRequest.status} status={selectedRequest.status} />
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

