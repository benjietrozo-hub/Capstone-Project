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
import { Package, ClipboardList, CheckCircle, XCircle, Eye, Download, FileText, Info, AlertCircle, Calendar, Clock } from 'lucide-react';
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
  inventory_item_ids: number[];
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
    inventory_item_ids: [],
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

  const { data: availableItemsResponse, isLoading: loadingAvailable } = useQuery({
    queryKey: ['available-items', selectedRequest?.category_id],
    queryFn: () => adminAPI.getInventoryItems({ 
      category_id: selectedRequest?.category_id, 
      status: 'available',
      per_page: 100
    }),
    enabled: !!selectedRequest?.category_id && showApprovalModal,
  });

  const availableItems = availableItemsResponse?.data?.data || [];

  const loading = activeTab === 'borrowed' ? loadingBorrowed : loadingRequests;

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    try {
      // Auto-assign items if none were selected (teacher made a general category request)
      let finalItemIds = [...approvalForm.inventory_item_ids];
      if (finalItemIds.length === 0 && availableItems.length >= selectedRequest.quantity_requested) {
        finalItemIds = availableItems.slice(0, selectedRequest.quantity_requested).map((i: any) => i.id);
      }

      if (finalItemIds.length !== selectedRequest.quantity_requested) {
        toast({
          title: 'Error',
          description: `Please select exactly ${selectedRequest.quantity_requested} items (or ensure enough are available).`,
          variant: 'destructive',
        });
        return;
      }

      await adminAPI.approveBorrowRequest(selectedRequest.id, {
        ...approvalForm,
        inventory_item_ids: finalItemIds
      });
      toast({
        title: 'Success',
        description: 'Request approved successfully',
      });
      setShowApprovalModal(false);
      setApprovalForm({ inventory_item_ids: [], expected_return_date: '', admin_notes: '' });
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

  const toggleItemSelection = (itemId: number) => {
    setApprovalForm(prev => {
      const isSelected = prev.inventory_item_ids.includes(itemId);
      if (isSelected) {
        return { ...prev, inventory_item_ids: prev.inventory_item_ids.filter(id => id !== itemId) };
      } else {
        if (prev.inventory_item_ids.length >= (selectedRequest?.quantity_requested || 0)) {
          toast({
            title: 'Selection Limit Reached',
            description: `You can only select up to ${selectedRequest?.quantity_requested} items.`,
            variant: 'destructive',
          });
          return prev;
        }
        return { ...prev, inventory_item_ids: [...prev.inventory_item_ids, itemId] };
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <NavHeader 
        title="Reservations Management" 
        subtitle="Process equipment requests and track issued items across the institution"
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
        <h1 className="text-xl font-black text-gray-900 tracking-tight">Reservations</h1>
        <p className="text-sm text-gray-500 font-medium">Manage institutional equipment</p>
      </div>
      
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-indigo-50 flex items-center gap-4 transition-all hover:shadow-md">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Requests</p>
              <p className="text-2xl font-black text-gray-900">{requests.filter(r => r.status === 'pending').length}</p>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-50 flex items-center gap-4 transition-all hover:shadow-md">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Issued Items</p>
              <p className="text-2xl font-black text-gray-900">{borrowedItems.length}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-50 flex items-center gap-4 transition-all hover:shadow-md">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">To Be Issued</p>
              <p className="text-2xl font-black text-emerald-600">
                {requests.filter(r => r.status === 'approved').length}
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-red-50 flex items-center gap-4 transition-all hover:shadow-md">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Overdue</p>
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
          <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <TabsList className="grid grid-cols-2 w-full max-w-md bg-transparent border-0 p-0">
              <TabsTrigger 
                value="borrowed" 
                className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-xl transition-all duration-300 py-3 font-black text-sm uppercase tracking-wider"
              >
                <Package className="w-4 h-4 mr-2" />
                Borrowed List
              </TabsTrigger>
              <TabsTrigger 
                value="requests" 
                className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-xl transition-all duration-300 py-3 font-black text-sm uppercase tracking-wider"
              >
                <ClipboardList className="w-4 h-4 mr-2" />
                Review Requests
              </TabsTrigger>
            </TabsList>

            <div className="hidden lg:flex items-center gap-4 px-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Live Management</span>
              </div>
            </div>
          </div>

          <TabsContent value="borrowed" className="mt-0 outline-none">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <div>
                <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                  <Package className="w-5 h-5 text-indigo-600" />
                  Currently Issued Equipment
                </h3>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">
                  Track items currently in teacher possession
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => handleExportCSV(borrowedItems, 'Borrowed_Items')}
                className="rounded-xl border-gray-200 font-bold flex items-center gap-2 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-all"
              >
                <Download className="w-4 h-4" />
                Export Data
              </Button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {loading ? (
                <div className="p-8"><TableSkeleton rows={8} cols={7} /></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Request</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Teacher</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Equipment</th>
                        <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Qty</th>
                        <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Borrowed</th>
                        <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Due Date</th>
                        <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {borrowedItems.map((item) => (
                        <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors group">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-black text-indigo-600">#{item.id}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-gray-900">{item.teacher?.full_name || 'N/A'}</span>
                              <span className="text-[10px] font-bold text-gray-400">{item.teacher?.employee_id || 'No ID'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-bold text-gray-700">{item.category?.category_name || 'N/A'}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg text-sm font-black text-gray-700">
                              {item.quantity_requested}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-[11px] font-bold text-gray-500">
                              {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {item.expected_return_date ? (() => {
                              const returnDate = new Date(item.expected_return_date);
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              returnDate.setHours(0, 0, 0, 0);
                              const isOverdue = returnDate < today;
                              const isDueToday = returnDate.getTime() === today.getTime();
                              
                              return (
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-black text-[10px] uppercase tracking-tight ${
                                  isOverdue ? 'bg-red-50 text-red-700 border-red-100 shadow-sm shadow-red-100' : 
                                  isDueToday ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                                  'bg-emerald-50 text-emerald-700 border-emerald-100'
                                }`}>
                                  {isOverdue && <AlertCircle className="w-3 h-3" />}
                                  {new Date(item.expected_return_date).toLocaleDateString()}
                                  {isOverdue && ' Overdue'}
                                </div>
                              );
                            })() : <span className="text-gray-400 font-bold">—</span>}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedViewRequest(item);
                                  setShowViewModal(true);
                                }}
                                className="p-2 text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleReturn(item.id)}
                                className="px-4 py-2 bg-emerald-600 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100 active:scale-95"
                              >
                                Return
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {borrowedItems.length === 0 && (
                    <div className="text-center py-20 bg-white">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="w-10 h-10 text-gray-200" />
                      </div>
                      <h4 className="text-lg font-black text-gray-900">Zero Active Borrows</h4>
                      <p className="text-sm text-gray-500 font-medium max-w-xs mx-auto mt-2 italic">
                        "Your shelves are full and your assets are safe."
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="requests" className="mt-0 outline-none">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <div>
                <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-indigo-600" />
                  Equipment Requests Queue
                </h3>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">
                  Review and process incoming teacher requests
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => handleExportCSV(requests, 'Borrow_Requests')}
                className="rounded-xl border-gray-200 font-bold flex items-center gap-2 hover:bg-indigo-50 hover:text-indigo-700"
              >
                <Download className="w-4 h-4" />
                Export Queue
              </Button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {loading ? (
                <div className="p-8"><TableSkeleton rows={8} cols={6} /></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Code</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Teacher</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                        <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Qty</th>
                        <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                        <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {requests.map((req) => (
                        <tr key={req.id} className="hover:bg-indigo-50/30 transition-colors group">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-black text-indigo-600">#{req.id}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-gray-900">{req.teacher?.full_name || 'N/A'}</span>
                              <span className="text-[10px] font-bold text-gray-400 uppercase">{req.teacher?.employee_id || 'Staff'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-bold text-gray-700">{req.category?.category_name || 'N/A'}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center justify-center px-3 py-1 bg-gray-100 rounded-lg text-sm font-black text-gray-700">
                              {req.quantity_requested}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-[11px] font-bold text-gray-500 whitespace-nowrap">
                              {req.created_at ? new Date(req.created_at).toLocaleDateString() : 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedViewRequest(req);
                                  setShowViewModal(true);
                                }}
                                className="p-2 text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              
                              {req.status === 'pending' && (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      setSelectedRequest(req);
                                      const preSelectedIds = req.inventoryItems?.map((i: any) => i.id) || [];
                                      setApprovalForm({
                                        inventory_item_ids: preSelectedIds,
                                        expected_return_date: req.expected_return_date || '',
                                        admin_notes: '',
                                      });
                                      setShowApprovalModal(true);
                                    }}
                                    className="px-3 py-1.5 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedRequest(req);
                                      setShowRejectionModal(true);
                                    }}
                                    className="px-3 py-1.5 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-600 hover:text-white transition-all"
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                              
                              {req.status === 'approved' && (
                                <button
                                  onClick={() => handleIssue(req.id)}
                                  className="px-4 py-2 bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-100 animate-pulse"
                                >
                                  Issue Now
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
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ClipboardList className="w-10 h-10 text-gray-200" />
                      </div>
                      <h4 className="text-lg font-black text-gray-900">Queue is Empty</h4>
                      <p className="text-sm text-gray-500 font-medium max-w-xs mx-auto mt-2 italic">
                        "Great work! You've processed all incoming requests."
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Upgrade Modals for Premium Feel */}
        <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
          <DialogContent className="sm:max-w-[500px] rounded-3xl p-0 overflow-hidden border-0 shadow-2xl">
            <div className="bg-indigo-600 px-6 py-6 text-white relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <CheckCircle className="w-32 h-32" />
              </div>
              <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
                Approval Required
              </DialogTitle>
              <DialogDescription className="text-indigo-100 font-medium mt-1">
                Assign equipment and set the return timeline.
              </DialogDescription>
            </div>
            
            <form onSubmit={handleApprove} className="p-6 space-y-6 bg-white">
              {selectedRequest && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Equipment</p>
                      <p className="text-sm font-black text-gray-900">{selectedRequest.category?.category_name}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Quantity</p>
                      <p className="text-sm font-black text-gray-900">{selectedRequest.quantity_requested} Unit(s)</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="expected-return-date" className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Expected Return Date</Label>
                    <Input
                      id="expected-return-date"
                      type="date"
                      className="rounded-xl border-gray-200 h-12 font-bold focus:ring-indigo-500/20"
                      value={approvalForm.expected_return_date}
                      onChange={(e) => setApprovalForm({ ...approvalForm, expected_return_date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="admin-notes" className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Instructions for Teacher</Label>
                    <Textarea
                      id="admin-notes"
                      className="rounded-xl border-gray-200 font-medium focus:ring-indigo-500/20"
                      value={approvalForm.admin_notes}
                      onChange={(e) => setApprovalForm({ ...approvalForm, admin_notes: e.target.value })}
                      placeholder="e.g. Handle with care, return to lab 101..."
                      rows={3}
                    />
                  </div>
                </div>
              )}
              
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowApprovalModal(false)}
                  className="flex-1 rounded-xl font-bold text-gray-500"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest rounded-xl h-12 shadow-lg shadow-indigo-100 transition-all active:scale-95"
                >
                  Approve & Assign
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Rejection Modal Upgrade */}
        <Dialog open={showRejectionModal} onOpenChange={setShowRejectionModal}>
          <DialogContent className="sm:max-w-[450px] rounded-3xl p-0 overflow-hidden border-0 shadow-2xl">
             <div className="bg-red-600 px-6 py-6 text-white relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <XCircle className="w-32 h-32" />
              </div>
              <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
                Deny Request
              </DialogTitle>
              <DialogDescription className="text-red-100 font-medium mt-1">
                Provide a reason for the rejection.
              </DialogDescription>
            </div>

            <form onSubmit={handleReject} className="p-6 space-y-6 bg-white">
              <div className="space-y-3">
                <Label htmlFor="rejection-reason" className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Reason for Rejection *</Label>
                <Textarea
                  id="rejection-reason"
                  className="rounded-xl border-gray-200 font-medium focus:ring-red-500/20 min-h-[120px]"
                  value={rejectionForm.admin_notes}
                  onChange={(e) => setRejectionForm({ admin_notes: e.target.value })}
                  placeholder="Items currently undergoing maintenance..."
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowRejectionModal(false)}
                  className="flex-1 rounded-xl font-bold text-gray-500"
                >
                  Back
                </Button>
                <Button 
                  type="submit" 
                  variant="destructive"
                  className="flex-[2] bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest rounded-xl h-12 shadow-lg shadow-red-100 transition-all active:scale-95"
                >
                  Confirm Denial
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* View Modal Upgrade */}
        <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
          <DialogContent className="sm:max-w-[550px] rounded-3xl p-0 overflow-hidden border-0 shadow-2xl">
            {selectedViewRequest && (
              <>
                <div className="bg-gray-900 px-6 py-8 text-white relative overflow-hidden">
                  <div className="absolute right-0 top-0 opacity-20 pointer-events-none">
                    <Info className="w-48 h-48 -mr-16 -mt-16" />
                  </div>
                  <div className="flex items-center justify-between relative z-10">
                    <div>
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Request Summary</p>
                      <h2 className="text-2xl font-black tracking-tight">REQ-{selectedViewRequest.id}</h2>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${
                      selectedViewRequest.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/50' :
                      selectedViewRequest.status === 'borrowed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/50' :
                      selectedViewRequest.status === 'returned' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50' :
                      'bg-gray-500/10 text-gray-400 border-gray-500/50'
                    }`}>
                      {selectedViewRequest.status}
                    </div>
                  </div>
                </div>

                <div className="p-8 space-y-8 bg-white">
                  <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Borrower</p>
                      <p className="text-base font-black text-gray-900">{selectedViewRequest.teacher?.full_name}</p>
                      <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-tighter">ID: {selectedViewRequest.teacher?.employee_id || 'N/A'}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Item Category</p>
                      <p className="text-base font-black text-gray-900">{selectedViewRequest.category?.category_name}</p>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Quantity: {selectedViewRequest.quantity_requested}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Requested On</p>
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(selectedViewRequest.created_at || '').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Due Date</p>
                      <div className="flex items-center gap-2 text-sm font-bold text-indigo-600">
                        <Clock className="w-4 h-4" />
                        {selectedViewRequest.expected_return_date ? new Date(selectedViewRequest.expected_return_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
                      </div>
                    </div>
                  </div>

                  {selectedViewRequest.purpose && (
                    <div className="space-y-2 pt-4 border-t border-gray-50">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Statement of Purpose</p>
                      <p className="text-sm font-medium text-gray-700 leading-relaxed italic bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        "{selectedViewRequest.purpose}"
                      </p>
                    </div>
                  )}

                  <div className="flex gap-4 pt-4">
                    <Button
                      variant="outline"
                      className="flex-1 rounded-2xl h-12 font-black uppercase text-[10px] tracking-widest border-2 border-gray-100 hover:bg-gray-50"
                      onClick={handleDownloadPDF}
                    >
                      <FileText className="w-4 h-4 mr-2 text-indigo-600" />
                      Manifest PDF
                    </Button>
                    <Button 
                      onClick={() => setShowViewModal(false)}
                      className="flex-1 bg-gray-900 text-white hover:bg-black rounded-2xl h-12 font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 shadow-xl shadow-gray-100"
                    >
                      Close Details
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
