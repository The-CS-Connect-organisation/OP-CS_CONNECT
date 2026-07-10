import { useEffect } from 'react';
import Hero from '@/components/awwwards/Hero';
import NavBar from '@/components/awwwards/Navbar';
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
      <main className="relative min-h-screen w-full overflow-x-hidden page-enter bg-white">
        <NavBar />
        <Hero />
        <AppGuide />
        <Footer />
      </main>
    </>
  );
}
