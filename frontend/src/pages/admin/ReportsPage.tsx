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
  date_reported: string;
  created_at: string;
}

interface ResolutionForm {
  admin_notes: string;
  resolution_date: string;
}

export function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showResolutionModal, setShowResolutionModal] = useState(false);

  const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const [resolutionForm, setResolutionForm] = useState<ResolutionForm>({
    admin_notes: '',
    resolution_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchReports();
  }, [status]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getReports({
        status: status || undefined,
        per_page: 50,
      });
      setReports(response.data.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load reports',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedReport(row);
              setShowDetailModal(true);
            }}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
          >
            View
          </button>
          {row.status !== 'resolved' && (
            <button
              onClick={() => {
                setSelectedReport(row);
                setShowResolutionModal(true);
              }}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
            >
              Resolve
            </button>
          )}
        </div>
      ),
    },
  ];

  if (loading) return <PageLoader />;

  return (
    <div>
      <NavHeader 
        title="Issue Reports" 
        subtitle="View and manage equipment issue reports"
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
        <h1 className="text-lg font-bold text-gray-900 mb-1">Issue Reports</h1>
        <p className="text-sm text-gray-600">View and manage equipment issue reports</p>
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
                { value: '', label: 'All Reports' },
                { value: 'pending', label: 'Pending' },
                { value: 'reviewed', label: 'Reviewed' },
                { value: 'resolved', label: 'Resolved' },
            ]}
          />
        </div>

        <Table columns={columns} data={reports} loading={loading} />
      </Card>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Report Details"
      >
        {selectedReport && (
          <div className="space-y-4">
            <div>
              <label className="font-semibold text-gray-700">Report ID</label>
              <p className="text-gray-600">#{selectedReport.id}</p>
            </div>
            <div>
              <label className="font-semibold text-gray-700">Reported By</label>
              <p className="text-gray-600">{selectedReport.teacher?.full_name}</p>
            </div>
            <div>
              <label className="font-semibold text-gray-700">Item</label>
              <p className="text-gray-600">{selectedReport.item?.item_name}</p>
            </div>
            <div>
              <label className="font-semibold text-gray-700">Report Type</label>
              <p className="text-gray-600">{selectedReport.report_type}</p>
            </div>
            <div>
              <label className="font-semibold text-gray-700">Description</label>
              <p className="text-gray-600">{selectedReport.description}</p>
            </div>
            <div>
              <label className="font-semibold text-gray-700">Status</label>
              <StatusBadge label={selectedReport.status} status={selectedReport.status} />
            </div>
            <div>
              <label className="font-semibold text-gray-700">Date Reported</label>
              <p className="text-gray-600">{formatDate(selectedReport.date_reported || selectedReport.created_at)}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Resolution Modal */}
      <Modal
        isOpen={showResolutionModal}
        onClose={() => setShowResolutionModal(false)}
        title="Resolve Report"
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
          />
          <div className="flex gap-4">
            <Button type="submit" variant="success">
              Resolve
            </Button>
            <Button variant="secondary" onClick={() => setShowResolutionModal(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
      </div>
    </div>
  );
}

