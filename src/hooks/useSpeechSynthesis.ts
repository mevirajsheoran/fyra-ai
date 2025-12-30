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
  speakAsync: (text: string) => Promise<void>;
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
  
  // Use a Map to track promises by unique ID
  const pendingPromisesRef = useRef<Map<string, () => void>>(new Map());
  const currentSpeechIdRef = useRef<string | null>(null);
  const intentionallyCancelledRef = useRef(false);

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
    
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const findBestVoice = useCallback(() => {
    let selectedVoice = voices.find((v) => v.name === preferredVoice);
    
    if (!selectedVoice) {
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

    return selectedVoice;
  }, [voices, preferredVoice]);

  // Generate unique ID
  const generateId = () => `speech-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Core speak function that returns the speech ID
  const speakWithId = useCallback(
    (text: string, speechId: string) => {
      if (!isSupported || !text) return;

      // Mark current speech as intentionally cancelled
      intentionallyCancelledRef.current = true;
      
      // Cancel ongoing speech (don't resolve its promise, it was intentional)
      window.speechSynthesis.cancel();
      
      // Set new speech as current
      currentSpeechIdRef.current = speechId;

      // Small delay to ensure cancel completes
      setTimeout(() => {
        intentionallyCancelledRef.current = false;
        
        const utterance = new SpeechSynthesisUtterance(text);
        
        const selectedVoice = findBestVoice();
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
          
          // Only resolve the promise for THIS speech
          const resolve = pendingPromisesRef.current.get(speechId);
          if (resolve) {
            resolve();
            pendingPromisesRef.current.delete(speechId);
          }
          
          // Only call onEnd if this is still the current speech
          if (currentSpeechIdRef.current === speechId) {
            currentSpeechIdRef.current = null;
            onEndRef.current?.();
          }
        };

        utterance.onerror = (event) => {
          // If this was an intentional cancel for a NEW speech, don't do anything
          if (intentionallyCancelledRef.current) {
            return;
          }
          
          // If this is a cancelled/interrupted error, just clean up
          if (event.error === "interrupted" || event.error === "canceled") {
            setIsSpeaking(false);
            // Don't resolve promise on cancel - it was interrupted
            pendingPromisesRef.current.delete(speechId);
            return;
          }
          
          console.error("Speech synthesis error:", event.error);
          setIsSpeaking(false);
          
          // Resolve promise even on error so code can continue
          const resolve = pendingPromisesRef.current.get(speechId);
          if (resolve) {
            resolve();
            pendingPromisesRef.current.delete(speechId);
          }
          
          if (currentSpeechIdRef.current === speechId) {
            currentSpeechIdRef.current = null;
            onEndRef.current?.();
          }
        };

        window.speechSynthesis.speak(utterance);
      }, 50);
    },
    [isSupported, findBestVoice, rate, pitch]
  );

  // Regular speak (fire and forget)
  const speak = useCallback(
    (text: string) => {
      const id = generateId();
      speakWithId(text, id);
    },
    [speakWithId]
  );

  // Async speak - waits for speech to complete
  const speakAsync = useCallback(
    (text: string): Promise<void> => {
      return new Promise((resolve) => {
        if (!isSupported || !text) {
          resolve();
          return;
        }

        const id = generateId();
        
        // Store the resolve function with this speech's ID
        pendingPromisesRef.current.set(id, resolve);
        
        // Start speaking
        speakWithId(text, id);
      });
    },
    [isSupported, speakWithId]
  );

  const stop = useCallback(() => {
    if (!isSupported) return;
    
    intentionallyCancelledRef.current = true;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    currentSpeechIdRef.current = null;
    
    // Clear all pending promises without resolving
    pendingPromisesRef.current.clear();
    
    setTimeout(() => {
      intentionallyCancelledRef.current = false;
    }, 100);
  }, [isSupported]);

  return {
    speak,
    speakAsync,
    stop,
    isSpeaking,
    isSupported,
    voices,
  };
}