import { useEffect, useRef, useState } from 'react';
import type { Renderer } from '../types';

interface Props<P> {
  render: Renderer<P>;
  params: P;
  aspectRatio: number;
  ariaLabel: string;
}

const MAX_DPR = 2;

export function CanvasFigure<P>({ render, params, aspectRatio, ariaLabel }: Props<P>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const [width, setWidth] = useState(0);
  const [contextLost, setContextLost] = useState(false);

  // Observe container width.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        setWidth(Math.floor(cr.width));
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Schedule a redraw whenever params or size change.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width <= 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setContextLost(true);
      return;
    }

    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const cssW = width;
      const cssH = Math.round(width / aspectRatio);
      const dpr = Math.min(MAX_DPR, window.devicePixelRatio || 1);
      if (canvas.width !== cssW * dpr || canvas.height !== cssH * dpr) {
        canvas.width = cssW * dpr;
        canvas.height = cssH * dpr;
      }
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, cssW, cssH);
      render(ctx, cssW, cssH, params);
    });

    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [params, width, aspectRatio, render]);

  return (
    <div ref={containerRef} className="canvas-figure">
      {contextLost ? (
        <p className="canvas-fallback">
          Your browser refused a 2D canvas context. The figure cannot be rendered.
        </p>
      ) : (
        <canvas ref={canvasRef} role="img" aria-label={ariaLabel} />
      )}
    </div>
  );
}
