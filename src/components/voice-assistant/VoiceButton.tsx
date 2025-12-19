// src/components/voice-assistant/VoiceButton.tsx

"use client";

import { Mic, MicOff, Loader2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VoiceStatus } from "@/types/voice-assistant";

interface VoiceButtonProps {
  status: VoiceStatus;
  isListening: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function VoiceButton({
  status,
  isListening,
  onClick,
  disabled,
}: VoiceButtonProps) {
  const isProcessing = status === "processing" || status === "generating";
  const isSpeaking = status === "speaking";

  return (
    <Button
      size="lg"
      onClick={onClick}
      disabled={disabled || isProcessing}
      className={`
        relative w-20 h-20 rounded-full transition-all duration-300
        ${isListening 
          ? "bg-destructive hover:bg-destructive/90 animate-pulse" 
          : isSpeaking
            ? "bg-blue-500 hover:bg-blue-600"
            : isProcessing
              ? "bg-yellow-500 hover:bg-yellow-600"
              : "bg-primary hover:bg-primary/90"
        }
      `}
    >
      {/* Pulse animation ring */}
      {isListening && (
        <span className="absolute inset-0 rounded-full animate-ping bg-destructive/50 opacity-75" />
      )}

      {/* Icon */}
      {isProcessing ? (
        <Loader2 className="w-8 h-8 animate-spin" />
      ) : isSpeaking ? (
        <Volume2 className="w-8 h-8 animate-pulse" />
      ) : isListening ? (
        <MicOff className="w-8 h-8" />
      ) : (
        <Mic className="w-8 h-8" />
      )}
    </Button>
  );
}

export default VoiceButton;