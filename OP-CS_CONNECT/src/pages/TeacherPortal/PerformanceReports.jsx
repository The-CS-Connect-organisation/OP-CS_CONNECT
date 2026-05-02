import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Loader2 } from 'lucide-react';
import { teacherApi } from '../../services/apiDataLayer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

/**
 * @component PerformanceReports
 * @description Report generation using real backend API with CSV download support
 * @param {Object} user - Current user object
 * @param {Function} addToast - Toast notification function
 */

const CLASSES = ['10-A', '10-B', '11-A', '11-B'];

const ReportCard = ({ report, onDownload }) => (
  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="nova-card p-4">
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-gray-900">{report.title}</h4>
        <p className="text-xs text-gray-500 mt-1">{report.type} • {report.format?.toUpperCase()}</p>
      </div>
      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">Ready</span>
    </div>
    <p className="text-xs text-gray-600 mb-3">Generated: {new Date(report.generatedAt).toLocaleDateString()}</p>
    <button
      onClick={() => onDownload(report)}
      className="w-full px-2 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition-all flex items-center justify-center gap-1"
    >
      <Download size={12} /> Download
    </button>
  </motion.div>
);

export const PerformanceReports = ({ user, addToast }) => {
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [reportConfig, setReportConfig] = useState({
    type: 'class',
    classId: '',
    studentId: '',
    format: 'json',
    term: '',
  });
  const [generating, setGenerating] = useState(false);
  const [generatedReports, setGeneratedReports] = useState([]);

  const handleGenerateReport = async () => {
    if (reportConfig.type === 'class' && !reportConfig.classId) {
      addToast?.('Please select a class', 'warning');
      return;
    }
    if (reportConfig.type === 'student' && !reportConfig.studentId) {
      addToast?.('Please enter a student ID', 'warning');
      return;
    }

    try {
      setGenerating(true);
      let res;
      if (reportConfig.type === 'class') {
        res = await teacherApi.generateClassReport(reportConfig.classId, reportConfig.format, reportConfig.term || null);
      } else {
        res = await teacherApi.generateStudentReport(reportConfig.studentId, reportConfig.format, reportConfig.term || null);
      }

      const data = res?.data?.data ?? res?.data ?? {};
      const report = {
        id: `report-${Date.now()}`,
        title: reportConfig.type === 'class'
          ? `Class Report - ${reportConfig.classId}`
          : `Student Report - ${reportConfig.studentId}`,
        type: reportConfig.type,
        format: reportConfig.format,
        generatedAt: new Date().toISOString(),
        rawData: data,
      };

      setGeneratedReports(prev => [report, ...prev]);
      setShowGenerateModal(false);
      addToast?.('Report generated successfully', 'success');

      // Auto-download CSV
      if (reportConfig.format === 'csv' && data.csv) {
        const blob = new Blob([data.csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${report.title}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      addToast?.(err?.message || 'Failed to generate report', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (report) => {
    const raw = report.rawData;
    if (!raw) { addToast?.('No data to download', 'warning'); return; }

    if (report.format === 'csv' && raw.csv) {
      const blob = new Blob([raw.csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.title}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const blob = new Blob([JSON.stringify(raw, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.title}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
    addToast?.('Download started', 'success');
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full pt-2 pb-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText size={32} className="text-green-500" />
            Performance Reports
          </h1>
          <p className="text-sm text-gray-500 mt-1">Generate and download performance reports</p>
        </div>
        <Button variant="primary" icon={FileText} onClick={() => setShowGenerateModal(true)} className="rounded-xl">
          Generate Report
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="nova-card p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Total Reports</p>
          <p className="text-3xl font-bold text-gray-900">{generatedReports.length}</p>
        </div>
        <div className="nova-card p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Class Reports</p>
          <p className="text-3xl font-bold text-gray-900">{generatedReports.filter(r => r.type === 'class').length}</p>
        </div>
        <div className="nova-card p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Student Reports</p>
          <p className="text-3xl font-bold text-gray-900">{generatedReports.filter(r => r.type === 'student').length}</p>
        </div>
      </motion.div>

      {/* Reports List */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-600">Generated Reports</h3>
        {generatedReports.length === 0 ? (
          <div className="py-12 text-center border border-dashed rounded-xl border-gray-200">
            <FileText size={40} className="mx-auto mb-4 text-gray-200" />
            <p className="text-sm text-gray-500">No reports generated yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generatedReports.map(report => (
              <ReportCard key={report.id} report={report} onDownload={handleDownload} />
            ))}
          </div>
        )}
      </motion.div>

      {/* Generate Modal */}
      <Modal isOpen={showGenerateModal} onClose={() => setShowGenerateModal(false)} title="Generate Performance Report" size="lg">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">Report Type</label>
            <select value={reportConfig.type} onChange={e => setReportConfig(p => ({ ...p, type: e.target.value }))} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-500">
              <option value="class">Class Report</option>
              <option value="student">Student Report</option>
            </select>
          </div>

          {reportConfig.type === 'class' && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">Select Class</label>
              <select value={reportConfig.classId} onChange={e => setReportConfig(p => ({ ...p, classId: e.target.value }))} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-500">
                <option value="">Choose a class...</option>
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}

          {reportConfig.type === 'student' && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">Student ID</label>
              <input type="text" value={reportConfig.studentId} onChange={e => setReportConfig(p => ({ ...p, studentId: e.target.value }))} placeholder="Enter student ID..." className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-500" />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">Term (Optional)</label>
            <input type="text" value={reportConfig.term} onChange={e => setReportConfig(p => ({ ...p, term: e.target.value }))} placeholder="e.g., Term 1, 2024" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-500" />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">Format</label>
            <select value={reportConfig.format} onChange={e => setReportConfig(p => ({ ...p, format: e.target.value }))} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-500">
              <option value="json">JSON</option>
              <option value="csv">CSV (auto-download)</option>
            </select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="primary" onClick={handleGenerateReport} disabled={generating} className="flex-1 rounded-lg">
              {generating ? <><Loader2 size={14} className="animate-spin mr-2" />Generating...</> : 'Generate Report'}
            </Button>
            <Button variant="secondary" onClick={() => setShowGenerateModal(false)} className="flex-1 rounded-lg">Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
