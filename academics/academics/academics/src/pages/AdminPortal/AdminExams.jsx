import { useState } from 'react';
import { ClipboardList, Plus, Edit2, Trash2, Eye, Calendar } from 'lucide-react';

const AdminExams = ({ user, addToast }) => {
  const [exams] = useState([
    { id: 1, name: 'Mid-Term Mathematics', grade: '10-A', date: '2024-05-10', duration: '2 hours', students: 35, status: 'scheduled' },
    { id: 2, name: 'Final English', grade: '10-B', date: '2024-05-15', duration: '1.5 hours', students: 32, status: 'scheduled' },
    { id: 3, name: 'Science Quiz', grade: '9-A', date: '2024-04-28', duration: '45 min', students: 30, status: 'completed' },
    { id: 4, name: 'History Test', grade: '11-C', date: '2024-04-25', duration: '1 hour', students: 28, status: 'completed' },
  ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Exam Management</h1>
        <button className="px-4 py-2 rounded-xl text-white text-sm font-medium flex items-center gap-2"
          style={{ background: 'var(--primary)' }}>
          <Plus size={16} /> Schedule Exam
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid var(--border-color)' }}>
          <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>12</h3>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Upcoming Exams</p>
        </div>
        <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid var(--border-color)' }}>
          <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>45</h3>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Completed Exams</p>
        </div>
        <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid var(--border-color)' }}>
          <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>1,250</h3>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Total Students</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border-color)' }}>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Exam Name</th>
              <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Grade</th>
              <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Date</th>
              <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Duration</th>
              <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Students</th>
              <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Status</th>
              <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((exam) => (
              <tr key={exam.id} className="border-t" style={{ borderColor: 'var(--border-color)' }}>
                <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-primary)' }}>{exam.name}</td>
                <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{exam.grade}</td>
                <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{exam.date}</td>
                <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-muted)' }}>{exam.duration}</td>
                <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{exam.students}</td>
                <td className="py-3 px-4">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    exam.status === 'scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  }`}>{exam.status}</span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button className="p-1 rounded-lg hover:bg-gray-100" onClick={() => addToast?.('View exam', 'info')}>
                      <Eye size={16} style={{ color: 'var(--text-muted)' }} />
                    </button>
                    <button className="p-1 rounded-lg hover:bg-gray-100" onClick={() => addToast?.('Edit exam', 'info')}>
                      <Edit2 size={16} style={{ color: 'var(--text-muted)' }} />
                    </button>
                    <button className="p-1 rounded-lg hover:bg-gray-100" onClick={() => addToast?.('Delete exam', 'warning')}>
                      <Trash2 size={16} style={{ color: 'var(--text-muted)' }} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminExams;