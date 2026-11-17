"use client";

import React, { useState, useEffect } from "react";
import { AtSign, ArrowRight, Lightbulb, AudioLines, Waves, X } from "lucide-react";

// Demo conversation data
const DEMO_SOURCE = {
  title: "Never Gonna Give You Up",
  type: "youtube" as const,
};

const DEMO_CONVERSATION = [
  {
    type: "user" as const,
    message: "What does 'give you up' mean in this song?",
  },
  {
    type: "assistant" as const,
    message: "Great question! In this song, **'give you up'** means to abandon or stop being with someone. Rick Astley is promising he will never leave or abandon the person he loves. It's a phrasal verb commonly used in English to express commitment.",
  },
];

export function ChatDemo() {
  const [animationPhase, setAnimationPhase] = useState<
    "source" | "typing" | "sent" | "response" | "reset"
  >("source");
  const [typedText, setTypedText] = useState("");
  const [showSource, setShowSource] = useState(false);
  const [messages, setMessages] = useState<typeof DEMO_CONVERSATION>([]);
  const [showResponseText, setShowResponseText] = useState("");

  // Animation loop
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (animationPhase === "source") {
      // Show source chip appearing
      timeout = setTimeout(() => {
        setShowSource(true);
        setAnimationPhase("typing");
      }, 500);
    } else if (animationPhase === "typing") {
      // Type the user message
      const messageToType = DEMO_CONVERSATION[0].message;
      if (typedText.length < messageToType.length) {
        timeout = setTimeout(() => {
          setTypedText(messageToType.slice(0, typedText.length + 1));
        }, 40);
      } else {
        // Message fully typed, wait then "send"
        timeout = setTimeout(() => {
          setAnimationPhase("sent");
        }, 800);
      }
    } else if (animationPhase === "sent") {
      // Add user message to chat
      timeout = setTimeout(() => {
        setMessages([DEMO_CONVERSATION[0]]);
        setTypedText("");
        
        // Then schedule response phase
        setTimeout(() => {
          setAnimationPhase("response");
        }, 500);
      }, 0);
    } else if (animationPhase === "response") {
      // Type the assistant response
      const responseToType = DEMO_CONVERSATION[1].message;
      if (showResponseText.length < responseToType.length) {
        timeout = setTimeout(() => {
          setShowResponseText(responseToType.slice(0, showResponseText.length + 2));
        }, 15);
      } else {
        // Response fully typed, wait then reset
        timeout = setTimeout(() => {
          setAnimationPhase("reset");
        }, 4000);
      }
    } else if (animationPhase === "reset") {
      // Reset everything
      timeout = setTimeout(() => {
        setShowSource(false);
        setMessages([]);
        setTypedText("");
        setShowResponseText("");
        setTimeout(() => {
          setAnimationPhase("source");
        }, 1000);
      }, 0);
    }

    return () => clearTimeout(timeout);
  }, [animationPhase, typedText, showResponseText]);

  return (
    <div className="flex flex-col h-full w-full">
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-hidden px-6 py-8">
        <div className="max-w-md mx-auto space-y-4">
          {/* User message */}
          {messages.length > 0 && (
            <div className="flex justify-end animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-[#dfecc870] text-[#1b5f4a] rounded-2xl rounded-br-sm px-4 py-3 max-w-[80%]">
                <p className="text-sm">{messages[0].message}</p>
              </div>
            </div>
          )}

          {/* Assistant response */}
          {showResponseText && (
            <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-stone-100 text-stone-800 rounded-2xl rounded-bl-sm px-4 py-3 max-w-[85%]">
                <p className="text-sm whitespace-pre-wrap">
                  {showResponseText.split("**").map((part, i) => 
                    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Input Area */}
      <div className="shrink-0 px-6 pb-6">
        <div className="max-w-md mx-auto">
          {/* Source Pill */}
          {showSource && (
            <div className="flex items-center gap-2 mb-2 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center gap-2 px-3 py-0 h-8 bg-stone-100 rounded-md group">
                {/* YouTube Icon */}
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-red-600 shrink-0">
                  <path
                    fill="currentColor"
                    d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                  />
                </svg>
                <span className="text-[10px] font-medium text-stone-700 max-w-[150px] truncate">
                  {DEMO_SOURCE.title}
                </span>
                <div className="p-0.5 rounded-full">
                  <X className="w-2 h-2 text-stone-400" />
                </div>
              </div>
            </div>
          )}

          {/* Input Form */}
          <div className="bg-white border border-stone-200 rounded-3xl p-3 shadow-sm">
            <div className="flex flex-col min-h-20">
              {/* Textarea */}
              <div className="flex-1 p-2 text-xs text-stone-700 mb-2">
                {typedText || (
                  <span className="text-stone-400">Ask anything about the video...</span>
                )}
                {typedText && animationPhase === "typing" && (
                  <span className="animate-pulse">|</span>
                )}
              </div>

              {/* Bottom Actions Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* @ button */}
                  <div className="flex items-center gap-1.5 p-2 rounded-full text-xs font-medium bg-stone-100 text-stone-500">
                    <AtSign className="w-3.5 h-3.5" />
                  </div>

                  {/* Quiz Mode */}
                  <div className="flex items-center gap-1.5 p-2 rounded-full text-xs font-medium bg-stone-100 text-stone-500">
                    <Lightbulb className="w-3.5 h-3.5" />
                  </div>

                  {/* Chat Mode */}
                  <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-full text-xs font-medium bg-[#dfecc870] text-[#1b5f4a]">
                    <div className="p-1 rounded-full bg-[#1b5f4a]">
                      <Waves className="w-2.5 h-2.5 text-[#dfecc8]" />
                    </div>
                    <span className="font-semibold">Chill</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Mic button */}
                  <div className="p-2 rounded-full text-stone-400 bg-stone-100">
                    <AudioLines className="w-4 h-4" />
                  </div>

                  {/* Submit button */}
                  <div
                    className={`
                      flex items-center justify-center gap-2 p-2 rounded-full text-sm font-medium transition-all
                      ${typedText
                        ? "bg-[#1b5f4a] text-[#dfecc8]"
                        : "bg-[#dfecc870] text-[#1b5f4a]"
                      }
                    `}
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo label */}
      <p className="text-xs text-stone-400 text-center pb-4">
        ↑ Select a source and ask your AI tutor anything
      </p>
    </div>
  );
}
