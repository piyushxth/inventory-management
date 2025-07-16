import React from "react";

const features = [
  {
    icon: "/globe.svg",
    text: "Free Global Shipping Over £150",
  },
  {
    icon: "/window.svg",
    text: "Easy Returns",
  },
  {
    icon: "/vercel.svg",
    text: "50,000+ reviews rated 4.9/5",
  },
  {
    icon: "https://www.stubbleandco.com/cdn/shop/files/BCorp_icon_white.svg?v=1695487806&width=256",
    text: "Certified B Corporation®",
    isImg: true,
  },
];

const Features = () => (
  <div className="w-full flex py-6 px-4 lg:px-10 bg-black mx-auto">
    <ul className="flex flex-wrap w-full">
      {features.map((feature, idx) => (
        <li
          key={idx}
          className={[
            "min-w-1/2 lg:min-w-auto flex flex-col justify-center items-center flex-1 gap-4 p-6 text-center border-r border-white last:border-r-0",
            idx === 1 ? "border-r-0 lg:border-r" : "",
            idx === 0 || idx === 1 ? "border-b lg:border-b-0" : "",
          ].join(" ")}
        >
          {feature.isImg ? (
            <img
              src={feature.icon}
              alt={feature.text}
              className="w-10 h-10 object-contain mb-2"
              loading="lazy"
            />
          ) : (
            <img
              src={feature.icon}
              alt=""
              className="w-10 h-10 object-contain mb-2"
              loading="lazy"
            />
          )}
          <h2 className="text-white text-sm font-semibold">{feature.text}</h2>
        </li>
      ))}
    </ul>
  </div>
);

export default Features;
