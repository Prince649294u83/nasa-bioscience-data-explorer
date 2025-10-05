"use client";

import { useEffect, useRef } from "react";

export default function DataStreamBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const columns = Math.floor(canvas.width / 20);
    const rows = Math.floor(canvas.height / 20);
    const gridSize = 20;

    // Binary streams
    const streams: Array<{
      x: number;
      y: number;
      speed: number;
      chars: string[];
      opacity: number;
    }> = [];

    for (let i = 0; i < 15; i++) {
      streams.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -500,
        speed: Math.random() * 1 + 0.5,
        chars: Array.from({ length: 20 }, () => (Math.random() > 0.5 ? "1" : "0")),
        opacity: Math.random() * 0.3 + 0.1,
      });
    }

    const animate = () => {
      // Fade effect instead of clear
      ctx.fillStyle = "rgba(5, 9, 26, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = "rgba(112, 182, 246, 0.03)";
      ctx.lineWidth = 1;

      for (let i = 0; i < columns; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
      }

      for (let i = 0; i < rows; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
      }

      // Grid ripple effect (subtle)
      const time = Date.now() / 2000;
      const rippleX = Math.sin(time) * canvas.width;
      const rippleY = Math.cos(time) * canvas.height;

      ctx.beginPath();
      ctx.arc(rippleX / 2 + canvas.width / 2, rippleY / 2 + canvas.height / 2, 100, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(112, 182, 246, 0.05)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Update and draw binary streams
      streams.forEach((stream) => {
        stream.y += stream.speed;

        if (stream.y > canvas.height + 200) {
          stream.y = -200;
          stream.x = Math.random() * canvas.width;
        }

        ctx.font = "12px 'Courier New', monospace";
        ctx.textAlign = "center";

        stream.chars.forEach((char, index) => {
          const charY = stream.y + index * 15;
          const charOpacity = stream.opacity * (1 - index / stream.chars.length);

          ctx.fillStyle = `rgba(112, 182, 246, ${charOpacity})`;
          ctx.fillText(char, stream.x, charY);
        });

        // Randomly change some characters
        if (Math.random() > 0.95) {
          const randomIndex = Math.floor(Math.random() * stream.chars.length);
          stream.chars[randomIndex] = Math.random() > 0.5 ? "1" : "0";
        }
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1, opacity: 0.4 }}
    />
  );
}