import { useState, useEffect } from 'react';
import Hero from '@/components/awwwards/Hero';
import NavBar from '@/components/awwwards/Navbar';
import AppGuide from '@/components/guide/AppGuide';
import Footer from '@/components/awwwards/Footer';
import AudioInit from '@/components/awwwards/AudioInit';
import LogoParticles from '@/components/ui/logo-particles';

export default function LandingPage() {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.style.backgroundColor = '';
  }, []);

  if (showSplash) {
    return <LogoParticles onComplete={() => setShowSplash(false)} />
  }

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
