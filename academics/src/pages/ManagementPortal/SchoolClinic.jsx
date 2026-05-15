import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartPulse, AlertTriangle, Plus, Clock, CheckCircle, X, Bell, Thermometer, Activity, Shield } from 'lucide-react';
import { teacherApi } from '../../services/apiDataLayer';
import { Select } from '../../components/ui/Select';

export function SchoolClinic({ user, addToast }) {
  const [records, setRecords] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [recordForm, setRecordForm] = useState({ studentId: '', recordType: 'visit', date: new Date().toISOString().split('T')[0], symptoms: [], diagnosis: '', treatment: '', followUpDate: '', isEmergency: false });
  const [alertForm, setAlertForm] = useState({ title: '', message: '', severity: 'warning', targetGroups: ['all'], classId: '', requiresAction: false, actionDescription: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const dash = await teacherApi.getClinicDashboard();
      if (dash?.success) setDashboard(dash.dashboard);
    } catch { }
    try {
      const al = await teacherApi.getClinicAlerts();
      if (al?.success) setAlerts(al.alerts || []);
    } catch { }
    setLoading(false);
  };

  const loadRecords = async (studentId) => {
    if (!studentId) return;
    setSelectedStudent(studentId);
    try {
      const res = await teacherApi.getHealthRecords(studentId);
      if (res?.success) setRecords(res.records || []);
    } catch (e) { addToast?.('Failed to load records', 'error'); }
  };

  const handleSubmitRecord = async () => {
    if (!recordForm.studentId) { addToast?.('Select a student', 'error'); return; }
    try {
      await teacherApi.submitHealthRecord({ ...recordForm, symptoms: typeof recordForm.symptoms === 'string' ? recordForm.symptoms.split(',').map(s => s.trim()).filter(Boolean) : recordForm.symptoms });
      addToast?.('Health record submitted', 'success');
      setShowRecordForm(false);
      setRecordForm({ studentId: '', recordType: 'visit', date: new Date().toISOString().split('T')[0], symptoms: [], diagnosis: '', treatment: '', followUpDate: '', isEmergency: false });
      loadRecords(recordForm.studentId);
      loadData();
    } catch (e) { addToast?.('Failed to submit record', 'error'); }
  };

  const handleSendAlert = async () => {
    if (!alertForm.title || !alertForm.message) { addToast?.('Title and message required', 'error'); return; }
    try {
      await teacherApi.sendClinicAlert({ ...alertForm, targetGroups: alertForm.targetGroups || ['all'] });
      addToast?.('Alert sent successfully', 'success');
      setShowAlertForm(false);
      setAlertForm({ title: '', message: '', severity: 'warning', targetGroups: ['all'], classId: '', requiresAction: false, actionDescription: '' });
      loadData();
    } catch (e) { addToast?.('Failed to send alert', 'error'); }
  };

  const recordTypes = [
    { value: 'visit', label: '🏥 Visit', color: 'from-blue-500 to-sky-500' },
    { value: 'medication', label: '💊 Medication', color: 'from-violet-500 to-purple-500' },
    { value: 'injury', label: '🩹 Injury', color: 'from-rose-500 to-red-500' },
    { value: 'allergy_update', label: '⚠️ Allergy', color: 'from-amber-500 to-orange-500' },
    { value: 'immunization', label: '💉 Immunization', color: 'from-emerald-500 to-teal-500' },
    { value: 'checkup', label: '📋 Checkup', color: 'from-cyan-500 to-blue-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">School Clinic</h2>
          <p className="text-sm text-slate-400 mt-1">Health records and alerts management</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAlertForm(true)} className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-bold hover:opacity-90 shadow-lg flex items-center gap-2">
            <Bell size={16} /> Send Alert
          </button>
          <button onClick={() => setShowRecordForm(true)} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-xl text-sm font-bold hover:opacity-90 shadow-lg flex items-center gap-2">
            <Plus size={16} /> Add Record
          </button>
        </div>
      </div>

      {/* Dashboard Stats */}
      {dashboard && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatPill icon={HeartPulse} label="Today's Visits" value={dashboard.today?.totalVisits || 0} gradient="from-blue-500 to-sky-500" glow="shadow-blue-500/10" />
          <StatPill icon={AlertTriangle} label="Emergencies" value={dashboard.today?.emergencies || 0} gradient="from-rose-500 to-red-500" glow="shadow-rose-500/10" />
          <StatPill icon={AlertTriangle} label="Active Alerts" value={dashboard.today?.newAlerts || 0} gradient="from-amber-500 to-orange-500" glow="shadow-amber-500/10" />
          <StatPill icon={Shield} label="Students w/ Conditions" value={dashboard.totalStudentsWithConditions || 0} gradient="from-violet-500 to-purple-500" glow="shadow-violet-500/10" />
        </div>
      )}

      {/* Tab Bar */}
      <div className="flex bg-white/5 backdrop-blur-sm rounded-2xl p-1 border border-white/10">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: Activity },
          { id: 'alerts', label: 'Alerts', icon: Bell },
          { id: 'records', label: 'Health Records', icon: HeartPulse },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === tab.id ? 'bg-gradient-to-br from-blue-600 to-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 bg-transparent'
            }`}>
            <tab.icon size={13} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' && dashboard && (
          <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card>
              <h3 className="text-sm font-bold text-slate-300 mb-4">Health Records by Type</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(dashboard.recordsByType || {}).map(([type, count]) => {
                  const cfg = recordTypes.find(r => r.value === type) || { label: type, color: 'from-slate-500 to-slate-600' };
                  return (
                    <div key={type} className={`bg-gradient-to-br ${cfg.color} rounded-xl p-4 shadow-lg`}>
                      <p className="text-2xl font-black text-white">{count}</p>
                      <p className="text-[10px] font-bold text-white/80 uppercase">{cfg.label}</p>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'alerts' && (
          <motion.div key="alerts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card>
              <h3 className="text-sm font-bold text-slate-300 mb-4">Clinic Alerts</h3>
              {alerts.length === 0 ? (
                <p className="text-center py-8 text-slate-500">No alerts</p>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div key={alert.id} className={`p-4 rounded-xl border ${
                      alert.severity === 'critical' || alert.severity === 'emergency'
                        ? 'bg-rose-500/10 border-rose-500/30'
                        : alert.severity === 'warning'
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-slate-800/50 border-slate-700/30'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Bell size={16} className={alert.severity === 'critical' || alert.severity === 'emergency' ? 'text-rose-400' : alert.severity === 'warning' ? 'text-amber-400' : 'text-slate-400'} />
                          <span className="text-sm font-bold text-white">{alert.title}</span>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          alert.severity === 'critical' || alert.severity === 'emergency' ? 'bg-rose-500/20 text-rose-300' :
                          alert.severity === 'warning' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-slate-600/20 text-slate-300'
                        }`}>{alert.severity}</span>
                      </div>
                      <p className="text-xs text-slate-300 mb-2">{alert.message}</p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500">
                        <span>{new Date(alert.createdAt).toLocaleString()}</span>
                        <span>Targets: {(alert.targetGroups || []).join(', ')}</span>
                        {alert.requiresAction && <span className="text-amber-400 flex items-center gap-1"><CheckCircle size={10} /> Action Required</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {activeTab === 'records' && (
          <motion.div key="records" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card>
              <h3 className="text-sm font-bold text-slate-300 mb-4">Student Health Records</h3>
              {records.length === 0 ? (
                <p className="text-center py-8 text-slate-500">{selectedStudent ? 'No records for this student' : 'Select a student first'}</p>
              ) : (
                <div className="space-y-3">
                  {records.map((r) => {
                    const cfg = recordTypes.find(t => t.value === r.recordType) || { label: r.recordType, color: 'from-slate-500 to-slate-600' };
                    return (
                      <div key={r.id} className={`flex items-center gap-4 p-3 rounded-xl border ${
                        r.isEmergency ? 'border-rose-500/30 bg-rose-500/5' : 'border-slate-700/30 bg-white/5'
                      }`}>
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cfg.color} flex items-center justify-center shrink-0`}>
                          {cfg.label.split(' ')[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white">{cfg.label}</p>
                          {r.diagnosis && <p className="text-xs text-slate-400">{r.diagnosis}</p>}
                          {r.medication && <p className="text-xs text-amber-300">💊 {r.medication}</p>}
                        </div>
                        <span className="text-xs text-slate-500">{r.date}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Record Form Modal */}
      <AnimatePresence>
        {showRecordForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Add Health Record</h3>
                <button onClick={() => setShowRecordForm(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
              </div>
              <div className="space-y-3">
                <input value={recordForm.studentId} onChange={e => { setRecordForm({ ...recordForm, studentId: e.target.value }); loadRecords(e.target.value); }} placeholder="Student ID" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500" />
                <div className="grid grid-cols-2 gap-3">
                  <Select options={recordTypes.map(r => r.value)} labels={recordTypes.map(r => r.label)} value={recordForm.recordType} onChange={v => setRecordForm({ ...recordForm, recordType: v })} className="w-full" />
                  <input type="date" value={recordForm.date} onChange={e => setRecordForm({ ...recordForm, date: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-700 text-white focus:outline-none focus:border-blue-500" />
                </div>
                <textarea value={recordForm.symptoms} onChange={e => setRecordForm({ ...recordForm, symptoms: e.target.value })} placeholder="Symptoms (comma separated)" rows={2} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-700 text-white placeholder-slate-400 resize-none" />
                <input value={recordForm.diagnosis} onChange={e => setRecordForm({ ...recordForm, diagnosis: e.target.value })} placeholder="Diagnosis" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-700 text-white placeholder-slate-400" />
                <input value={recordForm.treatment} onChange={e => setRecordForm({ ...recordForm, treatment: e.target.value })} placeholder="Treatment" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-700 text-white placeholder-slate-400" />
                <input value={recordForm.medication} onChange={e => setRecordForm({ ...recordForm, medication: e.target.value })} placeholder="Medication" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-700 text-white placeholder-slate-400" />
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="emergency" checked={recordForm.isEmergency} onChange={e => setRecordForm({ ...recordForm, isEmergency: e.target.checked })} className="w-4 h-4 text-rose-500" />
                  <label htmlFor="emergency" className="text-sm text-rose-400 font-bold">Emergency Case</label>
                </div>
                <button onClick={handleSubmitRecord} className="w-full py-3 bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold rounded-xl hover:opacity-90 shadow-lg shadow-blue-500/20 transition-all">Submit Health Record</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alert Form Modal */}
      <AnimatePresence>
        {showAlertForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Send Clinic Alert</h3>
                <button onClick={() => setShowAlertForm(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
              </div>
              <div className="space-y-3">
                <input required value={alertForm.title} onChange={e => setAlertForm({ ...alertForm, title: e.target.value })} placeholder="Alert title" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-amber-500" />
                <textarea required value={alertForm.message} onChange={e => setAlertForm({ ...alertForm, message: e.target.value })} placeholder="Alert message..." rows={3} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-700 text-white placeholder-slate-400 resize-none"></textarea>
                <Select options={['info', 'warning', 'critical', 'emergency']} labels={['Info', 'Warning', 'Critical', 'Emergency']} value={alertForm.severity} onChange={v => setAlertForm({ ...alertForm, severity: v })} className="w-full" />
                <Select options={['all', 'students', 'teachers', 'parents']} labels={['All', 'Students', 'Teachers', 'Parents']} value={(alertForm.targetGroups || ['all'])[0]} onChange={v => setAlertForm({ ...alertForm, targetGroups: [v] })} className="w-full" />
                <button onClick={handleSendAlert} className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:opacity-90 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2">
                  <Bell size={18} /> Send Alert
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatPill({ icon: Icon, label, value, gradient, glow }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`relative overflow-hidden rounded-2xl p-4 ${gradient} border ${glow} shadow-lg`}>
      <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-white/5 -mr-3 -mt-3" />
      <div className="relative flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shadow-sm">
          <Icon size={18} className="text-white" />
        </div>
        <div>
          <p className="text-2xl font-extrabold text-white tracking-tight">{value}</p>
          <p className="text-[10px] font-semibold text-white/70 uppercase tracking-wider">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}