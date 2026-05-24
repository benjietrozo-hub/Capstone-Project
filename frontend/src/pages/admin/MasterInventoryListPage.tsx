import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, Edit, Eye, FileSpreadsheet, Search } from 'lucide-react';
import { adminAPI } from '@/api';
import NavHeader from '@/components/NavHeader';
import NotificationProfile from '@/components/NotificationProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface MasterInventoryRow {
  first_item_id: number;
  category_id: number;
  parent_category: string | null;
  category_name: string;
  item_name: string;
  quantity: number;
  unit: string | null;
  description: string | null;
  date_acquired: string | null;
  unit_price: string | number | null;
  source_of_fund: string | null;
  remarks: string | null;
}

export function MasterInventoryListPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState('all');
  const [sourceOfFund, setSourceOfFund] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [perPage, setPerPage] = useState(25);
  const [showExportPreview, setShowExportPreview] = useState(false);

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  }, []);

  const { data: categoriesResponse } = useQuery({
    queryKey: ['item-categories'],
    queryFn: () => adminAPI.getItemCategories(),
  });

  const categories = categoriesResponse?.data || [];

  const { data, isLoading } = useQuery({
    queryKey: ['inventory-master-list', page, search, categoryId, sourceOfFund, dateFrom, dateTo, perPage],
    queryFn: () => adminAPI.getInventoryMasterList({
      page,
      per_page: perPage,
      search: search || undefined,
      category_id: categoryId !== 'all' ? categoryId : undefined,
      source_of_fund: sourceOfFund !== 'all' ? sourceOfFund : undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    }),
  });

  const rows: MasterInventoryRow[] = data?.data?.data || [];
  const total = data?.data?.total || 0;
  const lastPage = data?.data?.last_page || 1;
  const from = data?.data?.from || 0;

  const sourceOptions = useMemo(() => {
    const sources = rows
      .map((row) => row.source_of_fund)
      .filter((source): source is string => !!source && source.trim() !== '');
    return Array.from(new Set(sources)).sort();
  }, [rows]);



  const formatMoney = (value: string | number | null) => {
    if (value === null || value === undefined || value === '') return 'N/A';
    const amount = Number(value);
    if (Number.isNaN(amount)) return String(value);
    return amount.toLocaleString(undefined, { style: 'currency', currency: 'PHP' });
  };

  const formatDate = (value: string | null) => {
    if (!value) return 'N/A';
    return new Date(value).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const escapeCsv = (value: any) => {
    const text = value === null || value === undefined || value === '' ? 'N/A' : String(value);
    return `"${text.replace(/"/g, '""')}"`;
  };

  const csvPreviewRows = rows.map((row, index) => [
    from + index,
    row.quantity,
    row.unit || 'unit',
    row.description || row.item_name,
    row.date_acquired || 'N/A',
    row.unit_price || 'N/A',
    row.unit_price ? (Number(row.unit_price) * row.quantity).toFixed(2) : 'N/A',
    row.source_of_fund || 'N/A',
    row.remarks || 'N/A',
  ]);

  const downloadCsv = () => {
    const headers = ['No.', 'Quantity', 'Unit', 'Description', 'Date Acquired', 'Unit Price', 'Total Price', 'Source of Fund', 'Remarks'];

    const csv = [headers, ...csvPreviewRows]
      .map((line) => line.map(escapeCsv).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `master_inventory_list_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportPreview(false);
  };

  const resetFilters = () => {
    setSearch('');
    setCategoryId('all');
    setSourceOfFund('all');
    setDateFrom('');
    setDateTo('');
    setPerPage(25);
    setPage(1);
  };



  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-10">
      <NavHeader
        title="Master Inventory List"
        subtitle="Consolidated inventory records grouped from serialized units"
        showBackButton={false}
        showHomeButton={true}
        showMenuButton={true}
      >
        <NotificationProfile currentUser={currentUser} />
      </NavHeader>

      <div className="p-4 md:p-10 space-y-6 max-w-[1600px] mx-auto">
        <Card className="border-slate-100 shadow-sm">
          <CardContent className="p-5">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded bg-blue-50 text-blue-600">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">Inventory Record Ledger</h2>
                  <p className="text-sm text-slate-500">
                    Showing grouped quantities while preserving the serialized inventory workflow.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative flex-1 lg:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search records..."
                    className="pl-10"
                  />
                </div>
                <Button onClick={() => setShowExportPreview(true)} disabled={rows.length === 0} className="gap-2">
                  <Eye className="w-4 h-4" />
                  View CSV
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3 mt-5 pt-5 border-t border-slate-100">
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setPage(1);
                }}
                className="h-10 rounded border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map((category: any) => (
                  <option key={category.id} value={category.id}>
                    {[category.parent_category || 'Uncategorized', category.category_name].join(' / ')}
                  </option>
                ))}
              </select>

              <select
                value={sourceOfFund}
                onChange={(e) => {
                  setSourceOfFund(e.target.value);
                  setPage(1);
                }}
                className="h-10 rounded border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Fund Sources</option>
                {sourceOptions.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2 bg-white rounded border border-slate-200 px-3 h-10">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">From</span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setPage(1);
                  }}
                  className="w-full text-sm text-slate-700 outline-none bg-transparent"
                  title="Date acquired from"
                />
              </div>

              <div className="flex items-center gap-2 bg-white rounded border border-slate-200 px-3 h-10">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">To</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setPage(1);
                  }}
                  className="w-full text-sm text-slate-700 outline-none bg-transparent"
                  title="Date acquired to"
                />
              </div>

              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setPage(1);
                }}
                className="h-10 rounded border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>

              <Button variant="outline" onClick={resetFilters}>
                Reset Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500 mb-2 mt-4">
          <span>
            Showing <strong className="text-slate-900">{rows.length}</strong> of <strong className="text-slate-900">{total}</strong> grouped records
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Previous
            </Button>
            <span className="px-3 py-1 font-bold text-slate-700">
              Page {page} of {lastPage}
            </span>
            <Button variant="outline" size="sm" disabled={page >= lastPage} onClick={() => setPage((p) => Math.min(lastPage, p + 1))}>
              Next
            </Button>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase text-slate-500 tracking-wider">
                <tr>
                  <th className="px-2 py-2 font-black whitespace-nowrap">No.</th>
                  <th className="px-2 py-2 font-black whitespace-nowrap">Qty</th>
                  <th className="px-2 py-2 font-black whitespace-nowrap">Unit</th>
                  <th className="px-2 py-2 font-black max-w-[200px]">Description</th>
                  <th className="px-2 py-2 font-black whitespace-nowrap">Acquired</th>
                  <th className="px-2 py-2 font-black whitespace-nowrap">Unit Price</th>
                  <th className="px-2 py-2 font-black whitespace-nowrap">Total Price</th>
                  <th className="px-2 py-2 font-black whitespace-nowrap">Fund Source</th>
                  <th className="px-2 py-2 font-black max-w-[150px]">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="px-2 py-8 text-center text-slate-500 font-medium">
                      Loading master inventory records...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-2 py-8 text-center text-slate-500 font-medium">
                      No master inventory records found.
                    </td>
                  </tr>
                ) : (
                  rows.map((row, index) => (
                    <tr key={`${row.first_item_id}-${index}`} className="hover:bg-blue-50/30">
                      <td className="px-2 py-2 font-bold text-slate-700 whitespace-nowrap">{from + index}</td>
                      <td className="px-2 py-2 font-black text-blue-600 whitespace-nowrap">{row.quantity}</td>
                      <td className="px-2 py-2 whitespace-nowrap">{row.unit || 'unit'}</td>
                      <td className="px-2 py-2 max-w-[200px] truncate" title={row.description || row.item_name}>
                        <div className="font-bold text-slate-900 truncate">{row.description || row.item_name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                          {[row.parent_category || 'Uncategorized', row.category_name, row.item_name].filter(Boolean).join(' / ')}
                        </div>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">{formatDate(row.date_acquired)}</td>
                      <td className="px-2 py-2 whitespace-nowrap font-medium">{formatMoney(row.unit_price)}</td>
                      <td className="px-2 py-2 whitespace-nowrap font-bold text-slate-800">
                        {row.unit_price ? formatMoney(Number(row.unit_price) * row.quantity) : 'N/A'}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap max-w-[100px] truncate" title={row.source_of_fund || 'N/A'}>
                        {row.source_of_fund || 'N/A'}
                      </td>
                      <td className="px-2 py-2 text-slate-600 max-w-[150px] line-clamp-2 text-[11px]" title={row.remarks || 'N/A'}>
                        {row.remarks || 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>



      <Dialog open={showExportPreview} onOpenChange={setShowExportPreview}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>CSV Export Preview</DialogTitle>
            <DialogDescription>
              Review the currently filtered master inventory rows before downloading the CSV file.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[520px] overflow-auto border border-slate-100 rounded bg-slate-50/30">
            <table className="w-full text-xs text-left">
              <thead className="sticky top-0 bg-white border-b border-slate-200">
                <tr>
                  {['No.', 'Quantity', 'Unit', 'Description', 'Date Acquired', 'Unit Price', 'Total Price', 'Source of Fund', 'Remarks'].map((header) => (
                    <th key={header} className="px-3 py-2 font-black uppercase text-slate-500 whitespace-nowrap">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {csvPreviewRows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-blue-50/40">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="px-3 py-2 text-slate-700 align-top">
                        {cell || 'N/A'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportPreview(false)}>
              Close
            </Button>
            <Button onClick={downloadCsv} className="gap-2">
              <Download className="w-4 h-4" />
              Download CSV
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
