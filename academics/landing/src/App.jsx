import Navbar from './components/Navbar.jsx';
import HeroSection from './components/HeroSection.jsx';
import FeaturesSection from './components/FeaturesSection.jsx';
import CinematicScrollSection from './components/CinematicScrollSection.jsx';
import TestimonialsMarquee from './components/TestimonialsMarquee.jsx';
import WaitlistSection from './components/WaitlistSection.jsx';
import LoginSection from './components/LoginSection.jsx';
import Footer from './components/Footer.jsx';
import ScrollTriggerWrapper from './components/animations/ScrollTriggerWrapper.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        {/* 1. Hero — animated headline + CTA card */}
        <HeroSection />

        {/* 2. Smooth scroll clip-path reveal */}
        <CinematicScrollSection />

        {/* 3. Features grid */}
        <div id="features">
          <ScrollTriggerWrapper animation="fadeUp" stagger={0.1} className="w-full">
            <FeaturesSection />
          </ScrollTriggerWrapper>
        </div>

        {/* 4. 3D perspective testimonials marquee */}
        <TestimonialsMarquee />

        {/* 5. Login section */}
        <LoginSection />

        {/* 6. Waitlist / contact for non-Cornerstone schools */}
        <WaitlistSection />
      </main>
      <Footer />
    </>
  );
}
