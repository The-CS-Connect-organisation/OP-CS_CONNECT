import { useEffect } from 'react';
import Hero from '@/components/awwwards/Hero';
import About from '@/components/awwwards/About';
import NavBar from '@/components/awwwards/Navbar';
import Features from '@/components/awwwards/Features';
import Story from '@/components/awwwards/Story';
import Footer from '@/components/awwwards/Footer';

export default function LandingPage() {
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.style.backgroundColor = '';
  }, []);

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
