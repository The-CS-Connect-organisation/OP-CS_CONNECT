import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
import { TiLocationArrow } from "react-icons/ti";
import { useEffect, useState } from "react";

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [loadedVideos, setLoadedVideos] = useState<number>(0);

  const handleVideoLoad = (): void => {
    setLoadedVideos((prev: number) => prev + 1);
  };

  useEffect(() => {
    if (loadedVideos >= 1) {
      setLoading(false);
    }
  }, [loadedVideos]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  useGSAP(() => {
    gsap.set("#video-frame", {
      clipPath: "polygon(18% 0, 76% 0, 88% 90%, 5% 95%)",
      borderRadius: "0% 0% 40% 10%",
    });
    gsap.from("#video-frame", {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      borderRadius: "0% 0% 0% 0%",
      ease: "power1.inOut",
      scrollTrigger: {
        trigger: "#video-frame",
        start: "center center",
        end: "bottom center",
        scrub: true,
      },
    });
  });

  const getVideoSrc = (): string => `videos/hero-1.mp4`;

  return (
    <div className="relative h-dvh w-screen overflow-x-hidden">
      {loading && (
        <div className="flex-center absolute z-[100] h-dvh w-screen overflow-hidden bg-white">
          <div className="three-body">
            <div className="three-body__dot"></div>
            <div className="three-body__dot"></div>
            <div className="three-body__dot"></div>
          </div>
        </div>
      )}

      <div
        id="video-frame"
        className="relative z-10 h-dvh w-screen overflow-hidden rounded-lg bg-blue-75"
      >
        <div className="relative h-full w-full bg-blue-75">
          <video
            src={getVideoSrc()}
            autoPlay
            loop
            muted
            className="absolute left-0 top-0 size-full object-cover object-center"
            onLoadedData={handleVideoLoad}
          />

          <h1 className="special-font hero-heading absolute bottom-5 right-5 z-40 text-blue-75">
            CS C<b>O</b>NNECT
          </h1>

          <div className="absolute left-0 top-0 z-40 size-full">
            <div className="mt-24 px-5 sm:px-10">
              <h1 className="special-font hero-heading text-blue-100">
                emp<b>o</b>wer
              </h1>

              <p className="mb-5 max-w-64 font-robert-regular text-blue-100">
                AI-Powered School Management <br /> For the Next Generation
              </p>

              <a
                href="https://www.youtube.com/watch?v=WxKBhquOGzw"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative z-10 w-fit cursor-pointer overflow-hidden rounded-full bg-yellow-300 px-7 py-3 text-black flex-center gap-1"
              >
                <TiLocationArrow />
                <span className="relative inline-flex overflow-hidden font-general text-xs uppercase">
                  <div className="translate-y-0 skew-y-0 transition duration-500 group-hover:translate-y-[-160%] group-hover:skew-y-12">
                    Watch trailer
                  </div>
                  <div className="absolute translate-y-[164%] skew-y-12 transition duration-500 group-hover:translate-y-0 group-hover:skew-y-0">
                    Watch trailer
                  </div>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <h1 className="special-font hero-heading absolute bottom-5 right-5 text-black">
        CS C<b>O</b>NNECT
      </h1>
    </div>
  );
};

export default Hero;
