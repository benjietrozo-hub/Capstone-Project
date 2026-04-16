import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';
import NavHeader from '@/components/NavHeader';
import NotificationProfile from '@/components/NotificationProfile';

interface BorrowRequest {
  id: number;
  request_code: string;
  teacher?: {
    full_name: string;
  };
  item?: {
    item_name: string;
  };
  quantity_requested: number;
  status: string;
  created_at: string;
}

interface ApprovalForm {
  quantity_approved: string | number;
  expected_return_date: string;
  admin_notes: string;
}

interface RejectionForm {
  admin_notes: string;
}

export function BorrowRequestsPage() {
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<BorrowRequest | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [approvalForm, setApprovalForm] = useState<ApprovalForm>({
    quantity_approved: '',
    expected_return_date: '',
    admin_notes: '',
  });
  const [rejectionForm, setRejectionForm] = useState<RejectionForm>({
    admin_notes: '',
  });

  const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    fetchRequests();
  }, [status]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getBorrowRequests({
        status: status || undefined,
        per_page: 50,
      });
      setRequests(response.data.data);
    } catch (error) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    try {
      await adminAPI.approveBorrowRequest(selectedRequest.id, approvalForm);
      toast.success('Request approved successfully');
      setShowApprovalModal(false);
      setApprovalForm({ quantity_approved: '', expected_return_date: '', admin_notes: '' });
      fetchRequests();
    } catch (error) {
      toast.error('Failed to approve request');
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
      fetchRequests();
    } catch (error) {
      toast.error('Failed to reject request');
    }
  };

  const handleIssue = async (id: number) => {
    try {
      await adminAPI.issueBorrowRequest(id);
      toast.success('Item issued successfully');
      fetchRequests();
    } catch (error) {
      toast.error('Failed to issue item');
    }
  };

  const handleReturn = async (id: number) => {
    try {
      await adminAPI.returnBorrowRequest(id, {});
      toast.success('Item returned successfully');
      fetchRequests();
    } catch (error) {
      toast.error('Failed to process return');
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
          <div style={{ marginBottom: '20px' }}>
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
                  <th style={{ padding: '12px', textAlign: 'left' }}>Item</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Date</th>
                  <th style={{ padding: '12px', textAlign: 'center', borderRadius: '0 10px 0 0' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} style={{
                    borderBottom: '1px solid #e9ecef',
                    transition: 'background 0.3s ease'
                  }} onMouseOver={(e) => e.currentTarget.style.background = '#f8f9fa'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '12px', fontWeight: '600', color: '#667eea' }}>{req.request_code}</td>
                    <td style={{ padding: '12px' }}>{req.teacher?.full_name || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>{req.item?.item_name || 'N/A'}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>{req.quantity_requested}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span className={`badge ${getStatusColor(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px' }}>
                      {formatDate(req.created_at)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
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
            maxWidth: '420px', 
            width: '100%',
            height: 'auto',
            maxHeight: '600px',
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
              <h5 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>Approve Request</h5>
              <button
                onClick={() => setShowApprovalModal(false)}
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
            <div style={{ 
              padding: '12px 14px',
              overflowY: 'auto',
              flex: 1,
              maxHeight: '450px'
            }}>
              <form onSubmit={handleApprove} id="approveForm">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontWeight: '500', marginBottom: '4px', display: 'block', fontSize: '12px' }}>
                      Quantity <span style={{ color: '#dc3545' }}>*</span>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      min={1}
                      max={selectedRequest?.quantity_requested ?? undefined}
                      value={approvalForm.quantity_approved}
                      onChange={(e) =>
                        setApprovalForm({ ...approvalForm, quantity_approved: e.target.value })
                      }
                      required
                      style={{ fontSize: '12px', padding: '5px 8px' }}
                    />
                    {selectedRequest?.quantity_requested ? (
                      <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
                        Max: {selectedRequest.quantity_requested}
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <label style={{ fontWeight: '500', marginBottom: '4px', display: 'block', fontSize: '12px' }}>
                      Return Date <span style={{ color: '#dc3545' }}>*</span>
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      value={approvalForm.expected_return_date}
                      onChange={(e) =>
                        setApprovalForm({ ...approvalForm, expected_return_date: e.target.value })
                      }
                      required
                      style={{ fontSize: '12px', padding: '5px 8px' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontWeight: '500', marginBottom: '4px', display: 'block', fontSize: '12px' }}>
                    Notes
                  </label>
                  <textarea
                    className="form-control"
                    value={approvalForm.admin_notes}
                    onChange={(e) =>
                      setApprovalForm({ ...approvalForm, admin_notes: e.target.value })
                    }
                    rows={2}
                    placeholder="Optional..."
                    style={{ fontSize: '12px', padding: '5px 8px', resize: 'vertical' }}
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
      </div>
    </div>
  );
}
