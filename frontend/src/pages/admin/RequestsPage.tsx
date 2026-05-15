import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { TableSkeleton } from '../../components/common/Skeleton';
import { adminAPI } from '../../api';
import { formatDate, formatDateTime } from '../../utils/formatters';
import toast from 'react-hot-toast';
import NavHeader from '@/components/NavHeader';
import NotificationProfile from '@/components/NotificationProfile';
import { Button } from '@/components/ui/button';
import { Eye, Download, FileText, CheckCircle, XCircle } from 'lucide-react';
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
    <div className="min-h-screen bg-[#f8fafc]">
      <NavHeader 
        title="Borrow Requests Queue" 
        subtitle="Manage and monitor all equipment borrow requests in one place"
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
        <h1 className="text-xl font-black text-gray-900 tracking-tight">Requests Queue</h1>
        <p className="text-sm text-gray-500 font-medium">Review and process requests</p>
      </div>
      
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-white p-5 rounded shadow-sm border border-gray-100">
          <div className="flex-1 w-full sm:w-auto">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                <FileText className="w-4 h-4" />
              </div>
              <select
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block pl-10 pr-4 py-3 font-bold transition-all outline-none"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="pending">⏳ Pending Review</option>
                <option value="approved">✅ Approved</option>
                <option value="borrowed">📤 Borrowed</option>
                <option value="returned">📥 Returned</option>
                <option value="rejected">❌ Rejected</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={handleExportCSV}
              className="flex-1 sm:flex-none rounded-sm border-gray-200 font-bold flex items-center justify-center gap-2 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-all h-12"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8"><TableSkeleton rows={8} cols={7} /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Code</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Teacher</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                    <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Qty</th>
                    <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                    <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-black text-indigo-600">{req.request_code}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-black text-gray-900">{req.teacher?.full_name || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-700">{req.category?.category_name || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center px-3 py-1 bg-gray-100 rounded text-sm font-black text-gray-700">
                          {req.quantity_requested}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          req.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                          req.status === 'borrowed' ? 'bg-blue-100 text-blue-700' :
                          req.status === 'returned' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-[11px] font-bold text-gray-500">
                          {formatDateTime(req.created_at)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedViewRequest(req);
                              setShowViewModal(true);
                            }}
                            className="p-2 text-indigo-600 bg-indigo-50 rounded-sm hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {req.status === 'pending' && (
                            <div className="flex items-center gap-2">
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
                                className="px-3 py-1.5 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedRequest(req);
                                  setShowRejectionModal(true);
                                }}
                                className="px-3 py-1.5 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-red-600 hover:text-white transition-all"
                              >
                                Reject
                              </button>
                            </div>
                          )}

                          {req.status === 'approved' && (
                            <button
                              onClick={() => handleIssue(req.id)}
                              className="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
                            >
                              Issue
                            </button>
                          )}

                          {req.status === 'borrowed' && (
                            <button
                              onClick={() => handleReturn(req.id)}
                              className="px-4 py-1.5 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100"
                            >
                              Return
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {requests.length === 0 && (
                <div className="text-center py-20 bg-white">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                    <FileText className="w-10 h-10 text-gray-200" />
                  </div>
                  <h4 className="text-lg font-black text-gray-900 tracking-tight">No Requests Found</h4>
                  <p className="text-sm text-gray-500 font-medium max-w-xs mx-auto mt-2 italic">
                    All clear! No pending requests match your filter.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Improved Modals for consistent feel */}
        {showApprovalModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="bg-emerald-600 px-6 py-6 text-white relative">
                <div className="absolute right-4 top-4">
                  <button onClick={() => setShowApprovalModal(false)} className="hover:bg-white/20 p-1 rounded transition-colors">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight">Approve Request</h3>
                <p className="text-emerald-100 text-xs font-bold mt-1 uppercase tracking-widest">{selectedRequest?.category?.category_name}</p>
              </div>

              <form onSubmit={handleApprove} className="p-6 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Select Serial Numbers *</label>
                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                      {approvalForm.inventory_item_ids.length} / {selectedRequest?.quantity_requested}
                    </span>
                  </div>
                  
                  <div className="border border-gray-100 rounded max-h-[180px] overflow-y-auto bg-gray-50/50 p-2 space-y-1">
                    {availableItems.length === 0 ? (
                      <div className="py-8 text-center">
                        <p className="text-xs font-bold text-red-500 uppercase">Insufficient stock available!</p>
                      </div>
                    ) : (
                      availableItems.map((item: any) => (
                        <label 
                          key={item.id} 
                          className={`flex items-center gap-3 p-3 rounded-sm border transition-all cursor-pointer ${
                            approvalForm.inventory_item_ids.includes(item.id) 
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' 
                            : 'bg-white text-gray-700 border-gray-100 hover:border-indigo-200'
                          }`}
                        >
                          <input 
                            type="checkbox"
                            checked={approvalForm.inventory_item_ids.includes(item.id)}
                            onChange={() => toggleItemSelection(item.id)}
                            className="hidden"
                          />
                          <div className="flex-1">
                            <p className="text-xs font-black tracking-tight">{item.serial_number}</p>
                            <p className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${
                              approvalForm.inventory_item_ids.includes(item.id) ? 'text-indigo-100' : 'text-gray-400'
                            }`}>
                              {item.condition} • {item.item_name}
                            </p>
                          </div>
                          {approvalForm.inventory_item_ids.includes(item.id) && (
                            <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-3 h-3" />
                            </div>
                          )}
                        </label>
                      ))
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Expected Return Date</label>
                    <input
                      type="date"
                      className="w-full h-12 bg-gray-50 border border-gray-200 rounded-sm px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                      value={approvalForm.expected_return_date}
                      onChange={(e) => setApprovalForm({...approvalForm, expected_return_date: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Admin Notes (Optional)</label>
                    <textarea
                      className="w-full bg-gray-50 border border-gray-200 rounded-sm px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                      value={approvalForm.admin_notes}
                      onChange={(e) => setApprovalForm({ ...approvalForm, admin_notes: e.target.value })}
                      rows={2}
                      placeholder="Special instructions for borrower..."
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowApprovalModal(false)}
                    className="flex-1 h-12 rounded-sm text-sm font-black text-gray-500 hover:bg-gray-50 transition-colors uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm text-sm font-black uppercase tracking-widest shadow-lg shadow-emerald-100 transition-all active:scale-95"
                  >
                    Confirm Approval
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Rejection Modal Upgrade */}
        {showRejectionModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-sm rounded-sm overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="bg-red-600 px-6 py-6 text-white relative">
                <h3 className="text-xl font-black uppercase tracking-tight">Reject Request</h3>
                <p className="text-red-100 text-xs font-bold mt-1">Provide a justification for the denial.</p>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Reason for Rejection *</label>
                  <textarea
                    className="w-full bg-gray-50 border border-gray-200 rounded px-4 py-4 text-sm font-medium focus:ring-2 focus:ring-red-500/20 transition-all outline-none min-h-[120px]"
                    value={rejectionForm.admin_notes}
                    onChange={(e) => setRejectionForm({ admin_notes: e.target.value })}
                    required
                    placeholder="e.g. Maintenance required, insufficient inventory..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowRejectionModal(false)}
                    className="flex-1 h-12 rounded-sm text-sm font-black text-gray-500 hover:bg-gray-50 transition-colors uppercase tracking-widest"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleReject}
                    className="flex-[2] h-12 bg-red-600 hover:bg-red-700 text-white rounded-sm text-sm font-black uppercase tracking-widest shadow-lg shadow-red-100 transition-all active:scale-95"
                  >
                    Deny Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Modal Upgrade */}
        {showViewModal && selectedViewRequest && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-xl rounded-[40px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
              <div className="bg-gray-900 px-8 py-10 text-white relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-10 scale-150 rotate-12 pointer-events-none">
                  <FileText className="w-48 h-48" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-4 py-1.5 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                      Request Details
                    </span>
                    <button onClick={() => setShowViewModal(false)} className="text-white/50 hover:text-white transition-colors">
                      <XCircle className="w-6 h-6" />
                    </button>
                  </div>
                  <h2 className="text-4xl font-black tracking-tight">{selectedViewRequest.request_code}</h2>
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2">
                    Submitted on {formatDateTime(selectedViewRequest.created_at)}
                  </p>
                </div>
              </div>

              <div className="p-10 space-y-10">
                <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Borrower</p>
                    <p className="text-lg font-black text-gray-900">{selectedViewRequest.teacher?.full_name || 'N/A'}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Status</p>
                    <div className={`inline-flex px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest border-2 ${
                      selectedViewRequest.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                      selectedViewRequest.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                      selectedViewRequest.status === 'borrowed' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                      'bg-gray-50 text-gray-600 border-gray-200'
                    }`}>
                      {selectedViewRequest.status}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Equipment Category</p>
                    <p className="text-lg font-black text-gray-900">{selectedViewRequest.category?.category_name || 'N/A'}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Quantity Requested</p>
                    <p className="text-lg font-black text-gray-900">{selectedViewRequest.quantity_requested} Unit(s)</p>
                  </div>
                </div>

                {selectedViewRequest.purpose && (
                  <div className="space-y-3 pt-6 border-t border-gray-50">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Statement of Purpose</p>
                    <div className="bg-gray-50/80 p-5 rounded-sm border border-gray-100/50 italic text-gray-700 leading-relaxed text-sm">
                      "{selectedViewRequest.purpose}"
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleDownloadPDF}
                    className="flex-1 h-14 bg-white border-2 border-gray-100 hover:border-indigo-600 hover:bg-indigo-50 text-indigo-600 rounded text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Download Manifest
                  </button>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="flex-1 h-14 bg-gray-900 hover:bg-black text-white rounded text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-gray-100"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
