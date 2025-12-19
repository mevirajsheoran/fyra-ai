"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AIVisualDisplayProps {
  imageSrc: string;
  className?: string;
}

const AIVisualDisplay = ({ imageSrc, className }: AIVisualDisplayProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={cn("relative", className)}>
      {/* Outer glow ring */}
      <div className="absolute -inset-4 sm:-inset-8 rounded-full bg-gradient-to-r from-silver-400/20 via-transparent to-silver-400/20 blur-2xl animate-pulse-slow" />

      {/* Hexagonal frame simulation */}
      <div className="relative">
        {/* Rotating outer ring */}
        <div className="absolute -inset-4 rounded-full border border-silver-400/20 animate-[spin_30s_linear_infinite]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-silver-300 rounded-full shadow-[0_0_10px_rgba(192,192,192,0.8)]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-silver-300/60 rounded-full" />
        </div>

        {/* Counter-rotating ring */}
        <div className="absolute -inset-8 rounded-full border border-silver-600/20 animate-[spin_45s_linear_infinite_reverse]">
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-1 h-1 bg-silver-400 rounded-full" />
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1 h-1 bg-silver-400 rounded-full" />
        </div>

        {/* Main image container */}
        <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-silver-700/50 shadow-2xl">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-silver-900 via-silver-950 to-black" />

          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full" style={{
              backgroundImage: `
                linear-gradient(rgba(192,192,192,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(192,192,192,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }} />
          </div>

          {/* Image */}
          <img
            src={imageSrc}
            alt="AI Fitness Assistant"
            className={cn(
              "relative z-10 w-full h-full object-cover object-center transition-all duration-700",
              isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
            )}
            onLoad={() => setIsLoaded(true)}
          />

          {/* Scan line effect */}
          <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
            <div className="scanline" />
          </div>

          {/* Targeting reticle */}
          <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
            {/* Center circle */}
            <div className="relative w-1/3 h-1/3">
              <div className="absolute inset-0 border border-silver-300/30 rounded-full animate-pulse" />
              <div className="absolute inset-2 border border-silver-300/20 rounded-full" />
              {/* Crosshairs */}
              <div className="absolute top-1/2 left-0 w-1/4 h-[1px] bg-silver-300/40 -translate-y-1/2" />
              <div className="absolute top-1/2 right-0 w-1/4 h-[1px] bg-silver-300/40 -translate-y-1/2" />
              <div className="absolute left-1/2 top-0 h-1/4 w-[1px] bg-silver-300/40 -translate-x-1/2" />
              <div className="absolute left-1/2 bottom-0 h-1/4 w-[1px] bg-silver-300/40 -translate-x-1/2" />
            </div>
          </div>

          {/* Corner brackets */}
          <div className="absolute inset-4 z-20 pointer-events-none">
            <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-silver-300/40" />
            <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-silver-300/40" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-silver-300/40" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-silver-300/40" />
          </div>

          {/* Gradient overlays */}
          <div className="absolute inset-0 z-15 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute inset-0 z-15 bg-gradient-to-b from-silver-400/5 via-transparent to-transparent" />

          {/* Status indicators */}
          <div className="absolute bottom-4 left-4 right-4 z-30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-silver-300 rounded-full animate-pulse shadow-[0_0_10px_rgba(192,192,192,0.8)]" />
              <span className="text-[10px] font-mono text-silver-300/80 uppercase tracking-wider">
                AI Active
              </span>
            </div>
            <div className="text-[10px] font-mono text-silver-500">
              v2.0.1
            </div>
          </div>
        </div>

        {/* Floating data points */}
        <div className="absolute -top-2 -right-2 px-3 py-1.5 bg-silver-900/90 border border-silver-400/30 rounded-lg backdrop-blur-sm">
          <div className="text-[10px] font-mono text-silver-300">
            <span className="text-silver-500">SYNC:</span> 100%
          </div>
        </div>

        <div className="absolute -bottom-2 -left-2 px-3 py-1.5 bg-silver-900/90 border border-silver-600/30 rounded-lg backdrop-blur-sm">
          <div className="text-[10px] font-mono text-silver-400">
            <span className="text-silver-600">MODEL:</span> GPT-4
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIVisualDisplay;