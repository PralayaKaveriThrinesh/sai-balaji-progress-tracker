
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Project, ProgressUpdate, PaymentRequest } from '@/lib/types';

// Add type definitions for jspdf-autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface PdfExportOptions {
  title: string;
  description?: string;
  data: Record<string, any>[];
  columns: {
    key: string;
    header: string;
    width?: number;
  }[];
  fileName?: string;
  showHeaders?: boolean;
  orientation?: 'portrait' | 'landscape';
}

export const exportToPDF = ({
  title,
  description,
  data,
  columns,
  fileName = 'export.pdf',
  showHeaders = true,
  orientation = 'portrait',
}: PdfExportOptions): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Create a new PDF document
      const doc = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: 'a4',
      });
      
      // Add title
      doc.setFontSize(18);
      doc.text(title, doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
      
      // Add date
      const currentDate = new Date().toLocaleDateString();
      doc.setFontSize(10);
      doc.text(`Generated on: ${currentDate}`, doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' });
      
      // Add description if provided
      let yPos = 30;
      if (description) {
        doc.setFontSize(12);
        doc.text(description, 14, yPos);
        yPos += 10;
      }
      
      // Prepare table data
      const tableHeaders = columns.map(column => column.header);
      const tableBody = data.map(row => 
        columns.map(column => {
          const value = row[column.key];
          return value !== undefined && value !== null ? String(value) : '';
        })
      );
      
      // Add table
      doc.autoTable({
        head: showHeaders ? [tableHeaders] : [],
        body: tableBody,
        startY: yPos,
        theme: 'striped',
        headStyles: {
          fillColor: [243, 244, 246],
          textColor: [0, 0, 0],
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 10,
          cellPadding: 3,
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        },
        margin: { top: 10 },
      });
      
      // Add page numbers
      const pageCount = doc.internal.pages.length - 1;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }
      
      // Save and download the PDF
      doc.save(fileName);
      
      resolve();
    } catch (error) {
      console.error("PDF export error:", error);
      reject(error);
    }
  });
};

// Helper function to convert chart data to tabular format
export const convertChartDataForPdf = (
  chartData: Array<{ name: string; value: number }>,
  title: string,
  subtitle?: string
) => {
  return {
    title,
    description: subtitle,
    data: chartData,
    columns: [
      { key: 'name', header: 'Category', width: 250 },
      { key: 'value', header: 'Value', width: 150 }
    ],
    fileName: `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
  };
};

// Generate a comprehensive PDF report for a project
export const generateProjectPdfReport = async (
  project: Project,
  progress: ProgressUpdate[] = [],
  payments: PaymentRequest[] = []
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Title
  doc.setFontSize(20);
  doc.text(`Project Report: ${project.name || 'Unknown Project'}`, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
  
  // Project details section
  doc.setFontSize(16);
  doc.text("Project Details", 14, 35);
  
  // Project details in table format
  doc.autoTable({
    startY: 40,
    head: [['Property', 'Value']],
    body: [
      ['Project ID', project.id || 'N/A'],
      ['Project Name', project.name || 'N/A'],
      ['Status', project.status || 'In Progress'],
      ['Start Date', project.startDate || 'N/A'],
      ['Total Work', `${project.totalWork || 0} meters`],
      ['Completed Work', `${project.completedWork || 0} meters`],
      ['Completion', `${Math.round(((project.completedWork || 0) / (project.totalWork || 1)) * 100)}%`]
    ],
    theme: 'striped',
    headStyles: {
      fillColor: [100, 100, 100],
    }
  });
  
  // Progress updates section
  const progressY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(16);
  doc.text("Progress Updates", 14, progressY);
  
  if (progress && progress.length > 0) {
    doc.autoTable({
      startY: progressY + 5,
      head: [['Date', 'Distance', 'Location', 'Notes']],
      body: progress.map(p => [
        new Date(p.date).toLocaleDateString(),
        `${p.completedWork || 0} m`,
        p.location ? `${p.location.latitude.toFixed(4)}, ${p.location.longitude.toFixed(4)}` : 'N/A',
        p.notes || ''
      ]),
      theme: 'striped'
    });
  } else {
    doc.text("No progress updates available", 14, progressY + 10);
  }
  
  // Payment details section
  const paymentY = (doc as any).lastAutoTable?.finalY + 15 || progressY + 20;
  doc.setFontSize(16);
  doc.text("Payment Details", 14, paymentY);
  
  if (payments && payments.length > 0) {
    doc.autoTable({
      startY: paymentY + 5,
      head: [['Date', 'Amount', 'Status', 'Notes']],
      body: payments.map(p => [
        new Date(p.date).toLocaleDateString(),
        `₹${p.totalAmount.toLocaleString()}`,
        p.status,
        p.checkerNotes || ''
      ]),
      theme: 'striped'
    });
  } else {
    doc.text("No payment records available", 14, paymentY + 10);
  }
  
  // Add page numbers
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  return doc;
};

// Convert Word document blob to PDF
export const wordToPdf = async (wordBlob: Blob): Promise<void> => {
  // This is a placeholder for a Word-to-PDF conversion function
  // In a real-world scenario, you'd use a library or service that can convert Word to PDF
  // For now, we'll simulate this by generating a PDF with similar content
  
  const doc = new jsPDF();
  doc.text("Word document converted to PDF", 20, 20);
  doc.save("converted-document.pdf");
};
