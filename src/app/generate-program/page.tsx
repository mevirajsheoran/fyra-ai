  "use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";
import { VoiceButton } from "@/components/voice-assistant/VoiceButton";
import { StatusIndicator } from "@/components/voice-assistant/StatusIndicator";
import { ConversationDisplay } from "@/components/voice-assistant/ConversationDisplay";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const GenerateProgramPage = () => {
  const { user } = useUser();
  const router = useRouter();
  const [callActive, setCallActive] = useState(false);

  const {
    conversationState,
    status,
    error,
    isListening,
    isSpeaking,
    isUserSpeaking,
    transcript,
    callEnded,
    isSupported,
    startConversation,
    toggleListening,
    endCall,
    resetConversation,
    stopSpeaking,
  } = useVoiceAssistant();

  const handleToggleCall = () => {
    if (callActive) {
      endCall();
      setCallActive(false);
    } else {
      setCallActive(true);
      startConversation();
    }
  };

  if (!isSupported) {
    return (
      <div className="flex flex-col min-h-screen text-foreground pb-6 pt-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your browser doesn&apos;t support speech recognition. Please use
              Chrome, Edge, or Safari for the best experience.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const isFrozen = status === "generating" || callEnded;

  // Determine user status text and color
  const getUserStatus = () => {
    if (isUserSpeaking) {
      return { text: "Speaking...", color: "#22C55E", bgColor: "rgba(34, 197, 94, 0.5)" }; // Green
    }
    if (isListening) {
      return { text: "Listening...", color: "#60A5FA", bgColor: "rgba(59, 130, 246, 0.5)" }; // Blue
    }
    return { text: "Ready", color: "#A8A8A8", bgColor: "rgba(192, 192, 192, 0.2)" }; // Gray
  };

  const userStatus = getUserStatus();

  // Determine instruction text
  const getInstructionText = () => {
    if (status === "generating") {
      return { emoji: "⏳", text: "Generating your personalized plan..." };
    }
    if (status === "processing") {
      return { emoji: "⏳", text: "Processing your response..." };
    }
    if (isSpeaking) {
      return { emoji: "🔊", text: "AI is speaking..." };
    }
    if (isUserSpeaking) {
      return { emoji: "🎙️", text: "Keep speaking... I'm listening" };
    }
    if (isListening) {
      return { emoji: "🎤", text: "Listening... speak now" };
    }
    return { emoji: "⏸️", text: "Click the microphone to speak" };
  };

  const instruction = getInstructionText();

  return (
    <div className="flex flex-col min-h-screen text-foreground overflow-hidden pb-6 pt-24">
      <div className="container mx-auto px-4 h-full max-w-5xl">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-mono">
            <span>Generate Your </span>
            <span className="text-chrome uppercase">Fitness Program</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Have a voice conversation with our AI assistant to create your personalized plan
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* VIDEO CALL AREA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* AI ASSISTANT CARD */}
          <Card className="card-chrome backdrop-blur-sm overflow-hidden relative">
            <div className="aspect-video flex flex-col items-center justify-center p-6 relative">
              {/* Voice wave animation */}
              <div
                className={`absolute inset-0 ${isSpeaking ? "opacity-30" : "opacity-0"
                  } transition-opacity duration-300`}
              >
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-center items-center h-20">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`mx-1 w-1 rounded-full transition-all duration-150 ${isSpeaking ? "animate-sound-wave" : ""
                        }`}
                      style={{
                        animationDelay: `${i * 0.1}s`,
                        height: isSpeaking ? `${Math.random() * 50 + 20}%` : "5%",
                        background: "linear-gradient(180deg, #E8E8E8, #A8A8A8)",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* AI Avatar */}
              <div className="relative size-32 mb-4">
                <div
                  className={`absolute inset-0 rounded-full blur-lg ${isSpeaking ? "animate-pulse-silver" : ""
                    }`}
                  style={{ background: "rgba(192, 192, 192, 0.2)" }}
                />
                <div
                  className="relative w-full h-full rounded-full bg-card flex items-center justify-center overflow-hidden"
                  style={{ border: "1px solid rgba(192, 192, 192, 0.3)" }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to bottom, rgba(192, 192, 192, 0.1), rgba(80, 80, 80, 0.1))",
                    }}
                  />
                  <img
                    src="/ai-avatar.png"
                    alt="AI Assistant"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <h2 className="text-xl font-bold text-silver-shine">Fyra AI</h2>
              <p className="text-sm text-silver-dark mt-1">Fitness & Diet Coach</p>

              {/* Status Indicator */}
              <div className="mt-4">
                <StatusIndicator status={status} callEnded={callEnded} />
              </div>
            </div>
          </Card>

          {/* USER CARD */}
          <Card className="card-chrome backdrop-blur-sm overflow-hidden relative">
            <div className="aspect-video flex flex-col items-center justify-center p-6 relative">
              {/* Listening/Speaking animation */}
              {(isListening || isUserSpeaking) && (
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-center items-center h-20">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="mx-1 w-1 rounded-full animate-sound-wave"
                        style={{
                          animationDelay: `${i * 0.1}s`,
                          background: isUserSpeaking
                            ? "linear-gradient(180deg, #4ADE80, #22C55E)" // Green when speaking
                            : "linear-gradient(180deg, #60A5FA, #3B82F6)", // Blue when listening
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* User Image */}
              <div className="relative size-32 mb-4">
                <img
                  src={user?.imageUrl}
                  alt="User"
                  className="size-full object-cover rounded-full"
                />
                {(isListening || isUserSpeaking) && (
                  <div
                    className="absolute inset-0 border-4 rounded-full animate-pulse"
                    style={{
                      borderColor: isUserSpeaking ? "#22C55E" : "#3B82F6"
                    }}
                  />
                )}
              </div>

              <h2 className="text-xl font-bold text-silver-shine">You</h2>
              <p className="text-sm text-silver-dark mt-1">
                {user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "Guest"}
              </p>

              {/* User Status - Dynamic */}
              <div
                className="mt-4 flex items-center gap-2 px-3 py-1 rounded-full glass-silver transition-all duration-300"
                style={{
                  border: `1px solid ${userStatus.bgColor}`,
                }}
              >
                <div
                  className={`w-2 h-2 rounded-full ${(isListening || isUserSpeaking) ? "animate-pulse" : ""}`}
                  style={{ backgroundColor: userStatus.color }}
                />
                <span
                  className="text-xs transition-colors duration-300"
                  style={{ color: userStatus.color }}
                >
                  {userStatus.text}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* CONVERSATION DISPLAY */}
        <ConversationDisplay
          messages={conversationState.messages}
          currentTranscript={transcript}
          isListening={isListening}
          isUserSpeaking={isUserSpeaking}
          callEnded={callEnded}
        />

        {/* CALL CONTROLS */}
        <div className="w-full flex flex-col items-center gap-4 mt-8">
          <div className="flex items-center gap-6">
            {/* MICROPHONE BUTTON */}
            {callActive && !callEnded && (
              <div className="mic-button-blue">
                <VoiceButton
                  status={status}
                  isListening={isListening}
                  isSpeaking={isSpeaking}
                  isUserSpeaking={isUserSpeaking}
                  onClick={toggleListening}
                  disabled={isFrozen || isSpeaking}
                />
              </div>
            )}

            {/* START/END CALL BUTTON */}
            <Button
              className={`w-40 text-xl rounded-3xl relative transition-all duration-300 ${callActive ? "bg-red-600 hover:bg-red-700 text-white" : "btn-silver-primary"
                }`}
              onClick={() => {
                if (callEnded) {
                  router.push("/profile");
                } else {
                  handleToggleCall();
                }
              }}
              disabled={isFrozen && !callEnded}
            >
              {status === "generating" && (
                <span
                  className="absolute inset-0 rounded-full animate-ping opacity-75"
                  style={{ backgroundColor: "rgba(192, 192, 192, 0.5)" }}
                />
              )}
              <span>
                {status === "generating"
                  ? "Generating..."
                  : callEnded
                    ? "View Profile"
                    : callActive
                      ? "End Call"
                      : "Start Call"}
              </span>
            </Button>
          </div>

          {/* Instructions - Smooth transitions */}
          {callActive && !callEnded && (
            <p
              className="text-sm text-silver-medium text-center transition-all duration-300"
              key={instruction.text} // Force re-render for smooth transition
            >
              <span className="mr-1">{instruction.emoji}</span>
              {instruction.text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateProgramPage;