'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  baseAlpha: number;
}

export function AuthBackgroundAnimation() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = -1000;
    let mouseY = -1000;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Particle pool: gentle, floating constellation nodes
    const particleCount = Math.min(Math.floor((width * height) / 22000), 45);
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const baseAlpha = Math.random() * 0.45 + 0.15;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2 + 1.2,
        alpha: baseAlpha,
        baseAlpha,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Connect particles within proximity threshold
      const maxDistance = 140;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const lineAlpha = (1 - dist / maxDistance) * 0.18;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(124, 58, 237, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw and update each particle
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Cursor magnetic interaction
        if (mouseX > 0 && mouseY > 0) {
          const mdx = mouseX - p.x;
          const mdy = mouseY - p.y;
          const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mDist < 160 && mDist > 0) {
            const force = (160 - mDist) / 160;
            p.vx += (mdx / mDist) * force * 0.04;
            p.vy += (mdy / mDist) * force * 0.04;
          }
        }

        // Apply friction
        p.vx *= 0.985;
        p.vy *= 0.985;

        // Position update
        p.x += p.vx;
        p.y += p.vy;

        // Bounce gently at borders
        if (p.x < 0) {
          p.x = 0;
          p.vx *= -1;
        } else if (p.x > width) {
          p.x = width;
          p.vx *= -1;
        }

        if (p.y < 0) {
          p.y = 0;
          p.vy *= -1;
        } else if (p.y > height) {
          p.y = height;
          p.vy *= -1;
        }

        // Render particle with subtle purple luminescence
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(124, 58, 237, ${p.alpha})`;
        ctx.shadowColor = 'rgba(124, 58, 237, 0.4)';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* 1. Animated Ambient Glowing Blobs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl animate-fluid-blob-1" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-violet-400/25 rounded-full blur-3xl animate-fluid-blob-2" />
      <div className="absolute top-2/3 left-1/3 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl animate-fluid-blob-3" />
      <div className="absolute -top-10 right-1/4 w-72 h-72 bg-neutral-300/40 rounded-full blur-3xl animate-pulse" />

      {/* 2. Interactive Constellation Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-60"
      />

      {/* 3. Subtle Enterprise Grid Texture with Radial Mask */}
      <div className="absolute inset-0 bg-grid-monochrome opacity-35 [mask-image:radial-gradient(ellipse_at_50%_40%,black_50%,transparent_90%)]" />

      {/* 4. Soft Top & Bottom Vignettes */}
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/80 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white/90 to-transparent" />
    </div>
  );
}
