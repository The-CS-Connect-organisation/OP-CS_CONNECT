import { useEffect, useState } from 'react';
import Hero from '@/components/awwwards/Hero';
import NavBar from '@/components/awwwards/Navbar';
import AppGuide from '@/components/guide/AppGuide';
import Footer from '@/components/awwwards/Footer';
import AudioInit from '@/components/awwwards/AudioInit';

export default function LandingPage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.style.backgroundColor = '';

    const check = () => {
      setIsMobile(window.innerWidth < 768);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (isMobile) return null;

  return (
    <>
      <AudioInit />
      <main className="relative min-h-screen w-full overflow-x-hidden page-enter bg-white">
        <NavBar />
        <Hero />
        <AppGuide />
        <Footer />
      </main>
    </>
  );
}
