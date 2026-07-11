import { useEffect } from 'react';
import Hero from '@/components/awwwards/Hero';
import AppGuide from '@/components/guide/AppGuide';
import Footer from '@/components/awwwards/Footer';
import AudioInit from '@/components/awwwards/AudioInit';

export default function LandingPage() {
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.style.backgroundColor = '';
  }, []);

  return (
    <>
      <AudioInit />
      <main className="relative min-h-screen w-full overflow-x-hidden page-enter bg-[#FFFDF5]">
        <Hero />
        <AppGuide />
        <Footer />
      </main>
    </>
  );
}
