import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import { toast } from '@/hooks/use-toast';
import NavHeader from '@/components/NavHeader';
import NotificationProfile from '@/components/NotificationProfile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Package, ClipboardList } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

interface BorrowRequest {
  id: number;
  teacher?: {
    full_name: string;
    employee_id?: string;
  };
  item?: {
    item_name: string;
    item_code: string;
  };
  quantity_requested: number;
  status: string;
  borrow_date: string;
  expected_return_date?: string;
  actual_return_date?: string;
  admin_notes?: string;
}

interface ApprovalForm {
  quantity_approved: number;
  expected_return_date: string;
  admin_notes: string;
}

interface RejectionForm {
  admin_notes: string;
}

export function ReservationsPage() {
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'borrowed');
  const [borrowedItems, setBorrowedItems] = useState<BorrowRequest[]>([]);
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<BorrowRequest | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [approvalForm, setApprovalForm] = useState<ApprovalForm>({
    quantity_approved: 0,
    expected_return_date: '',
    admin_notes: '',
  });
  const [rejectionForm, setRejectionForm] = useState<RejectionForm>({
    admin_notes: '',
  });

  const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  // Update active tab when URL parameter changes
  useEffect(() => {
    if (tabFromUrl && (tabFromUrl === 'borrowed' || tabFromUrl === 'requests')) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'borrowed') {
        // Fetch borrowed items (status: borrowed)
        const response = await adminAPI.getBorrowRequests({
          status: 'borrowed',
          per_page: 100,
        });
        setBorrowedItems(response.data.data);
      } else {
        // Fetch pending requests
        const response = await adminAPI.getBorrowRequests({
          status: 'pending',
          per_page: 100,
        });
        setRequests(response.data.data);
      }
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

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    try {
      await adminAPI.approveBorrowRequest(selectedRequest.id, approvalForm);
      toast({
        title: 'Success',
        description: 'Request approved successfully',
      });
      setShowApprovalModal(false);
      setApprovalForm({ quantity_approved: 0, expected_return_date: '', admin_notes: '' });
      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve request',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    try {
      await adminAPI.rejectBorrowRequest(selectedRequest.id, rejectionForm);
      toast({
        title: 'Success',
        description: 'Request rejected successfully',
      });
      setShowRejectionModal(false);
      setRejectionForm({ admin_notes: '' });
      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject request',
        variant: 'destructive',
      });
    }
  };

  const handleReturn = async (id: number) => {
    if (!confirm('Mark this item as returned?')) return;
    
    try {
      await adminAPI.returnBorrowRequest(id, {});
      toast({
        title: 'Success',
        description: 'Item returned successfully',
      });
      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process return',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'badge-warning';
      case 'approved': return 'badge-success';
      case 'borrowed': return 'badge-info';
      case 'returned': return 'badge-success';
      case 'rejected': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  return (
    <div>
      <NavHeader 
        title="Reservations Management" 
        subtitle="Manage borrowed items and borrow requests"
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
        <h1 className="text-lg font-bold text-gray-900 mb-1">Reservations Management</h1>
        <p className="text-sm text-gray-600">Manage borrowed items and borrow requests</p>
      </div>
      
      <div className="p-6">
        <div className="card">
          {/* Modern Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="borrowed" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Borrowed List
              </TabsTrigger>
              <TabsTrigger value="requests" className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4" />
                Borrow Requests
              </TabsTrigger>
            </TabsList>

            {/* Borrowed List Tab */}
            <TabsContent value="borrowed" className="space-y-4">
              <div className="card-body">
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
                    Loading...
                  </div>
                ) : (
                  <div>
                    <div style={{ marginBottom: '20px' }}>
                      <h5 style={{ margin: 0, color: '#667eea' }}>
                        Currently Borrowed Items ({borrowedItems.length})
                      </h5>
                      <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '14px' }}>
                        Items that have been issued and are currently with teachers
                      </p>
                    </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%' }}>
                    <thead>
                      <tr style={{
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        color: 'white',
                        fontWeight: '600'
                      }}>
                        <th style={{ padding: '12px', textAlign: 'left', borderRadius: '10px 0 0 0' }}>Request ID</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Teacher</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Item</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Qty</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Borrowed Date</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Expected Return</th>
                        <th style={{ padding: '12px', textAlign: 'center', borderRadius: '0 10px 0 0' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {borrowedItems.map((item) => (
                        <tr key={item.id} style={{
                          borderBottom: '1px solid #e9ecef',
                          transition: 'background 0.3s ease'
                        }} onMouseOver={(e) => e.currentTarget.style.background = '#f8f9fa'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding: '12px', fontWeight: '600', color: '#667eea' }}>
                            #{item.id}
                          </td>
                          <td style={{ padding: '12px' }}>
                            <div>
                              <div style={{ fontWeight: '600' }}>{item.teacher?.full_name || 'N/A'}</div>
                              {item.teacher?.employee_id && (
                                <div style={{ fontSize: '12px', color: '#666' }}>
                                  ID: {item.teacher.employee_id}
                                </div>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <div>
                              <div style={{ fontWeight: '600' }}>{item.item?.item_name || 'N/A'}</div>
                              {item.item?.item_code && (
                                <div style={{ fontSize: '12px', color: '#666' }}>
                                  {item.item.item_code}
                                </div>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>
                            {item.quantity_requested}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px' }}>
                            {item.borrow_date ? new Date(item.borrow_date).toLocaleDateString() : 'N/A'}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px' }}>
                            {item.expected_return_date ? (
                              (() => {
                                const returnDate = new Date(item.expected_return_date);
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                returnDate.setHours(0, 0, 0, 0);
                                const isOverdue = returnDate < today;
                                const isDueToday = returnDate.getTime() === today.getTime();
                                
                                return (
                                  <span style={{
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
                                    {new Date(item.expected_return_date).toLocaleDateString()}
                                    {isOverdue && ' (OVERDUE)'}
                                    {isDueToday && ' (DUE TODAY)'}
                                  </span>
                                );
                              })()
                            ) : 'N/A'}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <button
                              onClick={() => handleReturn(item.id)}
                              className="btn btn-success"
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                            >
                              📥 Mark as Returned
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {borrowedItems.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
                      <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <p>No borrowed items at the moment</p>
                    </div>
                  )}
                </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Borrow Requests Tab */}
            <TabsContent value="requests" className="space-y-4">
              <div className="card-body">
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
                    Loading...
                  </div>
                ) : (
                  <div>
                    <div style={{ marginBottom: '20px' }}>
                      <h5 style={{ margin: 0, color: '#667eea' }}>
                        Pending Borrow Requests ({requests.length})
                      </h5>
                      <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '14px' }}>
                        New requests waiting for approval
                      </p>
                    </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%' }}>
                    <thead>
                      <tr style={{
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        color: 'white',
                        fontWeight: '600'
                      }}>
                        <th style={{ padding: '12px', textAlign: 'left', borderRadius: '10px 0 0 0' }}>Request ID</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Teacher</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Item</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Qty</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Date Requested</th>
                        <th style={{ padding: '12px', textAlign: 'center', borderRadius: '0 10px 0 0' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map((req) => (
                        <tr key={req.id} style={{
                          borderBottom: '1px solid #e9ecef',
                          transition: 'background 0.3s ease'
                        }} onMouseOver={(e) => e.currentTarget.style.background = '#f8f9fa'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding: '12px', fontWeight: '600', color: '#667eea' }}>
                            #{req.id}
                          </td>
                          <td style={{ padding: '12px' }}>
                            <div>
                              <div style={{ fontWeight: '600' }}>{req.teacher?.full_name || 'N/A'}</div>
                              {req.teacher?.employee_id && (
                                <div style={{ fontSize: '12px', color: '#666' }}>
                                  ID: {req.teacher.employee_id}
                                </div>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <div>
                              <div style={{ fontWeight: '600' }}>{req.item?.item_name || 'N/A'}</div>
                              {req.item?.item_code && (
                                <div style={{ fontSize: '12px', color: '#666' }}>
                                  {req.item.item_code}
                                </div>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>
                            {req.quantity_requested}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px' }}>
                            {new Date(req.borrow_date).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                              <button
                                onClick={() => {
                                  setSelectedRequest(req);
                                  setApprovalForm({
                                    quantity_approved: req.quantity_requested,
                                    expected_return_date: '',
                                    admin_notes: '',
                                  });
                                  setShowApprovalModal(true);
                                }}
                                className="btn btn-success"
                                style={{ padding: '6px 12px', fontSize: '12px' }}
                              >
                                ✓ Approve
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedRequest(req);
                                  setShowRejectionModal(true);
                                }}
                                className="btn btn-danger"
                                style={{ padding: '6px 12px', fontSize: '12px' }}
                              >
                                ✕ Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {requests.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
                      <ClipboardList className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <p>No pending requests</p>
                    </div>
                  )}
                </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Approval Modal */}
        <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                <span className="text-green-600">✓</span> Approve Borrow Request
              </DialogTitle>
              <DialogDescription>
                Review the request details and add any notes for the teacher.
              </DialogDescription>
            </DialogHeader>
            
            {/* Request Details */}
            {selectedRequest && (
              <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
                <h3 className="font-semibold text-sm text-gray-700 mb-2">Request Details</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Request ID:</span>
                    <p className="font-semibold text-gray-900">#{selectedRequest.id}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Teacher:</span>
                    <p className="font-semibold text-gray-900">{selectedRequest.teacher?.full_name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Item:</span>
                    <p className="font-semibold text-gray-900">{selectedRequest.item?.item_name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Item Code:</span>
                    <p className="font-semibold text-gray-900">{selectedRequest.item?.item_code || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Quantity Requested:</span>
                    <p className="font-semibold text-gray-900">{selectedRequest.quantity_requested}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Date Requested:</span>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedRequest.borrow_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Requested Borrow Date:</span>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedRequest.borrow_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {selectedRequest.purpose && (
                  <div className="pt-2 border-t">
                    <span className="text-gray-600 text-sm">Purpose:</span>
                    <p className="text-gray-900 text-sm mt-1">{selectedRequest.purpose}</p>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleApprove}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="quantity-approved">Quantity to Approve *</Label>
                  <Input
                    id="quantity-approved"
                    type="number"
                    min="1"
                    max={selectedRequest?.quantity_requested}
                    value={approvalForm.quantity_approved}
                    onChange={(e) =>
                      setApprovalForm({ ...approvalForm, quantity_approved: parseInt(e.target.value) || 0 })
                    }
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Maximum: {selectedRequest?.quantity_requested}
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="expected-return-date">Expected Return Date *</Label>
                  <Input
                    id="expected-return-date"
                    type="date"
                    value={approvalForm.expected_return_date}
                    onChange={(e) =>
                      setApprovalForm({ ...approvalForm, expected_return_date: e.target.value })
                    }
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="admin-notes">Admin Notes (Optional)</Label>
                  <Textarea
                    id="admin-notes"
                    value={approvalForm.admin_notes}
                    onChange={(e) =>
                      setApprovalForm({ ...approvalForm, admin_notes: e.target.value })
                    }
                    placeholder="Add any notes or instructions for the teacher..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowApprovalModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Approve Request
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Rejection Modal */}
        <Dialog open={showRejectionModal} onOpenChange={setShowRejectionModal}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                <span className="text-red-600">✕</span> Reject Borrow Request
              </DialogTitle>
              <DialogDescription>
                Review the request details and provide a reason for rejection. The teacher will see this message.
              </DialogDescription>
            </DialogHeader>
            
            {/* Request Details */}
            {selectedRequest && (
              <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
                <h3 className="font-semibold text-sm text-gray-700 mb-2">Request Details</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Request ID:</span>
                    <p className="font-semibold text-gray-900">#{selectedRequest.id}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Teacher:</span>
                    <p className="font-semibold text-gray-900">{selectedRequest.teacher?.full_name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Item:</span>
                    <p className="font-semibold text-gray-900">{selectedRequest.item?.item_name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Item Code:</span>
                    <p className="font-semibold text-gray-900">{selectedRequest.item?.item_code || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Quantity Requested:</span>
                    <p className="font-semibold text-gray-900">{selectedRequest.quantity_requested}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Date Requested:</span>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedRequest.borrow_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {selectedRequest.purpose && (
                  <div className="pt-2 border-t">
                    <span className="text-gray-600 text-sm">Purpose:</span>
                    <p className="text-gray-900 text-sm mt-1">{selectedRequest.purpose}</p>
                  </div>
                )}
              </div>
            )}
            
            <form onSubmit={handleReject}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="rejection-reason">Reason for Rejection *</Label>
                  <Textarea
                    id="rejection-reason"
                    value={rejectionForm.admin_notes}
                    onChange={(e) =>
                      setRejectionForm({ admin_notes: e.target.value })
                    }
                    placeholder="Please provide a clear reason for rejecting this request..."
                    rows={3}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowRejectionModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="destructive">
                  Reject Request
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
