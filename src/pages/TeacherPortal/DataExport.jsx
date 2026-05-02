import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Users, UserCheck, Loader2, Calendar } from 'lucide-react';
import { teacherApi } from '../../services/apiDataLayer';
import { Button } from '../../components/ui/Button';

/**
 * @component DataExport
 * @description Export attendance, grades, and student data with date range and format options
 * @param {Object} user - Current user object
 * @param {Function} addToast - Toast notification function
 */

const CLASSES = ['10-A', '10-B', '11-A', '11-B'];

const triggerDownload = (data, filename, format) => {
  let content, mime;
  if (format === 'csv' && typeof data === 'string') {
    content = data;
    mime = 'text/csv';
  } else if (format === 'csv' && data?.csv) {
    content = data.csv;
    mime = 'text/csv';
  } else {
    content = JSON.stringify(data, null, 2);
    mime = 'application/json';
    filename = filename.replace('.csv', '.json');
  }
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const ExportCard = ({ icon: Icon, title, description, color, onExport, loading }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="nova-card p-6"
  >
    <div className="flex items-start gap-4 mb-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
        <Icon size={22} style={{ color }} />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>
    </div>
    <Button variant="primary" icon={loading ? Loader2 : Download} onClick={onExport} disabled={loading} className="w-full rounded-lg">
      {loading ? 'Exporting...' : 'Export'}
    </Button>
  </motion.div>
);

export const DataExport = ({ user, addToast }) => {
  const [classId, setClassId] = useState('10-A');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [format, setFormat] = useState('csv');
  const [subject, setSubject] = useState('');
  const [term, setTerm] = useState('');
  const [loading, setLoading] = useState({ attendance: false, grades: false, students: false });

  const setLoad = (key, val) => setLoading(p => ({ ...p, [key]: val }));

  const handleExportAttendance = async () => {
    if (!startDate || !endDate) {
      addToast?.('Please select a date range', 'warning');
      return;
    }
    try {
      setLoad('attendance', true);
      const res = await teacherApi.exportAttendance(classId, startDate, endDate, format);
      const data = res?.data?.data ?? res?.data ?? {};
      triggerDownload(data, `attendance-${classId}-${startDate}-${endDate}.${format}`, format);
      addToast?.('Attendance exported successfully', 'success');
    } catch (err) {
      addToast?.(err?.message || 'Failed to export attendance', 'error');
    } finally {
      setLoad('attendance', false);
    }
  };

  const handleExportGrades = async () => {
    try {
      setLoad('grades', true);
      const res = await teacherApi.exportGrades(classId, subject || null, term || null, format);
      const data = res?.data?.data ?? res?.data ?? {};
      triggerDownload(data, `grades-${classId}.${format}`, format);
      addToast?.('Grades exported successfully', 'success');
    } catch (err) {
      addToast?.(err?.message || 'Failed to export grades', 'error');
    } finally {
      setLoad('grades', false);
    }
  };

  const handleExportStudents = async () => {
    try {
      setLoad('students', true);
      const res = await teacherApi.exportStudents(classId, format);
      const data = res?.data?.data ?? res?.data ?? {};
      triggerDownload(data, `students-${classId}.${format}`, format);
      addToast?.('Student data exported successfully', 'success');
    } catch (err) {
      addToast?.(err?.message || 'Failed to export student data', 'error');
    } finally {
      setLoad('students', false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full pt-2 pb-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Download size={32} className="text-teal-500" />
            Data Export
          </h1>
          <p className="text-sm text-gray-500 mt-1">Export attendance, grades, and student data</p>
        </div>
      </motion.div>

      {/* Global Options */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="nova-card p-6">
        <h3 className="text-sm font-semibold text-gray-600 mb-4">Export Options</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">Class</label>
            <select value={classId} onChange={e => setClassId(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500">
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">Format</label>
            <select value={format} onChange={e => setFormat(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500">
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">Subject (Grades)</label>
            <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g., Mathematics" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">Term (Grades)</label>
            <input type="text" value={term} onChange={e => setTerm(e.target.value)} placeholder="e.g., Term 1" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
          </div>
        </div>

        {/* Date Range for Attendance */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block flex items-center gap-1">
              <Calendar size={12} /> Start Date (Attendance)
            </label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block flex items-center gap-1">
              <Calendar size={12} /> End Date (Attendance)
            </label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
          </div>
        </div>
      </motion.div>

      {/* Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ExportCard
          icon={UserCheck}
          title="Attendance Data"
          description={`Export attendance records for ${classId}. Requires date range.`}
          color="#10b981"
          onExport={handleExportAttendance}
          loading={loading.attendance}
        />
        <ExportCard
          icon={FileText}
          title="Grades Data"
          description={`Export grade records for ${classId}. Optionally filter by subject and term.`}
          color="#3b82f6"
          onExport={handleExportGrades}
          loading={loading.grades}
        />
        <ExportCard
          icon={Users}
          title="Student Data"
          description={`Export student roster and profile data for ${classId}.`}
          color="#a855f7"
          onExport={handleExportStudents}
          loading={loading.students}
        />
      </div>

      {/* Info */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="nova-card p-5 bg-blue-50 border border-blue-100">
        <p className="text-xs text-blue-700 font-medium">
          <strong>Note:</strong> CSV files will be downloaded automatically. JSON files contain the full structured data. All exports are scoped to the selected class.
        </p>
      </motion.div>
    </div>
  );
};
