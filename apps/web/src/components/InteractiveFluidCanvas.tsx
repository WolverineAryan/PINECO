'use client';

import React, { useEffect, useRef } from 'react';

interface ParticleMass {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseXRatio: number;
  baseYRatio: number;
  speedX: number;
  speedY: number;
  phaseX: number;
  phaseY: number;
  radius: number;
  alpha: number;
  hue: number;
  sat: number;
  light: number;
}

export function InteractiveFluidCanvas({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let width = 0;
    let height = 0;
    let mouseX = -9999;
    let mouseY = -9999;
    let isHovered = false;
    let hoverStrength = 0;
    let lastTime = performance.now();

    const handleResize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Initialize organic fluid masses calibrated to 10% Purple / Violet / Indigo palette
    const masses: ParticleMass[] = [
      {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        baseXRatio: 0.2,
        baseYRatio: 0.3,
        speedX: 0.0007,
        speedY: 0.0009,
        phaseX: 0.2,
        phaseY: 1.4,
        radius: 260,
        alpha: 0.22,
        hue: 270, // Deep purple
        sat: 85,
        light: 65,
      },
      {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        baseXRatio: 0.78,
        baseYRatio: 0.35,
        speedX: 0.0008,
        speedY: 0.0006,
        phaseX: 2.1,
        phaseY: 0.5,
        radius: 300,
        alpha: 0.18,
        hue: 280, // Electric violet
        sat: 90,
        light: 60,
      },
      {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        baseXRatio: 0.5,
        baseYRatio: 0.65,
        speedX: 0.0006,
        speedY: 0.0008,
        phaseX: 4.2,
        phaseY: 3.1,
        radius: 280,
        alpha: 0.2,
        hue: 260, // Indigo purple
        sat: 80,
        light: 68,
      },
      {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        baseXRatio: 0.85,
        baseYRatio: 0.75,
        speedX: 0.0009,
        speedY: 0.0007,
        phaseX: 1.1,
        phaseY: 2.8,
        radius: 220,
        alpha: 0.15,
        hue: 290, // Radiant amethyst
        sat: 75,
        light: 65,
      },
      {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        baseXRatio: 0.15,
        baseYRatio: 0.75,
        speedX: 0.0007,
        speedY: 0.001,
        phaseX: 3.3,
        phaseY: 1.9,
        radius: 240,
        alpha: 0.16,
        hue: 265, // Royal violet
        sat: 85,
        light: 62,
      },
    ];

    // Initial position placement
    for (const d of masses) {
      d.x = width * d.baseXRatio;
      d.y = height * d.baseYRatio;
    }

    const parent = canvas.parentElement;
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      isHovered = true;
    };

    const handleMouseLeave = () => {
      isHovered = false;
      mouseX = -9999;
      mouseY = -9999;
    };

    if (parent) {
      parent.addEventListener('mousemove', handleMouseMove);
      parent.addEventListener('mouseleave', handleMouseLeave);
    }

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      if (width === 0 || height === 0) {
        animFrameId = requestAnimationFrame(render);
        return;
      }

      const targetHover = isHovered ? 1 : 0;
      hoverStrength += (targetHover - hoverStrength) * (dt * 3.5);

      ctx.clearRect(0, 0, width, height);

      const influenceRadius = 380;

      for (const d of masses) {
        // Natural organic harmonic flow
        const targetBaseX = width * d.baseXRatio + Math.sin(time * d.speedX + d.phaseX) * (width * 0.05);
        const targetBaseY = height * d.baseYRatio + Math.cos(time * d.speedY + d.phaseY) * (height * 0.05);

        let pushX = 0;
        let pushY = 0;

        if (hoverStrength > 0.01 && mouseX > 0 && mouseY > 0) {
          const dx = mouseX - d.x;
          const dy = mouseY - d.y;
          const dist = Math.hypot(dx, dy);

          if (dist > 1 && dist < influenceRadius) {
            // Gentle fluid displacement force
            const force = (1 - dist / influenceRadius) * 45 * hoverStrength;
            const angle = Math.atan2(dy, dx);
            pushX = -Math.cos(angle) * force;
            pushY = -Math.sin(angle) * force;
          }
        }

        const destX = targetBaseX + pushX;
        const destY = targetBaseY + pushY;

        const forceX = (destX - d.x) * 5;
        const forceY = (destY - d.y) * 5;

        d.vx = (d.vx + forceX * dt) * 0.88;
        d.vy = (d.vy + forceY * dt) * 0.88;

        d.x += d.vx * dt * 60;
        d.y += d.vy * dt * 60;
      }

      ctx.save();
      ctx.globalCompositeOperation = 'source-over';

      for (const d of masses) {
        const radius = d.radius;
        if (radius <= 1) continue;

        const grad = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, radius);
        const a = d.alpha;
        const colCenter = `hsla(${d.hue}, ${d.sat}%, ${d.light}%, ${a.toFixed(3)})`;
        const colMid = `hsla(${(d.hue + 12) % 360}, ${d.sat - 8}%, ${d.light + 4}%, ${(a * 0.5).toFixed(3)})`;
        const colOuter = `hsla(${(d.hue + 24) % 360}, ${d.sat - 15}%, ${d.light + 8}%, 0)`;

        grad.addColorStop(0, colCenter);
        grad.addColorStop(0.5, colMid);
        grad.addColorStop(1, colOuter);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(d.x, d.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      animFrameId = requestAnimationFrame(render);
    };

    animFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      if (parent) {
        parent.removeEventListener('mousemove', handleMouseMove);
        parent.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none select-none ${className}`}
    />
  );
}
