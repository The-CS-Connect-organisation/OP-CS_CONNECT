import { useState } from 'react';
import { Calendar, Clock, Users, BookOpen } from 'lucide-react';

const AdminTimetable = ({ user, addToast }) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = ['Period 1 (8:00-8:45)', 'Period 2 (8:45-9:30)', 'Period 3 (9:30-10:15)', 'Break (10:15-10:30)', 'Period 4 (10:30-11:15)', 'Period 5 (11:15-12:00)', 'Lunch (12:00-12:45)', 'Period 6 (12:45-1:30)', 'Period 7 (1:30-2:15)'];

  const timetableData = {
    'Monday': {
      'Period 1': { subject: 'Mathematics', teacher: 'Sarah Wilson', room: 'Room 101', grade: '10-A' },
      'Period 2': { subject: 'English', teacher: 'John Smith', room: 'Room 102', grade: '10-A' },
      'Period 3': { subject: 'Science', teacher: 'Emily Brown', room: 'Lab 1', grade: '10-A' },
      'Period 4': { subject: 'History', teacher: 'Michael Lee', room: 'Room 201', grade: '10-A' },
      'Period 5': { subject: 'Physical Ed', teacher: 'David Chen', room: 'Gym', grade: '10-A' },
    },
    'Tuesday': {
      'Period 1': { subject: 'Science', teacher: 'Emily Brown', room: 'Lab 1', grade: '10-A' },
      'Period 2': { subject: 'Mathematics', teacher: 'Sarah Wilson', room: 'Room 101', grade: '10-A' },
      'Period 3': { subject: 'Computer Sci', teacher: 'Alex Kim', room: 'Lab 2', grade: '10-A' },
      'Period 4': { subject: 'English', teacher: 'John Smith', room: 'Room 102', grade: '10-A' },
      'Period 5': { subject: 'Art', teacher: 'Lisa Wang', room: 'Art Room', grade: '10-A' },
    },
    // Add more days as needed
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Timetable Management</h1>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-xl border text-sm font-medium" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
            Export PDF
          </button>
          <button className="px-4 py-2 rounded-xl text-white text-sm font-medium" style={{ background: 'var(--primary)' }}>
            + Add Class
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 overflow-x-auto" style={{ border: '1px solid var(--border-color)' }}>
        <table className="w-full min-w-[800px]">
          <thead>
            <tr>
              <th className="text-left py-3 px-2 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Time/Day</th>
              {days.map(day => (
                <th key={day} className="text-center py-3 px-2 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periods.map((period, idx) => (
              <tr key={period} className={idx % 2 === 0 ? '' : 'bg-gray-50'}>
                <td className="py-3 px-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{period}</td>
                {days.map(day => {
                  const data = timetableData[day]?.[period.split(' ')[0] + ' ' + period.split(' ')[1]];
                  return (
                    <td key={day} className="py-2 px-2">
                      {data ? (
                        <div className="p-2 rounded-lg text-xs" style={{ background: 'var(--primary-light)', border: '1px solid var(--primary)' }}>
                          <div className="font-semibold" style={{ color: 'var(--primary)' }}>{data.subject}</div>
                          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{data.teacher}</div>
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{data.room} | {data.grade}</div>
                        </div>
                      ) : (
                        <div className="h-full min-h-[60px] border-2 border-dashed rounded-lg flex items-center justify-center"
                          style={{ borderColor: 'var(--border-color)' }}>
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Free</span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTimetable;