import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { TableSkeleton } from '../../components/common/Skeleton';
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
import { Package, ClipboardList, CheckCircle, XCircle, Eye, Download, FileText } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { exportToCSV, generateRequestPDF } from '../../utils/exportUtils';

interface BorrowRequest {
  id: number;
  teacher?: {
    full_name: string;
    employee_id?: string;
  };
  category_id?: number;
  category?: {
    category_name: string;
    description: string;
  };
  quantity_requested: number;
  status: string;
  borrow_date?: string;
  created_at?: string;
  date_requested?: string;
  expected_return_date?: string;
  actual_return_date?: string;
  admin_notes?: string;
  purpose?: string;
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
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'borrowed');
  const [selectedRequest, setSelectedRequest] = useState<BorrowRequest | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedViewRequest, setSelectedViewRequest] = useState<BorrowRequest | null>(null);
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

  const { 
    data: borrowedItems = [], 
    isLoading: loadingBorrowed 
  } = useQuery({
    queryKey: ['borrowed-items'],
    queryFn: async () => {
      const response = await adminAPI.getBorrowRequests({
        status: 'borrowed',
        per_page: 100,
      });
      return response.data.data;
    },
    enabled: activeTab === 'borrowed',
  });

  const { 
    data: requests = [], 
    isLoading: loadingRequests 
  } = useQuery({
    queryKey: ['pending-requests'],
    queryFn: async () => {
      const response = await adminAPI.getBorrowRequests({
        status: 'pending,approved', // Show both pending and approved
        per_page: 100,
      });
      return response.data.data;
    },
    enabled: activeTab === 'requests',
  });

  const loading = activeTab === 'borrowed' ? loadingBorrowed : loadingRequests;

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
      queryClient.invalidateQueries({ queryKey: ['borrowed-items'] });
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
    } catch (error: any) {
      console.error('Approval error:', error);

      let errorMessage = 'Failed to approve request';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;

        // Show detailed information if available
        if (error.response.data.details) {
          const details = error.response.data.details;
          if (details.quantity_available !== undefined) {
            errorMessage += ` (Available: ${details.quantity_available}, Requested: ${details.quantity_requested})`;
          }
        }
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleIssue = async (id: number) => {
    try {
      await adminAPI.issueBorrowRequest(id);
      toast({
        title: 'Success',
        description: 'Item issued successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['borrowed-items'] });
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to issue item',
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
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject request',
        variant: 'destructive',
      });
    }
  };

  const handleExportCSV = (data: BorrowRequest[], filename: string) => {
    const formattedData = data.map(req => ({
      'Request ID': `REQ-${req.id}`,
      'Teacher': req.teacher?.full_name || 'N/A',
      'Employee ID': req.teacher?.employee_id || 'N/A',
      'Category Name': req.category?.category_name || 'N/A',
      'Quantity': req.quantity_requested,
      'Status': req.status,
      'Date Requested': req.created_at ? new Date(req.created_at).toLocaleString() : 'N/A',
      'Expected Return': req.expected_return_date ? new Date(req.expected_return_date).toLocaleDateString() : 'N/A',
    }));
    exportToCSV(formattedData, filename);
  };

  const handleDownloadPDF = () => {
    if (!selectedViewRequest) return;
    
    generateRequestPDF({
      id: selectedViewRequest.id,
      teacher_name: selectedViewRequest.teacher?.full_name,
      employee_id: selectedViewRequest.teacher?.employee_id,
      category_name: selectedViewRequest.category?.category_name,
      quantity: selectedViewRequest.quantity_requested,
      status: selectedViewRequest.status,
      date_requested: selectedViewRequest.created_at,
      expected_return: selectedViewRequest.expected_return_date,
      purpose: selectedViewRequest.purpose,
      admin_notes: selectedViewRequest.admin_notes
    });
  };

  const handleReturn = async (id: number) => {
    if (!confirm('Mark this item as returned?')) return;
    
    try {
      await adminAPI.returnBorrowRequest(id, {});
      toast({
        title: 'Success',
        description: 'Item returned successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['borrowed-items'] });
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
                  <TableSkeleton rows={8} cols={7} />
                ) : (
                  <div>
                    <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h5 style={{ margin: 0, color: '#667eea' }}>
                          Currently Borrowed Items ({borrowedItems.length})
                        </h5>
                        <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '14px' }}>
                          Items that have been issued and are currently with teachers
                        </p>
                      </div>
                      <button
                        onClick={() => handleExportCSV(borrowedItems, 'Borrowed_Items')}
                        className="btn btn-outline-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '14px', border: '1px solid #667eea', color: '#667eea', borderRadius: '6px', background: 'transparent', cursor: 'pointer' }}
                      >
                        <Download className="w-4 h-4" />
                        Export CSV
                      </button>
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
                        <th style={{ padding: '12px', textAlign: 'left' }}>Category</th>
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
                              <div style={{ fontWeight: '600' }}>{item.category?.category_name || 'N/A'}</div>
                            </div>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>
                            {item.quantity_requested}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px' }}>
                            {item.created_at 
                              ? new Date(item.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) 
                              : 'N/A'}
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
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                              <button
                                onClick={() => {
                                  setSelectedViewRequest(item);
                                  setShowViewModal(true);
                                }}
                                className="btn btn-primary"
                                style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '4px' }}
                              >
                                <Eye className="w-3 h-3" /> View
                              </button>
                              <button
                                onClick={() => handleReturn(item.id)}
                                className="btn btn-success"
                                style={{ padding: '6px 12px', fontSize: '12px' }}
                              >
                                📥 Return
                              </button>
                            </div>
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
                  <TableSkeleton rows={8} cols={6} />
                ) : (
                  <div>
                    <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h5 style={{ margin: 0, color: '#667eea' }}>
                          Pending Borrow Requests ({requests.length})
                        </h5>
                        <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '14px' }}>
                          New requests waiting for approval
                        </p>
                      </div>
                      <button
                        onClick={() => handleExportCSV(requests, 'Borrow_Requests')}
                        className="btn btn-outline-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '14px', border: '1px solid #667eea', color: '#667eea', borderRadius: '6px', background: 'transparent', cursor: 'pointer' }}
                      >
                        <Download className="w-4 h-4" />
                        Export CSV
                      </button>
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
                        <th style={{ padding: '12px', textAlign: 'left' }}>Category</th>
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
                              <div style={{ fontWeight: '600' }}>{req.category?.category_name || 'N/A'}</div>
                            </div>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>
                            {req.quantity_requested}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px' }}>
                            {req.created_at 
                              ? new Date(req.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) 
                              : 'N/A'}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                              <button
                                onClick={() => {
                                  setSelectedViewRequest(req);
                                  setShowViewModal(true);
                                }}
                                className="btn btn-primary"
                                style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '4px' }}
                              >
                                <Eye className="w-3 h-3" /> View
                              </button>
                              {req.status === 'pending' && (
                                <>
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
                                    style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedRequest(req);
                                      setShowRejectionModal(true);
                                    }}
                                    className="btn btn-danger"
                                    style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                                  >
                                    <XCircle className="w-4 h-4" />
                                    Reject
                                  </button>
                                </>
                              )}
                              {req.status === 'approved' && (
                                <button
                                  onClick={() => handleIssue(req.id)}
                                  className="btn btn-info"
                                  style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px' }}
                                >
                                  📤 Issue
                                </button>
                              )}
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
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Approve Borrow Request
              </DialogTitle>
              <DialogDescription>
                Review the request details and approve the borrow request.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleApprove}>
              <div className="space-y-4">
                {/* Request Details */}
                {selectedRequest && (
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <h3 className="font-semibold text-sm text-gray-700">Request Details</h3>
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
                        <span className="text-gray-600">Category:</span>
                        <p className="font-semibold text-gray-900">{selectedRequest.category?.category_name || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Quantity Requested:</span>
                        <p className="font-semibold text-gray-900">{selectedRequest.quantity_requested}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Date Requested:</span>
                        <p className="font-semibold text-gray-900">
                          {selectedRequest.created_at 
                            ? new Date(selectedRequest.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) 
                            : 'N/A'}
                        </p>
                      </div>
                      {selectedRequest.expected_return_date && (
                        <div>
                          <span className="text-gray-600">Expected Return:</span>
                          <p className="font-semibold text-gray-900">
                            {new Date(selectedRequest.expected_return_date).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                    {selectedRequest.purpose && (
                      <div className="pt-2 border-t">
                        <span className="text-gray-600 text-sm">Purpose:</span>
                        <p className="text-gray-900 text-sm mt-1">{selectedRequest.purpose}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Approval Form */}
                <div className="space-y-4">
                  <div>
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
                    <p className="text-xs text-gray-500 mt-1">
                      Maximum: {selectedRequest?.quantity_requested}
                    </p>
                  </div>
                  
                  <div>
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
              </div>
              
              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowApprovalModal(false)}
                  className="px-6 py-2"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 text-base shadow-lg hover:shadow-xl transition-all duration-200"
                  style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    minWidth: '140px',
                    height: '48px'
                  }}
                >
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
                <XCircle className="w-5 h-5 text-red-600" />
                Reject Borrow Request
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
                    <span className="text-gray-600">Category:</span>
                    <p className="font-semibold text-gray-900">{selectedRequest.category?.category_name || 'N/A'}</p>
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

        {/* View Modal */}
        <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                Request Details
              </DialogTitle>
              <DialogDescription>
                View full details of the borrow request.
              </DialogDescription>
            </DialogHeader>
            
            {selectedViewRequest && (
              <div className="space-y-4 py-4">
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 block mb-1">Request ID</span>
                      <span className="font-medium text-gray-900">#{selectedViewRequest.id}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-1">Status</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedViewRequest.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        selectedViewRequest.status === 'borrowed' ? 'bg-blue-100 text-blue-800' :
                        selectedViewRequest.status === 'returned' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedViewRequest.status.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-1">Teacher</span>
                      <span className="font-medium text-gray-900">{selectedViewRequest.teacher?.full_name || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-1">Employee ID</span>
                      <span className="font-medium text-gray-900">{selectedViewRequest.teacher?.employee_id || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-1">Category</span>
                      <span className="font-medium text-gray-900">{selectedViewRequest.category?.category_name || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-1">Quantity</span>
                      <span className="font-medium text-gray-900">{selectedViewRequest.quantity_requested}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-1">Date Requested</span>
                      <span className="font-medium text-gray-900">
                        {selectedViewRequest.created_at ? new Date(selectedViewRequest.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-1">Expected Return</span>
                      <span className="font-medium text-gray-900">
                        {selectedViewRequest.expected_return_date ? new Date(selectedViewRequest.expected_return_date).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  {selectedViewRequest.purpose && (
                    <div className="pt-3 border-t border-gray-200 mt-3">
                      <span className="text-gray-500 block mb-1">Purpose</span>
                      <p className="text-sm text-gray-900 bg-white p-2 border rounded">{selectedViewRequest.purpose}</p>
                    </div>
                  )}

                  {selectedViewRequest.admin_notes && (
                    <div className="pt-3 border-t border-gray-200 mt-3">
                      <span className="text-gray-500 block mb-1">Admin Notes</span>
                      <p className="text-sm text-gray-900 bg-white p-2 border rounded">{selectedViewRequest.admin_notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <DialogFooter className="flex justify-between items-center w-full">
              <Button
                variant="outline"
                className="flex items-center gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                onClick={handleDownloadPDF}
              >
                <FileText className="w-4 h-4" /> Download PDF
              </Button>
              <Button 
                onClick={() => setShowViewModal(false)}
                className="bg-gray-800 text-white hover:bg-gray-700"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
