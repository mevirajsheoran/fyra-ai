// src/hooks/useSpeechRecognition.ts

"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseSpeechRecognitionProps {
  onResult: (transcript: string) => void;
  onError?: (error: string) => void;
  language?: string;
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  transcript: string;
}

export function useSpeechRecognition({
  onResult,
  onError,
  language = "en-US",
}: UseSpeechRecognitionProps): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState("");

  // Use 'any' type for the ref to avoid TypeScript issues
  const recognitionRef = useRef<any>(null);
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);

  // Keep refs updated
  useEffect(() => {
    onResultRef.current = onResult;
    onErrorRef.current = onError;
  }, [onResult, onError]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Get SpeechRecognition constructor (with webkit prefix for Safari)
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      console.warn("Speech Recognition not supported in this browser");
      return;
    }

    setIsSupported(true);

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcriptText = result[0].transcript;
        
        if (result.isFinal) {
          finalTranscript += transcriptText;
        } else {
          interimTranscript += transcriptText;
        }
      }

      setTranscript(interimTranscript || finalTranscript);

      if (finalTranscript) {
        onResultRef.current(finalTranscript.trim());
        setTranscript("");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      setTranscript("");

      const errorMessages: Record<string, string> = {
        "not-allowed": "Microphone access denied. Please allow microphone permission.",
        "no-speech": "No speech detected. Please try again.",
        "network": "Network error. Please check your connection.",
        "aborted": "Speech recognition was stopped.",
        "audio-capture": "No microphone found. Please check your microphone.",
        "service-not-allowed": "Speech recognition service not allowed.",
      };

      const message = errorMessages[event.error] || `Speech recognition error: ${event.error}`;
      onErrorRef.current?.(message);
    };

    recognitionRef.current = recognition;

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, [language]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;

    try {
      setTranscript("");
      recognitionRef.current.start();
      setIsListening(true);
    } catch (error) {
      console.error("Failed to start speech recognition:", error);
      onErrorRef.current?.("Failed to start speech recognition");
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) return;

    try {
      recognitionRef.current.stop();
      setIsListening(false);
    } catch (error) {
      console.error("Failed to stop speech recognition:", error);
    }
  }, [isListening]);

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
    transcript,
  };
}