import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '@/components/awwwards/Hero';
import AppGuide from '@/components/guide/AppGuide';
import Footer from '@/components/awwwards/Footer';
import TermsConditions from '@/components/ui/terms-conditions';

export default function LandingPage() {
  const navigate = useNavigate();
  const [showToc, setShowToc] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.style.backgroundColor = '';
  }, []);

  useEffect(() => {
    if (window.innerWidth < 768) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
    };
  }, []);

  const handleAccept = () => {
    setShowToc(false);
    if (!audioRef.current) {
      audioRef.current = new Audio('https://res.cloudinary.com/iextksqn/video/upload/v1783788795/01-cornfield-chase-theme-from-interstellar-piano-version_XPZdb46h_d4zjzn.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
    }
    audioRef.current.play().catch(() => {});
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
