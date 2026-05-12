import { useRef } from 'react';
import Navbar from './components/Navbar.jsx';
import HeroSection from './components/HeroSection.jsx';
import FeaturesSection from './components/FeaturesSection.jsx';
import CinematicScrollSection from './components/CinematicScrollSection.jsx';
import Footer from './components/Footer.jsx';
import ScrollTriggerWrapper from './components/animations/ScrollTriggerWrapper.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <ScrollTriggerWrapper animation="fadeUp" stagger={0.1} className="w-full">
          <FeaturesSection />
        </ScrollTriggerWrapper>
        <CinematicScrollSection />
      </main>
      <Footer />
    </>
  );
}
