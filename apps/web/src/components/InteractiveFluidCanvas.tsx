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

    // 7 Signature Fluid Masses directly aligned with the rainbow water flow spectrum (Cyan, Blue, Purple, Magenta, Rose, Amber, Emerald)
    const masses: FluidMass[] = [
      {
        baseXRatio: 0.2,
        baseYRatio: 0.3,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radiusRatio: 0.42,
        radius: 280,
        hue: 195, // Vivid Cyan / Blue
        sat: 90,
        light: 60,
        alpha: 0.42,
        phaseX: 0,
        phaseY: 1.0,
        speedX: 0.35,
        speedY: 0.4,
      },
      {
        baseXRatio: 0.5,
        baseYRatio: 0.22,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radiusRatio: 0.46,
        radius: 320,
        hue: 240, // Deep Royal Blue
        sat: 88,
        light: 62,
        alpha: 0.38,
        phaseX: 1.8,
        phaseY: 0.6,
        speedX: 0.3,
        speedY: 0.35,
      },
      {
        baseXRatio: 0.8,
        baseYRatio: 0.35,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radiusRatio: 0.45,
        radius: 300,
        hue: 275, // Electric Purple (Pineco Brand core)
        sat: 92,
        light: 60,
        alpha: 0.45,
        phaseX: 0.9,
        phaseY: 2.1,
        speedX: 0.38,
        speedY: 0.32,
      },
      {
        baseXRatio: 0.78,
        baseYRatio: 0.72,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radiusRatio: 0.4,
        radius: 270,
        hue: 305, // Rich Magenta / Violet
        sat: 90,
        light: 62,
        alpha: 0.36,
        phaseX: 2.5,
        phaseY: 1.2,
        speedX: 0.32,
        speedY: 0.42,
      },
      {
        baseXRatio: 0.52,
        baseYRatio: 0.82,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radiusRatio: 0.42,
        radius: 290,
        hue: 345, // Soft Rose / Crimson
        sat: 90,
        light: 64,
        alpha: 0.35,
        phaseX: 0.4,
        phaseY: 2.8,
        speedX: 0.4,
        speedY: 0.35,
      },
      {
        baseXRatio: 0.25,
        baseYRatio: 0.75,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radiusRatio: 0.38,
        radius: 260,
        hue: 38, // Warm Amber / Golden Sunlight
        sat: 94,
        light: 58,
        alpha: 0.36,
        phaseX: 2.2,
        phaseY: 0.3,
        speedX: 0.42,
        speedY: 0.3,
      },
      {
        baseXRatio: 0.14,
        baseYRatio: 0.52,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radiusRatio: 0.4,
        radius: 270,
        hue: 165, // Fresh Emerald / Teal
        sat: 86,
        light: 56,
        alpha: 0.35,
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

      // Draw all 7 rainbow fluid masses with multi-stop radial gradients
      for (const d of masses) {
        const radius = d.radius;
        if (radius <= 1) continue;

        const grad = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, radius);
        const y = d.alpha;
        const E = `hsla(${d.hue}, ${d.sat}%, ${d.light}%, ${y.toFixed(3)})`;
        const N = `hsla(${(d.hue + 15) % 360}, ${d.sat - 8}%, ${d.light + 4}%, ${(y * 0.55).toFixed(3)})`;
        const F = `hsla(${(d.hue + 30) % 360}, ${d.sat - 12}%, ${d.light + 8}%, 0)`;

        grad.addColorStop(0, E);
        grad.addColorStop(0.5, N);
        grad.addColorStop(1, F);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(d.x, d.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Dynamic Interactive Cursor Fluid Glow on Hover (Enhancement for immediate cursor feedback)
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
        const curAlpha = 0.45 * hoverStrength;
        cursorGrad.addColorStop(0, `hsla(275, 95%, 65%, ${curAlpha.toFixed(3)})`);
        cursorGrad.addColorStop(0.35, `hsla(295, 90%, 62%, ${(curAlpha * 0.6).toFixed(3)})`);
        cursorGrad.addColorStop(0.65, `hsla(235, 85%, 65%, ${(curAlpha * 0.25).toFixed(3)})`);
        cursorGrad.addColorStop(1, 'hsla(275, 90%, 60%, 0)');

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
