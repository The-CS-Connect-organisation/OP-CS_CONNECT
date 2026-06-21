import { Link } from 'react-router-dom';
import {
  GraduationCap, UserCheck, Building2, Bus, BookOpen, Files,
  CreditCard, BarChart3, MessageSquare, ShieldCheck, ArrowRight,
  Sparkles, Library, HeartPulse, Users, Calendar, Bell
} from 'lucide-react';

const features = [
  { icon: UserCheck, label: 'Attendance', color: 'bg-emerald-500' },
  { icon: BookOpen, label: 'Assignments & Grades', color: 'bg-blue-500' },
  { icon: Calendar, label: 'Timetable & Exams', color: 'bg-violet-500' },
  { icon: CreditCard, label: 'Fees & Finance', color: 'bg-green-500' },
  { icon: Bus, label: 'Bus Tracking', color: 'bg-amber-500' },
  { icon: MessageSquare, label: 'Communication Hub', color: 'bg-cyan-500' },
  { icon: BarChart3, label: 'Analytics & Reports', color: 'bg-rose-500' },
  { icon: Files, label: 'Notes & Study Planner', color: 'bg-indigo-500' },
  { icon: HeartPulse, label: 'Health & Counselling', color: 'bg-pink-500' },
  { icon: Library, label: 'Library & Resources', color: 'bg-teal-500' },
  { icon: Bell, label: 'Announcements', color: 'bg-orange-500' },
  { icon: ShieldCheck, label: 'Role-based Access', color: 'bg-purple-500' },
];

const roles = [
  { icon: GraduationCap, label: 'Students', desc: 'Track grades, attendance, fees, bus routes, assignments, exams, and more — all in one place.' },
  { icon: Users, label: 'Teachers', desc: 'Mark attendance, manage assignments, grade submissions, upload notes, and monitor student progress.' },
  { icon: Building2, label: 'Admin & Manager', desc: 'Full ERP control — HR, payroll, SIS, finance, invoicing, bus assignment, and institutional analytics.' },
  { icon: UserCheck, label: 'Parents', desc: 'Stay informed with real-time access to your child\'s attendance, grades, timetable, and fee status.' },
  { icon: Bus, label: 'Drivers', desc: 'View assigned routes, manage bus schedules, and track student boarding in real time.' },
  { icon: Users, label: 'Librarian', desc: 'Manage the library catalogue, track issued books, and oversee student borrowing.' },
];

export default function AppGuide() {
  return (
    <section className="w-full bg-white">
      {/* How It Works */}
      <div className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <Sparkles className="w-8 h-8 text-orange-500 mx-auto mb-4" />
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How CS Connect Works
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            A unified school management platform connecting every stakeholder
            in your institution's ecosystem
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-20">
          {features.map((f) => (
            <div
              key={f.label}
              className="flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group"
            >
              <div className={`${f.color} p-3 rounded-lg text-white group-hover:scale-110 transition-transform`}>
                <f.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-gray-700 text-center leading-tight">
                {f.label}
              </span>
            </div>
          ))}
        </div>

        {/* User Roles */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-10">
            Built for Everyone
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((r) => (
              <div
                key={r.label}
                className="p-6 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-lg bg-orange-50 text-orange-600 group-hover:bg-orange-100 transition-colors">
                    <r.icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-gray-900">{r.label}</h4>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* About */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8 md:p-12 mb-16">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              About CS Connect
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              CS Connect is an AI-powered school management platform developed by students,
              for students. It brings together attendance tracking, grade management, fee
              processing, bus route management, communication tools, and institutional
              analytics into a single seamless ecosystem. Built with modern web technologies
              and a focus on user experience, CS Connect serves students, teachers, admins,
              managers, parents, and staff alike.
            </p>
            <p className="text-gray-500 text-sm">
              Built by{' '}
              <span className="font-semibold text-gray-700">Navaneeth Nalabothu</span> and{' '}
              <span className="font-semibold text-gray-700">Rishith Manchala</span>
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg shadow-orange-500/25 transition-all hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5"
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
      </div>
    </section>
  );
}
