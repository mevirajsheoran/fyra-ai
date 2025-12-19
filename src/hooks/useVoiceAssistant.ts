"use client";

import { useState, useCallback, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useSpeechRecognition } from "./useSpeechRecognition";
import { useSpeechSynthesis } from "./useSpeechSynthesis";
import {
  Message,
  UserHealthData,
  ConversationState,
  VoiceStatus,
} from "@/types/voice-assistant";

/* ======================
   INITIAL DATA
   ====================== */

const initialHealthData: UserHealthData = {
  name: null,
  age: null,
  gender: null,
  weight: null,
  height: null,
  goal: null,
  activityLevel: null,
  experienceLevel: null,
  workoutPreference: null,
  daysPerWeek: null,
  dietaryRestrictions: [],
  healthConditions: [],
};

/* ======================
   HOOK
   ====================== */

export function useVoiceAssistant() {
  const { user } = useUser();

  /* ======================
     STATE
     ====================== */

  const [conversationState, setConversationState] =
    useState<ConversationState>({
      messages: [],
      collectedData: initialHealthData,
      isComplete: false,
      turnNumber: 1,
    });

  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [callEnded, setCallEnded] = useState(false);

  // Guards
  const processingRef = useRef(false);
  const hasStartedRef = useRef(false);

  /* ======================
     TEXT-TO-SPEECH
     ====================== */

  const handleSpeechStart = useCallback(() => {
    setStatus("speaking");
  }, []);

  const handleSpeechEnd = useCallback(() => {
    setStatus("idle");
  }, []);

  const {
    speak,
    stop: stopSpeaking,
    isSpeaking,
    isSupported: ttsSupported,
  } = useSpeechSynthesis({
    onStart: handleSpeechStart,
    onEnd: handleSpeechEnd,
    rate: 1.0,
  });

  /* ======================
     CORE MESSAGE PIPELINE
     ====================== */

  const processMessage = useCallback(
    async (userMessage: string) => {
      // 🚫 Ignore input after completion
      if (conversationState.isComplete || callEnded) return;

      if (processingRef.current) return;

      processingRef.current = true;

      setStatus("processing");
      setError(null);

      try {
        const userMsg: Message = {
          id: crypto.randomUUID(),
          role: "user",
          content: userMessage,
          timestamp: Date.now(),
        };

        const newMessages = [...conversationState.messages, userMsg];

        setConversationState((prev) => ({
          ...prev,
          messages: newMessages,
        }));

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationHistory: newMessages,
            turnNumber: conversationState.turnNumber,
            userName: user?.firstName || null,
          }),

        });

        if (!response.ok) {
          throw new Error("Chat request failed");
        }

        const data = await response.json();

        const aiMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.message,
          timestamp: Date.now(),
        };

        const allMessages = [...newMessages, aiMsg];

        setConversationState((prev) => ({
          ...prev,
          messages: allMessages,
          isComplete: data.isComplete,
          turnNumber: prev.turnNumber + 1,
        }));

        speak(data.message);

        // ONLY after AI declares completion
        if (data.isComplete) {
          stopListening();      // 🛑 mic off
          stopSpeaking();       // optional safety
          setStatus("generating");

          setTimeout(() => {
            extractDataAndGeneratePlan(allMessages);
          }, 300);
        }

      } catch (err) {
        console.error("processMessage error:", err);
        setError("Something went wrong. Please try again.");
        setStatus("idle");
      } finally {
        processingRef.current = false;
      }
    },
    [conversationState, speak]
  );

  /* ======================
     EXTRACTION + GENERATION
     ====================== */

  const extractDataAndGeneratePlan = async (messages: Message[]) => {
    setStatus("generating");

    try {
      const extractRes = await fetch("/api/extract-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationHistory: messages }),
      });

      if (!extractRes.ok) {
        throw new Error("Data extraction failed");
      }

      const extractResult = await extractRes.json();

      if (!extractResult.isComplete) {
        setConversationState((prev) => ({
          ...prev,
          collectedData: extractResult.data,
        }));
        setStatus("idle");
        return;
      }

      const planRes = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userData: extractResult.data }),
      });

      if (!planRes.ok) {
        throw new Error("Plan generation failed");
      }

      const planResult = await planRes.json();

      if (!planResult.success) {
        throw new Error("Invalid plan response");
      }

      setGeneratedPlan(planResult);
      setConversationState((prev) => ({
        ...prev,
        collectedData: extractResult.data,
        isComplete: true,
      }));

      speak(
        `Perfect! Your ${planResult.planName} is ready. Taking you to your profile now.`
      );

      setCallEnded(true);
    } catch (err) {
      console.error("extractDataAndGeneratePlan error:", err);
      setError("Failed to generate your plan. Please try again.");
      setStatus("idle");
    }
  };

  /* ======================
     SPEECH-TO-TEXT
     ====================== */

  const handleSpeechResult = useCallback(
    (transcript: string) => {
      if (transcript.trim()) {
        processMessage(transcript);
      }
    },
    [processMessage]
  );

  const {
    isListening,
    isSupported: sttSupported,
    startListening,
    stopListening,
    transcript,
  } = useSpeechRecognition({
    onResult: handleSpeechResult,
    onError: (err) => setError(err),
  });

  /* ======================
     UI ACTIONS
     ====================== */

  const startConversation = useCallback(async () => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    setConversationState({
      messages: [],
      collectedData: initialHealthData,
      isComplete: false,
      turnNumber: 1,
    });

    setStatus("processing");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationHistory: [],
          turnNumber: 1,
          userName: user?.firstName || null,
        }),

      });

      if (!response.ok) {
        throw new Error("Failed to start conversation");
      }

      const data = await response.json();

      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.message,
        timestamp: Date.now(),
      };

      setConversationState((prev) => ({
        ...prev,
        messages: [aiMsg],
        turnNumber: 2,
      }));

      speak(data.message);
      setStatus("idle");
    } catch (err) {
      console.error("startConversation error:", err);
      setError("Failed to start conversation.");
      setStatus("idle");
    }
  }, [speak]);

  const toggleListening = useCallback(() => {
    if (status === "processing" || status === "generating") return;

    if (isListening) {
      stopListening();
      setStatus("idle");
    } else {
      stopSpeaking();
      setStatus("listening");
      startListening();
    }
  }, [isListening, status, startListening, stopListening, stopSpeaking]);

  const endCall = useCallback(() => {
    stopSpeaking();
    stopListening();
    setStatus("idle");
  }, [stopSpeaking, stopListening]);

  const resetConversation = useCallback(() => {
    setConversationState({
      messages: [],
      collectedData: initialHealthData,
      isComplete: false,
      turnNumber: 1,
    });
    setStatus("idle");
    setError(null);
    setGeneratedPlan(null);
    setCallEnded(false);
    hasStartedRef.current = false;
    stopSpeaking();
    stopListening();
  }, [stopSpeaking, stopListening]);

  /* ======================
     PUBLIC API
     ====================== */

  return {
    conversationState,
    status,
    error,
    isListening,
    isSpeaking,
    transcript,
    generatedPlan,
    callEnded,
    isSupported: sttSupported && ttsSupported,

    startConversation,
    toggleListening,
    endCall,
    resetConversation,
    stopSpeaking,
  };
}
