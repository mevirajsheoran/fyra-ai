"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
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
   HELPER: Calculate speech duration
   ====================== */

const calculateSpeechDuration = (text: string): number => {
  const baseTime = (text.length / 10) * 1000;
  return Math.min(Math.max(baseTime, 4000), 20000);
};

/* ======================
   HOOK
   ====================== */

export function useVoiceAssistant() {
  const { user } = useUser();
  const router = useRouter();

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
  const [shouldAutoListen, setShouldAutoListen] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");

  // Guards
  const processingRef = useRef(false);
  const hasStartedRef = useRef(false);
  const isConversationCompleteRef = useRef(false);
  const callActiveRef = useRef(false);

  /* ======================
     TEXT-TO-SPEECH
     ====================== */

  const handleSpeechStart = useCallback(() => {
    setStatus((prev) => (prev === "generating" ? "generating" : "speaking"));
  }, []);

  const handleSpeechEnd = useCallback(() => {
    if (isConversationCompleteRef.current) {
      return;
    }
    setShouldAutoListen(true);
  }, []);

  const {
    speak,
    stop: stopSpeaking,
    isSpeaking: isAISpeaking,
    isSupported: ttsSupported,
  } = useSpeechSynthesis({
    onStart: handleSpeechStart,
    onEnd: handleSpeechEnd,
    rate: 1.0,
  });

  /* ======================
     SPEECH-TO-TEXT
     ====================== */

  const handleSpeechResult = useCallback(
    (transcript: string) => {
      if (transcript.trim() && !callEnded && !isConversationCompleteRef.current) {
        setLiveTranscript(""); // Clear live transcript when final result comes
        processMessageRef.current?.(transcript);
      }
    },
    [callEnded]
  );

  const handleInterimResult = useCallback((interim: string) => {
    setLiveTranscript(interim);
  }, []);

  const {
    isListening,
    isSupported: sttSupported,
    startListening,
    stopListening,
    transcript,
    interimTranscript,
    isSpeaking: isUserSpeaking,
  } = useSpeechRecognition({
    onResult: handleSpeechResult,
    onError: (err) => setError(err),
    onInterimResult: handleInterimResult,
  });

  /* ======================
     AUTO-START LISTENING EFFECT
     ====================== */

  useEffect(() => {
    if (shouldAutoListen && callActiveRef.current && !isConversationCompleteRef.current && !callEnded) {
      setShouldAutoListen(false);
      setStatus("listening");
      startListening();
    }
  }, [shouldAutoListen, callEnded, startListening]);

  /* ======================
     EXTRACTION + GENERATION
     ====================== */

  const extractDataAndGeneratePlan = useCallback(
    async (messages: Message[]) => {
      console.log("🚀 Starting extractDataAndGeneratePlan...");

      try {
        console.log("📊 Calling /api/extract-data...");
        const extractRes = await fetch("/api/extract-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationHistory: messages }),
        });

        if (!extractRes.ok) {
          throw new Error("Data extraction failed");
        }

        const extractResult = await extractRes.json();
        console.log("📊 Extract result:", extractResult);

        setConversationState((prev) => ({
          ...prev,
          collectedData: extractResult.data,
        }));

        console.log("🏋️ Calling /api/generate-plan...");
        const planRes = await fetch("/api/generate-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userData: extractResult.data }),
        });

        if (!planRes.ok) {
          const errorText = await planRes.text();
          console.error("Generate plan failed:", errorText);
          throw new Error("Plan generation failed");
        }

        const planResult = await planRes.json();
        console.log("🏋️ Plan result:", planResult);

        if (!planResult.success) {
          throw new Error("Invalid plan response");
        }

        setGeneratedPlan(planResult);
        setConversationState((prev) => ({
          ...prev,
          collectedData: extractResult.data,
          isComplete: true,
        }));

        const completionMessage = `Perfect! Your ${planResult.planName || "personalized fitness plan"} is ready. Taking you to your profile now.`;
        console.log("🔊 Speaking completion message...");
        speak(completionMessage);

        const speechDuration = calculateSpeechDuration(completionMessage);
        console.log(`⏱️ Waiting ${speechDuration}ms for speech...`);

        setTimeout(() => {
          console.log("✅ Setting callEnded = true");
          setCallEnded(true);

          setTimeout(() => {
            console.log("🔀 Redirecting to /profile...");
            router.push("/profile");
          }, 1500);
        }, speechDuration);
      } catch (err) {
        console.error("❌ extractDataAndGeneratePlan error:", err);
        setError("Failed to generate your plan. Please try again.");
        setStatus("idle");
        isConversationCompleteRef.current = false;
      }
    },
    [speak, router]
  );

  /* ======================
     CORE MESSAGE PIPELINE
     ====================== */

  const processMessage = useCallback(
    async (userMessage: string) => {
      if (conversationState.isComplete || callEnded || isConversationCompleteRef.current) {
        console.log("⚠️ Ignoring message - conversation complete");
        return;
      }

      if (processingRef.current) {
        console.log("⚠️ Ignoring message - already processing");
        return;
      }

      processingRef.current = true;
      console.log("📝 Processing message:", userMessage);

      stopListening();
      setLiveTranscript("");
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

        console.log("💬 Calling /api/chat with turnNumber:", conversationState.turnNumber);
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
        console.log("💬 Chat response:", data);

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

        if (data.isComplete) {
          console.log("🎯 Conversation complete!");

          isConversationCompleteRef.current = true;
          stopListening();
          setStatus("generating");

          console.log("🔊 Speaking final message:", data.message);
          speak(data.message);

          const speechDuration = calculateSpeechDuration(data.message);
          console.log(`⏱️ Final message will take ~${speechDuration}ms`);

          setTimeout(() => {
            console.log("🚀 Starting plan generation...");
            extractDataAndGeneratePlan(allMessages);
          }, speechDuration);
        } else {
          speak(data.message);
        }
      } catch (err) {
        console.error("❌ processMessage error:", err);
        setError("Something went wrong. Please try again.");
        setStatus("idle");
      } finally {
        processingRef.current = false;
      }
    },
    [conversationState, speak, callEnded, user?.firstName, stopListening, extractDataAndGeneratePlan]
  );

  const processMessageRef = useRef(processMessage);
  processMessageRef.current = processMessage;

  /* ======================
     UI ACTIONS
     ====================== */

  const startConversation = useCallback(async () => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    callActiveRef.current = true;

    console.log("🎬 Starting conversation...");

    setConversationState({
      messages: [],
      collectedData: initialHealthData,
      isComplete: false,
      turnNumber: 1,
    });

    setStatus("processing");
    setLiveTranscript("");
    isConversationCompleteRef.current = false;

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
      console.log("🎬 First message:", data.message);

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
    } catch (err) {
      console.error("❌ startConversation error:", err);
      setError("Failed to start conversation.");
      setStatus("idle");
      hasStartedRef.current = false;
      callActiveRef.current = false;
    }
  }, [speak, user?.firstName]);

  const toggleListening = useCallback(() => {
    if (status === "processing" || status === "generating") {
      console.log("⚠️ Cannot toggle - status:", status);
      return;
    }
    if (isAISpeaking) {
      console.log("⚠️ Cannot toggle - AI is speaking");
      return;
    }
    if (callEnded || isConversationCompleteRef.current) {
      console.log("⚠️ Cannot toggle - call ended");
      return;
    }

    if (isListening) {
      stopListening();
      setLiveTranscript("");
      setStatus("idle");
    } else {
      stopSpeaking();
      setLiveTranscript("");
      setStatus("listening");
      startListening();
    }
  }, [isListening, status, startListening, stopListening, stopSpeaking, isAISpeaking, callEnded]);

  const endCall = useCallback(() => {
    console.log("📞 Ending call...");
    stopSpeaking();
    stopListening();
    setStatus("idle");
    setCallEnded(true);
    setLiveTranscript("");
    isConversationCompleteRef.current = true;
    callActiveRef.current = false;
  }, [stopSpeaking, stopListening]);

  const resetConversation = useCallback(() => {
    console.log("🔄 Resetting conversation...");
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
    setShouldAutoListen(false);
    setLiveTranscript("");
    hasStartedRef.current = false;
    isConversationCompleteRef.current = false;
    callActiveRef.current = false;
    stopSpeaking();
    stopListening();
  }, [stopSpeaking, stopListening]);

  /* ======================
     PUBLIC API
     ====================== */

  // Combine live transcript sources
  const currentTranscript = liveTranscript || interimTranscript;

  return {
    conversationState,
    status,
    error,
    isListening,
    isSpeaking: isAISpeaking,
    isUserSpeaking,
    transcript: currentTranscript,
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