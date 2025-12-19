"use client";

import { cn } from "@/lib/utils";

interface StatsCardProps {
  value: string;
  label: string;
  icon?: React.ReactNode;
  className?: string;
}

const StatsCard = ({ value, label, icon, className }: StatsCardProps) => {
  return (
    <div className={cn(
      "relative group",
      className
    )}>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-silver-800/30 to-silver-900/30 rounded-lg blur-sm group-hover:blur-md transition-all duration-300" />
      
      {/* Card */}
      <div className="relative p-4 sm:p-6 rounded-lg border border-silver-700/30 bg-silver-900/20 backdrop-blur-sm group-hover:border-cyan-500/30 transition-all duration-300">
        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-cyan-500/5 to-transparent" />
        
        {/* Corner accent */}
        <div className="absolute top-0 right-0 w-8 h-8">
          <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-l from-cyan-400/50 to-transparent" />
          <div className="absolute top-0 right-0 h-full w-[1px] bg-gradient-to-b from-cyan-400/50 to-transparent" />
        </div>

        {/* Icon */}
        {icon && (
          <div className="text-cyan-400/60 mb-2 group-hover:text-cyan-400 transition-colors">
            {icon}
          </div>
        )}

        {/* Value */}
        <div className="relative">
          <span className="text-2xl sm:text-3xl lg:text-4xl font-bold font-mono bg-gradient-to-r from-white via-cyan-100 to-silver-300 bg-clip-text text-transparent">
            {value}
          </span>
        </div>

        {/* Label */}
        <div className="mt-1 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-silver-400 font-mono">
          {label}
        </div>

        {/* Animated bottom line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-silver-600/50 to-transparent" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 group-hover:w-1/2 h-[1px] bg-cyan-400/50 transition-all duration-500" />
      </div>
    </div>
  );
};

export default StatsCard;