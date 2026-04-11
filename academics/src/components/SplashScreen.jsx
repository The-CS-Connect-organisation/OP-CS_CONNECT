import { useEffect, useRef } from 'react';

export default function SplashScreen({ onComplete }) {
  const timerRef = useRef(null);

  useEffect(() => {
    // Play a loud startup whoosh when splash starts
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const t = ac.currentTime;

      // Deep bass rumble rising — like a machine powering on
      const osc1 = ac.createOscillator();
      const gain1 = ac.createGain();
      const filter1 = ac.createBiquadFilter();
      filter1.type = 'lowpass'; filter1.frequency.value = 600;
      osc1.connect(filter1); filter1.connect(gain1); gain1.connect(ac.destination);
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(40, t);
      osc1.frequency.exponentialRampToValueAtTime(180, t + 1.5);
      gain1.gain.setValueAtTime(0.0001, t);
      gain1.gain.linearRampToValueAtTime(0.8, t + 0.4);
      gain1.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
      osc1.start(t); osc1.stop(t + 2.0);

      // High whoosh layer
      const osc2 = ac.createOscillator();
      const gain2 = ac.createGain();
      const filter2 = ac.createBiquadFilter();
      filter2.type = 'bandpass'; filter2.frequency.value = 1200; filter2.Q.value = 0.5;
      osc2.connect(filter2); filter2.connect(gain2); gain2.connect(ac.destination);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(200, t + 0.2);
      osc2.frequency.exponentialRampToValueAtTime(1200, t + 1.4);
      gain2.gain.setValueAtTime(0.0001, t + 0.2);
      gain2.gain.linearRampToValueAtTime(0.5, t + 0.7);
      gain2.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
      osc2.start(t + 0.2); osc2.stop(t + 1.8);

      // Logo reveal chime at ~5s
      setTimeout(() => {
        try {
          const ac2 = new (window.AudioContext || window.webkitAudioContext)();
          const now = ac2.currentTime;
          [0, 0.12, 0.24].forEach((delay, i) => {
            const freqs = [523, 659, 784];
            const osc = ac2.createOscillator();
            const g = ac2.createGain();
            osc.connect(g); g.connect(ac2.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freqs[i], now + delay);
            g.gain.setValueAtTime(0.7, now + delay);
            g.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.5);
            osc.start(now + delay); osc.stop(now + delay + 0.55);
          });
        } catch {}
      }, 5000);
    } catch {}

    timerRef.current = setTimeout(() => onComplete?.(), 7500);
    return () => clearTimeout(timerRef.current);
  }, [onComplete]);

  const skip = () => { clearTimeout(timerRef.current); onComplete?.(); };

  const logoSrc = `${import.meta.env.BASE_URL}logo.png`;

  return (
    <div onClick={skip} style={{ position: 'fixed', inset: 0, zIndex: 9999, cursor: 'pointer' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Arimo:wght@400;700&display=swap');

        .cs-splash-body {
          height: 100vh;
          display: flex;
          background: #F6F6F6;
          margin: 0;
          padding: 0;
        }

        .cs-splash-body * { box-sizing: border-box; }

        /* ── Variables ── */
        :root {
          --color-screen: #414141;
          --color-square: #BD3C03;
          --color-mobile: #E3A400;
          --color-laptop: #9A246C;
          --color-aio: #505CF4;
          --color-desktop: #75EC6C;
          --tl-duration: .1s;
          --tl-diff: .45s;
          --tl-start-mobile: 2.15s;
          --tl-start-laptop: 2.5s;
          --tl-start-aio: 3.05s;
          --tl-start-desktop: 3.5s;
          --anim-start: 1s;
          --vp-s: 4vh;
        }

        /* ── Scene ── */
        .scene {
          width: 32em;
          height: 18em;
          margin: auto;
          position: relative;
          overflow: hidden;
          background: #F6F6F6;
          font-size: var(--vp-s);
        }
        .scene > * {
          position: absolute;
          top: 0; bottom: 0; left: 0; right: 0;
          margin: auto;
        }

        /* ── Keyframes ── */
        @keyframes cs-scale-in { from { transform: scale(.1); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes cs-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes cs-fade-in-out { 0%,100%{opacity:0} 10%,90%{opacity:1} }
        @keyframes cs-shrink-mpb-width { from{width:13.5em} to{width:0em} }
        @keyframes cs-shrink-y { to{transform:scaleY(0)} }
        @keyframes cs-clip-up { from{clip-path:polygon(0 0,100% 0,100% 100%,0 100%)} to{clip-path:polygon(0 0,100% 0,100% 0,0 0)} }
        @keyframes cs-vanish { 0%{transform:translateY(-.8em) scaleY(1) scaleX(1)} 50%{transform:translateY(-3em) scaleY(1.8) scaleX(1)} 100%{transform:translateY(-3em) scaleY(1.8) scaleX(0)} }
        @keyframes cs-shake { from,to{transform-origin:50% 100%;transform:rotateZ(4deg)} 50%{transform:rotateZ(-4deg)} }
        @keyframes cs-kick {
          0%,32%{transform-origin:0 100%}
          10%{transform:translateX(-.5em) translateY(-.25em) rotateZ(-25deg)}
          24%,30%{transform:translateX(-1em) rotateZ(0deg)}
          34%{transform-origin:100% 100%}
          40%{transform:translateX(-1em) rotateZ(0deg)}
          54%{transform:translateX(.2em) rotateZ(25deg)}
          74%,100%{transform:rotateZ(0deg)}
        }

        /* Mobile */
        @keyframes cs-to-mobile {
          to { width:3.3em;height:6em;padding:.3em .08em;transform:translateY(-5em);color:var(--color-mobile);border-radius:.1em; }
        }
        /* Laptop */
        @keyframes cs-to-laptop {
          from { width:3.3em;height:6em;padding:.3em .08em;transform:translateY(-5em);color:var(--color-mobile);border-radius:.1em; }
          to   { width:10em;height:6em;padding:.25em;transform:translateY(-5em);color:var(--color-laptop);border-radius:.1em; }
        }
        @keyframes cs-mpb-to-laptop { to{width:13.5em;height:2em;color:var(--color-laptop)} }
        @keyframes cs-mpc-to-laptop { to{color:var(--color-screen);width:2.7em;height:.8em;clip-path:polygon(14% 0,(86%) 0,100% 100%,0 100%);transform:translateY(-.7em)} }
        /* AIO */
        @keyframes cs-to-aio {
          from { width:10em;height:6em;padding:.25em;transform:translateY(-5em);color:var(--color-laptop);border-radius:.1em; }
          to   { width:11.2em;height:8em;padding:.3em .2em 1.3em .2em;transform:translateY(-6.1em);color:var(--color-aio);border-radius:.1em; }
        }
        @keyframes cs-mpb-to-aio {
          from { width:13.5em;height:2em;color:var(--color-laptop); }
          to   { color:var(--color-aio);width:5em;height:.7em;transform:translateY(1.15em); }
        }
        @keyframes cs-mpc-to-aio { to{color:var(--color-aio);transform:translateY(0em);width:2.2em;height:2em;clip-path:initial} }
        /* Desktop */
        @keyframes cs-to-desktop {
          from { width:11.2em;height:8em;padding:.3em .2em 1.3em .2em;transform:translateY(-6.1em);color:var(--color-aio);border-radius:.1em; }
          to   { width:11.8em;height:7em;padding:.1em .15em;transform:translateY(-5.9em);color:var(--color-desktop);border-radius:.1em; }
        }
        @keyframes cs-mpb-to-desktop {
          from { color:var(--color-aio);width:5em;height:.7em;transform:translateY(1.15em); }
          to   { color:var(--color-desktop);transform:translateY(1em);width:13em;height:.7em; }
        }
        @keyframes cs-mpc-to-desktop {
          from { color:var(--color-aio);transform:translateY(0em);width:2.2em;height:2em; }
          to   { color:var(--color-desktop);transform:translateY(-.9em);width:2em;height:1.5em; }
        }
        @keyframes cs-mpa-to-desktop { from{transform:scaleY(0)} to{transform:scaleY(1)} }
        @keyframes cs-text-slide-down { from{transform:translateY(-12.2em)} to{transform:translateY(0%)} }
        @keyframes cs-progress { from{width:0%} to{width:100%} }

        /* ── Device ── */
        .cs-device {
          display: flex;
          width: 1.5em; height: 1.5em;
          position: relative;
          top: calc(50% + 1.5em); bottom: auto;
          margin: auto;
          color: var(--color-square);
          background: currentColor;
          animation:
            cs-fade-in .5s 0s ease both,
            cs-kick .5s linear var(--anim-start),
            cs-shake calc(1s / 14) linear calc(var(--anim-start) + .6s) 14,
            cs-to-mobile calc(var(--tl-duration) / 2) ease var(--tl-start-mobile),
            cs-to-laptop var(--tl-duration) ease var(--tl-start-laptop),
            cs-to-aio var(--tl-duration) ease var(--tl-start-aio),
            cs-to-desktop var(--tl-duration) ease var(--tl-start-desktop);
          animation-fill-mode: forwards;
        }
        .cs-device__wrapper {
          z-index: 10;
          animation: cs-shrink-y var(--tl-duration) ease calc(var(--tl-start-desktop) + var(--tl-diff)) forwards;
        }
        .cs-device__webcam {
          width:.15em;height:.15em;
          position:absolute;top:.1em;left:0;right:0;margin:auto;
          border-radius:50%;background:var(--color-screen);opacity:0;
          animation: cs-fade-in-out 1.5s linear calc(var(--anim-start) + 1.1s) forwards;
        }
        .cs-device__screen {
          height:100%;width:100%;margin:auto;
          background:var(--color-screen);
          transform-origin:50% 50%;
          border-radius:.05em;
          animation: cs-scale-in .05s linear calc(var(--anim-start) + 1.05s) both;
        }

        /* ── Morphable ── */
        .cs-morphable { color: var(--color-screen); }
        .cs-morphable--center {
          width:0;height:0;background:currentColor;
          top:auto;bottom:4em;position:absolute;z-index:1;
          animation:
            cs-mpc-to-laptop var(--tl-duration) ease var(--tl-start-laptop) forwards,
            cs-mpc-to-aio var(--tl-duration) ease var(--tl-start-aio) forwards,
            cs-mpc-to-desktop var(--tl-duration) ease var(--tl-start-desktop) forwards,
            cs-vanish var(--tl-duration) linear calc(var(--tl-start-desktop) + var(--tl-duration) + var(--tl-diff)) forwards;
        }
        .cs-morphable__attachment {
          width:4.5em;height:1.2em;
          background:#8ef87e;border-radius:50%;
          top:auto;bottom:4.5em;
          box-shadow:0 .2em 0 0 #5bc94a;
          position:absolute;
          animation:
            cs-mpa-to-desktop var(--tl-duration) ease var(--tl-start-desktop) both,
            cs-shrink-y var(--tl-duration) ease calc(var(--tl-start-desktop) + var(--tl-duration) + var(--tl-diff)) forwards;
        }
        .cs-morphable--bottom {
          width:0;height:0;top:auto;bottom:4.5em;
          animation:
            cs-mpb-to-laptop var(--tl-duration) ease var(--tl-start-laptop) forwards,
            cs-mpb-to-aio var(--tl-duration) ease var(--tl-start-aio) forwards,
            cs-mpb-to-desktop var(--tl-duration) ease var(--tl-start-desktop) forwards,
            cs-shrink-mpb-width var(--tl-duration) ease calc(var(--tl-start-desktop) + var(--tl-duration) + var(--tl-diff)) forwards;
        }
        .cs-morphable__face {
          top:100%;left:0;width:100%;height:.5em;
          background-color:currentColor;
          clip-path:polygon(0 0,100% 0,98.5% 100%,1.5% 100%);
        }
        .cs-morphable__face--top {
          height:100%;
          clip-path:polygon(13% 0,87% 0,100% 100%,0 100%);
        }
        .cs-morphable__face--front:after {
          content:'';display:block;position:relative;
          width:100%;height:100%;background:rgba(0,0,0,.15);
        }

        /* ── Cat ── */
        .cs-cat {
          width:.58em;position:absolute;left:0;right:0;bottom:.5em;margin:auto;
          animation: cs-fade-in-out var(--tl-diff) var(--tl-start-aio) ease both;
        }

        /* ── Mouse ── */
        .cs-mouse {
          width:2.5em;bottom:2.8em;top:auto;right:5.8em;left:auto;
          animation:
            cs-scale-in var(--tl-duration) ease var(--tl-start-aio) both,
            cs-clip-up var(--tl-duration) ease calc(var(--tl-start-desktop) + var(--tl-duration) + var(--tl-diff)) both;
        }

        /* ── Logo reveal ── */
        .cs-logo-reveal {
          font-family: 'Arimo', sans-serif;
          color: #393A32;
          width: 15.4em; height: 4em;
          margin: auto;
          animation: cs-text-slide-down .4s 5.0s cubic-bezier(0.77,0,0.175,1) both;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: .3em;
        }
        .cs-logo-img {
          width: 2.2em; height: 2.2em;
          border-radius: .2em;
          object-fit: contain;
          background: white;
          box-shadow: 0 .1em .4em rgba(0,0,0,.15);
        }
        .cs-loading-text {
          font-size: .45em;
          font-weight: 600;
          letter-spacing: .15em;
          text-transform: uppercase;
          color: #64748b;
        }
        .cs-progress-track {
          width: 6em; height: .12em;
          background: #e2e8f0;
          border-radius: 999px;
          overflow: hidden;
        }
        .cs-progress-bar {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, #6366f1, #8b5cf6, #3b82f6, #10b981);
          animation: cs-progress 1.8s .3s ease-in-out both;
        }

        /* ── Skip hint ── */
        .cs-skip {
          position: absolute;
          bottom: .5em; left: 0; right: 0;
          text-align: center;
          font-size: .35em;
          color: #cbd5e1;
          letter-spacing: .1em;
          font-family: 'Arimo', sans-serif;
          animation: cs-fade-in 1s 1s ease both;
        }
      `}</style>

      <div className="cs-splash-body">
        <div className="scene">

          {/* Device wrapper */}
          <div className="cs-device__wrapper">
            <div className="cs-device">
              <div className="cs-device__webcam" />
              <div className="cs-device__screen" />
            </div>
          </div>

          {/* Morphable parts */}
          <div className="cs-morphable cs-morphable--center">
            <div className="cs-morphable__face cs-morphable__face--top" />
          </div>
          <div className="cs-morphable__attachment" />
          <div className="cs-morphable cs-morphable--bottom">
            <div className="cs-morphable__face cs-morphable__face--front" />
          </div>

          {/* Cat (AIO phase) */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23 24" className="cs-cat">
            <path fill="#24318A" fillRule="evenodd" d="M7 5.16c2.88-1.62 5.9-1.62 9.05 0l5.67-4.3c.5 2.87.5 5.07 0 6.62l-.5 7.8c-.95 3.1-4 6.25-7.2 7.5H9.7c-4.43-2.1-7-4.6-7.73-7.5-.3-2.3-.47-4.6-.47-6.9-.57-2.15-.57-4.65 0-7.5L7 5.15zm1.7 11.5c-.87-1.8-1.9-2.7-3.1-2.66-1.2.05-.6 1.12 1.8 3.22.46.2.8.2 1 0 .2-.2.3-.4.3-.55zM12 21c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm2.37-4.4c0 .15.1.34.3.55.22.2.56.2 1.03 0 2.4-2.1 2.98-3.17 1.8-3.22-1.2-.04-2.24.85-3.13 2.67z"/>
          </svg>

          {/* Mouse (desktop phase) */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 73 31" className="cs-mouse">
            <defs>
              <path id="cs-mouse-path" d="M.7 15.62C1.37 9.46 5.56 5.18 13.27 2.8 24.83-.8 47.64-1.96 60.1 7.85 68.43 14.38 72.53 21 72.43 27.72c-4.48 2.18-15.18 2.9-32.1 2.2-16.93-.72-24.7-3.07-23.33-7.04.4-1.86-.84-3.06-3.73-3.6-2.9-.52-7.08-1.52-12.57-3v-.66z"/>
              <mask id="cs-mouse-mask" fill="#fff">
                <use xlinkHref="#cs-mouse-path"/>
              </mask>
            </defs>
            <use fill="#4860F9" xlinkHref="#cs-mouse-path"/>
            <path fill="rgba(0,0,0,.2)" d="M1.26 16c1.93-3.28 4.1-4.78 6.53-4.5 3.62.42 9.2.2 10-1.8 1.1 2.98 1.1 5.07 0 6.3-1.12 1.2-1.38 2.92-.8 5.12L1.26 16z" mask="url(#cs-mouse-mask)"/>
          </svg>

          {/* Logo reveal — replaces the LTT text */}
          <div className="cs-logo-reveal">
            <img src={logoSrc} alt="Cornerstone" className="cs-logo-img" />
            <div className="cs-loading-text">Loading...</div>
            <div className="cs-progress-track">
              <div className="cs-progress-bar" />
            </div>
          </div>

          <div className="cs-skip">click to skip</div>
        </div>
      </div>
    </div>
  );
}
