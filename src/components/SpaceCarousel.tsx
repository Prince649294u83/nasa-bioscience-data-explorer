"use client";

import { useEffect, useState } from "react";

const carouselImages = [
  {
    url: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/6ccab27e-f814-4c07-ba08-c5df566de7b7/generated_images/futuristic-nasa-space-station-orbiting-e-4e2f5ffd-20251005070115.jpg",
    alt: "NASA Space Station"
  },
  {
    url: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/6ccab27e-f814-4c07-ba08-c5df566de7b7/generated_images/mars-rover-on-red-planet-surface%2c-deta-eda6fea2-20251005070156.jpg",
    alt: "Mars Rover"
  },
  {
    url: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/6ccab27e-f814-4c07-ba08-c5df566de7b7/generated_images/astronaut-conducting-eva-spacewalk-outsi-c7377645-20251005070208.jpg",
    alt: "Astronaut Spacewalk"
  },
  {
    url: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/6ccab27e-f814-4c07-ba08-c5df566de7b7/generated_images/close-up-of-living-plant-experiment-in-s-ae0fc246-20251005070217.jpg",
    alt: "Space Plant Experiment"
  },
  {
    url: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/6ccab27e-f814-4c07-ba08-c5df566de7b7/generated_images/futuristic-spacecraft-approaching-jupite-f8a753a7-20251005070226.jpg",
    alt: "Jupiter Mission"
  },
  {
    url: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/6ccab27e-f814-4c07-ba08-c5df566de7b7/generated_images/microscopic-view-of-cells-in-space-biosc-91e36d3a-20251005070235.jpg",
    alt: "Space Bioscience Cells"
  },
  {
    url: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/6ccab27e-f814-4c07-ba08-c5df566de7b7/generated_images/saturn-with-prominent-ring-system%2c-det-5684f894-20251005070315.jpg",
    alt: "Saturn"
  },
  {
    url: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/6ccab27e-f814-4c07-ba08-c5df566de7b7/generated_images/lunar-base-on-moon-surface%2c-multiple-h-6a1eb977-20251005070325.jpg",
    alt: "Lunar Base"
  },
  {
    url: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/6ccab27e-f814-4c07-ba08-c5df566de7b7/generated_images/nebula-with-vibrant-cyan%2c-magenta%2c-a-43bd2725-20251005070334.jpg",
    alt: "Cosmic Nebula"
  },
  {
    url: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/6ccab27e-f814-4c07-ba08-c5df566de7b7/generated_images/advanced-rocket-launch-at-night%2c-power-1eca0bd3-20251005070344.jpg",
    alt: "Rocket Launch"
  }
];

export const SpaceCarousel = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative w-full h-screen text-center overflow-hidden">
      {/* 3D Rotating Slider */}
      <div
        className="absolute top-[10%] left-1/2 -translate-x-1/2 z-20 w-[200px] h-[250px] md:w-[200px] md:h-[250px] sm:w-[160px] sm:h-[200px] max-[767px]:w-[100px] max-[767px]:h-[150px]"
        style={{
          transformStyle: "preserve-3d",
          transform: "perspective(1000px)",
          animation: "carouselRotate 20s linear infinite",
        }}
      >
        {carouselImages.map((image, index) => (
          <div
            key={index}
            className="absolute inset-0 rounded-lg overflow-hidden"
            style={{
              transform: `rotateY(${(index * 360) / carouselImages.length}deg) translateZ(550px)`,
            }}
          >
            <img
              src={image.url}
              alt={image.alt}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Content Section */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] pb-24 flex flex-wrap justify-between items-center z-10 px-4 max-[1023px]:flex-col max-[1023px]:gap-8">
        {/* Main Heading */}
        <h1
          className="text-[16em] leading-none text-[#25283B] relative font-black tracking-[0.1em] max-[1023px]:text-center max-[1023px]:w-full max-[1023px]:text-[7em] max-[1023px]:shadow-[0_10px_20px_#000] max-[767px]:text-[5em]"
          style={{
            fontFamily: "var(--font-space)",
          }}
        >
          RESEARCH
          <span
            className="absolute inset-0 z-10"
            style={{
              WebkitTextStroke: "2px rgba(100, 200, 255, 0.8)",
              color: "transparent",
            }}
          >
            RESEARCH
          </span>
        </h1>

        {/* Author/Info Section */}
        <div
          className="text-right max-w-[200px] max-[1023px]:max-w-none max-[1023px]:w-full max-[1023px]:text-center max-[1023px]:px-8 max-[1023px]:text-white max-[1023px]:z-20 max-[1023px]:shadow-[0_10px_20px_#000]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          <h2 className="text-5xl font-bold text-primary glow-text">NASA</h2>
          <p className="text-lg font-bold text-foreground mt-2 max-[1023px]:text-white">Bioscience</p>
          <p className="text-sm text-muted-foreground mt-4 leading-relaxed max-[1023px]:text-white/90">
            Explore decades of space biology research through interactive 3D visualization
          </p>
        </div>
      </div>
    </div>
  );
};