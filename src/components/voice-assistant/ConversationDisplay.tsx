// src/components/voice-assistant/ConversationDisplay.tsx

"use client";

import { useEffect, useRef } from "react";
import { Message } from "@/types/voice-assistant";

interface ConversationDisplayProps {
  messages: Message[];
  currentTranscript?: string;
  isListening: boolean;
  callEnded: boolean;
}

export function ConversationDisplay({
  messages,
  currentTranscript,
  isListening,
  callEnded,
}: ConversationDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, currentTranscript]);

  if (messages.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="w-full bg-card/90 backdrop-blur-sm border border-border rounded-xl p-4 h-64 overflow-y-auto transition-all duration-300 scroll-smooth"
    >
      <div className="space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className="animate-fadeIn">
            <div className="font-semibold text-xs text-muted-foreground mb-1">
              {msg.role === "assistant" ? "Fyra AI" : "You"}:
            </div>
            <p className="text-foreground">{msg.content}</p>
          </div>
        ))}

        {/* Current transcript while listening */}
        {isListening && currentTranscript && (
          <div className="animate-fadeIn">
            <div className="font-semibold text-xs text-primary mb-1">
              You (speaking):
            </div>
            <p className="text-foreground/70 italic">{currentTranscript}...</p>
          </div>
        )}

        {/* Call ended message */}
        {callEnded && (
          <div className="animate-fadeIn">
            <div className="font-semibold text-xs text-primary mb-1">System:</div>
            <p className="text-foreground">
              Your fitness program has been created! Redirecting to your profile...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}





export default ConversationDisplay;