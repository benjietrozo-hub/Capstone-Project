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
  
  // Institutional Header (DepEd Standard)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Republic of the Philippines', doc.internal.pageSize.width / 2, 15, { align: 'center' });
  doc.text('Department of Education', doc.internal.pageSize.width / 2, 20, { align: 'center' });
  doc.text('Caraga Region XIII', doc.internal.pageSize.width / 2, 25, { align: 'center' });
  doc.text('Division of Agusan del Norte', doc.internal.pageSize.width / 2, 30, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('CALOC-AN ELEMENTARY SCHOOL', doc.internal.pageSize.width / 2, 38, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text('Caloc-an, Magallanes, Agusan del Norte', doc.internal.pageSize.width / 2, 43, { align: 'center' });
  
  // Divider line
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(14, 48, 196, 48);

  // Document Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);
  doc.text('EQUIPMENT BORROWER\'S SLIP', doc.internal.pageSize.width / 2, 58, { align: 'center' });
  
  // Meta Info
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Request Code: ${reqData.request_code || `REQ-${reqData.id}`}`, 14, 68);
  doc.text(`Date Generated: ${new Date().toLocaleString()}`, 196, 68, { align: 'right' });
  
  // AutoTable for Request Details
  autoTable(doc, {
    startY: 75,
    theme: 'grid',
    headStyles: { fillColor: [50, 50, 50], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 5 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50, fillColor: [250, 250, 250] },
      1: { cellWidth: 'auto' }
    },
    body: [
      ['Full Name of Borrower', reqData.teacher_name || 'N/A'],
      ['Employee/ID Number', reqData.employee_id || 'N/A'],
      ['Equipment Category', reqData.category_name || 'N/A'],
      ['Requested Quantity', String(reqData.quantity || '0')],
      ['Date Requested', reqData.date_requested ? formatDate(reqData.date_requested) : 'N/A'],
      ['Expected Return Date', reqData.expected_return ? formatDate(reqData.expected_return) : 'N/A'],
      ['Purpose of Use', reqData.purpose || 'None provided'],
      ['Status', reqData.status?.toUpperCase() || 'PENDING'],
      ['Admin/Office Notes', reqData.admin_notes || 'N/A']
    ],
  });

  // Accountability / Signatures
  const finalY = (doc as any).lastAutoTable.finalY + 30;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  
  // Borrower
  doc.line(14, finalY, 74, finalY);
  doc.text(reqData.teacher_name?.toUpperCase() || 'BORROWER NAME', 44, finalY + 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text('Signature over Printed Name', 44, finalY + 10, { align: 'center' });
  doc.text('(Borrower)', 44, finalY + 15, { align: 'center' });

  // Supply Officer
  doc.setFont('helvetica', 'bold');
  doc.line(136, finalY, 196, finalY);
  doc.text('BENJIE TROZO', 166, finalY + 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text('Signature over Printed Name', 166, finalY + 10, { align: 'center' });
  doc.text('School Property Custodian', 166, finalY + 15, { align: 'center' });

  // Approval (Centered Bottom)
  const approvalY = finalY + 35;
  doc.setFont('helvetica', 'bold');
  doc.text('Approved by:', doc.internal.pageSize.width / 2, approvalY - 10, { align: 'center' });
  doc.line(doc.internal.pageSize.width / 2 - 30, approvalY + 5, doc.internal.pageSize.width / 2 + 30, approvalY + 5);
  doc.text('SCHOOL PRINCIPAL', doc.internal.pageSize.width / 2, approvalY + 10, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text('Office of the Principal', doc.internal.pageSize.width / 2, approvalY + 15, { align: 'center' });

  // Footer
  const pageCount = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      'Property Inventory Management System - Caloc-an Elementary School',
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  doc.save(`Borrow_Slip_${reqData.request_code || reqData.id}.pdf`);
};

/**
 * Generates and downloads a PDF for a specific equipment issue report
 * @param report Report data object
 */
export const generateIssueReportPDF = (report: any) => {
  const doc = new jsPDF();
  
  // Institutional Header (DepEd Standard)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Republic of the Philippines', doc.internal.pageSize.width / 2, 15, { align: 'center' });
  doc.text('Department of Education', doc.internal.pageSize.width / 2, 20, { align: 'center' });
  doc.text('Caraga Region XIII', doc.internal.pageSize.width / 2, 25, { align: 'center' });
  doc.text('Division of Agusan del Norte', doc.internal.pageSize.width / 2, 30, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('CALOC-AN ELEMENTARY SCHOOL', doc.internal.pageSize.width / 2, 38, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text('Caloc-an, Magallanes, Agusan del Norte', doc.internal.pageSize.width / 2, 43, { align: 'center' });
  
  // Divider line
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(14, 48, 196, 48);

  // Document Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);
  doc.text('EQUIPMENT ISSUE REPORT', doc.internal.pageSize.width / 2, 58, { align: 'center' });
  
  // Meta Info
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Report ID: #${report.id}`, 14, 68);
  doc.text(`Date Generated: ${new Date().toLocaleString()}`, 196, 68, { align: 'right' });
  
  // AutoTable for Details
  autoTable(doc, {
    startY: 75,
    theme: 'grid',
    headStyles: { fillColor: [50, 50, 50], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 5 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50, fillColor: [250, 250, 250] },
      1: { cellWidth: 'auto' }
    },
    body: [
      ['Reported By', report.teacher?.full_name || 'N/A'],
      ['Equipment Affected', report.item?.item_name || 'N/A'],
      ['Report Type', report.report_type || 'N/A'],
      ['Description of Issue', report.description || 'N/A'],
      ['Date Reported', report.date_reported ? formatDate(report.date_reported) : formatDate(report.created_at)],
      ['Status', report.status?.toUpperCase() || 'PENDING'],
      ['Admin Notes/Resolution', report.admin_response || report.resolution || 'N/A']
    ],
  });

  // Footer
  const pageCount = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      'Property Inventory Management System - Caloc-an Elementary School',
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  doc.save(`Issue_Report_${report.id}.pdf`);
};
