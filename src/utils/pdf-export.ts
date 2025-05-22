
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { jsPDF as JsPDFType } from 'jspdf';

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
  return new Promise((resolve) => {
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
    const pageCount = (doc as any).internal.getNumberOfPages();
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
