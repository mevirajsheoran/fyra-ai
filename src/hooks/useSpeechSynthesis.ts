// src/hooks/useSpeechSynthesis.ts

"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseSpeechSynthesisProps {
  onEnd?: () => void;
  onStart?: () => void;
  rate?: number;
  pitch?: number;
  preferredVoice?: string;
}

interface UseSpeechSynthesisReturn {
  speak: (text: string) => void;
  stop: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
}

export function useSpeechSynthesis({
  onEnd,
  onStart,
  rate = 1.0,
  pitch = 1.0,
  preferredVoice,
}: UseSpeechSynthesisProps = {}): UseSpeechSynthesisReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  const onEndRef = useRef(onEnd);
  const onStartRef = useRef(onStart);

  useEffect(() => {
    onEndRef.current = onEnd;
    onStartRef.current = onStart;
  }, [onEnd, onStart]);

  // Load voices
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    setIsSupported(true);

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    
    // Chrome loads voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!isSupported || !text) return;

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // Find best voice
      let selectedVoice = voices.find((v) => v.name === preferredVoice);
      
      if (!selectedVoice) {
        // Try to find a good English voice
        selectedVoice = voices.find(
          (v) =>
            v.lang.startsWith("en") &&
            (v.name.toLowerCase().includes("google") ||
             v.name.toLowerCase().includes("natural") ||
             v.name.toLowerCase().includes("samantha") ||
             v.name.toLowerCase().includes("alex"))
        );
      }
      
      if (!selectedVoice) {
        selectedVoice = voices.find((v) => v.lang.startsWith("en"));
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.rate = rate;
      utterance.pitch = pitch;

      utterance.onstart = () => {
        setIsSpeaking(true);
        onStartRef.current?.();
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        onEndRef.current?.();
      };

      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event.error);
        setIsSpeaking(false);
        onEndRef.current?.();
      };

      window.speechSynthesis.speak(utterance);
    },
    [isSupported, voices, preferredVoice, rate, pitch]
  );

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
    voices,
  };
}