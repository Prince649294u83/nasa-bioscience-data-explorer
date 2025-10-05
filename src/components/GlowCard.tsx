"use client";

import { Card } from "@/components/ui/card";
import { ReactNode } from "react";
import { motion } from "framer-motion";

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
}

export default function GlowCard({ 
  children, 
  className = "", 
  glowColor = "primary" 
}: GlowCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={`relative overflow-hidden ${className}`}
        style={{
          background: "linear-gradient(135deg, rgba(var(--color-card), 0.5), rgba(var(--color-card), 0.3))",
        }}
      >
        <motion.div
          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
          style={{
            background: `radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), var(--color-${glowColor}) 0%, transparent 50%)`,
            opacity: 0.1,
          }}
        />
        {children}
      </Card>
    </motion.div>
  );
}