import { useEffect, useRef, useState } from "react";

export default function AudioInit() {
  const startedRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [started, setStarted] = useState(false);

  const start = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    const audio = audioRef.current;
    if (audio) {
      audio.loop = true;
      audio.volume = 1.0;
      audio.play().catch(() => {});
    }
    setStarted(true);
  };

  useEffect(() => {
    if (started) return;
    const opts: AddEventListenerOptions = { capture: true, passive: true };
    window.addEventListener("wheel", start, opts);
    window.addEventListener("scroll", start, opts);
    window.addEventListener("keydown", start, opts);
    return () => {
      window.removeEventListener("wheel", start, opts);
      window.removeEventListener("scroll", start, opts);
      window.removeEventListener("keydown", start, opts);
    };
  }, [started]);

  return (
    <>
      <audio ref={audioRef} src={`${import.meta.env.BASE_URL}audio/loop2.0.m4a`} loop preload="auto" />
      {!started && (
        <div
          className="fixed inset-0 z-[60]"
          onPointerDown={start}
          onWheel={start}
        />
      )}
      <div
        className={`fixed bottom-6 left-6 z-50 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/70 text-xs font-general uppercase tracking-wider transition-all duration-700 select-none pointer-events-none ${
          started ? "opacity-0 scale-90" : "opacity-100"
        }`}
      >
        tap or scroll to start audio
      </div>
    </>
  );
}
