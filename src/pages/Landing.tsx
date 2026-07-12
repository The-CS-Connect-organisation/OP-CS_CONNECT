import { useEffect, useRef, useState } from 'react';
import Hero from '@/components/awwwards/Hero';
import AppGuide from '@/components/guide/AppGuide';
import Footer from '@/components/awwwards/Footer';
import TermsConditions from '@/components/ui/terms-conditions';

export default function LandingPage() {
  const [audioStarted, setAudioStarted] = useState(false);
  const [showToc, setShowToc] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.style.backgroundColor = '';
  }, []);

  const handleAccept = () => {
    setShowToc(false);
    if (!audioRef.current) {
      audioRef.current = new Audio('https://res.cloudinary.com/iextksqn/video/upload/v1783788795/01-cornfield-chase-theme-from-interstellar-piano-version_XPZdb46h_d4zjzn.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
    }
    audioRef.current.play().catch(() => {});
    setAudioStarted(true);
  };

  return (
    <>
      {showToc && <TermsConditions onAccept={handleAccept} />}
      <main className="relative min-h-screen w-full overflow-x-hidden page-enter bg-[#FFFDF5]">
        <Hero />
        <AppGuide />
        <Footer />
      </main>
    </>
  );
}
