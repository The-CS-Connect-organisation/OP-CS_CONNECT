import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useStore } from '../../hooks/useStore';
import { KEYS } from '../../data/schema';

const dayColors = {
  Monday: 'from-blue-500 to-cyan-500',
  Tuesday: 'from-purple-500 to-pink-500',
  Wednesday: 'from-emerald-500 to-teal-500',
  Thursday: 'from-orange-500 to-red-500',
  Friday: 'from-indigo-500 to-purple-500',
};

export const Timetable = ({ user }) => {
  const { data: timetable } = useStore(KEYS.TIMETABLE, {});
  const [selectedDay, setSelectedDay] = useState(new Date().toLocaleDateString('en-US', { weekday: 'long' }));
  const classTimetable = timetable[user.class] || [];
  const todaySchedule = classTimetable.find(t => t.day === selectedDay)?.slots || [];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
          <Calendar className="text-primary-500" /> Weekly Timetable
        </h1>
        <p className="text-gray-500 mt-1">Class: {user.class}</p>
      </motion.div>

      {/* Day Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {classTimetable.map(day => (
          <motion.button key={day.day} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedDay(day.day)}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              selectedDay === day.day
                ? `bg-gradient-to-r ${dayColors[day.day]} text-white shadow-lg`
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {day.day}
          </motion.button>
        ))}
      </div>

      {/* Schedule */}
      <div className="space-y-3">
        <AnimatePresence mode="wait">
          {todaySchedule.map((slot, idx) => (
            <motion.div key={`${selectedDay}-${idx}`}
              initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="flex items-center gap-4 hover:shadow-xl transition-shadow">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${dayColors[selectedDay]} flex flex-col items-center justify-center text-white flex-shrink-0`}>
                  <Clock size={16} />
                  <span className="text-[10px] font-bold">{slot.time.split(' ')[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-semibold text-gray-800 dark:text-white">{slot.subject}</h4>
                  <div className="flex flex-wrap gap-4 mt-2">
                    <span className="flex items-center gap-1.5 text-sm text-gray-500"><User size={14} /> {slot.teacher}</span>
                    <span className="flex items-center gap-1.5 text-sm text-gray-500"><MapPin size={14} /> Room {slot.room}</span>
                  </div>
                </div>
                <Badge color="blue">{slot.time}</Badge>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
