import { useEffect, useRef, useState } from 'react';
import Hero from '@/components/awwwards/Hero';
import AppGuide from '@/components/guide/AppGuide';
import Footer from '@/components/awwwards/Footer';
import TermsConditions from '@/components/ui/terms-conditions';

export default function LandingPage() {
  const [audioStarted, setAudioStarted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.style.backgroundColor = '';
  }, []);

  const handleAccept = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('YOUR_AUDIO_URL_HERE');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
    }
    audioRef.current.play().catch(() => {});
    setAudioStarted(true);
  };

  return (
    <>
      <TermsConditions onAccept={handleAccept} />
      <main className="relative min-h-screen w-full overflow-x-hidden page-enter bg-[#FFFDF5]">
        <Hero />
        <AppGuide />
        <Footer />
      </main>
    </>
  );
}
