import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate } from './formatters';

// Type definitions to help with auto-complete
interface BorrowRequestData {
  id: number | string;
  request_code?: string;
  teacher_name?: string;
  employee_id?: string;
  category_name?: string;
  category_code?: string;
  quantity?: number | string;
  status?: string;
  date_requested?: string;
  expected_return?: string;
  purpose?: string;
  admin_notes?: string;
}

/**
 * Downloads a CSV file from an array of objects
 * @param data Array of objects containing data
 * @param filename Name of the file to save
 * @param headers Optional mapping of keys to human-readable headers
 */
export const exportToCSV = (data: any[], filename: string, headers?: Record<string, string>) => {
  if (!data || !data.length) return;

  // Extract columns to export
  const keys = Object.keys(headers || data[0]);
  
  // Create CSV header row
  const csvRows = [];
  csvRows.push(keys.map(key => headers ? headers[key] : key).join(','));

  // Create CSV data rows
  for (const row of data) {
    const values = keys.map(key => {
      let value = row[key];
      // Handle nested objects
      if (typeof value === 'object' && value !== null) {
        value = JSON.stringify(value);
      }
      // Escape quotes and commas
      const stringValue = String(value ?? '').replace(/"/g, '""');
      return `"${stringValue}"`;
    });
    csvRows.push(values.join(','));
  }

  // Create Blob and download
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Generates and downloads a beautiful PDF for a specific borrow request
 * @param reqData Request data object
 */
export const generateRequestPDF = (reqData: BorrowRequestData) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(22);
  doc.setTextColor(40, 40, 40);
  doc.text('Borrow Request Details', 14, 22);
  
  // Request ID / Status
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Request ID: #${reqData.id}`, 14, 30);
  doc.text(`Status: ${reqData.status?.toUpperCase() || 'N/A'}`, 14, 35);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 40);
  
  // Divider line
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 45, 196, 45);

  // AutoTable for Request Details
  autoTable(doc, {
    startY: 50,
    theme: 'grid',
    headStyles: { fillColor: [102, 126, 234], textColor: 255 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60, fillColor: [245, 245, 245] },
      1: { cellWidth: 'auto' }
    },
    body: [
      ['Request Code', reqData.request_code || `REQ-${reqData.id}`],
      ['Teacher Name', reqData.teacher_name || 'N/A'],
      ['Employee ID', reqData.employee_id || 'N/A'],
      ['Category Name', reqData.category_name || 'N/A'],
      ['Category Code', reqData.category_code || 'N/A'],
      ['Quantity', String(reqData.quantity || '0')],
      ['Date Requested', reqData.date_requested ? formatDate(reqData.date_requested) : 'N/A'],
      ['Expected Return', reqData.expected_return ? formatDate(reqData.expected_return) : 'N/A'],
      ['Purpose', reqData.purpose || 'None provided'],
      ['Admin Notes', reqData.admin_notes || 'None']
    ],
  });

  // Footer
  const pageCount = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      'Role-Based Online Inventory Management System',
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  doc.save(`Borrow_Request_${reqData.id}.pdf`);
};
