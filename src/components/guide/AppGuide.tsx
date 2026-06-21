import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap, UserCheck, Building2, Bus, BookOpen, Files,
  CreditCard, BarChart3, MessageSquare, ShieldCheck, ArrowRight,
  Sparkles, Library, HeartPulse, Users, Calendar, Bell, ChevronDown,
  Monitor, Smartphone, Wifi, Cloud, CheckCircle, HelpCircle, X,
  Layers, GitBranch, Globe, Lock, Zap, Target, Eye
} from 'lucide-react';

function useReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function Accordion({ title, icon: Icon, color, children }: { title: string; icon: any; color: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  return (
    <div className={`rounded-xl border transition-all duration-300 ${open ? 'border-orange-200 shadow-md shadow-orange-100/50' : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 md:p-5 text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`${color} p-2.5 rounded-lg text-white transition-transform duration-300 ${open ? 'scale-110' : ''}`}>
            <Icon className="w-5 h-5" />
          </div>
          <span className="font-semibold text-gray-800 text-sm md:text-base">{title}</span>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div
        ref={contentRef}
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: open ? `${contentRef.current?.scrollHeight ?? 500}px` : '0px' }}
      >
        <div className="px-4 md:px-5 pb-4 md:pb-5 text-sm text-gray-600 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border-b border-gray-100 transition-all duration-300 ${open ? 'pb-4' : 'pb-0'}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left gap-4 group"
      >
        <span className="font-medium text-gray-800 text-sm md:text-base group-hover:text-orange-600 transition-colors">{q}</span>
        <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${open ? 'bg-orange-500 text-white rotate-45' : 'bg-gray-100 text-gray-400 group-hover:bg-orange-100 group-hover:text-orange-500'}`}>
          <X className="w-3.5 h-3.5" />
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <p className="text-sm text-gray-500 leading-relaxed pr-8">{a}</p>
      </div>
    </div>
  );
}

const features = [
  { icon: UserCheck, label: 'Attendance', color: 'bg-emerald-500', desc: 'Real-time attendance tracking with bulk marking, QR code scanning, and automated reports. Teachers can mark present/absent/late with a single tap, and the system auto-generates monthly summaries for parents.' },
  { icon: BookOpen, label: 'Assignments & Grades', color: 'bg-blue-500', desc: 'Create, distribute, and grade assignments digitally. Students submit online, teachers evaluate with rubrics, and grades sync instantly to report cards with percentile rankings.' },
  { icon: Calendar, label: 'Timetable & Exams', color: 'bg-violet-500', desc: 'Dynamic timetable builder with drag-and-drop scheduling, conflict detection, and role-specific views. Exam management includes seating plans, hall tickets, and grade entry.' },
  { icon: CreditCard, label: 'Fees & Finance', color: 'bg-green-500', desc: 'Complete fee management with installment plans, online payment integration, receipt generation, and due-date reminders. Track outstanding balances and generate financial reports.' },
  { icon: Bus, label: 'Bus Tracking', color: 'bg-amber-500', desc: 'Live GPS bus tracking with route optimization, student boarding logs, delay notifications, and driver communication. Parents get real-time ETAs for pickup points.' },
  { icon: MessageSquare, label: 'Communication Hub', color: 'bg-cyan-500', desc: 'Centralized messaging platform connecting teachers, students, parents, and staff. Supports announcements, direct messages, group chats, and automated notification broadcasts.' },
  { icon: BarChart3, label: 'Analytics & Reports', color: 'bg-rose-500', desc: 'AI-powered analytics dashboard with predictive grade modeling, attendance trends, at-risk student identification, and customizable report generation for stakeholders.' },
  { icon: Files, label: 'Notes & Study Planner', color: 'bg-indigo-500', desc: 'Collaborative note-taking with rich text, file attachments, and shared notebooks. Integrated study planner with deadline tracking, focus mode, and progress visualization.' },
  { icon: HeartPulse, label: 'Health & Counselling', color: 'bg-pink-500', desc: 'Digital health records, clinic visit logs, vaccination tracking, and confidential counselling booking. Students can schedule appointments and submit anonymous reports.' },
  { icon: Library, label: 'Library & Resources', color: 'bg-teal-500', desc: 'Digital library catalogue with book search, issue/return tracking, overdue alerts, and e-resource access. Students can browse, reserve, and renew books online.' },
  { icon: Bell, label: 'Announcements', color: 'bg-orange-500', desc: 'Role-targeted announcements with priority levels, attachment support, read receipts, and scheduled publishing. Critical alerts can be pinned and push-notified.' },
  { icon: ShieldCheck, label: 'Role-based Access', color: 'bg-purple-500', desc: 'Granular permission system with 8 user roles — each with customized dashboards, menus, and data access. Secure authentication with JWT and session management.' },
];

const roles = [
  {
    icon: GraduationCap, label: 'Students', color: 'bg-violet-500',
    desc: 'Your complete academic command center.',
    details: [
      'View real-time grades, attendance percentages, and fee status',
      'Submit assignments, check exam schedules, and download hall tickets',
      'Track bus location, book counselling sessions, and access digital library',
      'Use AI-powered study planner, focus mode, and collaborative notes',
      'Submit anonymous reports, log IT helpdesk tickets, and report lost items'
    ]
  },
  {
    icon: Users, label: 'Teachers', color: 'bg-blue-500',
    desc: 'Streamline your classroom management.',
    details: [
      'Mark attendance with bulk/QR modes and export reports',
      'Create assignments with rubrics, grade submissions, and give feedback',
      'Upload lesson notes, manage exam entries, and generate report cards',
      'Track student performance trends and identify at-risk learners',
      'Book rooms, manage assets, view salary slips, and access class analytics'
    ]
  },
  {
    icon: Building2, label: 'Admin & Manager', color: 'bg-orange-500',
    desc: 'Full institutional control at your fingertips.',
    details: [
      'Complete ERP suite — HR, payroll, SIS, finance, and invoicing',
      'Manage users, roles, permissions, and create accounts',
      'Configure bus routes, assign students, and oversee fleet operations',
      'View institutional analytics, audit logs, and generate compliance reports',
      'Manage library, cafeteria, facilities, athletics, and alumni relations'
    ]
  },
  {
    icon: UserCheck, label: 'Parents', color: 'bg-green-500',
    desc: 'Stay connected to your child\'s education.',
    details: [
      'Monitor attendance, grades, and timetable in real time',
      'View fee details, make payments, and track bus location',
      'Receive push notifications for announcements and alerts',
      'Book counselling appointments and access health records',
      'Communicate with teachers through the integrated messaging system'
    ]
  },
  {
    icon: Bus, label: 'Drivers', color: 'bg-amber-500',
    desc: 'Manage your routes and students efficiently.',
    details: [
      'View assigned routes, student lists, and pickup schedules',
      'Log student boarding and drop-off in real time',
      'Receive route optimization suggestions and delay alerts',
      'Communicate with transport coordinators and parents',
      'Access vehicle maintenance logs and trip history'
    ]
  },
  {
    icon: Users, label: 'Librarian', color: 'bg-teal-500',
    desc: 'Run the library like clockwork.',
    details: [
      'Manage book catalogue with search, categories, and tags',
      'Track issue/return cycles with automated overdue alerts',
      'Oversee student borrowing limits and reservation queues',
      'Generate library usage reports and popular book analytics',
      'Process book requests and manage e-resource subscriptions'
    ]
  },
];

const faqs = [
  { q: 'What is CS Connect?', a: 'CS Connect is a comprehensive, AI-powered school management platform built by students for schools. It handles attendance, grades, fees, bus tracking, communication, analytics, and more — serving students, teachers, admins, managers, parents, drivers, and librarians in one unified system.' },
  { q: 'How do I get started?', a: 'Simply click "Get Started" or "Sign in" on this page to access the login portal. If you\'re a new user, your school\'s administrator can create your account. Once logged in, you\'ll see a dashboard customized for your role with all relevant features.' },
  { q: 'Is CS Connect free to use?', a: 'CS Connect offers tiered pricing based on your school\'s size and requirements. Basic features are available for individual users, while schools can opt for institutional plans that unlock the full ERP suite including HR, payroll, SIS, and advanced analytics.' },
  { q: 'Which devices are supported?', a: 'CS Connect is fully responsive and works on desktops, tablets, and smartphones. The platform is optimized for Chrome, Firefox, Safari, and Edge browsers. Mobile apps are also available for iOS and Android with offline support for key features.' },
  { q: 'How is my data secured?', a: 'All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We use JWT-based authentication with session management, role-based access control, and regular security audits. We comply with data protection regulations and never share your data with third parties.' },
  { q: 'Can parents track their child in real time?', a: 'Yes! Parents get live GPS tracking of school buses with real-time ETAs, delay notifications, and boarding/drop-off logs. They can also view their child\'s attendance, grades, timetable, and fee status instantly from their dashboard.' },
  { q: 'How does the AI feature work?', a: 'CS Connect\'s AI engine analyzes historical data to predict student outcomes, identify at-risk learners, suggest personalized study plans, and generate actionable insights for teachers. The AI lab also provides a chatbot for instant help and queries.' },
  { q: 'Can I integrate CS Connect with my existing systems?', a: 'CS Connect provides REST APIs and webhook support for integration with existing school management software, payment gateways, SMS gateways, and email services. Our team can assist with custom integrations for your institution.' },
  { q: 'How do I reset my password?', a: 'On the login page, click "Forgot password?" and enter your registered email. You\'ll receive a password reset link within minutes. If you don\'t receive it, contact your school administrator or our support team.' },
  { q: 'Is there a mobile app?', a: 'Yes, CS Connect is available as a progressive web app (PWA) that can be installed directly from the browser on any device. Native Android and iOS apps are also available with additional offline capabilities.' },
];

export default function AppGuide() {
  return (
    <section className="w-full bg-white">
      <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">

        {/* Header */}
        <Reveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-500 shadow-lg shadow-orange-500/20 mb-5 animate-bounce-slow">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
              How CS Connect Works
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">
              A unified school management platform connecting every stakeholder
              in your institution's ecosystem — from attendance to analytics.
            </p>
          </div>
        </Reveal>

        {/* Feature Cards with Accordion */}
        <Reveal delay={100}>
          <div className="mb-20">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Layers className="w-5 h-5 text-orange-500" />
              Everything You Need
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              {features.map((f, i) => (
                <Accordion key={f.label} title={f.label} icon={f.icon} color={f.color}>
                  <p>{f.desc}</p>
                </Accordion>
              ))}
            </div>
          </div>
        </Reveal>

        {/* How It Works Steps */}
        <Reveal delay={200}>
          <div className="mb-20 bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 md:p-12 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-8 flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-orange-500" />
              How It Works — Step by Step
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: '01', icon: Monitor, title: 'Sign In', desc: 'Log in with your school-provided credentials. Your role determines your dashboard, menus, and permissions automatically.' },
                { step: '02', icon: Target, title: 'Navigate', desc: 'Use the sidebar or top navigation to access your tools — attendance, grades, fees, messages, and more.' },
                { step: '03', icon: Cloud, title: 'Stay Synced', desc: 'Every action updates in real time. Teachers mark attendance, parents see it instantly. Grades post, students view them immediately.' },
              ].map((s) => (
                <div key={s.step} className="text-center group">
                  <div className="w-14 h-14 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-4 text-lg font-black group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">{s.step}</div>
                  <div className="w-10 h-0.5 bg-orange-200 mx-auto mb-4" />
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-3">
                    <s.icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-gray-800 mb-2">{s.title}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* User Roles with details */}
        <Reveal delay={300}>
          <div className="mb-20">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-500" />
              Built for Everyone
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roles.map((r) => (
                <div
                  key={r.label}
                  className="p-6 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 group hover:-translate-y-1"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`${r.color} p-2.5 rounded-lg text-white group-hover:scale-110 transition-transform duration-300`}>
                      <r.icon className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-gray-900">{r.label}</h4>
                  </div>
                  <p className="text-sm text-gray-500 mb-3 font-medium">{r.desc}</p>
                  <ul className="space-y-1.5">
                    {r.details.map((d) => (
                      <li key={d} className="flex items-start gap-2 text-xs text-gray-400">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Tech Highlights */}
        <Reveal delay={400}>
          <div className="mb-20 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Zap, label: 'Real-time Sync', sub: 'Instant updates across all users' },
              { icon: ShieldCheck, label: 'Enterprise Security', sub: 'Encrypted, role-based, audited' },
              { icon: Smartphone, label: 'Mobile-first', sub: 'Works on any device anywhere' },
              { icon: Globe, label: 'Cloud-hosted', sub: '99.9% uptime, auto-scaled' },
            ].map((t) => (
              <div key={t.label} className="text-center p-5 rounded-xl bg-gray-50 border border-gray-100 hover:border-orange-200 hover:bg-orange-50/30 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                  <t.icon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-gray-800 text-sm">{t.label}</h4>
                <p className="text-xs text-gray-400 mt-1">{t.sub}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* FAQ */}
        <Reveal delay={500}>
          <div className="mb-20">
            <div className="flex items-center gap-3 mb-6">
              <HelpCircle className="w-5 h-5 text-orange-500" />
              <h3 className="text-xl font-bold text-gray-800">Frequently Asked Questions</h3>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50 px-2">
              {faqs.map((f) => (
                <FaqItem key={f.q} q={f.q} a={f.a} />
              ))}
            </div>
          </div>
        </Reveal>

        {/* About */}
        <Reveal delay={600}>
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8 md:p-12 mb-16 border border-orange-100/50">
            <div className="max-w-3xl mx-auto text-center">
              <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-orange-500/20">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                About CS Connect
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                CS Connect is an AI-powered school management platform developed by students,
                for students. It brings together attendance tracking, grade management, fee
                processing, bus route management, communication tools, and institutional
                analytics into a single seamless ecosystem.
              </p>
              <p className="text-gray-500 leading-relaxed mb-4 text-sm">
                Built with React, TypeScript, Node.js, and Firebase, CS Connect serves
                thousands of users across multiple school roles — from students checking
                their grades to administrators managing institutional operations.
              </p>
              <p className="text-gray-500 text-sm">
                Built by{' '}
                <span className="font-semibold text-gray-700">Navaneeth Nalabothu</span> and{' '}
                <span className="font-semibold text-gray-700">Rishith Manchala</span>
              </p>
            </div>
          </div>
        </Reveal>

        {/* CTA */}
        <Reveal delay={700}>
          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg shadow-orange-500/25 transition-all hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-1 active:translate-y-0"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-gray-400 text-sm mt-4">
              Already have an account?{' '}
              <Link to="/login" className="text-orange-500 hover:text-orange-600 font-medium underline underline-offset-2">
                Sign in
              </Link>
            </p>
          </div>
        </Reveal>

      </div>
    </section>
  );
}
