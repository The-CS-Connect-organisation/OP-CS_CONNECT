import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookMarked, Search, Filter, Download, FileText, Calendar } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useStore } from '../../hooks/useStore';
import { KEYS } from '../../data/schema';

export const Notes = ({ user }) => {
  const { data: notes } = useStore(KEYS.NOTES, []);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');

  const myNotes = notes.filter(n => n.class === user.class);
  const subjects = [...new Set(myNotes.map(n => n.subject))];

  const filtered = myNotes.filter(n => {
    const matchesSubject = selectedSubject === 'all' || n.subject === selectedSubject;
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  const subjectColors = {
    Mathematics: 'from-blue-500 to-cyan-500',
    Biology: 'from-emerald-500 to-teal-500',
    'English Literature': 'from-purple-500 to-pink-500',
    Physics: 'from-orange-500 to-red-500',
    Chemistry: 'from-amber-500 to-yellow-500',
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
          <BookMarked className="text-primary-500" /> Notes & Resources
        </h1>
        <p className="text-gray-500 mt-1">Study materials shared by your teachers</p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes..." className="input-field pl-9 pr-4 py-2.5 text-sm" />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          <button onClick={() => setSelectedSubject('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${selectedSubject === 'all' ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>
            All
          </button>
          {subjects.map(s => (
            <button key={s} onClick={() => setSelectedSubject(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${selectedSubject === s ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filtered.map((note, idx) => (
            <motion.div key={note.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
              <Card className="h-full flex flex-col hover:shadow-xl transition-shadow group">
                <div className={`w-full h-32 rounded-xl bg-gradient-to-br ${subjectColors[note.subject] || 'from-gray-500 to-gray-600'} flex items-center justify-center mb-4 group-hover:scale-[1.02] transition-transform`}>
                  <FileText size={40} className="text-white/80" />
                </div>
                <Badge className="self-start mb-2">{note.subject}</Badge>
                <h4 className="text-base font-semibold text-gray-800 dark:text-white mb-1">{note.title}</h4>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{note.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {note.createdAt}</span>
                    <span>{note.fileSize}</span>
                  </div>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-gray-500 hover:text-primary-500 transition-colors">
                    <Download size={16} />
                  </motion.button>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
