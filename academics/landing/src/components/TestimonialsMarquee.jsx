import { memo } from 'react';
import { motion } from 'framer-motion';

// ── Marquee primitive ─────────────────────────────────────────────────────────
function Marquee({ children, reverse = false, pauseOnHover = false, vertical = false, repeat = 4, className = '' }) {
  return (
    <div
      className={`group flex overflow-hidden p-2 [--duration:40s] [--gap:1rem] [gap:var(--gap)] ${
        vertical ? 'flex-col' : 'flex-row'
      } ${className}`}
    >
      {Array.from({ length: repeat }, (_, i) => (
        <div
          key={i}
          className={[
            'flex shrink-0 justify-around',
            vertical ? 'flex-col [gap:var(--gap)]' : 'flex-row [gap:var(--gap)]',
            !vertical ? 'animate-marquee' : 'animate-marquee-vertical',
            pauseOnHover ? 'group-hover:[animation-play-state:paused]' : '',
            reverse ? '[animation-direction:reverse]' : '',
          ].join(' ')}
        >
          {children}
        </div>
      ))}
    </div>
  );
}

// ── Testimonial data ──────────────────────────────────────────────────────────
const testimonials = [
  {
    name: 'Priya Sharma',
    username: '@priya_s',
    body: 'The AI doubt resolver cleared concepts I struggled with for weeks. My math scores improved by 23% in one term.',
    img: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop',
    country: '🇮🇳 India',
  },
  {
    name: 'Rajesh Kumar',
    username: '@rajesh_k',
    body: 'Real-time attendance alerts and fee tracking have made my life so much easier as a parent.',
    img: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop',
    country: '🇮🇳 India',
  },
  {
    name: 'Ananya Reddy',
    username: '@ananya_r',
    body: 'Auto-grading and the AI answer scorer save me 8+ hours every week. I can focus on what matters — teaching.',
    img: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop',
    country: '🇮🇳 India',
  },
  {
    name: 'Liam Chen',
    username: '@liam_c',
    body: 'The timetable manager is a game changer. No more scheduling conflicts and substitute assignments are instant.',
    img: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop',
    country: '🇸🇬 Singapore',
  },
  {
    name: 'Fatima Al-Hassan',
    username: '@fatima_h',
    body: 'Bus tracking gives me peace of mind every single morning. I know exactly when my child arrives.',
    img: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop',
    country: '🇦🇪 UAE',
  },
  {
    name: 'Noah Williams',
    username: '@noah_w',
    body: 'The study planner AI is incredible. It built me a personalised revision schedule in seconds.',
    img: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop',
    country: '🇬🇧 UK',
  },
  {
    name: 'Mei Lin',
    username: '@mei_l',
    body: 'The library interface is so clean. Finding and reserving books has never been this easy.',
    img: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop',
    country: '🇨🇳 China',
  },
  {
    name: 'Carlos Mendez',
    username: '@carlos_m',
    body: 'Fee management is transparent and the payment reminders are a lifesaver. No more late fees!',
    img: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop',
    country: '🇲🇽 Mexico',
  },
  {
    name: 'Aisha Okonkwo',
    username: '@aisha_o',
    body: 'The communication hub keeps parents, teachers and students all on the same page. Brilliant.',
    img: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop',
    country: '🇳🇬 Nigeria',
  },
];

// ── Card ──────────────────────────────────────────────────────────────────────
const TestimonialCard = memo(({ img, name, username, body, country }) => (
  <div className="w-52 flex-shrink-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
    <div className="flex items-center gap-2.5 mb-3">
      <img
        src={img}
        alt={name}
        className="w-9 h-9 rounded-full object-cover flex-shrink-0"
        loading="lazy"
      />
      <div>
        <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
          {name} <span className="text-xs font-normal text-gray-400">{country}</span>
        </p>
        <p className="text-xs text-gray-400">{username}</p>
      </div>
    </div>
    <blockquote className="text-xs text-gray-600 leading-relaxed">"{body}"</blockquote>
  </div>
));

// ── Section ───────────────────────────────────────────────────────────────────
export default function TestimonialsMarquee() {
  const half = Math.ceil(testimonials.length / 2);
  const row1 = testimonials.slice(0, half);
  const row2 = testimonials.slice(half);

  return (
    <section className="relative py-24 bg-gradient-to-b from-white to-orange-50/40 overflow-hidden">
      {/* Header */}
      <motion.div
        className="text-center max-w-2xl mx-auto px-6 mb-14"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-200 text-sm font-semibold text-purple-700 mb-4">
          ❤️ Real Stories
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
          Loved by students,{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
            teachers & parents
          </span>
        </h2>
      </motion.div>

      {/* 3D perspective marquee container */}
      <div
        className="relative flex h-80 w-full max-w-5xl mx-auto flex-row items-center justify-center overflow-hidden gap-3"
        style={{ perspective: '300px' }}
      >
        <div
          className="flex flex-row items-center gap-4"
          style={{
            transform:
              'translateX(-80px) translateY(0px) translateZ(-100px) rotateX(20deg) rotateY(-10deg) rotateZ(20deg)',
          }}
        >
          {/* Column 1 — down */}
          <Marquee vertical pauseOnHover repeat={3} className="[--duration:35s]">
            {row1.map((t) => (
              <TestimonialCard key={t.username} {...t} />
            ))}
          </Marquee>

          {/* Column 2 — up */}
          <Marquee vertical pauseOnHover reverse repeat={3} className="[--duration:35s]">
            {row2.map((t) => (
              <TestimonialCard key={t.username} {...t} />
            ))}
          </Marquee>

          {/* Column 3 — down */}
          <Marquee vertical pauseOnHover repeat={3} className="[--duration:40s]">
            {row1.map((t) => (
              <TestimonialCard key={`${t.username}-2`} {...t} />
            ))}
          </Marquee>

          {/* Column 4 — up */}
          <Marquee vertical pauseOnHover reverse repeat={3} className="[--duration:38s]">
            {row2.map((t) => (
              <TestimonialCard key={`${t.username}-3`} {...t} />
            ))}
          </Marquee>
        </div>

        {/* Gradient fades */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-white" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-orange-50/40" />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-white" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-white" />
      </div>
    </section>
  );
}
