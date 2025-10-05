"use client";

import { useEffect, useRef, useState } from "react";

interface DataPoint {
  year: string;
  count: number;
}

interface Props {
  data: DataPoint[];
}

export default function RocketLaunchChart({ data }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [particles, setParticles] = useState<any[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const maxCount = Math.max(...data.map((d) => d.count));
    const barWidth = (canvas.width / window.devicePixelRatio) / data.length;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw orbital path baseline
      ctx.beginPath();
      ctx.strokeStyle = "rgba(112, 182, 246, 0.3)";
      ctx.lineWidth = 2;
      ctx.moveTo(0, canvas.height / window.devicePixelRatio - 40);
      ctx.lineTo(canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio - 40);
      ctx.stroke();

      // Draw rocket launches (energy beams)
      data.forEach((point, index) => {
        const x = (index + 0.5) * barWidth;
        const baseY = canvas.height / window.devicePixelRatio - 40;
        const height = (point.count / maxCount) * (canvas.height / window.devicePixelRatio - 80);
        const topY = baseY - height;

        const isHovered = hoveredIndex === index;

        // Energy beam gradient
        const gradient = ctx.createLinearGradient(x, baseY, x, topY);
        gradient.addColorStop(0, isHovered ? "rgba(112, 182, 246, 0.8)" : "rgba(112, 182, 246, 0.5)");
        gradient.addColorStop(0.5, isHovered ? "rgba(167, 139, 250, 0.6)" : "rgba(167, 139, 250, 0.4)");
        gradient.addColorStop(1, isHovered ? "rgba(236, 72, 153, 1)" : "rgba(236, 72, 153, 0.8)");

        // Draw rocket trail
        ctx.beginPath();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = isHovered ? 8 : 6;
        ctx.lineCap = "round";
        ctx.moveTo(x, baseY);
        ctx.lineTo(x, topY);
        ctx.stroke();

        // Glow effect
        if (isHovered) {
          ctx.shadowBlur = 20;
          ctx.shadowColor = "rgba(112, 182, 246, 0.8)";
          ctx.beginPath();
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 12;
          ctx.moveTo(x, baseY);
          ctx.lineTo(x, topY);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Rocket head (glowing sphere)
        ctx.beginPath();
        ctx.arc(x, topY, isHovered ? 8 : 6, 0, Math.PI * 2);
        const headGradient = ctx.createRadialGradient(x, topY, 0, x, topY, isHovered ? 8 : 6);
        headGradient.addColorStop(0, "rgba(236, 72, 153, 1)");
        headGradient.addColorStop(1, "rgba(236, 72, 153, 0.3)");
        ctx.fillStyle = headGradient;
        ctx.fill();

        // Planetary marker on baseline
        ctx.beginPath();
        ctx.arc(x, baseY, 4, 0, Math.PI * 2);
        ctx.fillStyle = isHovered ? "rgba(112, 182, 246, 1)" : "rgba(112, 182, 246, 0.6)";
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Year label
        ctx.fillStyle = isHovered ? "rgba(255, 255, 255, 1)" : "rgba(255, 255, 255, 0.7)";
        ctx.font = "12px 'Space Grotesk', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(point.year, x, baseY + 20);
      });

      // Draw particles
      particles.forEach((particle, idx) => {
        particle.y -= particle.speed;
        particle.opacity -= 0.02;
        particle.size -= 0.1;

        if (particle.opacity > 0 && particle.size > 0) {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(236, 72, 153, ${particle.opacity})`;
          ctx.fill();
        }
      });

      setParticles((prev) => prev.filter((p) => p.opacity > 0 && p.size > 0));

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [data, hoveredIndex, particles]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const barWidth = rect.width / data.length;
    const index = Math.floor(x / barWidth);

    if (index >= 0 && index < data.length) {
      setHoveredIndex(index);

      // Create particle burst on hover change
      if (hoveredIndex !== index) {
        const centerX = (index + 0.5) * barWidth;
        const baseY = rect.height - 40;
        const height = (data[index].count / Math.max(...data.map((d) => d.count))) * (rect.height - 80);
        const topY = baseY - height;

        const newParticles = Array.from({ length: 10 }, () => ({
          x: centerX + (Math.random() - 0.5) * 20,
          y: topY,
          speed: Math.random() * 2 + 1,
          opacity: 1,
          size: Math.random() * 3 + 2,
        }));

        setParticles((prev) => [...prev, ...newParticles]);
      }
    }
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-pointer"
        style={{ width: "100%", height: "300px" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
      {hoveredIndex !== null && (
        <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm border border-primary/30 rounded-lg px-4 py-2 animate-in fade-in slide-in-from-top-2">
          <div className="text-sm font-medium text-primary">
            🚀 {data[hoveredIndex].year}
          </div>
          <div className="text-2xl font-black" style={{ fontFamily: "var(--font-space)" }}>
            {data[hoveredIndex].count}
          </div>
          <div className="text-xs text-muted-foreground">Publications Launched</div>
        </div>
      )}
    </div>
  );
}