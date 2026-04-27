import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Target, 
  BookOpen, 
  ChevronRight, 
  ChevronLeft, 
  Download, 
  Sparkles, 
  AlertCircle,
  GraduationCap,
  Clock,
  CheckCircle2,
  Brain,
  Zap,
  Lightbulb
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const STUDY_TIPS = [
  {
    title: 'The Feynman Technique',
    description: 'Explain the concept to a "6-year-old." If you stumble, go back and review that specific part.',
    icon: Brain
  },
  {
    title: 'Active Recall',
    description: 'Don\'t just read notes. Close the book and write down everything you remember about a chapter.',
    icon: Zap
  },
  {
    title: 'Spaced Repetition',
    description: 'Review the topic today, tomorrow, in 3 days, and in 7 days to lock it in long-term memory.',
    icon: Clock
  },
  {
    title: 'Pomodoro Technique',
    description: 'Study for 25 minutes, then take a 5-minute break. It keeps your brain fresh.',
    icon: Target
  }
];

const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 
  'English Literature', 'History', 'Geography', 'Computer Science'
];

export const StudyPlanner = ({ user, addToast }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    subject: '',
    grade: '',
    weakChapters: '',
    targetScore: 85,
    testDate: '',
    currentLevel: 'beginner'
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const generatePlan = () => {
    setIsGenerating(true);
    
    // Simulate complex calculation
    setTimeout(() => {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      
      // BACKGROUND DECORATION
      doc.setFillColor(252, 252, 255);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      
      // SIDE ACCENT LINE
      doc.setFillColor(255, 107, 157);
      doc.rect(0, 0, 5, pageHeight, 'F');
      
      // HEADER BOX
      doc.setFillColor(30, 41, 59); // Slate 800
      doc.rect(5, 0, pageWidth, 45, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(28);
      doc.text('ACADEMIC BLUEPRINT', 25, 28);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(200, 200, 200);
      doc.text(`PREPARED FOR: ${user?.name || 'CORNERSTONE STUDENT'} \u2022 SUBJECT: ${formData.subject.toUpperCase()}`, 25, 36);
      
      // METRICS ROW
      let y = 60;
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Performance Targets', 25, y);
      
      doc.autoTable({
        startY: y + 5,
        margin: { left: 25 },
        head: [['Metric', 'Value', 'Status']],
        body: [
          ['Target Score', `${formData.targetScore}%`, 'OPTIMISTIC'],
          ['Subject Area', formData.subject, 'CORE'],
          ['Difficulty Level', formData.currentLevel.toUpperCase(), 'ADAPTIVE'],
          ['Goal Date', formData.testDate, 'UPCOMING']
        ],
        theme: 'grid',
        headStyles: { fillColor: [255, 107, 157], textColor: 255 },
        styles: { fontSize: 10, cellPadding: 4 }
      });

      // CHAPTER FOCUS AREA
      y = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(14);
      doc.text('Key Focus Chapters', 25, y);
      
      const chapters = formData.weakChapters.split(',').map(c => c.trim()).filter(c => c !== '');
      doc.autoTable({
        startY: y + 5,
        margin: { left: 25 },
        body: chapters.map(ch => [ch, 'High Priority', 'Requires Review']),
        head: [['Chapter Name', 'Urgency', 'Action Taken']],
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 9 }
      });

      // DAILY ROADMAP
      y = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(14);
      doc.text('Stratified Study Schedule', 25, y);
      
      const today = new Date();
      const examDate = new Date(formData.testDate);
      const daysLeft = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));
      
      const schedule = [];
      if (daysLeft > 0) {
        for (let i = 1; i <= Math.min(daysLeft, 14); i++) {
          const date = new Date();
          date.setDate(today.getDate() + i);
          let phase = i <= Math.ceil(daysLeft * 0.4) ? 'Foundation' : (i <= Math.ceil(daysLeft * 0.8) ? 'Mastery' : 'Refinement');
          let task = i === 1 ? 'Diagnostic Test' : (i === daysLeft ? 'Final Mock' : `Chapter Mastery: ${chapters[(i % chapters.length)] || 'Concept Review'}`);
          schedule.push([`Day ${i}`, date.toLocaleDateString(), phase, task]);
        }
      }

      doc.autoTable({
        startY: y + 5,
        margin: { left: 25 },
        head: [['Day', 'Date', 'Phase', 'Action Plan']],
        body: schedule,
        theme: 'grid',
        headStyles: { fillColor: [30, 41, 59] },
        styles: { fontSize: 8 }
      });

      // FOOTER TIPS
      if (doc.lastAutoTable.finalY > 230) doc.addPage();
      
      const footerY = doc.internal.pageSize.height - 40;
      doc.setFontSize(12);
      doc.setTextColor(30, 41, 59);
      doc.text('Advanced Cognitive Tips', 25, footerY - 5);
      
      let tipX = 25;
      STUDY_TIPS.forEach((tip, idx) => {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(tip.title, tipX, footerY + 5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(tip.description, tipX, footerY + 9, { maxWidth: 40 });
        tipX += 45;
      });

      doc.save(`Cornerstone_Blueprint_${formData.subject}.pdf`);
      setIsGenerating(false);
      addToast?.('Success! Your enhanced study plan is ready.', 'success');
      setStep(4);
    }, 2000);
  };

  return (
    <div className="min-h-screen pb-20 px-4 pt-10" style={{ background: 'var(--bg-app)' }}>
      <div className="max-w-2xl mx-auto">
        <header className="mb-10 text-center">
          <div className="inline-flex p-3 rounded-2xl bg-pink-100 text-pink-600 mb-4">
            <Sparkles size={25} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">AI Study Architect</h1>
          <p className="text-[var(--text-muted)] mt-2">Build a data-driven path to your target grade.</p>
        </header>

        <div className="bg-white/80 backdrop-blur-xl border border-[var(--border-default)] rounded-3xl shadow-2xl p-8 relative overflow-hidden">
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
            <motion.div 
              className="h-full bg-pink-500"
              initial={{ width: '0%' }}
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ type: 'spring', damping: 20 }}
            />
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                    <BookOpen size={16} className="text-pink-500" /> Choose Subject
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {SUBJECTS.map(subj => (
                      <button
                        key={subj}
                        onClick={() => setFormData({...formData, subject: subj})}
                        className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                          formData.subject === subj 
                          ? 'border-pink-500 bg-pink-50 text-pink-700' 
                          : 'border-gray-100 hover:border-pink-200'
                        }`}
                      >
                        {subj}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button 
                    disabled={!formData.subject}
                    onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-3 bg-pink-600 text-white rounded-2xl font-bold shadow-lg shadow-pink-200 disabled:opacity-50 hover:scale-105 active:scale-95 transition-all"
                  >
                    Next Step <ChevronRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle size={16} className="text-amber-500" /> Focus Areas
                  </label>
                  <p className="text-xs text-slate-500 mb-3">Which chapters do you find the most difficult? (Comma separated)</p>
                  <textarea 
                    value={formData.weakChapters}
                    onChange={(e) => setFormData({...formData, weakChapters: e.target.value})}
                    placeholder="e.g. Thermodynamics, Linear Algebra, Organic Synthesis..."
                    className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-pink-500 transition-colors h-32 outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-1">
                    <Target size={16} className="text-indigo-500" /> Target Grade: {formData.targetScore}%
                  </label>
                  <input 
                    type="range" min="50" max="100" 
                    value={formData.targetScore}
                    onChange={(e) => setFormData({...formData, targetScore: e.target.value})}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-2 px-1">
                    <span>PASS (50%)</span>
                    <span>ELITE (100%)</span>
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <button onClick={handleBack} className="p-3 text-slate-400 hover:text-slate-600 flex items-center gap-1">
                    <ChevronLeft size={18} /> Back
                  </button>
                  <button 
                    disabled={!formData.weakChapters}
                    onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-3 bg-pink-600 text-white rounded-2xl font-bold shadow-lg shadow-pink-200 disabled:opacity-50"
                  >
                    Set Schedule <ChevronRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-semibold mb-4 flex items-center gap-2">
                    <Calendar size={16} className="text-violet-500" /> When is the Test?
                  </label>
                  <input 
                    type="date"
                    value={formData.testDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFormData({...formData, testDate: e.target.value})}
                    className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-pink-500 outline-none"
                  />
                </div>

                <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
                  <h4 className="text-indigo-900 font-bold text-sm flex items-center gap-2 mb-2">
                    <Lightbulb size={16} /> Insight
                  </h4>
                  <p className="text-indigo-800/80 text-xs leading-relaxed">
                    Based on your target of <strong>{formData.targetScore}%</strong>, our AI suggests a 
                    <strong> high-intensity</strong> focus on active recall. We will generate a plan to prioritize 
                    your weak chapters immediately.
                  </p>
                </div>

                <div className="mt-8 flex justify-between">
                  <button onClick={handleBack} className="p-3 text-slate-400 hover:text-slate-600 flex items-center gap-1">
                    <ChevronLeft size={18} /> Back
                  </button>
                  <button 
                    disabled={!formData.testDate || isGenerating}
                    onClick={generatePlan}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200"
                  >
                    {isGenerating ? 'Analyzing Academics...' : 'Engineer My Plan'} 
                    {isGenerating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles size={18} />}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={40} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Your Success Plan is Live!</h2>
                <p className="text-slate-500 mt-2 mb-8">
                  We've curated chapters, study tips, and a day-by-day roadmap just for you.
                </p>

                <div className="grid grid-cols-1 gap-4 mb-8 text-left">
                  {STUDY_TIPS.slice(0, 2).map((tip, idx) => (
                    <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-pink-50 border border-pink-100">
                      <div className="shrink-0 p-2 bg-white rounded-xl text-pink-600 shadow-sm h-fit">
                        <tip.icon size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-pink-900 text-sm">{tip.title}</h4>
                        <p className="text-pink-800/70 text-xs mt-1 leading-relaxed">{tip.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={generatePlan}
                    className="flex items-center justify-center gap-2 w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-colors"
                  >
                    <Download size={18} /> Redownload PDF
                  </button>
                  <button 
                    onClick={() => setStep(1)}
                    className="py-4 text-slate-500 font-semibold hover:text-slate-800"
                  >
                    Plan Another Subject
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Floating Motivation */}
        <div className="mt-10 flex flex-wrap justify-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
          <div className="flex items-center gap-2 text-sm font-medium">
            <GraduationCap size={16} /> 10k+ Students Guided
          </div>
          <div className="flex items-center gap-2 text-sm font-medium">
            <CheckCircle2 size={16} /> Built-in Spaced Repetition
          </div>
          <div className="flex items-center gap-2 text-sm font-medium">
            <Target size={16} /> Goal Oriented Logic
          </div>
        </div>
      </div>
    </div>
  );
};
