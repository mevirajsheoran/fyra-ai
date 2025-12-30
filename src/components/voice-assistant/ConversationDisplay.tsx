"use client";

import { useEffect, useRef } from "react";
import { Message } from "@/types/voice-assistant";

interface ConversationDisplayProps {
  messages: Message[];
  currentTranscript: string;
  isListening: boolean;
  isUserSpeaking?: boolean;
  callEnded: boolean;
}

export function ConversationDisplay({
  messages,
  currentTranscript,
  isListening,
  isUserSpeaking = false,
  callEnded,
}: ConversationDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages or transcript change
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, currentTranscript]);

  return (
    <div
      ref={containerRef}
      className="w-full h-64 overflow-y-auto rounded-lg border border-silver-700/30 bg-black/20 backdrop-blur-sm p-4 space-y-4"
    >
      {messages.length === 0 && !currentTranscript && (
        <div className="flex items-center justify-center h-full">
          <p className="text-silver-500 text-sm font-mono">
            {callEnded ? "Conversation ended" : "Conversation will appear here..."}
          </p>
        </div>
      )}

      {/* Rendered messages */}
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[80%] rounded-lg px-4 py-2 ${
              message.role === "user"
                ? "bg-blue-600/80 text-white"
                : "bg-silver-800/60 text-silver-100"
            }`}
          >
            <p className="text-sm">{message.content}</p>
            <p className="text-[10px] opacity-50 mt-1 font-mono">
              {new Date(message.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
      ))}

      {/* Real-time transcript (while user is speaking) */}
      {currentTranscript && (
        <div className="flex justify-end">
          <div className="max-w-[80%] rounded-lg px-4 py-2 bg-blue-600/50 text-white border border-blue-400/30">
            <div className="flex items-center gap-2">
              {/* Speaking indicator */}
              <div className="flex items-center gap-1">
                <span 
                  className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"
                  style={{ animationDelay: "0ms" }}
                />
                <span 
                  className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"
                  style={{ animationDelay: "150ms" }}
                />
                <span 
                  className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
              <p className="text-sm italic">{currentTranscript}</p>
            </div>
            <p className="text-[10px] opacity-50 mt-1 font-mono">
              {isUserSpeaking ? "Speaking..." : "Listening..."}
            </p>
          </div>
        </div>
      )}

      {/* Listening indicator (no transcript yet) */}
      {isListening && !currentTranscript && (
        <div className="flex justify-end">
          <div className="max-w-[80%] rounded-lg px-4 py-2 bg-silver-800/40 border border-blue-400/20">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span 
                  className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"
                  style={{ animationDelay: "0ms" }}
                />
                <span 
                  className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"
                  style={{ animationDelay: "200ms" }}
                />
                <span 
                  className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"
                  style={{ animationDelay: "400ms" }}
                />
              </div>
              <p className="text-sm text-silver-400 italic">Listening for your response...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ConversationDisplay;