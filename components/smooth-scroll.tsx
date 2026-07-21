"use client";

import React, { useEffect, useRef } from "react";
import Lenis from "lenis";

export function SmoothScrollProvider({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Lenis on the specific container
    const lenis = new Lenis({
      wrapper: containerRef.current,
      content: containerRef.current.firstElementChild as HTMLElement,
      lerp: 0.1, // Smoothness
      duration: 1.2,
      smoothWheel: true,
      wheelMultiplier: 1,
    });

    // RequestAnimationFrame loop for Lenis
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    
    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <div ref={containerRef} className={className}>
      <div className="lenis-content-wrapper min-h-full">
        {children}
      </div>
    </div>
  );
}
