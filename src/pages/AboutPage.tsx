import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, School, Cpu, Users, BadgeCheck } from 'lucide-react';

const highlights = [
  { icon: Cpu, label: 'AI-Powered', desc: 'Smart automation of school management tasks' },
  { icon: Users, label: 'All-in-One', desc: 'Connects students, teachers, parents & admins' },
  { icon: BadgeCheck, label: 'Real-Time', desc: 'Live updates for attendance, grades & more' },
];

export default function AboutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white page-enter">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-700 transition-colors mb-12"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-general text-sm uppercase tracking-wide">Back</span>
        </button>

        <div className="flex items-center gap-4 mb-12">
          <img src={`${import.meta.env.BASE_URL}img/csfeviconbgfreeedition.png`} alt="CS Connect" className="w-10 h-10" />
          <div>
            <h1 className="font-zentry text-3xl font-black uppercase tracking-wider text-gray-900">
              CS Connect
            </h1>
            <p className="font-general text-xs uppercase tracking-widest text-orange-500">
              By Cornerstone School
            </p>
          </div>
        </div>

        <p className="font-circular-web text-lg text-gray-600 leading-relaxed max-w-2xl mb-16">
          CS Connect is a next-generation school management platform designed to
          unify every aspect of school life — from attendance and grades to
          communication and analytics — into one intelligent, AI-powered ecosystem.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {highlights.map((h) => (
            <div key={h.label} className="rounded-xl border border-gray-100 bg-gray-50 p-6">
              <h.icon className="w-8 h-8 text-orange-500 mb-4" />
              <h3 className="font-general text-sm font-bold uppercase tracking-wide text-gray-800 mb-2">
                {h.label}
              </h3>
              <p className="font-circular-web text-sm text-gray-500 leading-relaxed">
                {h.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-gray-100 bg-gray-50 p-8 mb-16">
          <div className="flex items-center gap-3 mb-6">
            <School className="w-6 h-6 text-orange-500" />
            <h2 className="font-general text-sm font-bold uppercase tracking-wide text-gray-800">
              Cornerstone School
            </h2>
          </div>
          <p className="font-circular-web text-sm text-gray-500 leading-relaxed">
            Cornerstone School is committed to providing a world-class education
            through innovation and technology. CS Connect is our vision for a
            seamlessly connected school ecosystem where every stakeholder stays
            informed, engaged, and empowered.
          </p>
        </div>

        <div className="text-center">
          <a
            href="https://www.cornerstoneschool.edu.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-full bg-orange-500 px-8 py-3 text-white font-general text-sm uppercase tracking-wide hover:bg-orange-600 transition-colors"
          >
            Visit School Website
          </a>
        </div>
      </div>
    </div>
  );
}
