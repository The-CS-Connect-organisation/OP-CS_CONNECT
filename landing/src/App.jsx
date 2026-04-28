import { useRef } from 'react';
import Navbar from './components/Navbar.jsx';
import HeroSection from './components/HeroSection.jsx';
import FeaturesSection from './components/FeaturesSection.jsx';
import LoginSection from './components/LoginSection.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  const loginRef = useRef(null);

  return (
    <>
      <Navbar loginRef={loginRef} />
      <main>
        <HeroSection loginRef={loginRef} />
        <FeaturesSection />
        <LoginSection sectionRef={loginRef} />
      </main>
      <Footer />
    </>
  );
}
