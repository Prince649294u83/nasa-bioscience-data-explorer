"use client";

import { motion } from "framer-motion";

interface PlanetOrbitProps {
  size?: number;
  orbitRadius?: number;
  duration?: number;
  color?: string;
}

export default function PlanetOrbit({
  size = 20,
  orbitRadius = 100,
  duration = 10,
  color = "#8b5cf6",
}: PlanetOrbitProps) {
  return (
    <div className="relative" style={{ width: orbitRadius * 2, height: orbitRadius * 2 }}>
      {/* Orbit path */}
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/10"
        style={{ width: orbitRadius * 2, height: orbitRadius * 2 }}
      />
      
      {/* Orbiting planet */}
      <motion.div
        className="absolute top-1/2 left-1/2 rounded-full"
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          boxShadow: `0 0 20px ${color}`,
        }}
        animate={{
          rotate: 360,
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <div
          className="absolute rounded-full"
          style={{
            width: size,
            height: size,
            top: -orbitRadius,
            left: -size / 2,
          }}
        />
      </motion.div>
    </div>
  );
}