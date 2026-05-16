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
  const [editingRow, setEditingRow] = useState<MasterInventoryRow | null>(null);
  const [editForm, setEditForm] = useState({
    unit: '',
    description: '',
    date_acquired: '',
    unit_price: '',
    source_of_fund: '',
    remarks: '',
  });
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

  const updateMutation = useMutation({
    mutationFn: (payload: any) => adminAPI.updateInventoryMasterListGroup(payload),
    onSuccess: (response: any) => {
      toast.success(response.data?.message || 'Master inventory row updated');
      setEditingRow(null);
      queryClient.invalidateQueries({ queryKey: ['inventory-master-list'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update master inventory row');
    },
  });

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
    row.source_of_fund || 'N/A',
    row.remarks || 'N/A',
  ]);

  const downloadCsv = () => {
    const headers = ['No.', 'Quantity', 'Unit', 'Description', 'Date Acquired', 'Unit Price', 'Source of Fund', 'Remarks'];

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

  const openEditModal = (row: MasterInventoryRow) => {
    setEditingRow(row);
    setEditForm({
      unit: row.unit || 'unit',
      description: row.description || row.item_name || '',
      date_acquired: row.date_acquired ? row.date_acquired.split('T')[0] : '',
      unit_price: row.unit_price ? String(row.unit_price) : '',
      source_of_fund: row.source_of_fund || '',
      remarks: row.remarks || '',
    });
  };

  const handleSaveEdit = () => {
    if (!editingRow) return;

    updateMutation.mutate({
      category_id: editingRow.category_id,
      item_name: editingRow.item_name,
      current_unit: editingRow.unit,
      current_description: editingRow.description,
      current_date_acquired: editingRow.date_acquired ? editingRow.date_acquired.split('T')[0] : null,
      current_unit_price: editingRow.unit_price,
      current_source_of_fund: editingRow.source_of_fund,
      current_remarks: editingRow.remarks,
      unit: editForm.unit,
      description: editForm.description,
      date_acquired: editForm.date_acquired,
      unit_price: editForm.unit_price,
      source_of_fund: editForm.source_of_fund,
      remarks: editForm.remarks,
    });
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

              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPage(1);
                }}
                title="Date acquired from"
              />

              <Input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPage(1);
                }}
                title="Date acquired to"
              />

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

        <div className="bg-white border border-slate-100 rounded shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-black whitespace-nowrap">No.</th>
                  <th className="px-4 py-3 font-black whitespace-nowrap">Quantity</th>
                  <th className="px-4 py-3 font-black whitespace-nowrap">Unit</th>
                  <th className="px-4 py-3 font-black min-w-[280px]">Description</th>
                  <th className="px-4 py-3 font-black whitespace-nowrap">Date Acquired</th>
                  <th className="px-4 py-3 font-black whitespace-nowrap">Unit Price</th>
                  <th className="px-4 py-3 font-black whitespace-nowrap">Source of Fund</th>
                  <th className="px-4 py-3 font-black min-w-[220px]">Remarks</th>
                  <th className="px-4 py-3 font-black whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-16 text-center text-slate-500 font-medium">
                      Loading master inventory records...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-16 text-center text-slate-500 font-medium">
                      No master inventory records found.
                    </td>
                  </tr>
                ) : (
                  rows.map((row, index) => (
                    <tr key={`${row.first_item_id}-${index}`} className="hover:bg-blue-50/30">
                      <td className="px-4 py-3 font-bold text-slate-700">{from + index}</td>
                      <td className="px-4 py-3 font-black text-blue-600">{row.quantity}</td>
                      <td className="px-4 py-3">{row.unit || 'unit'}</td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{row.description || row.item_name}</div>
                        <div className="text-xs text-slate-400 mt-1">
                          {[row.parent_category || 'Uncategorized', row.category_name, row.item_name].filter(Boolean).join(' / ')}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{formatDate(row.date_acquired)}</td>
                      <td className="px-4 py-3 whitespace-nowrap font-medium">{formatMoney(row.unit_price)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{row.source_of_fund || 'N/A'}</td>
                      <td className="px-4 py-3 text-slate-600">{row.remarks || 'N/A'}</td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(row)}
                          className="gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
          <span>
            Showing <strong className="text-slate-900">{rows.length}</strong> of <strong className="text-slate-900">{total}</strong> grouped records
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Previous
            </Button>
            <span className="px-3 py-2 font-bold text-slate-700">
              Page {page} of {lastPage}
            </span>
            <Button variant="outline" disabled={page >= lastPage} onClick={() => setPage((p) => Math.min(lastPage, p + 1))}>
              Next
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={!!editingRow} onOpenChange={(open) => !open && setEditingRow(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Master Inventory Row</DialogTitle>
            <DialogDescription>
              This updates the shared master-list fields for {editingRow?.quantity || 0} serialized unit(s) in this grouped row.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={editForm.unit}
                onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                placeholder="pc, set, box"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_acquired">Date Acquired</Label>
              <Input
                id="date_acquired"
                type="date"
                value={editForm.date_acquired}
                onChange={(e) => setEditForm({ ...editForm, date_acquired: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit_price">Unit Price</Label>
              <Input
                id="unit_price"
                type="number"
                min="0"
                step="0.01"
                value={editForm.unit_price}
                onChange={(e) => setEditForm({ ...editForm, unit_price: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="source_of_fund">Source of Fund</Label>
              <Input
                id="source_of_fund"
                value={editForm.source_of_fund}
                onChange={(e) => setEditForm({ ...editForm, source_of_fund: e.target.value })}
                placeholder="MOOE, Donation, Office"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                value={editForm.remarks}
                onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingRow(null)} disabled={updateMutation.isPending}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                  {['No.', 'Quantity', 'Unit', 'Description', 'Date Acquired', 'Unit Price', 'Source of Fund', 'Remarks'].map((header) => (
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
