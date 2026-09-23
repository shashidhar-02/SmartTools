import { CalculationResult } from '../types';

export function exportCalculationToCSV(data: CalculationResult, filename?: string) {
  let csvContent = '\uFEFF'; // UTF-8 BOM for Microsoft Excel

  // Header metadata
  csvContent += `SmartTools Hub - ${data.toolName} Report\r\n`;
  csvContent += `Generated: "${data.dateGenerated}"\r\n`;
  csvContent += `Category: "${data.category}"\r\n\r\n`;

  // Inputs
  csvContent += '--- INPUT PARAMETERS ---\r\n';
  csvContent += 'Parameter,Value\r\n';
  data.inputs.forEach((inp) => {
    csvContent += `"${inp.label.replace(/"/g, '""')}","${inp.value.replace(/"/g, '""')}"\r\n`;
  });
  csvContent += '\r\n';

  // Primary Result & Breakdown
  csvContent += '--- SUMMARY RESULT ---\r\n';
  csvContent += `"${data.primaryResult.label.replace(/"/g, '""')}","${data.primaryResult.value.replace(/"/g, '""')}"\r\n\r\n`;

  if (data.breakdown && data.breakdown.length > 0) {
    csvContent += '--- BREAKDOWN ---\r\n';
    csvContent += 'Component,Value,Note\r\n';
    data.breakdown.forEach((b) => {
      csvContent += `"${b.label.replace(/"/g, '""')}","${b.value.replace(/"/g, '""')}","${(b.note || '').replace(/"/g, '""')}"\r\n`;
    });
    csvContent += '\r\n';
  }

  // Schedule Table (e.g. Amortization, Year by year)
  if (data.scheduleTable && data.scheduleTable.rows.length > 0) {
    csvContent += `--- ${data.scheduleTable.title.toUpperCase()} ---\r\n`;
    csvContent += data.scheduleTable.headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(',') + '\r\n';
    data.scheduleTable.rows.forEach((row) => {
      csvContent += row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',') + '\r\n';
    });
    if (data.scheduleTable.totalRow) {
      csvContent += data.scheduleTable.totalRow.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',') + '\r\n';
    }
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const sanitizedName = (filename || `${data.toolName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-data.csv`).replace(
    /\.csv$/,
    ''
  );
  link.setAttribute('href', url);
  link.setAttribute('download', `${sanitizedName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
