import React from "react";

const HeroVideo = () => {
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
          src="/hero-video1.mp4"
          type="video/mp4"
          media="(max-width: 767px)"
        />
        <source
          src="/hero-video2.mp4"
          type="video/mp4"
          media="(min-width: 768px)"
        />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default HeroVideo;
