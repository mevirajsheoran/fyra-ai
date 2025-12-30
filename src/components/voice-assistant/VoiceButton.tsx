"use client";

import { Mic, MicOff, Loader2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VoiceStatus } from "@/types/voice-assistant";

interface VoiceButtonProps {
  status: VoiceStatus;
  isListening: boolean;
  isSpeaking?: boolean;
  isUserSpeaking?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function VoiceButton({
  status,
  isListening,
  isSpeaking = false,
  isUserSpeaking = false,
  onClick,
  disabled,
}: VoiceButtonProps) {
  const isProcessing = status === "processing";
  const isGenerating = status === "generating";
  const isButtonDisabled = disabled || isProcessing || isGenerating || isSpeaking;

  const getButtonClass = () => {
    if (isGenerating) return "bg-purple-500 cursor-not-allowed opacity-70";
    if (isUserSpeaking) return "bg-green-500 hover:bg-green-600"; // Green when user is speaking
    if (isListening) return "bg-blue-500 hover:bg-blue-600"; // Blue when listening
    if (isSpeaking) return "bg-gray-500 cursor-not-allowed opacity-70"; // Gray when AI speaking
    if (isProcessing) return "bg-yellow-500 cursor-not-allowed";
    return "bg-primary hover:bg-primary/90";
  };

  return (
    <Button
      size="lg"
      onClick={onClick}
      disabled={isButtonDisabled}
      className={`relative w-20 h-20 rounded-full transition-all duration-300 ${getButtonClass()}`}
    >
      {/* Pulse animation - different colors based on state */}
      {(isListening || isUserSpeaking) && (
        <span 
          className="absolute inset-0 rounded-full animate-ping opacity-50"
          style={{ 
            backgroundColor: isUserSpeaking ? "rgba(34, 197, 94, 0.5)" : "rgba(59, 130, 246, 0.5)"
          }}
        />
      )}

      {/* Icon */}
      {isGenerating ? (
        <Loader2 className="w-8 h-8 animate-spin" />
      ) : isProcessing ? (
        <Loader2 className="w-8 h-8 animate-spin" />
      ) : isSpeaking ? (
        <Volume2 className="w-8 h-8 animate-pulse" />
      ) : isListening ? (
        <Mic className="w-8 h-8" />
      ) : (
        <Mic className="w-8 h-8" />
      )}
    </Button>
  );
}

export default VoiceButton;