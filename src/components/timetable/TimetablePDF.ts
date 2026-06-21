import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { TimetableEntry } from './types';
import { DAYS } from './types';

export function exportTimetablePDF(entries: TimetableEntry[], className: string) {
  const doc = new jsPDF('landscape', 'mm', 'a4');
  const pageW = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(18);
  doc.setTextColor(249, 115, 22);
  doc.text('Cornerstone International School', pageW / 2, 20, { align: 'center' });

  doc.setFontSize(14);
  doc.setTextColor(100, 100, 100);
  doc.text(`Timetable - ${className}`, pageW / 2, 30, { align: 'center' });

  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`, pageW / 2, 37, { align: 'center' });

  // Collect all unique times
  const times = [...new Set(entries.map(e => e.time))].sort();

  // Build grid data
  const body = times.map(time => {
    const row: string[] = [time];
    DAYS.forEach(day => {
      const entry = entries.find(e => e.day === day && e.time === time);
      row.push(entry ? `${entry.subject}\n${entry.teacher}\nRm ${entry.room || '-'}` : '—');
    });
    return row;
  });

  autoTable(doc, {
    head: [['Time', ...DAYS]],
    body,
    startY: 45,
    styles: {
      fontSize: 8,
      cellPadding: 3,
      valign: 'middle',
    },
    headStyles: {
      fillColor: [249, 115, 22],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    columnStyles: {
      0: { cellWidth: 22, fontStyle: 'bold', fillColor: [255, 247, 237] },
    },
    bodyStyles: {
      lineColor: [230, 230, 230],
      lineWidth: 0.1,
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.cell.raw !== '—' && data.column.index > 0 && data.row.index % 2 === 0) {
        data.cell.styles.fillColor = [255, 247, 237];
      }
    },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text(`Page ${i} of ${pageCount}`, pageW - 20, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
  }

  doc.save(`Timetable_${className.replace(/\s+/g, '_')}.pdf`);
}
