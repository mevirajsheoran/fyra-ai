"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { forwardRef } from "react";

interface CyberButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
}

const CyberButton = forwardRef<HTMLButtonElement, CyberButtonProps>(
  ({ children, href, variant = "primary", size = "md", className, onClick }, ref) => {
    const baseStyles = `
      relative inline-flex items-center justify-center
      font-mono font-medium tracking-wider uppercase
      transition-all duration-300 ease-out
      group overflow-hidden
    `;

    const sizeStyles = {
      sm: "px-4 py-2 text-xs",
      md: "px-6 py-3 text-sm",
      lg: "px-8 py-4 text-base",
    };

    const variantStyles = {
      primary: `
        bg-gradient-to-r from-silver-300 to-silver-200
        text-white font-semibold
        hover:from-silver-200 hover:to-silver-100
        shadow-[0_0_20px_rgba(192,192,192,0.3)]
        hover:shadow-[0_0_40px_rgba(192,192,192,0.5)]
        border border-silver-300/50
      `,
      secondary: `
        bg-silver-800/50
        text-silver-100
        border border-silver-600/50
        hover:bg-silver-700/50
        hover:border-silver-500/50
        backdrop-blur-sm
      `,
      outline: `
        bg-transparent
        text-silver-300
        border-2 border-silver-400/50
        hover:bg-silver-400/10
        hover:border-silver-300
        hover:shadow-[0_0_30px_rgba(192,192,192,0.2)]
      `,
    };

    const content = (
      <>
        {/* Animated background sweep */}
        <span className="absolute inset-0 w-full h-full">
          <span className={cn(
            "absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-500",
            variant === "primary" 
              ? "bg-gradient-to-r from-transparent via-white/30 to-transparent" 
              : "bg-gradient-to-r from-transparent via-silver-300/10 to-transparent"
          )} />
        </span>

        {/* Corner accents */}
        <span className="absolute top-0 left-0 w-2 h-2 border-l border-t border-current opacity-50" />
        <span className="absolute top-0 right-0 w-2 h-2 border-r border-t border-current opacity-50" />
        <span className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-current opacity-50" />
        <span className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-current opacity-50" />

        {/* Button content */}
        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>

        {/* Glow line at bottom */}
        {variant === "primary" && (
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-60" />
        )}
      </>
    );

    const combinedStyles = cn(baseStyles, sizeStyles[size], variantStyles[variant], className);

    if (href) {
      return (
        <Link href={href} className={combinedStyles}>
          {content}
        </Link>
      );
    }

    return (
      <button ref={ref} onClick={onClick} className={combinedStyles}>
        {content}
      </button>
    );
  }
);

CyberButton.displayName = "CyberButton";

export default CyberButton;