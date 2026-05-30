import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";

import AnimatedTitle from "./AnimatedTitle";

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  useGSAP(() => {
    const clipAnimation = gsap.timeline({
      scrollTrigger: {
        trigger: "#clip",
        start: "center center",
        end: "+=800 center",
        scrub: true,
        pin: true,
        pinSpacing: true,
      },
    });

    clipAnimation.to(".mask-clip-path", {
      width: "100vw",
      height: "100vh",
      borderRadius: 0,
    });
  });

  return (
    <div id="about" className="min-h-screen w-screen bg-white">
      <div className="relative mb-8 mt-36 flex flex-col items-center gap-5">
        <p className="font-general text-xl uppercase md:text-[30px]">
          Welcome to CS Connect
        </p>

        <AnimatedTitle
          title="Emp<b>o</b>wering educ<b>a</b>tion <br /> with AI-p<b>o</b>wered <b>i</b>ntelligence"
          containerClass="mt-5 !text-black text-center"
        />

        <div className="about-subtext">
          <p>The future of school management begins here</p>
          <p className="text-gray-500">
            CS Connect unites every aspect of school life into one intelligent
            platform — from attendance and grades to communication and analytics.
          </p>
        </div>
      </div>

      <div className="h-dvh w-screen" id="clip">
        <div className="mask-clip-path about-image">
          <img
            src="img/about.webp"
            alt="Background"
            className="absolute left-0 top-0 size-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default About;
