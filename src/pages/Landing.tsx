import { useEffect, useState } from 'react';
import Hero from '@/components/awwwards/Hero';
import About from '@/components/awwwards/About';
import NavBar from '@/components/awwwards/Navbar';
import Features from '@/components/awwwards/Features';
import Story from '@/components/awwwards/Story';
import Footer from '@/components/awwwards/Footer';
import MobileLanding from '@/components/awwwards/MobileLanding';
import { Smartphone } from 'lucide-react';

export default function LandingPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.style.backgroundColor = '';

    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setShowPrompt(false);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (isMobile) {
    return (
      <>
        {showPrompt && (
          <div className="fixed top-0 left-0 right-0 z-[100] bg-orange-500 text-white text-center py-2 px-4 text-xs font-general uppercase tracking-wide flex items-center justify-center gap-2">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile optimized view enabled</span>
            <button
              onClick={() => setShowPrompt(false)}
              className="underline ml-2"
            >
              Dismiss
            </button>
          </div>
        )}
        <MobileLanding />
      </>
    );
  }

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden page-enter">
      <NavBar />
      <Hero />
      <About />
      <Features />
      <Story />
      <Footer />
    </main>
  );
}
