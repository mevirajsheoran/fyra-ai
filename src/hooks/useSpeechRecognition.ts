"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseSpeechRecognitionProps {
  onResult: (transcript: string) => void;
  onError?: (error: string) => void;
  onInterimResult?: (transcript: string) => void;
  language?: string;
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  transcript: string;
  interimTranscript: string;
  isSpeaking: boolean; // NEW: User is actively speaking
}

export function useSpeechRecognition({
  onResult,
  onError,
  onInterimResult,
  language = "en-US",
}: UseSpeechRecognitionProps): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef<any>(null);
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);
  const onInterimResultRef = useRef(onInterimResult);
  const speakingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    onResultRef.current = onResult;
    onErrorRef.current = onError;
    onInterimResultRef.current = onInterimResult;
  }, [onResult, onError, onInterimResult]);

  // Clear speaking timeout
  const clearSpeakingTimeout = useCallback(() => {
    if (speakingTimeoutRef.current) {
      clearTimeout(speakingTimeoutRef.current);
      speakingTimeoutRef.current = null;
    }
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      console.warn("Speech Recognition not supported in this browser");
      return;
    }

    setIsSupported(true);

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimText = "";

      // Process results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;

        if (result.isFinal) {
          finalTranscript += text;
        } else {
          interimText += text;
        }
      }

      // User is speaking if we have interim results
      if (interimText) {
        setIsSpeaking(true);
        setInterimTranscript(interimText);
        onInterimResultRef.current?.(interimText);
        
        // Reset speaking timeout
        clearSpeakingTimeout();
        speakingTimeoutRef.current = setTimeout(() => {
          setIsSpeaking(false);
        }, 1000);
      }

      // Handle final transcript
      if (finalTranscript) {
        setTranscript(finalTranscript);
        setInterimTranscript("");
        setIsSpeaking(false);
        clearSpeakingTimeout();
        onResultRef.current(finalTranscript.trim());
      }
    };

    recognition.onspeechstart = () => {
      setIsSpeaking(true);
    };

    recognition.onspeechend = () => {
      clearSpeakingTimeout();
      speakingTimeoutRef.current = setTimeout(() => {
        setIsSpeaking(false);
      }, 500);
    };

    recognition.onend = () => {
      setIsListening(false);
      setIsSpeaking(false);
      clearSpeakingTimeout();
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      setIsSpeaking(false);
      setInterimTranscript("");
      clearSpeakingTimeout();

      // Ignore no-speech and aborted errors
      if (event.error === "no-speech" || event.error === "aborted") {
        return;
      }

      const errorMessages: Record<string, string> = {
        "not-allowed": "Microphone access denied. Please allow microphone permission.",
        "network": "Network error. Please check your connection.",
        "audio-capture": "No microphone found. Please check your microphone.",
        "service-not-allowed": "Speech recognition service not allowed.",
      };

      const message = errorMessages[event.error] || `Speech recognition error: ${event.error}`;
      onErrorRef.current?.(message);
    };

    recognitionRef.current = recognition;

    return () => {
      clearSpeakingTimeout();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, [language, clearSpeakingTimeout]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;

    try {
      setTranscript("");
      setInterimTranscript("");
      setIsSpeaking(false);
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
      setIsSpeaking(false);
      setInterimTranscript("");
      clearSpeakingTimeout();
    } catch (error) {
      console.error("Failed to stop speech recognition:", error);
    }
  }, [isListening, clearSpeakingTimeout]);

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
    transcript,
    interimTranscript,
    isSpeaking,
  };
}