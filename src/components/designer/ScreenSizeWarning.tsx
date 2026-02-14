"use client";

import { useEffect, useState } from "react";
import { WarningTriangle } from "iconoir-react";

export function ScreenSizeWarning() {
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      // Show warning if width < 1024px (tablet/mobile)
      setIsSmallScreen(window.innerWidth < 1024);
    };

    // Check on mount
    checkScreenSize();

    // Check on resize
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  if (!isSmallScreen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="max-w-md mx-4 text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="rounded bg-accent/10 p-4">
            <WarningTriangle width={48} height={48} className="text-accent" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">
            Screen too small
          </h2>
          <p className="text-muted-foreground">
            The Happy Balcony designer works best on larger screens. Please use a desktop or laptop computer for the best experience.
          </p>
        </div>

        {/* Minimum size info */}
        <div className="bg-muted/50 rounded p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">Minimum screen width</p>
          <p>1024px (tablet landscape or larger)</p>
        </div>

        {/* Current size indicator */}
        <div className="text-xs text-muted-foreground">
          Your current screen width: <span className="font-mono font-semibold">{typeof window !== 'undefined' ? window.innerWidth : 0}px</span>
        </div>
      </div>
    </div>
  );
}
