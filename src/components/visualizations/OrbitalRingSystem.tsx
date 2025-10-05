"use client";

import { useEffect, useRef, useState } from "react";

interface DataPoint {
  name: string;
  value: number;
  color: string;
}

interface Props {
  data: DataPoint[];
}

export default function OrbitalRingSystem({ data }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const animationRef = useRef<number>();
  const rotationRef = useRef(0);

  const total = data.reduce((sum, d) => sum + d.value, 0);

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

    const centerX = canvas.width / window.devicePixelRatio / 2;
    const centerY = canvas.height / window.devicePixelRatio / 2;
    const maxRadius = Math.min(centerX, centerY) - 40;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      rotationRef.current += 0.002;

      // Draw central core
      const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 30);
      coreGradient.addColorStop(0, "rgba(112, 182, 246, 1)");
      coreGradient.addColorStop(0.5, "rgba(167, 139, 250, 0.8)");
      coreGradient.addColorStop(1, "rgba(167, 139, 250, 0.2)");

      ctx.beginPath();
      ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
      ctx.fillStyle = coreGradient;
      ctx.fill();

      // Glow effect for core
      ctx.shadowBlur = 20;
      ctx.shadowColor = "rgba(112, 182, 246, 0.8)";
      ctx.beginPath();
      ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
      ctx.fillStyle = coreGradient;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw total count in center
      ctx.fillStyle = "rgba(255, 255, 255, 1)";
      ctx.font = "bold 20px 'Orbitron', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(total.toString(), centerX, centerY);

      // Draw orbital rings
      let currentAngle = rotationRef.current;
      data.forEach((segment, index) => {
        const percentage = segment.value / total;
        const angleSpan = percentage * Math.PI * 2;
        const isHovered = hoveredIndex === index;
        const isSelected = selectedIndex === index;

        const baseRadius = maxRadius - 50;
        const thickness = 35;
        const radius = isHovered || isSelected ? baseRadius + 5 : baseRadius;
        const segmentThickness = isHovered || isSelected ? thickness + 5 : thickness;

        // Parse color
        const colorMatch = segment.color.match(/var\(--color-chart-(\d+)\)/);
        const colorMap: { [key: string]: string } = {
          "1": "rgba(112, 182, 246, 0.7)",
          "2": "rgba(167, 139, 250, 0.7)",
          "3": "rgba(110, 231, 183, 0.7)",
          "4": "rgba(192, 132, 252, 0.7)",
          "5": "rgba(251, 191, 36, 0.7)",
        };
        const color = colorMatch ? colorMap[colorMatch[1]] : "rgba(112, 182, 246, 0.7)";

        // Draw segment arc
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + angleSpan);
        ctx.arc(centerX, centerY, radius - segmentThickness, currentAngle + angleSpan, currentAngle, true);
        ctx.closePath();

        ctx.fillStyle = color;
        ctx.fill();

        // Glow effect
        if (isHovered || isSelected) {
          ctx.shadowBlur = 15;
          ctx.shadowColor = color;
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Draw border
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw label on larger segments
        if (percentage > 0.08) {
          const midAngle = currentAngle + angleSpan / 2;
          const labelRadius = radius - segmentThickness / 2;
          const labelX = centerX + Math.cos(midAngle) * labelRadius;
          const labelY = centerY + Math.sin(midAngle) * labelRadius;

          ctx.save();
          ctx.translate(labelX, labelY);
          ctx.rotate(midAngle + Math.PI / 2);
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
          ctx.font = "10px 'Space Grotesk', sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(`${(percentage * 100).toFixed(0)}%`, 0, 0);
          ctx.restore();
        }

        currentAngle += angleSpan + 0.02; // Small gap between segments
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [data, hoveredIndex, selectedIndex, total]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    const maxRadius = Math.min(centerX, centerY) - 40;
    const baseRadius = maxRadius - 50;
    const thickness = 35;

    if (distance >= baseRadius - thickness && distance <= baseRadius + 5) {
      let currentAngle = rotationRef.current;
      let foundIndex = -1;

      for (let i = 0; i < data.length; i++) {
        const percentage = data[i].value / total;
        const angleSpan = percentage * Math.PI * 2;
        
        let normalizedAngle = angle;
        let normalizedCurrentAngle = currentAngle % (Math.PI * 2);
        
        if (normalizedAngle < 0) normalizedAngle += Math.PI * 2;
        if (normalizedCurrentAngle < 0) normalizedCurrentAngle += Math.PI * 2;

        const endAngle = normalizedCurrentAngle + angleSpan;

        if (normalizedAngle >= normalizedCurrentAngle && normalizedAngle <= endAngle) {
          foundIndex = i;
          break;
        }

        currentAngle += angleSpan + 0.02;
      }

      setHoveredIndex(foundIndex >= 0 ? foundIndex : null);
    } else {
      setHoveredIndex(null);
    }
  };

  const handleClick = () => {
    if (hoveredIndex !== null) {
      setSelectedIndex(selectedIndex === hoveredIndex ? null : hoveredIndex);
    }
  };

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-pointer"
        style={{ width: "100%", height: "300px" }}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        onMouseLeave={() => setHoveredIndex(null)}
      />
      {(hoveredIndex !== null || selectedIndex !== null) && (
        <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm border border-accent/30 rounded-lg px-4 py-3 animate-in fade-in slide-in-from-right-2 max-w-xs">
          <div className="text-xs text-muted-foreground mb-1">Orbital Sector</div>
          <div className="text-lg font-black mb-1" style={{ fontFamily: "var(--font-space)" }}>
            {data[selectedIndex ?? hoveredIndex!].name}
          </div>
          <div className="text-2xl font-bold text-accent mb-1">
            {data[selectedIndex ?? hoveredIndex!].value}
          </div>
          <div className="text-xs text-muted-foreground">
            {((data[selectedIndex ?? hoveredIndex!].value / total) * 100).toFixed(1)}% of total publications
          </div>
        </div>
      )}
    </div>
  );
}