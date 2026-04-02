import { useState } from 'react';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useStore } from '../../hooks/useStore';
import { KEYS } from '../../data/schema';

export const TimetableManager = () => {
  const { data: timetable, setData } = useStore(KEYS.TIMETABLE, {});
  
  // Simple viewer for now, editing logic can be complex
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
        <Calendar className="text-primary-500" /> Timetable Management
      </h1>
      
      <div className="grid gap-4">
        {Object.entries(timetable).map(([className, schedule]) => (
          <Card key={className}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">{className}</h3>
              <Button size="sm" variant="ghost">Edit</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="p-3">Day</th>
                    <th className="p-3">Time</th>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Teacher</th>
                    <th className="p-3">Room</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((day, idx) => (
                    day.slots.map((slot, sIdx) => (
                      <tr key={`${idx}-${sIdx}`} className="border-b dark:border-gray-700">
                        {sIdx === 0 && <td rowSpan={day.slots.length} className="p-3 font-medium">{day.day}</td>}
                        <td className="p-3">{slot.time}</td>
                        <td className="p-3">{slot.subject}</td>
                        <td className="p-3">{slot.teacher}</td>
                        <td className="p-3">{slot.room}</td>
                      </tr>
                    ))
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
