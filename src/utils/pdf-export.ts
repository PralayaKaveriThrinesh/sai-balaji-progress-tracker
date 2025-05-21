
import PDFDocument from 'pdfkit';
import blobStream from 'blob-stream';

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
      const doc = new PDFDocument({
        margin: 50,
        size: 'A4',
        layout: orientation,
        info: {
          Title: title,
          Author: 'Saibalaji App',
          Subject: 'Data Export',
          Keywords: 'export, data, statistics',
        },
      });

      // Set up the document stream
      const stream = doc.pipe(blobStream());

      // Add title
      doc.fontSize(24).font('Helvetica-Bold').text(title, { align: 'center' });
      doc.moveDown();

      // Add date
      const currentDate = new Date().toLocaleDateString();
      doc.fontSize(12).font('Helvetica').text(`Generated on: ${currentDate}`, { align: 'center' });
      doc.moveDown();

      // Add description if provided
      if (description) {
        doc.fontSize(14).font('Helvetica').text(description);
        doc.moveDown(1.5);
      } else {
        doc.moveDown(1);
      }

      // Calculate table dimensions
      const pageWidth = orientation === 'landscape' ? 770 : 520;
      const totalWidth = columns.reduce((acc, col) => acc + (col.width || 100), 0);
      const scaleFactor = Math.min(1, pageWidth / totalWidth);
      
      // Headers
      if (showHeaders) {
        // Draw header backgrounds
        doc.fillColor('#f3f4f6').rect(50, doc.y, pageWidth - 100, 30).fill();
        doc.fillColor('#000');
        
        // Draw header text
        let xPos = 50;
        columns.forEach(column => {
          const width = (column.width || 100) * scaleFactor;
          doc.font('Helvetica-Bold')
             .fontSize(12)
             .text(column.header, xPos + 5, doc.y + 10, {
                width: width - 10,
                align: 'left'
              });
          xPos += width;
        });
        doc.moveDown(2);
      }

      // Draw rows
      data.forEach((row, rowIndex) => {
        const y = doc.y;
        
        // Draw zebra striping
        if (rowIndex % 2 === 1) {
          doc.fillColor('#f9fafb').rect(50, y, pageWidth - 100, 25).fill();
          doc.fillColor('#000');
        }
        
        // Draw row content
        let xPos = 50;
        columns.forEach(column => {
          const width = (column.width || 100) * scaleFactor;
          const value = row[column.key];
          const displayValue = value !== undefined && value !== null ? String(value) : '';
          
          doc.font('Helvetica')
             .fontSize(10)
             .text(displayValue, xPos + 5, y + 5, {
                width: width - 10,
                align: 'left'
              });
          xPos += width;
        });
        doc.moveDown(1.5);
        
        // Add new page if running out of space
        if (doc.y > doc.page.height - 100) {
          doc.addPage();
        }
      });

      // Add page numbers
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc.fontSize(10).text(
          `Page ${i + 1} of ${pageCount}`,
          50,
          doc.page.height - 50,
          { align: 'center' }
        );
      }

      // Finalize the PDF
      doc.end();

      // When the stream is done, create a blob and download
      stream.on('finish', () => {
        const blob = stream.toBlob('application/pdf');
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        resolve();
      });

      stream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
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
