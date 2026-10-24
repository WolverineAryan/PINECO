'use client';

import React, { useEffect, useRef } from 'react';

interface FluidMass {
  baseXRatio: number;
  baseYRatio: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radiusRatio: number;
  radius: number;
  hue: number;
  sat: number;
  light: number;
  alpha: number;
  phaseX: number;
  phaseY: number;
  speedX: number;
  speedY: number;
}

export function InteractiveFluidCanvas({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animFrameId: number;
    let resizeObserver: ResizeObserver | null = null;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let mouseX = -1000;
    let mouseY = -1000;
    let smoothMouseX = -1000;
    let smoothMouseY = -1000;
    let isHovered = false;
    let hoverStrength = 0;
    let time = 0;
    let lastTime = performance.now();

    // 7 Signature Fluid Masses strictly aligned with Pineco's Purple & Black palette
    const masses: FluidMass[] = [
      {
        baseXRatio: 0.18,
        baseYRatio: 0.28,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radiusRatio: 0.44,
        radius: 290,
        hue: 268, // Electric Royal Purple (#7C3AED)
        sat: 88,
        light: 58,
        alpha: 0.38,
        phaseX: 0,
        phaseY: 1.0,
        speedX: 0.35,
        speedY: 0.4,
      },
      {
        baseXRatio: 0.48,
        baseYRatio: 0.22,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radiusRatio: 0.46,
        radius: 320,
        hue: 260, // Deep Obsidian Jet Black
        sat: 30,
        light: 8,
        alpha: 0.4,
        phaseX: 1.8,
        phaseY: 0.6,
        speedX: 0.3,
        speedY: 0.35,
      },
      {
        baseXRatio: 0.82,
        baseYRatio: 0.32,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radiusRatio: 0.45,
        radius: 310,
        hue: 274, // Luminous Violet Purple (#9333EA)
        sat: 92,
        light: 54,
        alpha: 0.36,
        phaseX: 0.9,
        phaseY: 2.1,
        speedX: 0.38,
        speedY: 0.32,
      },
      {
        baseXRatio: 0.76,
        baseYRatio: 0.74,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radiusRatio: 0.42,
        radius: 280,
        hue: 265, // Midnight Plum / Deep Violet (#1C1033)
        sat: 68,
        light: 14,
        alpha: 0.42,
        phaseX: 2.5,
        phaseY: 1.2,
        speedX: 0.32,
        speedY: 0.42,
      },
      {
        baseXRatio: 0.5,
        baseYRatio: 0.84,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radiusRatio: 0.44,
        radius: 300,
        hue: 262, // Soft Luminous Lavender Purple (#C4B5FD)
        sat: 82,
        light: 72,
        alpha: 0.32,
        phaseX: 0.4,
        phaseY: 2.8,
        speedX: 0.4,
        speedY: 0.35,
      },
      {
        baseXRatio: 0.24,
        baseYRatio: 0.72,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radiusRatio: 0.4,
        radius: 270,
        hue: 250, // Carbon Black (#09090C)
        sat: 25,
        light: 6,
        alpha: 0.36,
        phaseX: 2.2,
        phaseY: 0.3,
        speedX: 0.42,
        speedY: 0.3,
      },
      {
        baseXRatio: 0.12,
        baseYRatio: 0.52,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radiusRatio: 0.42,
        radius: 280,
        hue: 270, // Signature Royal Purple (#6D28D9)
        sat: 86,
        light: 46,
        alpha: 0.38,
        phaseX: 1.5,
        phaseY: 1.9,
        speedX: 0.36,
        speedY: 0.38,
      },
    ];

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      width = Math.max(rect.width, 320);
      height = Math.max(rect.height, 200);
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      const diag = Math.hypot(width, height);
      for (const s of masses) {
        s.radius = Math.max(diag * s.radiusRatio, 220);
        if (s.x === 0 && s.y === 0) {
          s.x = width * s.baseXRatio;
          s.y = height * s.baseYRatio;
        }
      }
    };

    resizeCanvas();
    const parentEl = canvas.parentElement;
    if (parentEl && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => resizeCanvas());
      resizeObserver.observe(parentEl);
    }

    const handlePointerMove = (e: PointerEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const rx = e.clientX - rect.left;
      const ry = e.clientY - rect.top;

      if (rx >= 0 && ry >= 0 && rx <= width && ry <= height) {
        mouseX = rx;
        mouseY = ry;
        isHovered = true;
      } else {
        isHovered = false;
      }
    };

    const handlePointerEnter = (e: PointerEvent) => {
      if (!canvas) return;
      isHovered = true;
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      smoothMouseX = mouseX;
      smoothMouseY = mouseY;
    };

    const handlePointerLeave = () => {
      isHovered = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!canvas || e.touches.length === 0) return;
      const rect = canvas.getBoundingClientRect();
      const t = e.touches[0];
      mouseX = t.clientX - rect.left;
      mouseY = t.clientY - rect.top;
      isHovered = true;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (!canvas || e.touches.length === 0) return;
      const rect = canvas.getBoundingClientRect();
      const t = e.touches[0];
      mouseX = t.clientX - rect.left;
      mouseY = t.clientY - rect.top;
      smoothMouseX = mouseX;
      smoothMouseY = mouseY;
      isHovered = true;
    };

    if (parentEl) {
      parentEl.addEventListener('pointermove', handlePointerMove, { passive: true });
      parentEl.addEventListener('pointerenter', handlePointerEnter, { passive: true });
      parentEl.addEventListener('pointerleave', handlePointerLeave, { passive: true });
      parentEl.addEventListener('touchmove', handleTouchMove, { passive: true });
      parentEl.addEventListener('touchstart', handleTouchStart, { passive: true });
    }

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      time += dt;

      if (width === 0 || height === 0) {
        animFrameId = requestAnimationFrame(render);
        return;
      }

      // Smooth hover easing transition (toppercode physics)
      const targetHover = isHovered ? 1 : 0;
      hoverStrength += (targetHover - hoverStrength) * (dt * 4.0);

      // Smooth cursor follower physics for instant luminous response
      if (mouseX > 0 && mouseY > 0) {
        if (smoothMouseX < 0) {
          smoothMouseX = mouseX;
          smoothMouseY = mouseY;
        } else {
          smoothMouseX += (mouseX - smoothMouseX) * (dt * 8);
          smoothMouseY += (mouseY - smoothMouseY) * (dt * 8);
        }
      }

      ctx.clearRect(0, 0, width, height);

      const influenceRadius = 380;

      // Update fluid masses with organic wave flow + cursor interaction
      for (const d of masses) {
        const m = width * d.baseXRatio + Math.sin(time * d.speedX + d.phaseX) * (width * 0.05);
        const C = height * d.baseYRatio + Math.cos(time * d.speedY + d.phaseY) * (height * 0.05);

        let pushX = 0;
        let pushY = 0;

        if (hoverStrength > 0.01 && mouseX > 0 && mouseY > 0) {
          const dx = mouseX - d.x;
          const dy = mouseY - d.y;
          const dist = Math.hypot(dx, dy);

          if (dist > 1 && dist < influenceRadius) {
            // Repulsion and fluid displacement force (toppercode algorithm)
            const T = (1 - dist / influenceRadius) * 48 * hoverStrength;
            const angle = Math.atan2(dy, dx);
            pushX = Math.cos(angle) * T;
            pushY = Math.sin(angle) * T;
          }
        }

        const N = m + pushX;
        const F = C + pushY;
        const forceX = (N - d.x) * 6;
        const forceY = (F - d.y) * 6;

        d.vx = (d.vx + forceX * dt) * 0.9;
        d.vy = (d.vy + forceY * dt) * 0.9;

        d.x += d.vx * dt * 60;
        d.y += d.vy * dt * 60;
      }

      ctx.save();
      ctx.globalCompositeOperation = 'source-over';

      // Draw all fluid masses strictly in Purple & Black theme
      for (const d of masses) {
        const radius = d.radius;
        if (radius <= 1) continue;

        const grad = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, radius);
        const y = d.alpha;
        const E = `hsla(${d.hue}, ${d.sat}%, ${d.light}%, ${y.toFixed(3)})`;
        const N = `hsla(${d.hue}, ${Math.max(d.sat - 10, 20)}%, ${Math.max(d.light - 6, 6)}%, ${(y * 0.5).toFixed(3)})`;
        const F = `hsla(${d.hue}, ${d.sat}%, ${d.light}%, 0)`;

        grad.addColorStop(0, E);
        grad.addColorStop(0.5, N);
        grad.addColorStop(1, F);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(d.x, d.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Dynamic Interactive Cursor Fluid Glow on Hover (strictly purple and black)
      if (hoverStrength > 0.02 && smoothMouseX > 0 && smoothMouseY > 0) {
        const cursorRadius = Math.max(width * 0.28, 260);
        const cursorGrad = ctx.createRadialGradient(
          smoothMouseX,
          smoothMouseY,
          0,
          smoothMouseX,
          smoothMouseY,
          cursorRadius
        );
        const curAlpha = 0.42 * hoverStrength;
        cursorGrad.addColorStop(0, `hsla(268, 92%, 58%, ${curAlpha.toFixed(3)})`);
        cursorGrad.addColorStop(0.35, `hsla(265, 80%, 32%, ${(curAlpha * 0.55).toFixed(3)})`);
        cursorGrad.addColorStop(0.7, `hsla(260, 30%, 10%, ${(curAlpha * 0.25).toFixed(3)})`);
        cursorGrad.addColorStop(1, 'hsla(260, 30%, 10%, 0)');

        ctx.fillStyle = cursorGrad;
        ctx.beginPath();
        ctx.arc(smoothMouseX, smoothMouseY, cursorRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      animFrameId = requestAnimationFrame(render);
    };

    animFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameId);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (parentEl) {
        parentEl.removeEventListener('pointermove', handlePointerMove);
        parentEl.removeEventListener('pointerenter', handlePointerEnter);
        parentEl.removeEventListener('pointerleave', handlePointerLeave);
        parentEl.removeEventListener('touchmove', handleTouchMove);
        parentEl.removeEventListener('touchstart', handleTouchStart);
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
