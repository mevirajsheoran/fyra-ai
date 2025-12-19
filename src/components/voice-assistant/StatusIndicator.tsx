// src/components/voice-assistant/StatusIndicator.tsx

"use client";

import { VoiceStatus } from "@/types/voice-assistant";

interface StatusIndicatorProps {
  status: VoiceStatus;
  callEnded: boolean;
}

export function StatusIndicator({ status, callEnded }: StatusIndicatorProps) {
  const getStatusConfig = () => {
    if (callEnded) {
      return { text: "Redirecting to profile...", color: "bg-green-500" };
    }

    switch (status) {
      case "listening":
        return { text: "Listening...", color: "bg-destructive animate-pulse" };
      case "processing":
        return { text: "Processing...", color: "bg-yellow-500 animate-pulse" };
      case "speaking":
        return { text: "Speaking...", color: "bg-primary animate-pulse" };
      case "generating":
        return { text: "Creating your plan...", color: "bg-purple-500 animate-pulse" };
      default:
        return { text: "Ready", color: "bg-muted" };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border">
      <div className={`w-2 h-2 rounded-full ${config.color}`} />
      <span className="text-xs text-muted-foreground">{config.text}</span>
    </div>
  );
}


export default StatusIndicator;