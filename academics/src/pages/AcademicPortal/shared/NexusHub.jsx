import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  MessageSquare,
  Phone,
  Video,
  Plus,
  Search,
  Hash,
  ShieldCheck,
  Trophy,
  Zap,
  Cpu,
  Microscope,
  MoreVertical,
  X,
  Volume2,
  Mic,
  Settings,
  Globe,
  Lock,
  ArrowRight,
  PhoneCall
} from 'lucide-react';

// Mock Data for the Nexus
const INITIAL_CLUBS = [
  {
    id: 'club-1',
    name: 'STEM Innovation Lab',
    type: 'STEM',
    icon: Microscope,
    color: '#6366f1',
    members: 142,
    isMember: true,
    channels: ['general', 'robotics-ai', 'biotech-projects', 'research-papers'],
    extensions: ['github-sync', 'research-notion']
  },
  {
    id: 'club-2',
    name: 'Varsity Soccer',
    type: 'Sports',
    icon: Trophy,
    color: '#f59e0b',
    members: 45,
    isMember: true,
    channels: ['strategy', 'training-times', 'match-highlights'],
    extensions: ['score-tracker']
  },
  {
    id: 'club-3',
    name: 'Cornerstone Coders',
    type: 'STEM',
    icon: Cpu,
    color: '#10b981',
    members: 89,
    isMember: false,
    channels: ['web-dev', 'python-scripts', 'help-center'],
    extensions: ['code-playground']
  }
];

const MOCK_MESSAGES = [
  { id: 1, sender: 'Alex Chen', text: 'Has anyone finished the Robotics assignment?', time: '10:42 AM', isMe: false },
  { id: 2, sender: 'You', text: 'Almost done with the motor calibrations.', time: '10:45 AM', isMe: true },
  { id: 3, sender: 'Sarah Blake', text: 'I can help with the code if needed!', time: '10:46 AM', isMe: false },
];

export const NexusHub = ({ user, addToast }) => {
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'club-view'
  const [activeSubTab, setActiveSubTab] = useState('chat'); // 'chat' | 'leaderboard' | 'research'
  const [selectedClub, setSelectedClub] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState('general');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMembers, setShowMembers] = useState(true);
  const [isCalling, setIsCalling] = useState(false);
  const [callType, setCallType] = useState('voice'); 
  const [clubs, setClubs] = useState(INITIAL_CLUBS);
  const [message, setMessage] = useState('');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [researchPapers, setResearchPapers] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch Leaderboard on tab switch
  useEffect(() => {
    if (activeSubTab === 'leaderboard' || activeTab === 'browse') {
      // In a real app: const res = await api.get('/clubs/leaderboard');
      // Simulated for now with the logic we added to the backend
      const fetchLeaderboard = () => {
        const sorted = [...clubs].map(c => ({
          ...c,
          points: c.members * 15 + Math.floor(Math.random() * 200)
        })).sort((a,b) => b.points - a.points);
        setLeaderboardData(sorted);
      };
      fetchLeaderboard();
    }
  }, [activeSubTab, activeTab, clubs]);

  // Handle Club Creation
  const handleCreateClub = (e) => {
    e.preventDefault();
    const name = e.target.clubName.value;
    const type = e.target.clubType.value;

    const newClub = {
      id: `club-${Date.now()}`,
      name,
      type,
      icon: type === 'STEM' ? Cpu : (type === 'Sports' ? Trophy : Users),
      color: type === 'STEM' ? '#6366f1' : '#f43f5e',
      members: 1,
      isMember: true,
      channels: ['general', 'announcements'],
      extensions: []
    };

    setClubs([newClub, ...clubs]);
    setShowCreateModal(false);
    addToast?.(`Club "${name}" created successfully!`, 'success');
  };

  const handleJoinClub = (clubId) => {
    setClubs(clubs.map(c => c.id === clubId ? { ...c, isMember: true, members: c.members + 1 } : c));
    addToast?.('Joined community!', 'success');
  };

  const handleResearchUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    // Simulate API delay
    setTimeout(() => {
      const newPaper = {
        title: file.name.split('.')[0],
        author: user?.name || 'Scholar',
        date: 'Just now',
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`
      };
      setResearchPapers([newPaper, ...researchPapers]);
      setIsUploading(false);
      addToast?.('Research paper uploaded to vault!', 'success');
    }, 1500);
  };

  return (
    <div className="flex h-[calc(100vh-100px)] overflow-hidden rounded-3xl border border-[var(--border-default)] shadow-2xl bg-slate-50">

      {/* ── Discord-like Sidebar ── */}
      <div className="w-20 bg-slate-900 flex flex-col items-center py-5 gap-4 shrink-0">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => { setActiveTab('browse'); setSelectedClub(null); }}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${activeTab === 'browse' ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
        >
          <Globe size={24} />
        </motion.button>

        <div className="w-8 h-[2px] bg-slate-800 rounded-full" />

        {clubs.filter(c => c.isMember).map(club => (
          <motion.button
            key={club.id}
            whileHover={{ scale: 1.1, borderRadius: '16px' }}
            whileTap={{ scale: 0.9 }}
            onClick={() => { setActiveTab('club-view'); setSelectedClub(club); setActiveSubTab('chat'); }}
            className={`w-12 h-12 flex items-center justify-center text-white transition-all overflow-hidden ${selectedClub?.id === club.id ? 'rounded-2xl shadow-lg ring-2 ring-white/20' : 'rounded-3xl'}`}
            style={{ backgroundColor: club.color }}
          >
            <club.icon size={22} />
          </motion.button>
        ))}

        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowCreateModal(true)}
          className="w-12 h-12 rounded-3xl bg-slate-800 text-emerald-500 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all"
        >
          <Plus size={24} />
        </motion.button>
      </div>

      {/* ── Sub Sidebar (Channels/DMs) ── */}
      <div className="w-64 bg-slate-100 border-r border-[var(--border-default)] flex flex-col shrink-0">
        <div className="p-4 border-b border-white/10 h-16 flex items-center justify-between bg-white shadow-sm">
          <span className="font-bold text-slate-800 truncate">
            {activeTab === 'browse' ? 'The Commons' : selectedClub?.name}
          </span>
          <ArrowRight size={16} className="text-slate-400" />
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-6">
          {activeTab === 'browse' ? (
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-2">Social Nexus</p>
              <nav className="space-y-1">
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-200 text-slate-900 font-medium">
                  <Globe size={18} /> Global Hub
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-200 text-slate-600 transition-colors">
                  <Search size={18} /> Explore Clubs
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-200 text-slate-600 transition-colors">
                  <Zap size={18} /> Trending Events
                </button>
              </nav>
            </div>
          ) : (
            <>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-2">Text Channels</p>
                <nav className="space-y-1">
                  {selectedClub?.channels.map(ch => (
                    <button
                      key={ch}
                      onClick={() => { setSelectedChannel(ch); setActiveSubTab('chat'); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${selectedChannel === ch && activeSubTab === 'chat' ? 'bg-white text-indigo-600 shadow-sm font-bold' : 'text-slate-500 hover:bg-white/50'}`}
                    >
                      <Hash size={16} /> {ch}
                    </button>
                  ))}
                </nav>
              </div>

              <div>
                <div className="flex items-center justify-between px-2 mb-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Village Lounges</p>
                  <Plus size={12} className="text-slate-400 cursor-pointer" />
                </div>
                <nav className="space-y-1">
                  <button
                    onClick={() => { setIsCalling(true); setCallType('voice'); }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-500 hover:bg-white/50 transition-all font-medium"
                  >
                    <div className="flex items-center gap-2"><Volume2 size={16} /> Campus Lounge</div>
                    <div className="flex -space-x-1.5">
                      <div className="w-4 h-4 rounded-full bg-indigo-400 border border-white" />
                      <div className="w-4 h-4 rounded-full bg-emerald-400 border border-white" />
                    </div>
                  </button>
                </nav>
              </div>

              {selectedClub?.extensions.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest px-2 mb-2">Nexus Extensions</p>
                  <nav className="space-y-1">
                    {selectedClub.extensions.map(ext => (
                      <button key={ext} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-indigo-100 bg-indigo-50/50 text-indigo-600 text-xs font-semibold capitalize">
                        <Zap size={14} /> {ext.replace('-', ' ')}
                      </button>
                    ))}
                  </nav>
                </div>
              )}
            </>
          )}
        </div>

        {/* User Stats at bottom of sidebar */}
        <div className="p-3 bg-white border-t border-[var(--border-default)]">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase">
              {user?.name?.[0] || 'S'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-slate-900 truncate uppercase tracking-tight">{user?.name || 'Scholar'}</p>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] text-slate-400 font-medium">Sync Active</span>
              </div>
            </div>
            <Settings size={14} className="text-slate-300 hover:text-slate-600 cursor-pointer" />
          </div>
        </div>
      </div>

      {/* ── Main content Area ── */}
      <div className="flex-1 bg-white flex flex-col relative">

        {activeTab === 'browse' ? (
          /* EXPLORE PAGE */
          <div className="flex-1 overflow-y-auto p-10 bg-slate-50/50">
            <header className="mb-12">
              <h2 className="text-4xl font-black text-slate-900 mb-2">Campus Village</h2>
              <p className="text-slate-500 text-lg">Your central hub for community, competition, and research.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
              {clubs.map(club => (
                <motion.div
                  key={club.id}
                  whileHover={{ y: -8, shadow: '0 20px 40px rgba(0,0,0,0.05)' }}
                  className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform">
                    <club.icon size={128} />
                  </div>

                  <div className="flex items-start justify-between mb-6">
                    <div className="p-4 rounded-2xl text-white shadow-lg" style={{ backgroundColor: club.color }}>
                      <club.icon size={24} />
                    </div>
                    {club.isMember ? (
                      <span className="flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-wider border border-indigo-100">
                        <ShieldCheck size={12} /> Active
                      </span>
                    ) : (
                      <button
                        onClick={() => handleJoinClub(club.id)}
                        className="px-5 py-2 bg-slate-900 text-white rounded-full text-xs font-bold hover:bg-slate-800 transition-colors"
                      > Join Community </button>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-slate-800 mb-1">{club.name}</h3>
                  <p className="text-sm text-slate-400 mb-6">{club.members} active students</p>

                  <div className="flex flex-wrap gap-2">
                    {club.channels.slice(0, 3).map(ch => (
                      <span key={ch} className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg">#{ch}</span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          /* CLUB PAGE */
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col min-w-0">
              {/* Header with Sub-Tabs */}
              <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between bg-white z-10 sticky top-0">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="text-indigo-500"><Hash size={20} className="font-bold" /></div>
                    <h1 className="font-bold text-slate-800">{selectedChannel}</h1>
                  </div>
                  
                  <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    {[
                      { id: 'chat', icon: MessageSquare, label: 'Chat' },
                      { id: 'leaderboard', icon: Trophy, label: 'Leaderboard' },
                      { id: 'research', icon: Microscope, label: 'Research' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveSubTab(tab.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeSubTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        <tab.icon size={14} /> {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>
                
                <div className="flex items-center gap-3">
                   <button onClick={() => setShowMembers(!showMembers)} className={`p-2 rounded-lg transition-colors ${showMembers ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-100'}`}>
                    <Users size={20} />
                  </button>
                  <div className="w-[1px] h-6 bg-slate-200" />
                  <PhoneCall size={20} className="text-slate-400 hover:text-indigo-500 cursor-pointer" onClick={() => { setIsCalling(true); setCallType('voice'); }} />
                  <Video size={21} className="text-slate-400 hover:text-indigo-500 cursor-pointer" onClick={() => { setIsCalling(true); setCallType('video'); }} />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto bg-white relative">
                {activeSubTab === 'chat' ? (
                  /* CHAT VIEW */
                  <div className="flex flex-col h-full">
                    <div className="flex-1 p-6 space-y-6">
                      <div className="py-10 text-center border-b border-slate-50 mb-6">
                        <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                          <Hash size={32} className="text-slate-300" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800">Welcome to #{selectedChannel}</h2>
                        <p className="text-slate-400 text-sm">This is the start of the community conversation.</p>
                      </div>

                      {MOCK_MESSAGES.map(msg => (
                        <div key={msg.id} className={`flex gap-4 group ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                          <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center shrink-0 shadow-sm border border-white">
                            <span className="text-indigo-600 font-bold text-xs">{msg.sender[0]}</span>
                          </div>
                          <div className={`space-y-1 max-w-[70%] ${msg.isMe ? 'text-right' : ''}`}>
                            <div className={`flex items-center gap-2 mb-1 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                              <span className="text-[11px] font-black text-slate-800 uppercase tracking-tighter">{msg.sender}</span>
                              <span className="text-[9px] text-slate-400">{msg.time}</span>
                            </div>
                            <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.isMe ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                              {msg.text}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* INPUT AREA */}
                    <div className="p-6 bg-slate-50 border-t border-slate-100 sticky bottom-0">
                      <div className="flex items-center gap-3 bg-white border-2 border-slate-200 p-2 rounded-2xl focus-within:border-indigo-400 transition-all shadow-sm">
                        <button className="p-2 text-slate-400 hover:text-indigo-500"><Plus size={20} /></button>
                        <input
                          type="text"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder={`Message #${selectedChannel}...`}
                          className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 font-medium"
                        />
                        <button className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-xs flex items-center gap-2 hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100">
                          Send <Zap size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : activeSubTab === 'leaderboard' ? (
                  /* LEADERBOARD VIEW */
                  <div className="p-10">
                    <div className="max-w-2xl mx-auto">
                      <div className="flex items-center gap-4 mb-10">
                        <div className="w-16 h-16 rounded-3xl bg-yellow-500 flex items-center justify-center text-white shadow-xl shadow-yellow-100">
                          <Trophy size={32} />
                        </div>
                        <div>
                          <h2 className="text-3xl font-black text-slate-900">Campus Rankings</h2>
                          <p className="text-slate-500">Top clubs ranked by engagement and project volume.</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {leaderboardData.map((c, i) => (
                          <motion.div 
                            key={c.id}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center gap-4 p-5 rounded-[24px] bg-white border border-slate-100 hover:border-indigo-200 transition-all shadow-sm"
                          >
                            <div className="w-8 font-black text-slate-300 text-xl"># {i+1}</div>
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0" style={{ backgroundColor: c.color }}>
                              <c.icon size={24} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-slate-800">{c.name}</h4>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{c.type}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-black text-slate-900">{c.points} pts</p>
                              <p className="text-[10px] text-emerald-500 font-bold tracking-tight">Active Activity</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* RESEARCH VIEW */
                  <div className="p-10">
                    <div className="max-w-4xl mx-auto">
                       <div className="flex items-center justify-between mb-10">
                         <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-3xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                              <Microscope size={32} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-slate-900">Research Vault</h2>
                                <p className="text-slate-500">Shared knowledge and project repositories.</p>
                            </div>
                         </div>
                         <div className="relative">
                            <input 
                              type="file" 
                              id="research-upload" 
                              className="hidden" 
                              onChange={handleResearchUpload}
                              accept=".pdf,.doc,.docx"
                            />
                            <label 
                              htmlFor="research-upload"
                              className={`px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg cursor-pointer flex items-center gap-2 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                            >
                              {isUploading ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                  Uploading...
                                </>
                              ) : (
                                <>+ Upload Paper</>
                              )}
                            </label>
                         </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {researchPapers.length === 0 ? (
                          <div className="col-span-2 py-20 border-2 border-dashed border-slate-100 rounded-[32px] flex flex-col items-center justify-center text-slate-400">
                            <FileText size={48} className="mb-4 opacity-10" />
                            <p className="font-bold">The vault is empty</p>
                            <p className="text-xs">Be the first to publish a paper in this community.</p>
                          </div>
                        ) : (
                          researchPapers.map((file, i) => (
                             <div key={i} className="p-5 bg-white border border-slate-100 rounded-[24px] hover:border-indigo-50 hover:border-indigo-200 transition-all group flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0 shadow-sm">
                                  <FileText size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">{file.title}</h4>
                                  <p className="text-xs text-slate-400 mb-2">By {file.author} • {file.date}</p>
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-bold text-slate-500">{file.size}</span>
                                    <ArrowRight size={14} className="text-slate-300 group-hover:text-indigo-600 transition-all opacity-0 group-hover:opacity-100" />
                                  </div>
                                </div>
                             </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* MEMBER SIDEBAR */}
            <AnimatePresence>
              {showMembers && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 240, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="bg-slate-50 border-l border-slate-100 overflow-hidden shrink-0 hidden xl:flex flex-col"
                >
                  <div className="p-5 border-b border-slate-200/50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Members — {selectedClub?.members}</p>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {[
                      { name: 'Alex Chen', status: 'Online', role: 'President' },
                      { name: 'Sarah Blake', status: 'In Voice', role: 'Member' },
                      { name: 'Michael Sun', status: 'Offline', role: 'Member' },
                      { name: 'Chloe Wu', status: 'Online', role: 'Mentor' }
                    ].map((member, i) => (
                      <div key={i} className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${member.status === 'Offline' ? 'opacity-40' : 'hover:bg-white cursor-pointer shadow-sm shadow-transparent hover:shadow-slate-200'}`}>
                        <div className="relative">
                           <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-500">
                             {member.name[0]}
                           </div>
                           {member.status !== 'Offline' && (
                             <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-50 ${member.status === 'In Voice' ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
                           )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-800 truncate">{member.name}</p>
                          <p className={`text-[10px] font-bold ${member.role === 'President' ? 'text-indigo-600' : 'text-slate-400'}`}>{member.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ── Discord-like Active Call Overlay ── */}
        <AnimatePresence>
          {isCalling && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: '100%', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="absolute inset-0 bg-slate-900 z-[100] overflow-hidden flex flex-col"
            >
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg"><Volume2 size={18} /></div>
                  <div>
                    <h4 className="text-white font-bold">Voice: Campus Lounge</h4>
                    <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">{selectedClub?.name}</p>
                  </div>
                </div>
                <button onClick={() => setIsCalling(false)} className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-all"><X /></button>
              </div>

              <div className="flex-1 flex flex-wrap items-center justify-center gap-8 p-10">
                {[1, 2, 3].map(i => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="relative group cursor-pointer"
                  >
                    <div className="w-32 h-32 rounded-3xl bg-slate-800 border-2 border-indigo-500/30 flex items-center justify-center transition-all group-hover:border-indigo-500 relative overflow-hidden">
                      <span className="text-5xl font-black text-indigo-500/20">{i === 1 ? 'Y' : 'U'}</span>
                      {callType === 'video' && i === 1 && (
                        <div className="absolute inset-0 bg-slate-700 flex items-center justify-center">
                          <span className="text-xs text-white/50 font-bold tracking-tight">Camera Restricted</span>
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-2 inset-x-0 mx-auto w-fit px-4 py-1 bg-slate-900 border border-slate-800 rounded-full text-[10px] text-white font-bold shadow-xl">
                      {i === 1 ? 'You (Me)' : `Student #${i}`}
                    </div>
                    {i === 1 && <div className="absolute top-2 right-2 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900 shadow-[0_0_8px_#10b981] animate-pulse" />}
                  </motion.div>
                ))}
              </div>

              <div className="p-8 pb-12 flex justify-center items-center gap-6 bg-slate-950/50 backdrop-blur-md">
                <button className="w-14 h-14 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 transition-all"><Mic size={24} /></button>
                <button
                  onClick={() => setIsCalling(false)}
                  className="w-16 h-16 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 hover:bg-rose-600 transition-all active:scale-95 hover:rotate-90"
                >
                  <Phone size={28} className="rotate-[135deg]" />
                </button>
                <button className="w-14 h-14 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 transition-all" onClick={() => setCallType(callType === 'video' ? 'voice' : 'video')}>
                  {callType === 'video' ? <Video size={24} className="text-indigo-400" /> : <Video size={24} className="opacity-40" />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* ── Create Club Modal ── */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="bg-white rounded-[40px] shadow-2xl p-10 w-full max-w-md relative z-10 border border-slate-100"
            >
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600"><Globe size={24} /></div>
                 <h2 className="text-3xl font-black text-slate-900 tracking-tight">Establish Club</h2>
              </div>
              <p className="text-slate-500 mb-8 text-sm leading-relaxed">Charter a new community for your peers. All clubs require admin verification.</p>

              <form onSubmit={handleCreateClub} className="space-y-6">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Guild Name</label>
                  <input required name="clubName" type="text" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-slate-800 font-bold focus:border-indigo-400 outline-none transition-all placeholder:text-slate-300" placeholder="e.g. AI Strategy Group" />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                  <select name="clubType" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-slate-800 font-bold focus:border-indigo-400 outline-none transition-all appearance-none cursor-pointer">
                    <option value="STEM">🔬 STEM & Technology</option>
                    <option value="Sports">🏆 Athletic & Sports</option>
                    <option value="Arts">🎨 Creative Arts</option>
                    <option value="Social">🤝 Social Service</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 bg-indigo-50 p-4 rounded-2xl border border-indigo-100 text-indigo-700 text-xs font-semibold">
                  <ShieldCheck size={16} /> Restricted to verified Cornerstone IDs.
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors">Cancel</button>
                  <button type="submit" className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-200/50 hover:bg-indigo-700 transition-all transform active:scale-95">Charter Guild</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
