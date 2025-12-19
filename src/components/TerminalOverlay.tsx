"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const TerminalOverlay = () => {
  const [currentLine, setCurrentLine] = useState(0);
  const [displayText, setDisplayText] = useState("");

  const terminalLines = [
    { prefix: "SYSTEM", text: "Initializing AI fitness module...", color: "text-cyan-400" },
    { prefix: "SCAN", text: "Analyzing user biometrics...", color: "text-silver-400" },
    { prefix: "AI", text: "Loading personalization engine...", color: "text-cyan-400" },
    { prefix: "STATUS", text: "Ready for input", color: "text-green-400" },
  ];

  useEffect(() => {
    const line = terminalLines[currentLine];
    let charIndex = 0;

    const typeInterval = setInterval(() => {
      if (charIndex <= line.text.length) {
        setDisplayText(line.text.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => {
          setCurrentLine((prev) => (prev + 1) % terminalLines.length);
        }, 2000);
      }
    }, 50);

    return () => clearInterval(typeInterval);
  }, [currentLine]);

  const currentTerminal = terminalLines[currentLine];

  return (
    <div className="absolute -bottom-4 -left-4 -right-4 sm:left-4 sm:right-auto sm:max-w-xs">
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-lg" />
        
        {/* Terminal window */}
        <div className="relative bg-black/90 backdrop-blur-xl border border-cyan-500/30 rounded-lg overflow-hidden shadow-2xl">
          {/* Title bar */}
          <div className="flex items-center gap-2 px-3 py-2 bg-silver-900/50 border-b border-silver-800/50">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            </div>
            <span className="text-[10px] font-mono text-silver-500 ml-2">
              ai-fitness-terminal
            </span>
          </div>

          {/* Terminal content */}
          <div className="p-3 sm:p-4 font-mono text-xs sm:text-sm">
            <div className="flex items-start gap-2">
              <span className="text-silver-600">{">"}</span>
              <span className={cn("font-semibold", currentTerminal.color)}>
                [{currentTerminal.prefix}]
              </span>
              <span className="text-silver-300">
                {displayText}
                <span className="animate-pulse text-cyan-400">▊</span>
              </span>
            </div>
          </div>

          {/* Bottom status bar */}
          <div className="px-3 py-1.5 bg-silver-900/30 border-t border-silver-800/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
              <span className="text-[9px] text-silver-500 font-mono">CONNECTED</span>
            </div>
            <span className="text-[9px] text-silver-600 font-mono">
              {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerminalOverlay;