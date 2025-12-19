"use client";

import { cn } from "@/lib/utils";

interface RoboticFrameProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: "cyan" | "silver" | "white";
}

const RoboticFrame = ({ 
  children, 
  className,
  glowColor = "cyan" 
}: RoboticFrameProps) => {
  const glowStyles = {
    cyan: "border-cyan-500/30 shadow-[0_0_30px_rgba(0,212,255,0.15)]",
    silver: "border-silver-400/30 shadow-[0_0_30px_rgba(192,192,192,0.15)]",
    white: "border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)]",
  };

  return (
    <div className={cn("relative", className)}>
      {/* Corner Brackets */}
      <div className="absolute -inset-3 pointer-events-none">
        {/* Top Left */}
        <div className="absolute top-0 left-0 w-8 h-8">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-400 to-transparent" />
          <div className="absolute top-0 left-0 h-full w-[2px] bg-gradient-to-b from-cyan-400 to-transparent" />
          <div className="absolute top-1 left-1 w-2 h-2 border-l-2 border-t-2 border-cyan-400/50" />
        </div>
        
        {/* Top Right */}
        <div className="absolute top-0 right-0 w-8 h-8">
          <div className="absolute top-0 right-0 w-full h-[2px] bg-gradient-to-l from-cyan-400 to-transparent" />
          <div className="absolute top-0 right-0 h-full w-[2px] bg-gradient-to-b from-cyan-400 to-transparent" />
          <div className="absolute top-1 right-1 w-2 h-2 border-r-2 border-t-2 border-cyan-400/50" />
        </div>
        
        {/* Bottom Left */}
        <div className="absolute bottom-0 left-0 w-8 h-8">
          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-400 to-transparent" />
          <div className="absolute bottom-0 left-0 h-full w-[2px] bg-gradient-to-t from-cyan-400 to-transparent" />
          <div className="absolute bottom-1 left-1 w-2 h-2 border-l-2 border-b-2 border-cyan-400/50" />
        </div>
        
        {/* Bottom Right */}
        <div className="absolute bottom-0 right-0 w-8 h-8">
          <div className="absolute bottom-0 right-0 w-full h-[2px] bg-gradient-to-l from-cyan-400 to-transparent" />
          <div className="absolute bottom-0 right-0 h-full w-[2px] bg-gradient-to-t from-cyan-400 to-transparent" />
          <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-cyan-400/50" />
        </div>
      </div>

      {/* Inner Content */}
      <div className={cn(
        "relative border rounded-lg overflow-hidden",
        glowStyles[glowColor]
      )}>
        {children}
      </div>
    </div>
  );
};

export default RoboticFrame;