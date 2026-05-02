import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { TableSkeleton } from '../../components/common/Skeleton';
import { adminAPI } from '../../api';
import { formatDate, formatDateTime } from '../../utils/formatters';
import toast from 'react-hot-toast';
import NavHeader from '@/components/NavHeader';
import NotificationProfile from '@/components/NotificationProfile';
import { Eye, Download, FileText } from 'lucide-react';
import { exportToCSV, generateRequestPDF } from '../../utils/exportUtils';

interface BorrowRequest {
  id: number;
  request_code: string;
  teacher?: {
    full_name: string;
  };
  category_id: number;
  category?: {
    category_name: string;
  };
  quantity_requested: number;
  status: string;
  created_at: string;
  expected_return_date?: string;
  purpose?: string;
  admin_notes?: string;
}

interface ApprovalForm {
  inventory_item_ids: number[];
  expected_return_date: string;
  admin_notes: string;
}

interface RejectionForm {
  admin_notes: string;
}

export function BorrowRequestsPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<BorrowRequest | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedViewRequest, setSelectedViewRequest] = useState<BorrowRequest | null>(null);
  const [approvalForm, setApprovalForm] = useState<ApprovalForm>({
    inventory_item_ids: [],
    expected_return_date: '',
    admin_notes: '',
  });
  const [rejectionForm, setRejectionForm] = useState<RejectionForm>({
    admin_notes: '',
  });

  const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  const { 
    data: requestsResponse, 
    isLoading: loading 
  } = useQuery({
    queryKey: ['borrow-requests', { status }],
    queryFn: () => adminAPI.getBorrowRequests({
      status: status || undefined,
      per_page: 50,
    }),
    placeholderData: (previousData: any) => previousData,
  });

  const requests = requestsResponse?.data?.data || [];

  const { data: availableItemsResponse } = useQuery({
    queryKey: ['available-items', selectedRequest?.category_id],
    queryFn: () => adminAPI.getInventoryItems({ 
      category_id: selectedRequest?.category_id, 
      status: 'available',
      per_page: 500
    }),
    enabled: !!selectedRequest?.category_id && showApprovalModal,
  });

  const availableItems = availableItemsResponse?.data?.data || [];

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    
    if (approvalForm.inventory_item_ids.length !== selectedRequest.quantity_requested) {
      toast.error(`Please select exactly ${selectedRequest.quantity_requested} items.`);
      return;
    }

    try {
      await adminAPI.approveBorrowRequest(selectedRequest.id, approvalForm);
      toast.success('Request approved successfully');
      setShowApprovalModal(false);
      setApprovalForm({ inventory_item_ids: [], expected_return_date: '', admin_notes: '' });
      queryClient.invalidateQueries({ queryKey: ['borrow-requests'] });
      queryClient.invalidateQueries({ queryKey: ['available-items'] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve request');
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    try {
      await adminAPI.rejectBorrowRequest(selectedRequest.id, rejectionForm);
      toast.success('Request rejected successfully');
      setShowRejectionModal(false);
      setRejectionForm({ admin_notes: '' });
      queryClient.invalidateQueries({ queryKey: ['borrow-requests'] });
    } catch (error) {
      toast.error('Failed to reject request');
    }
  };

  const handleIssue = async (id: number) => {
    try {
      await adminAPI.issueBorrowRequest(id);
      toast.success('Item issued successfully');
      queryClient.invalidateQueries({ queryKey: ['borrow-requests'] });
    } catch (error) {
      toast.error('Failed to issue item');
    }
  };

  const handleReturn = async (id: number) => {
    try {
      // In a real implementation this should open a modal to confirm condition
      await adminAPI.returnBorrowRequest(id, {
        actual_return_date: new Date().toISOString().split('T')[0],
        condition_on_return: 'good'
      });
      toast.success('Item returned successfully');
      queryClient.invalidateQueries({ queryKey: ['borrow-requests'] });
    } catch (error) {
      toast.error('Failed to process return');
    }
  };

  const handleExportCSV = () => {
    const formattedData = requests.map(req => ({
      'Request ID': req.request_code || `REQ-${req.id}`,
      'Teacher': req.teacher?.full_name || 'N/A',
      'Category Name': req.category?.category_name || 'N/A',
      'Quantity': req.quantity_requested,
      'Status': req.status,
      'Date Requested': req.created_at ? formatDateTime(req.created_at) : 'N/A',
      'Expected Return': req.expected_return_date ? formatDate(req.expected_return_date) : 'N/A',
    }));
    exportToCSV(formattedData, 'Borrow_Requests');
  };

  const handleDownloadPDF = () => {
    if (!selectedViewRequest) return;
    
    generateRequestPDF({
      id: selectedViewRequest.id,
      request_code: selectedViewRequest.request_code,
      teacher_name: selectedViewRequest.teacher?.full_name,
      category_name: selectedViewRequest.category?.category_name,
      quantity: selectedViewRequest.quantity_requested,
      status: selectedViewRequest.status,
      date_requested: selectedViewRequest.created_at,
      expected_return: selectedViewRequest.expected_return_date,
      purpose: selectedViewRequest.purpose,
      admin_notes: selectedViewRequest.admin_notes
    });
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

  // Function to toggle selection of an item
  const toggleItemSelection = (itemId: number) => {
    setApprovalForm(prev => {
      const isSelected = prev.inventory_item_ids.includes(itemId);
      if (isSelected) {
        return { ...prev, inventory_item_ids: prev.inventory_item_ids.filter(id => id !== itemId) };
      } else {
        if (prev.inventory_item_ids.length >= (selectedRequest?.quantity_requested || 0)) {
          toast.error(`You can only select up to ${selectedRequest?.quantity_requested} items.`);
          return prev;
        }
        return { ...prev, inventory_item_ids: [...prev.inventory_item_ids, itemId] };
      }
    });
  };

  return (
    <div>
      <NavHeader 
        title="Borrow Requests" 
        subtitle="Review and manage equipment borrow requests"
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
        <h1 className="text-lg font-bold text-gray-900 mb-1">Borrow Requests</h1>
        <p className="text-sm text-gray-600">Review and manage equipment borrow requests</p>
      </div>
      
      <div className="p-6">
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-body">
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <label className="form-label">Filter by Status</label>
              <select
                className="form-control"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{ maxWidth: '250px' }}
              >
                <option value="">All Requests</option>
                <option value="pending">⏳ Pending</option>
                <option value="approved">✓ Approved</option>
                <option value="borrowed">📤 Borrowed</option>
                <option value="returned">📥 Returned</option>
                <option value="rejected">✕ Rejected</option>
              </select>
            </div>
            <button
              onClick={handleExportCSV}
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
                  <th style={{ padding: '12px', textAlign: 'left', borderRadius: '10px 0 0 0' }}>Code</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Teacher</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Category</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Date</th>
                  <th style={{ padding: '12px', textAlign: 'center', borderRadius: '0 10px 0 0' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '20px' }}>
                      <TableSkeleton rows={5} cols={7} />
                    </td>
                  </tr>
                ) : requests.map((req) => (
                  <tr key={req.id} style={{
                    borderBottom: '1px solid #e9ecef',
                    transition: 'background 0.3s ease'
                  }} onMouseOver={(e) => e.currentTarget.style.background = '#f8f9fa'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '12px', fontWeight: '600', color: '#667eea' }}>{req.request_code}</td>
                    <td style={{ padding: '12px' }}>{req.teacher?.full_name || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>{req.category?.category_name || 'N/A'}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>{req.quantity_requested}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span className={`badge ${getStatusColor(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px' }}>
                      {formatDateTime(req.created_at)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => {
                            setSelectedViewRequest(req);
                            setShowViewModal(true);
                          }}
                          className="btn btn-primary"
                          style={{ padding: '4px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '4px' }}
                        >
                          <Eye className="w-3 h-3" /> View
                        </button>
                        {req.status === 'pending' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedRequest(req);
                                setApprovalForm({
                                  inventory_item_ids: [],
                                  expected_return_date: '',
                                  admin_notes: '',
                                });
                                setShowApprovalModal(true);
                              }}
                              className="btn btn-success"
                              style={{ padding: '4px 10px', fontSize: '12px' }}
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRequest(req);
                                setShowRejectionModal(true);
                              }}
                              className="btn btn-danger"
                              style={{ padding: '4px 10px', fontSize: '12px' }}
                            >
                              ✕ Reject
                            </button>
                          </>
                        )}
                        {req.status === 'approved' && (
                          <button
                            onClick={() => handleIssue(req.id)}
                            className="btn btn-info"
                            style={{ padding: '4px 10px', fontSize: '12px' }}
                          >
                            📤 Issue
                          </button>
                        )}
                        {req.status === 'borrowed' && (
                          <button
                            onClick={() => handleReturn(req.id)}
                            className="btn btn-secondary"
                            style={{ padding: '4px 10px', fontSize: '12px' }}
                          >
                            📥 Return
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
                No requests found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '10px'
        }}>
          <div className="card" style={{ 
            maxWidth: '500px', 
            width: '100%',
            height: 'auto',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#f8f9fa',
            border: '3px solid #28a745'
          }}>
            <div className="card-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 14px',
              borderBottom: '1px solid #e9ecef'
            }}>
              <h5 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>Approve Request ({selectedRequest?.category?.category_name})</h5>
              <button
                onClick={() => setShowApprovalModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '18px',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '0'
                }}
              >
                ×
              </button>
            </div>
            
            {/* Form Fields */}
            <div style={{ 
              padding: '16px',
              overflowY: 'auto',
              flex: 1
            }}>
              <form onSubmit={handleApprove} id="approveForm">
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontWeight: '600', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Select Specific Serial Numbers <span style={{ color: '#dc3545' }}>*</span></span>
                    <span className="badge badge-primary">{approvalForm.inventory_item_ids.length} / {selectedRequest?.quantity_requested} Selected</span>
                  </label>
                  
                  <div style={{ 
                    border: '1px solid #dee2e6', 
                    borderRadius: '8px', 
                    maxHeight: '200px', 
                    overflowY: 'auto',
                    backgroundColor: '#fff' 
                  }}>
                    {availableItems.length === 0 ? (
                      <div style={{ padding: '16px', textAlign: 'center', color: '#dc3545', fontWeight: '500' }}>
                        No available items in this category!
                      </div>
                    ) : (
                      availableItems.map((item: any) => (
                        <label 
                          key={item.id} 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            padding: '10px 12px', 
                            borderBottom: '1px solid #f1f3f5',
                            cursor: 'pointer',
                            backgroundColor: approvalForm.inventory_item_ids.includes(item.id) ? '#e6f2ff' : 'transparent',
                            transition: 'background-color 0.2s'
                          }}
                        >
                          <input 
                            type="checkbox"
                            checked={approvalForm.inventory_item_ids.includes(item.id)}
                            onChange={() => toggleItemSelection(item.id)}
                            style={{ marginRight: '12px', width: '16px', height: '16px', cursor: 'pointer' }}
                          />
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '13px' }}>{item.serial_number}</div>
                            <div style={{ fontSize: '11px', color: '#6c757d' }}>{item.item_name} - {item.condition}</div>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontWeight: '500', marginBottom: '4px', display: 'block', fontSize: '13px' }}>
                    Expected Return Date
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={approvalForm.expected_return_date}
                    onChange={(e) => setApprovalForm({...approvalForm, expected_return_date: e.target.value})}
                    style={{ fontSize: '13px' }}
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontWeight: '500', marginBottom: '4px', display: 'block', fontSize: '13px' }}>
                    Admin Notes
                  </label>
                  <textarea
                    className="form-control"
                    value={approvalForm.admin_notes}
                    onChange={(e) =>
                      setApprovalForm({ ...approvalForm, admin_notes: e.target.value })
                    }
                    rows={2}
                    placeholder="Optional..."
                    style={{ fontSize: '13px', resize: 'vertical' }}
                  />
                </div>
              </form>
            </div>

            {/* Buttons - Always Visible */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              padding: '20px 20px',
              borderTop: '3px solid #28a745',
              backgroundColor: '#fff',
              position: 'sticky',
              bottom: 0,
              flexShrink: 0,
              boxShadow: '0 -2px 10px rgba(0,0,0,0.1)'
            }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowApprovalModal(false)}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="approveForm"
                className="btn btn-success"
                style={{
                  padding: '12px 30px',
                  fontSize: '16px',
                  fontWeight: '800',
                  minWidth: '120px',
                  height: '50px',
                  backgroundColor: '#28a745',
                  border: '3px solid #28a745',
                  boxShadow: '0 4px 8px rgba(40, 167, 69, 0.3)'
                }}
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '10px'
        }}>
          <div className="card" style={{ 
            maxWidth: '420px', 
            width: '100%',
            height: 'auto',
            maxHeight: '400px'
          }}>
            <div className="card-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 14px',
              borderBottom: '1px solid #e9ecef'
            }}>
              <h5 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>Reject Request</h5>
              <button
                onClick={() => setShowRejectionModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '18px',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '0',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>
            
            {/* Form Fields */}
            <div style={{ padding: '12px 14px' }}>
              <form onSubmit={handleReject}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontWeight: '500', marginBottom: '4px', display: 'block', fontSize: '12px' }}>
                    Reason for Rejection <span style={{ color: '#dc3545' }}>*</span>
                  </label>
                  <textarea
                    className="form-control"
                    value={rejectionForm.admin_notes}
                    onChange={(e) =>
                      setRejectionForm({ admin_notes: e.target.value })
                    }
                    rows={3}
                    required
                    placeholder="Please provide a reason..."
                    style={{ fontSize: '12px', padding: '5px 8px', resize: 'vertical' }}
                  />
                </div>
              </form>
            </div>

            {/* Buttons - Always Visible */}
            <div style={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'flex-end',
              padding: '10px 14px',
              borderTop: '1px solid #e9ecef',
              backgroundColor: '#fff'
            }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowRejectionModal(false)}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-danger"
                onClick={handleReject}
                style={{
                  padding: '6px 16px',
                  fontSize: '13px',
                  fontWeight: '600',
                  minWidth: '80px'
                }}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '10px'
        }}>
          <div className="card" style={{ 
            maxWidth: '500px', 
            width: '100%',
            height: 'auto',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div className="card-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              borderBottom: '1px solid #e9ecef'
            }}>
              <h5 style={{ margin: 0, fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye className="w-5 h-5" style={{ color: '#667eea' }} />
                Request Details
              </h5>
              <button
                onClick={() => setShowViewModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#666' }}
              >×</button>
            </div>
            
            <div style={{ padding: '16px', overflowY: 'auto' }}>
              {selectedViewRequest && (
                <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
                    <div>
                      <span style={{ color: '#666', display: 'block', fontSize: '12px', marginBottom: '2px' }}>Request Code</span>
                      <strong style={{ color: '#333' }}>{selectedViewRequest.request_code}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#666', display: 'block', fontSize: '12px', marginBottom: '2px' }}>Status</span>
                      <span className={`badge ${getStatusColor(selectedViewRequest.status)}`}>
                        {selectedViewRequest.status.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: '#666', display: 'block', fontSize: '12px', marginBottom: '2px' }}>Teacher</span>
                      <strong style={{ color: '#333' }}>{selectedViewRequest.teacher?.full_name || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#666', display: 'block', fontSize: '12px', marginBottom: '2px' }}>Category</span>
                      <strong style={{ color: '#333' }}>{selectedViewRequest.category?.category_name || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#666', display: 'block', fontSize: '12px', marginBottom: '2px' }}>Quantity</span>
                      <strong style={{ color: '#333' }}>{selectedViewRequest.quantity_requested}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#666', display: 'block', fontSize: '12px', marginBottom: '2px' }}>Date Requested</span>
                      <strong style={{ color: '#333' }}>{formatDateTime(selectedViewRequest.created_at)}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#666', display: 'block', fontSize: '12px', marginBottom: '2px' }}>Expected Return</span>
                      <strong style={{ color: '#333' }}>
                        {selectedViewRequest.expected_return_date ? formatDate(selectedViewRequest.expected_return_date) : 'N/A'}
                      </strong>
                    </div>
                  </div>
                  
                  {selectedViewRequest.purpose && (
                    <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #e9ecef' }}>
                      <span style={{ color: '#666', display: 'block', fontSize: '12px', marginBottom: '4px' }}>Purpose</span>
                      <div style={{ background: '#fff', padding: '8px', border: '1px solid #e9ecef', borderRadius: '4px', fontSize: '13px' }}>
                        {selectedViewRequest.purpose}
                      </div>
                    </div>
                  )}

                  {selectedViewRequest.admin_notes && (
                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e9ecef' }}>
                      <span style={{ color: '#666', display: 'block', fontSize: '12px', marginBottom: '4px' }}>Admin Notes</span>
                      <div style={{ background: '#fff', padding: '8px', border: '1px solid #e9ecef', borderRadius: '4px', fontSize: '13px' }}>
                        {selectedViewRequest.admin_notes}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '16px',
              borderTop: '1px solid #e9ecef',
              background: '#fff'
            }}>
              <button
                onClick={handleDownloadPDF}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  color: '#667eea',
                  border: '1px solid #667eea',
                  borderRadius: '6px',
                  background: 'transparent',
                  cursor: 'pointer'
                }}
              >
                <FileText className="w-4 h-4" /> Download PDF
              </button>
              <button
                onClick={() => setShowViewModal(false)}
                style={{
                  padding: '8px 24px',
                  fontSize: '14px',
                  color: '#fff',
                  background: '#343a40',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
