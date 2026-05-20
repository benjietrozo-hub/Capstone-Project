import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Table } from '../../components/common/Table';
import { Button, FormField } from '../../components/common/FormElements';
import { PageLoader } from '../../components/common/Loader';
import { Modal } from '../../components/common/Modal';
import { adminAPI } from '../../api';
import { formatDate } from '../../utils/formatters.js';
import { toast } from '@/hooks/use-toast';
import NavHeader from '@/components/NavHeader';
import NotificationProfile from '@/components/NotificationProfile';
import { History, AlertCircle, Search, Filter, Download, Calendar, User, Package, Eye, FileText, Printer } from 'lucide-react';
import { exportToCSV, generateRequestPDF, generateIssueReportPDF } from '../../utils/exportUtils';

interface Report {
  id: number;
  teacher?: {
    full_name: string;
  };
  item?: {
    item_name: string;
  };
  report_type: string;
  description: string;
  status: string;
  admin_response?: string;
  resolution?: string;
  date_reported: string;
  created_at: string;
}

interface ResolutionForm {
  admin_notes: string;
  resolution_date: string;
}

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'borrow' | 'issue'>('borrow');
  const [reports, setReports] = useState<Report[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [expandedYears, setExpandedYears] = useState<number[]>([]);
  const [historyByYear, setHistoryByYear] = useState<Record<number, any[]>>({});
  const [loadingYears, setLoadingYears] = useState(true);
  const [loadingHistoryMap, setLoadingHistoryMap] = useState<Record<number, boolean>>({});
  const [paginationMap, setPaginationMap] = useState<Record<number, { current_page: number, last_page: number, total: number }>>({});
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedHistory, setSelectedHistory] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  
  const [resolutionForm, setResolutionForm] = useState<ResolutionForm>({
    admin_notes: '',
    resolution_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (activeTab === 'issue') {
      fetchReports();
    } else {
      fetchYears();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'borrow' && expandedYears.length > 0) {
      expandedYears.forEach(year => fetchBorrowHistoryForYear(year));
    }
  }, [status, searchQuery]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getReports({
        status: status || undefined,
        per_page: 50,
      });
      const rData = response.data.data;
      setReports(Array.isArray(rData) ? rData : (rData?.data || []));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load issue reports',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchYears = async () => {
    try {
      setLoadingYears(true);
      const response = await adminAPI.getBorrowHistoryYears();
      if (response.data?.success) {
        const years = response.data.data || [];
        setAvailableYears(years);
        if (years.length > 0) {
          toggleYear(years[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching history years:', error);
    } finally {
      setLoadingYears(false);
    }
  };

  const toggleYear = (year: number) => {
    const isExpanded = expandedYears.includes(year);
    if (isExpanded) {
      setExpandedYears(expandedYears.filter(y => y !== year));
    } else {
      setExpandedYears([...expandedYears, year]);
      if (!historyByYear[year]) {
        fetchBorrowHistoryForYear(year);
      }
    }
  };

  const fetchBorrowHistoryForYear = async (year: number, page: number = 1) => {
    try {
      setLoadingHistoryMap(prev => ({ ...prev, [year]: true }));
      const response = await adminAPI.getBorrowHistory({
        status: status || undefined,
        search: searchQuery,
        year: year,
        page: page,
        per_page: 50
      });
      
      const newData = response.data.data.data || [];
      const pagination = {
        current_page: response.data.data.current_page,
        last_page: response.data.data.last_page,
        total: response.data.data.total
      };

      setHistoryByYear(prev => ({ 
        ...prev, 
        [year]: page === 1 ? newData : [...(prev[year] || []), ...newData] 
      }));
      setPaginationMap(prev => ({ ...prev, [year]: pagination }));
    } catch (error) {
      console.error(`Error fetching history for ${year}:`, error);
    } finally {
      setLoadingHistoryMap(prev => ({ ...prev, [year]: false }));
    }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    try {
      await adminAPI.resolveReport(selectedReport.id, resolutionForm);
      toast({
        title: 'Success',
        description: 'Report resolved successfully',
      });
      setShowResolutionModal(false);
      setResolutionForm({ admin_notes: '', resolution_date: new Date().toISOString().split('T')[0] });
      fetchReports();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to resolve report',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadSingleBorrowPDF = (item: any) => {
    generateRequestPDF({
      id: item.id,
      request_code: item.request_code,
      teacher_name: item.teacher?.full_name,
      category_name: item.category?.category_name,
      quantity: item.inventory_items?.length || 0,
      status: item.status,
      date_requested: item.date_needed || item.created_at,
      expected_return: item.expected_return_date,
      purpose: item.purpose,
      admin_notes: item.admin_notes
    });
    toast({
      title: 'PDF Downloaded',
      description: `Manifest for request ${item.request_code} has been downloaded.`,
    });
  };

  const handleDownloadSingleBorrowCSV = (item: any) => {
    const recordData = [{
      'Transaction Code': item.request_code || `REQ-${item.id}`,
      'Teacher Name': item.teacher?.full_name || 'N/A',
      'Department': item.teacher?.department || 'N/A',
      'Equipment Category': item.category?.category_name || 'N/A',
      'Units Count': item.inventory_items?.length || 0,
      'Date Needed': item.date_needed ? formatDate(item.date_needed) : 'N/A',
      'Expected Return Date': item.expected_return_date ? formatDate(item.expected_return_date) : 'N/A',
      'Status': item.status,
      'Purpose': item.purpose || 'N/A',
    }];
    exportToCSV(recordData, `Borrow_Transaction_${item.request_code || item.id}`);
    toast({
      title: 'CSV Exported',
      description: `CSV for transaction ${item.request_code || item.id} has been exported.`,
    });
  };

  const handleDownloadSingleIssuePDF = (report: any) => {
    generateIssueReportPDF(report);
    toast({
      title: 'PDF Downloaded',
      description: `Issue report #${report.id} has been downloaded as PDF.`,
    });
  };

  const handleDownloadSingleIssueCSV = (report: any) => {
    const recordData = [{
      'Report ID': report.id,
      'Reported By': report.teacher?.full_name || 'N/A',
      'Equipment Affected': report.item?.item_name || 'N/A',
      'Report Type': report.report_type || 'N/A',
      'Description': report.description || 'N/A',
      'Status': report.status,
      'Admin Notes': report.admin_response || report.resolution || 'N/A',
      'Date Reported': report.date_reported ? formatDate(report.date_reported) : formatDate(report.created_at),
    }];
    exportToCSV(recordData, `Issue_Report_${report.id}`);
    toast({
      title: 'CSV Exported',
      description: `Issue report #${report.id} has been exported to CSV.`,
    });
  };

  const handleExportView = () => {
    if (activeTab === 'borrow') {
      const allData: any[] = [];
      availableYears.forEach(year => {
        if (historyByYear[year]) {
          allData.push(...historyByYear[year]);
        }
      });

      if (allData.length === 0) {
        toast({
          title: 'Export Failed',
          description: 'No borrow history data loaded. Please expand a year to load records first.',
          variant: 'destructive',
        });
        return;
      }

      const formattedData = allData.map(item => ({
        'Transaction Code': item.request_code || `REQ-${item.id}`,
        'Teacher Name': item.teacher?.full_name || 'N/A',
        'Department': item.teacher?.department || 'N/A',
        'Equipment Category': item.category?.category_name || 'N/A',
        'Units Count': item.inventory_items?.length || 0,
        'Date Needed': item.date_needed ? formatDate(item.date_needed) : 'N/A',
        'Expected Return Date': item.expected_return_date ? formatDate(item.expected_return_date) : 'N/A',
        'Status': item.status,
        'Purpose': item.purpose || 'N/A',
      }));

      exportToCSV(formattedData, `Borrow_History_Export_${new Date().toISOString().split('T')[0]}`);
      toast({
        title: 'Export Success',
        description: 'Borrow history exported successfully',
      });
    } else {
      if (reports.length === 0) {
        toast({
          title: 'Export Failed',
          description: 'No issue reports available to export.',
          variant: 'destructive',
        });
        return;
      }

      const formattedData = reports.map(report => ({
        'Report ID': report.id,
        'Reported By': report.teacher?.full_name || 'N/A',
        'Equipment Affected': report.item?.item_name || 'N/A',
        'Report Type': report.report_type || 'N/A',
        'Description': report.description || 'N/A',
        'Status': report.status,
        'Admin Notes': report.admin_response || report.resolution || 'N/A',
        'Date Reported': formatDate(report.date_reported || report.created_at),
      }));

      exportToCSV(formattedData, `Issue_Reports_Export_${new Date().toISOString().split('T')[0]}`);
      toast({
        title: 'Export Success',
        description: 'Issue reports exported successfully',
      });
    }
  };

  const columns = [
    { key: 'id', label: 'Report ID' },
    { key: 'teacher.full_name', label: 'Reported By', render: (_: any, row: Report) => row.teacher?.full_name },
    { key: 'item.item_name', label: 'Item', render: (_: any, row: Report) => row.item?.item_name },
    { key: 'report_type', label: 'Report Type' },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => <StatusBadge label={value} status={value} />,
    },
    { key: 'date_reported', label: 'Date', render: (_: any, row: Report) => formatDate(row.date_reported || row.created_at) },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: Report) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedReport(row);
              setShowDetailModal(true);
            }}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 font-bold animate-all"
          >
            View
          </button>
          {row.status !== 'resolved' && (
            <button
              onClick={() => {
                setSelectedReport(row);
                setShowResolutionModal(true);
              }}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 font-bold animate-all"
            >
              Resolve
            </button>
          )}
          <button
            onClick={() => handleDownloadSingleIssuePDF(row)}
            title="Download PDF Report"
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all border border-transparent hover:border-red-100"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDownloadSingleIssueCSV(row)}
            title="Export CSV"
            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-all border border-transparent hover:border-green-100"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <NavHeader 
        title="Inventory Reports" 
        subtitle="Historical borrow data and equipment issue reports"
        showBackButton={true}
      >
        <NotificationProfile currentUser={currentUser} />
      </NavHeader>
      
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        
        {/* Tabs and Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex bg-white p-1 rounded-sm shadow-sm border border-gray-200">
            <button
              onClick={() => { setActiveTab('borrow'); setStatus(''); }}
              className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-bold transition-all ${activeTab === 'borrow' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            >
              <History className="w-4 h-4" /> Borrow History
            </button>
            <button
              onClick={() => { setActiveTab('issue'); setStatus(''); }}
              className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-bold transition-all ${activeTab === 'issue' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            >
              <AlertCircle className="w-4 h-4" /> Issue Reports
            </button>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-sm text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-sm text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">All Statuses</option>
              {activeTab === 'borrow' ? (
                <>
                  <option value="returned">Returned</option>
                  <option value="borrowed">Currently Borrowed</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                </>
              ) : (
                <>
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="resolved">Resolved</option>
                </>
              )}
            </select>
            <button
              onClick={handleExportView}
              className="px-4 py-2 bg-slate-900 text-white rounded-sm text-sm font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm whitespace-nowrap"
              title="Export Current View to CSV"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>

        {activeTab === 'borrow' ? (
          <div className="space-y-4">
            {loadingYears ? (
              <div className="text-center py-12 bg-white rounded shadow-sm border border-gray-200">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-4 text-gray-500 font-medium">Loading history timeline...</p>
              </div>
            ) : availableYears.length === 0 ? (
              <div className="bg-white p-12 text-center rounded shadow-sm border border-gray-200">
                <History className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium text-lg">No borrow history recorded yet</p>
              </div>
            ) : (
              availableYears.map(year => (
                <div key={year} className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden transition-all duration-300">
                  <button 
                    onClick={() => toggleYear(year)}
                    className="w-full px-6 py-4 flex items-center justify-between bg-gray-50/50 hover:bg-gray-100/80 transition-colors border-b border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-sm bg-blue-100 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-800">{year} Transactions</h2>
                    </div>
                    <div className="flex items-center gap-4">
                      {historyByYear[year] && !loadingHistoryMap[year] && (
                        <span className="text-sm font-semibold px-3 py-1 bg-white rounded-full border border-gray-200 text-gray-600 shadow-sm">
                          {historyByYear[year].length} records
                        </span>
                      )}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-white border border-gray-200 shadow-sm transform transition-transform duration-300 ${expandedYears.includes(year) ? 'rotate-180' : ''}`}>
                         <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </button>
                  
                  {expandedYears.includes(year) && (
                    <div className="overflow-x-auto bg-white">
                      <table className="w-full text-left">
                        <thead className="bg-white border-b border-gray-100">
                          <tr>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest bg-gray-50/30">Transaction</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest bg-gray-50/30">Teacher</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest bg-gray-50/30">Equipment</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest bg-gray-50/30">Duration</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest bg-gray-50/30">Status</th>
                            <th className="px-6 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest bg-gray-50/30">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {loadingHistoryMap[year] ? (
                            <tr><td colSpan={6} className="px-6 py-12 text-center">
                              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mb-2"></div>
                              <p className="text-gray-400 font-medium">Loading records for {year}...</p>
                            </td></tr>
                          ) : !historyByYear[year] || historyByYear[year].length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                              <History className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                              <p>No records found for {year} with the current filters.</p>
                            </td></tr>
                          ) : (
                            historyByYear[year].map((item) => (
                              <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="text-sm font-bold text-gray-900">{item.request_code}</div>
                                  <div className="text-[10px] text-gray-500 font-mono">ID: {item.id}</div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black text-xs border border-blue-200/50">
                                      {item.teacher?.first_name?.[0]}{item.teacher?.last_name?.[0]}
                                    </div>
                                    <div>
                                      <div className="text-sm font-bold text-gray-900">{item.teacher?.full_name}</div>
                                      <div className="text-[10px] font-medium tracking-wide text-gray-500 uppercase">{item.teacher?.department || 'N/A'}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm font-bold text-gray-900">{item.category?.category_name}</div>
                                  <div className="text-xs font-medium text-gray-500 bg-gray-100 inline-block px-2 py-0.5 rounded-sm mt-1">
                                    {item.inventory_items?.length || 0} unit(s)
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-xs font-medium text-gray-700">Requested: {formatDate(item.date_needed)}</div>
                                  <div className="text-[10px] text-gray-500 italic mt-0.5">Expected Return: {formatDate(item.expected_return_date)}</div>
                                </td>
                                <td className="px-6 py-4">
                                  <StatusBadge label={item.status} status={item.status} />
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <div className="flex justify-end gap-1.5">
                                    <button 
                                      onClick={() => { setSelectedHistory(item); setShowHistoryModal(true); }}
                                      title="View Details"
                                      className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-sm transition-all shadow-sm border border-transparent hover:border-blue-100"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => handleDownloadSingleBorrowPDF(item)}
                                      title="Download PDF Manifest"
                                      className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-all shadow-sm border border-transparent hover:border-red-100"
                                    >
                                      <FileText className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => handleDownloadSingleBorrowCSV(item)}
                                      title="Export to CSV"
                                      className="p-2.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-sm transition-all shadow-sm border border-transparent hover:border-green-100"
                                    >
                                      <Download className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>

                      {paginationMap[year] && paginationMap[year].current_page < paginationMap[year].last_page && (
                        <div className="p-6 text-center border-t border-gray-50 bg-gray-50/20">
                          <button
                            onClick={() => fetchBorrowHistoryForYear(year, paginationMap[year].current_page + 1)}
                            disabled={loadingHistoryMap[year]}
                            className="px-6 py-2 bg-white border border-gray-200 rounded shadow-sm text-sm font-bold text-primary hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                          >
                            {loadingHistoryMap[year] ? 'Loading more...' : `Load More Records (${paginationMap[year].total - historyByYear[year].length} remaining)`}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden p-6">
            <Table columns={columns} data={reports} loading={loading} />
          </div>
        )}

        {/* History Detail Modal */}
        <Modal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          title="Transaction Details"
        >
          {selectedHistory && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-sm border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Request Code</p>
                  <p className="text-sm font-bold text-gray-700">{selectedHistory.request_code}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-sm border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                  <StatusBadge label={selectedHistory.status} status={selectedHistory.status} />
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-primary" /> Teacher Information
                </h4>
                <div className="p-4 bg-blue-50/50 rounded-sm border border-blue-100">
                  <p className="font-bold text-gray-900">{selectedHistory.teacher?.full_name}</p>
                  <p className="text-xs text-gray-600">{selectedHistory.teacher?.email}</p>
                  <p className="text-xs text-gray-600 mt-1">{selectedHistory.teacher?.department} Department</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                  <Package className="w-3.5 h-3.5 text-primary" /> Allocated Items
                </h4>
                <div className="space-y-2">
                  {selectedHistory.inventory_items?.map((unit: any) => (
                    <div key={unit.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-sm shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
                          <Package className="w-4 h-4 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{unit.item_name}</p>
                          <p className="text-[10px] text-gray-500 font-mono">SN: {unit.serial_number}</p>
                        </div>
                      </div>
                      <StatusBadge label={unit.pivot?.status || 'Allocated'} status={unit.pivot?.status} />
                    </div>
                  ))}
                  {(!selectedHistory.inventory_items || selectedHistory.inventory_items.length === 0) && (
                    <p className="text-xs text-gray-500 italic">No specific units were linked to this request.</p>
                  )}
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-sm border border-amber-100">
                <h4 className="text-xs font-black text-amber-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" /> Purpose
                </h4>
                <p className="text-sm text-amber-900 leading-relaxed">{selectedHistory.purpose || 'No purpose stated.'}</p>
              </div>
            </div>
          )}
        </Modal>

        {/* Existing Issue Report Detail Modal */}
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Issue Report Details"
        >
          {selectedReport && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-sm border border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Report ID</p>
                  <p className="text-lg font-black text-gray-900">#{selectedReport.id}</p>
                </div>
                <StatusBadge label={selectedReport.status} status={selectedReport.status} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Reported By</label>
                  <p className="text-sm font-bold text-gray-700">{selectedReport.teacher?.full_name}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Item Affected</label>
                  <p className="text-sm font-bold text-gray-700">{selectedReport.item?.item_name}</p>
                </div>
              </div>

              <div className="p-4 bg-red-50/50 rounded-sm border border-red-100">
                <label className="text-[10px] font-black text-red-800 uppercase tracking-widest block mb-1">Description of Issue</label>
                <p className="text-sm text-gray-800">{selectedReport.description}</p>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Date Reported</label>
                <p className="text-sm font-medium text-gray-600">{formatDate(selectedReport.date_reported || selectedReport.created_at)}</p>
              </div>
            </div>
          )}
        </Modal>

        {/* Resolution Modal */}
        <Modal
          isOpen={showResolutionModal}
          onClose={() => setShowResolutionModal(false)}
          title="Resolve Equipment Issue"
        >
          <form onSubmit={handleResolve} className="space-y-4">
            <FormField
              label="Resolution Date"
              type="date"
              value={resolutionForm.resolution_date}
              onChange={(e) =>
                setResolutionForm({ ...resolutionForm, resolution_date: e.target.value })
              }
            />
            <FormField
              label="Resolution Notes"
              type="textarea"
              value={resolutionForm.admin_notes}
              onChange={(e) =>
                setResolutionForm({ ...resolutionForm, admin_notes: e.target.value })
              }
              required
              placeholder="Explain how this issue was resolved..."
            />
            <div className="flex gap-4 pt-4">
              <Button type="submit" variant="success" className="flex-1">
                Mark as Resolved
              </Button>
              <Button variant="secondary" onClick={() => setShowResolutionModal(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}

