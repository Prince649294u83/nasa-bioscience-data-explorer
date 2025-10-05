"use client";

import { useEffect, useRef, useState } from "react";

interface DataPoint {
  category: string;
  impact: number;
}

interface Props {
  data: DataPoint[];
}

export default function DeepSpaceScanner({ data }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [pingActive, setPingActive] = useState(false);
  const animationRef = useRef<number>();
  const pingTimeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const centerX = canvas.width / window.devicePixelRatio / 2;
    const centerY = canvas.height / window.devicePixelRatio / 2;
    const maxRadius = Math.min(centerX, centerY) - 60;
    const maxImpact = 100;

    const animate = (timestamp: number) => {
      ctx.clearRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);

      // Draw hexagonal grid
      ctx.save();
      ctx.translate(centerX, centerY);
      
      // Draw concentric hexagons
      for (let i = 1; i <= 4; i++) {
        const radius = (maxRadius / 4) * i;
        ctx.beginPath();
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 3) {
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          if (angle === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(112, 182, 246, ${0.08 + i * 0.02})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw radial scan lines
      const angleStep = (Math.PI * 2) / data.length;
      ctx.strokeStyle = "rgba(112, 182, 246, 0.1)";
      ctx.lineWidth = 1;
      data.forEach((_, index) => {
        const angle = index * angleStep;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * maxRadius, Math.sin(angle) * maxRadius);
        ctx.stroke();
      });

      ctx.restore();

      // Draw data points
      data.forEach((point, index) => {
        const angle = index * angleStep - Math.PI / 2;
        const distance = (point.impact / maxImpact) * maxRadius;
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;

        const isHovered = hoveredIndex === index;
        const baseSize = 6;
        const pointSize = isHovered ? baseSize * 1.5 : baseSize;

        // Outer glow
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, pointSize * 3);
        glowGradient.addColorStop(0, "rgba(167, 139, 250, 0.6)");
        glowGradient.addColorStop(1, "rgba(167, 139, 250, 0)");
        
        ctx.beginPath();
        ctx.arc(x, y, pointSize * 3, 0, Math.PI * 2);
        ctx.fillStyle = glowGradient;
        ctx.fill();

        // Main point
        ctx.beginPath();
        ctx.arc(x, y, pointSize, 0, Math.PI * 2);
        ctx.fillStyle = isHovered ? "rgba(236, 72, 153, 1)" : "rgba(167, 139, 250, 0.9)";
        ctx.shadowBlur = isHovered ? 15 : 8;
        ctx.shadowColor = isHovered ? "rgba(236, 72, 153, 1)" : "rgba(167, 139, 250, 0.8)";
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw category labels
        const labelDistance = maxRadius + 30;
        const labelX = centerX + Math.cos(angle) * labelDistance;
        const labelY = centerY + Math.sin(angle) * labelDistance;
        
        ctx.fillStyle = isHovered ? "rgba(255, 255, 255, 1)" : "rgba(255, 255, 255, 0.6)";
        ctx.font = isHovered ? "bold 11px 'Space Grotesk', sans-serif" : "10px 'Space Grotesk', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(point.category, labelX, labelY);
      });

      // Draw center core
      const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 8);
      coreGradient.addColorStop(0, "rgba(112, 182, 246, 1)");
      coreGradient.addColorStop(1, "rgba(112, 182, 246, 0.2)");
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
      ctx.fillStyle = coreGradient;
      ctx.fill();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate(0);

    // Trigger ping every 4 seconds
    const pingInterval = setInterval(() => {
      setPingActive(true);
      setTimeout(() => setPingActive(false), 2000);
    }, 4000);

    // Initial ping on mount
    setPingActive(true);
    setTimeout(() => setPingActive(false), 2000);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      clearInterval(pingInterval);
    };
  }, [data, hoveredIndex]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const maxRadius = Math.min(centerX, centerY) - 60;
    const maxImpact = 100;
    const angleStep = (Math.PI * 2) / data.length;

    let foundIndex = -1;
    let minDistance = Infinity;

    data.forEach((point, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const distance = (point.impact / maxImpact) * maxRadius;
      const pointX = centerX + Math.cos(angle) * distance;
      const pointY = centerY + Math.sin(angle) * distance;

      const dx = x - pointX;
      const dy = y - pointY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 20 && dist < minDistance) {
        minDistance = dist;
        foundIndex = index;
      }
    });

    setHoveredIndex(foundIndex >= 0 ? foundIndex : null);
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      {/* Scanline texture overlay */}
      <div className="absolute inset-0 scanline-texture pointer-events-none opacity-30 z-10" />
      
      {/* Radar ping effect */}
      {pingActive && (
        <>
          {/* Main ping ring */}
          <div
            className="absolute left-1/2 top-1/2 rounded-full pointer-events-none z-20"
            style={{
              width: '80px',
              height: '80px',
              border: '3px solid rgba(112, 182, 246, 0.8)',
              boxShadow: '0 0 20px rgba(112, 182, 246, 0.8), inset 0 0 20px rgba(112, 182, 246, 0.4)',
              animation: 'radarPing 2s cubic-bezier(0.4, 0, 0.2, 1) forwards',
            }}
          />
          
          {/* Trailing ring */}
          <div
            className="absolute left-1/2 top-1/2 rounded-full pointer-events-none z-20"
            style={{
              width: '80px',
              height: '80px',
              border: '2px solid rgba(236, 72, 153, 0.6)',
              boxShadow: '0 0 15px rgba(236, 72, 153, 0.6)',
              animation: 'radarTrail 2s cubic-bezier(0.4, 0, 0.2, 1) 0.2s forwards',
            }}
          />
        </>
      )}

      {/* Glitch effect overlay */}
      {pingActive && (
        <div
          className="absolute inset-0 pointer-events-none z-30"
          style={{
            animation: 'glitchFlicker 2s cubic-bezier(0.4, 0, 0.2, 1) 1.8s',
            background: 'linear-gradient(90deg, transparent 0%, rgba(112, 182, 246, 0.1) 48%, rgba(236, 72, 153, 0.1) 52%, transparent 100%)',
          }}
        />
      )}

      {/* Canvas for grid and data points */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair relative z-0"
        style={{ width: "100%", height: "400px" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredIndex(null)}
      />

      {/* Data readout */}
      {hoveredIndex !== null && (
        <div 
          className="absolute top-4 left-4 bg-card/95 backdrop-blur-md border border-primary/40 rounded-lg px-5 py-4 z-40 tech-corner"
          style={{
            boxShadow: '0 0 30px rgba(112, 182, 246, 0.3)',
            animation: 'fadeInUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <div className="text-xs text-primary mb-1 font-mono tracking-wider">📡 TARGET ACQUIRED</div>
          <div className="text-xl font-black mb-2 gradient-text" style={{ fontFamily: "var(--font-space)" }}>
            {data[hoveredIndex].category}
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-4xl font-bold text-accent">
              {data[hoveredIndex].impact}
            </div>
            <div className="text-sm text-muted-foreground font-mono">IMPACT</div>
          </div>
        </div>
      )}
    </div>
  );
}