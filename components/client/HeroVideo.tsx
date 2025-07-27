import React from "react";

const HeroVideo = () => {
  const mobileOverlay =
    "linear-gradient(61.56deg, rgba(0,0,0,0.18), rgba(0,0,0,0) 74.72%)";
  const desktopOverlay =
    "linear-gradient(360deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 34.19%), linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 13.36%)";
  return (
    <div
      className="  relative overflow-hidden will-change-transform
          aspect-[375/600] max-h-auto md:max-h-[896px] lg:max-h-auto lg:aspect-[1440/650] w-full"
    >
      <video
        playsInline
        autoPlay
        loop
        muted
        preload="none"
        className="block w-full h-full object-cover"
        poster="/client/hero-poster.webp"
      >
        <source
          src="/client/product/tees.mov"
          type="video/mp4"
          media="(max-width: 767px)"
        />
        <source
          src="/client/product/tees.mov"
          type="video/mp4"
          media="(min-width: 768px)"
        />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default HeroVideo;
