const Footer = () => {
  return (
    <footer className="w-full bg-gradient-to-b from-orange-500 to-orange-700 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col items-center">
        <div className="flex items-center gap-3 mb-3">
          <img
            src={`${import.meta.env.BASE_URL}img/csfeviconbgfreeedition.png`}
            alt="Cornerstone School"
            className="h-10 w-10 object-contain brightness-0 invert"
          />
          <span className="font-bold text-lg tracking-wide">Cornerstone Public School</span>
        </div>
        <p className="text-center max-w-xl text-sm font-normal leading-relaxed text-white/80 mb-4">
          Empowering the next generation through innovation, technology, and a
          commitment to excellence in education.
        </p>
        <a
          href="https://www.cornerstoneschool.edu.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-2 rounded-full border border-white/30 text-white/90 text-sm font-medium hover:bg-white/10 transition-colors mb-4"
        >
          Visit our school website &rarr;
        </a>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:-translate-y-0.5 transition-all duration-300">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" stroke="#fff" strokeOpacity=".6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <a href="#" className="hover:-translate-y-0.5 transition-all duration-300">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 2H7a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5" stroke="#fff" strokeOpacity=".6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 11.37a4 4 0 1 1-7.914 1.173A4 4 0 0 1 16 11.37m1.5-4.87h.01" stroke="#fff" strokeOpacity=".6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <a href="#" className="hover:-translate-y-0.5 transition-all duration-300">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6M6 9H2v12h4zM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4" stroke="#fff" strokeOpacity=".6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <a href="#" className="hover:-translate-y-0.5 transition-all duration-300">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2" stroke="#fff" strokeOpacity=".6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
      <div className="border-t border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-3 text-center text-sm font-normal text-white/70">
          &copy; 2026 Cornerstone Public School Pvt Ltd. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
