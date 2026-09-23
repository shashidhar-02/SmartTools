import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CalculationResult } from '../types';

export function exportCalculationToPDF(data: CalculationResult, filename?: string) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let currentY = margin;

  // 1. HEADER BANNER
  // Top brand bar
  doc.setFillColor(37, 99, 235); // Primary blue (#2563eb)
  doc.rect(0, 0, pageWidth, 5, 'F');

  // Brand Name & Tagline
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.text('SMARTTOOLS HUB', margin, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text('All-in-One Calculators, Converters & Data Utility Hub', margin, currentY + 11);

  // Report Date / Time on top right
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  const dateStr = data.dateGenerated || new Date().toLocaleString();
  doc.text(`Generated: ${dateStr}`, pageWidth - margin, currentY + 6, { align: 'right' });
  doc.text(`Category: ${data.category}`, pageWidth - margin, currentY + 11, { align: 'right' });

  currentY += 16;

  // Divider line
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, pageWidth - margin, currentY);

  currentY += 8;

  // 2. REPORT TITLE
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.text(data.toolName.toUpperCase(), margin, currentY);
  currentY += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Official Calculation & Data Analysis Report', margin, currentY);
  currentY += 8;

  // 3. PRIMARY RESULT HIGHLIGHT CARD
  const cardWidth = pageWidth - (margin * 2);
  const cardHeight = 24;
  doc.setFillColor(239, 246, 255); // Soft blue fill (blue-50)
  doc.setDrawColor(191, 219, 254); // blue-200 border
  doc.roundedRect(margin, currentY, cardWidth, cardHeight, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(37, 99, 235);
  doc.text(data.primaryResult.label.toUpperCase(), margin + 6, currentY + 7);

  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text(data.primaryResult.value, margin + 6, currentY + 16);

  if (data.primaryResult.subtext) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(data.primaryResult.subtext, margin + 6, currentY + 21);
  }

  currentY += cardHeight + 8;

  // 4. INPUT PARAMETERS (TABLE OR 2-COLUMN LIST)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text('USER INPUT PARAMETERS', margin, currentY);
  currentY += 3;

  const inputRows = data.inputs.map((inp) => [inp.label, inp.value]);
  autoTable(doc, {
    startY: currentY,
    head: [['Parameter', 'Value Entered']],
    body: inputRows,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: {
      fontSize: 8.5,
      cellPadding: 2.5,
      textColor: [51, 65, 85],
    },
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [30, 41, 59],
      fontStyle: 'bold',
      lineColor: [226, 232, 240],
    },
    alternateRowStyles: {
      fillColor: [255, 255, 255],
    },
  });

  // Get Y after table
  currentY = (doc as any).lastAutoTable.finalY + 8;

  // 5. DETAILED BREAKDOWN
  if (data.breakdown && data.breakdown.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text('CALCULATED BREAKDOWN & METRICS', margin, currentY);
    currentY += 3;

    const breakdownRows = data.breakdown.map((b) => [b.label, b.value, b.note || '-']);
    autoTable(doc, {
      startY: currentY,
      head: [['Component', 'Value', 'Notes / Share']],
      body: breakdownRows,
      margin: { left: margin, right: margin },
      theme: 'grid',
      styles: {
        fontSize: 8.5,
        cellPadding: 2.5,
        textColor: [51, 65, 85],
      },
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // 6. SCHEDULE / DATA TABLE (IF PRESENT, e.g. Amortization, Growth Schedule)
  if (data.scheduleTable && data.scheduleTable.rows.length > 0) {
    // Check if we need a new page for the schedule table
    if (currentY > pageHeight - 60) {
      doc.addPage();
      currentY = margin;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text(data.scheduleTable.title.toUpperCase(), margin, currentY);
    currentY += 3;

    const tableBody = [...data.scheduleTable.rows];
    if (data.scheduleTable.totalRow) {
      tableBody.push(data.scheduleTable.totalRow);
    }

    autoTable(doc, {
      startY: currentY,
      head: [data.scheduleTable.headers],
      body: tableBody,
      margin: { left: margin, right: margin },
      theme: 'striped',
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
        textColor: [51, 65, 85],
      },
      headStyles: {
        fillColor: [15, 23, 42], // Slate-900
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // 7. FORMULA & METHODOLOGY
  if (data.formula) {
    if (currentY > pageHeight - 40) {
      doc.addPage();
      currentY = margin;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text('MATHEMATICAL FORMULA & METHODOLOGY', margin, currentY);
    currentY += 4;

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, currentY, cardWidth, 12, 2, 2, 'FD');

    doc.setFont('courier', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text(data.formula, margin + 4, currentY + 7);

    currentY += 18;
  }

  // 8. DISCLAIMER & FOOTER ON ALL PAGES
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Subtle bottom line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);

    // Disclaimer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(148, 163, 184); // Slate-400
    const disclaimer =
      data.disclaimer ||
      'Disclaimer: Results are estimates for educational and planning purposes only. Verify with qualified professionals.';
    doc.text(disclaimer, margin, pageHeight - 10, { maxWidth: cardWidth - 30 });

    // Page count & branding
    doc.text(`Page ${i} of ${pageCount} • SmartTools Hub`, pageWidth - margin, pageHeight - 10, {
      align: 'right',
    });
  }

  // Save / Download PDF directly in browser
  const sanitizedName = (filename || `${data.toolName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-report.pdf`).replace(
    /\.pdf$/,
    ''
  );
  doc.save(`${sanitizedName}.pdf`);
}
