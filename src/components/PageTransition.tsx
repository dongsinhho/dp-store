"use client";

import { useEffect, useState } from "react";

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    // Check if user prefers reduced motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      // Skip animation, render immediately
      setShouldAnimate(false);
      return;
    }
    setShouldAnimate(true);
  }, []);

  return (
    <div className={shouldAnimate ? "animate-fade-in" : undefined}>
      {children}
    </div>
  );
}
