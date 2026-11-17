import { useState, useRef, useEffect, useCallback } from "react";
import Webcam from "react-webcam";
import { useSpeechRecognition } from "@/core/hooks/use-speech-recognition";
import { useAuth } from "@/core/providers/auth-provider";
import { useSources } from "@/features/chat/hooks/useSources";
import {
  sendChatMessage,
  saveChatConversation,
  loadChatConversation,
  deleteChatConversation,
} from "@/features/chat/controller";
import type { ChatMessage } from "@/features/chat/procedure";
import { type ChatMode } from "@/features/chat/procedure/chat-modes";
import { useUIStore, type SidebarTabId } from "@/core/store/ui-store";
import { TabId } from "@/features/ai-interaction/presentation/TranscriptSidebar";
import { useSkills } from "@/features/skills/hooks/useSkills";
import { useContextProcessing } from "./useContextProcessing";
import { useChatHistory } from "@/features/chat/hooks/useChatHistory";
import { generateAnswer } from "@/features/interview/controller/context";
import {
  createInterviewSession,
  addInterviewMessage,
} from "@/features/interview/controller/interview-messages";
import { generateInterviewQuestionWithContext } from "@/features/interview/controller/context-ai";

export function useInterviewSession() {
  const webcamRef = useRef<Webcam>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
  // State
  const [capturing, setCapturing] = useState(false);
  const [currentInterviewQuestion, setCurrentInterviewQuestion] = useState<string>("Connecting to host...");
  const [interviewMessages, setInterviewMessages] = useState<ChatMessage[]>([]);
  const currentInterviewSessionIdRef = useRef<string | null>(null);
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chat-messages');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error("Failed to parse saved messages:"); }
      }
    }
    return [];
  });
  
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [selectedSkillName, setSelectedSkillName] = useState<string>("Mindful Listener");
  const [selectedSkillData, setSelectedSkillData] = useState<{
    systemPrompt?: string;
    context?: Array<{ type: "pdf" | "url" | "video"; content: string; title: string }>;
    interviewMode?: "ai-asks" | "user-asks";
  } | null>(null);

  // Global UI Store
  const { 
    isSidebarOpen: showTranscript, 
    setSidebarOpen: setShowTranscript,
    toggleSidebar,
    sidebarTab, 
    setSidebarTab 
  } = useUIStore();
  
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isChatProcessing, setIsChatProcessing] = useState(false);

  // Context and Interview Mode
  const { contextData, processContexts, setContextData } = useContextProcessing();
  const [interviewMode, setInterviewMode] = useState<"ai-asks" | "user-asks">("ai-asks");
  const [customSystemPrompt, setCustomSystemPrompt] = useState("");

  const { sources: availableVideos } = useSources();
  const { savedChats, refetchChats } = useChatHistory();
  const [currentChatTitle, setCurrentChatTitle] = useState("New Chat");
  const [currentChatId, setCurrentChatId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('current-chat-id');
    }
    return null;
  });

  const { skills } = useSkills();
  const { session } = useAuth();
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  // Refs for stable callbacks
  const chatMessagesRef = useRef(chatMessages);
  const contextDataRef = useRef(contextData);
  const availableVideosRef = useRef(availableVideos);
  const currentChatIdRef = useRef(currentChatId);

  useEffect(() => { chatMessagesRef.current = chatMessages; }, [chatMessages]);
  useEffect(() => { contextDataRef.current = contextData; }, [contextData]);
  useEffect(() => { availableVideosRef.current = availableVideos; }, [availableVideos]);
  useEffect(() => { currentChatIdRef.current = currentChatId; }, [currentChatId]);

  // Connection Simulation
  useEffect(() => {
    if (currentInterviewQuestion === "Connecting to host...") {
        const timer = setTimeout(() => {
            setCurrentInterviewQuestion("");
        }, 1500);
        return () => clearTimeout(timer);
    }
  }, [currentInterviewQuestion]);

  // Persist CHAT messages & ID
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (chatMessages.length > 0) {
        localStorage.setItem('chat-messages', JSON.stringify(chatMessages));
      } else {
        localStorage.removeItem('chat-messages');
      }
      
      if (currentChatId) {
        localStorage.setItem('current-chat-id', currentChatId);
      } else if (chatMessages.length === 0) {
        // Only clear ID if messages are also cleared (New Chat state)
        localStorage.removeItem('current-chat-id');
      }
    }
  }, [chatMessages, currentChatId]);

  // Update chat title
  useEffect(() => {
    if (chatMessages.length > 0 && !currentChatId) {
      const firstUserMsg = chatMessages.find(m => m.role === "user");
      if (firstUserMsg) {
        setCurrentChatTitle(firstUserMsg.content.slice(0, 30) + "...");
      }
    }
  }, [chatMessages, currentChatId]);

  const handleSendTranscript = useCallback(async () => {
    if (!transcript || transcript.length < 5 || isProcessingAI) return;
    
    const userMessage = transcript;
    setInterviewMessages(prev => [...prev, { role: "user", content: userMessage }]);
    
    if (currentInterviewSessionIdRef.current) {
      await addInterviewMessage(currentInterviewSessionIdRef.current, "user", userMessage);
    }
    
    resetTranscript();
    setIsProcessingAI(true);
    
    try {
      if (interviewMode === "ai-asks") {
        const result = await generateInterviewQuestionWithContext(
          userMessage,
          interviewMessages.filter(m => m.role === "ai").map(m => m.content),
          selectedSkillData?.systemPrompt || customSystemPrompt || "You are a helpful interview partner.",
          selectedSkillData?.context
        );
        
        if (result.success && result.question) {
            setCurrentInterviewQuestion(result.question);
            setInterviewMessages(prev => [...prev, { 
              role: "ai" as const, 
              content: result.question || "",
              timestamp: new Date()
            }]);
            
            if (currentInterviewSessionIdRef.current) {
              await addInterviewMessage(currentInterviewSessionIdRef.current, "ai", result.question);
            }
        } else {
          const errorMsg = result.error || "Failed to generate question";
          setCurrentInterviewQuestion(errorMsg);
          setInterviewMessages(prev => [...prev, { role: "ai", content: errorMsg }]);
        }
      } else {
        if (contextData) {
          const answer = await generateAnswer(
            contextData,
            userMessage,
            customSystemPrompt || "You are a helpful assistant."
          );
          if (answer) {
            setCurrentInterviewQuestion(answer);
            setInterviewMessages(prev => [...prev, { role: "ai", content: answer }]);
            
            if (currentInterviewSessionIdRef.current) {
              await addInterviewMessage(currentInterviewSessionIdRef.current, "ai", answer);
            }
          }
        } else {
          const errorMsg = "Please upload context (PDF/URL/Video) to use this mode.";
          setCurrentInterviewQuestion(errorMsg);
          setInterviewMessages(prev => [...prev, { role: "ai", content: errorMsg }]);
        }
      }
    } catch (error) {
      console.error("Error generating response:");
      const errorMsg = "Sorry, I encountered an error. Please try again.";
      setCurrentInterviewQuestion(errorMsg);
      setInterviewMessages(prev => [...prev, { role: "ai", content: errorMsg }]);
    }
    
    setIsProcessingAI(false);
  }, [transcript, isProcessingAI, interviewMessages, selectedSkillData, contextData, interviewMode, customSystemPrompt, resetTranscript]);

  // Timer Logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (capturing) {
      timer = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => clearInterval(timer);
  }, [capturing]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const handleStartCapture = useCallback(async () => {
    setCapturing(true);
    resetTranscript();
    setInterviewMessages([]);

    const sessionTitle = `Interview - ${new Date().toLocaleString()}`;
    const result = await createInterviewSession(sessionTitle, undefined);
    if (result.success && result.sessionId) {
      currentInterviewSessionIdRef.current = result.sessionId;
      void 0;
    }

    // Solicitar permissão e iniciar reconhecimento de voz
    const started = await startListening();

    if (!started) {
      // Se não conseguiu iniciar (sem permissão ou erro)
      alert("Unable to start speech recognition. Please check microphone permissions.");
      setCapturing(false);
      return;
    }

    if (webcamRef.current && webcamRef.current.stream) {
        const stream = webcamRef.current.stream;
        if (stream.getTracks().length === 0) {
            alert("Camera or microphone not ready. Please check permissions.");
            setCapturing(false);
            stopListening();
            return;
        }

        try {
            const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });
            mediaRecorder.start();
            mediaRecorderRef.current = mediaRecorder;
        } catch (error) {
            console.error("Failed to start MediaRecorder:");
            alert("Failed to start recording. Please refresh and try again.");
            setCapturing(false);
            stopListening();
        }
    } else {
        alert("Camera not ready. Please wait a moment.");
        setCapturing(false);
        stopListening();
    }
  }, [startListening, stopListening, resetTranscript]);

  const handleStopCapture = useCallback(async () => {
    if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
    setCapturing(false);
    stopListening();
    
    if (currentInterviewSessionIdRef.current && interviewMessages.length > 0) {
      const { saveInterviewTranscript } = await import("@/features/interview/controller/interview-messages");
      const result = await saveInterviewTranscript(
        currentInterviewSessionIdRef.current,
        selectedSkillName
      );
      if (result.success) void 0;
    }
  }, [stopListening, interviewMessages.length, selectedSkillName]);

  const handleSendChatMessage = useCallback(async (message: string, selectedVideoIds?: string[], isQuizMode?: boolean, chatMode?: string) => {
    const currentVideos = availableVideosRef.current;
    
    const messageSources = selectedVideoIds && selectedVideoIds.length > 0
      ? currentVideos.filter(v => selectedVideoIds.includes(v.id)).map(v => ({ id: v.id, title: v.title, type: v.type }))
      : undefined;

    // Optimistic Update
    const newUserMsg: ChatMessage = {
      role: "user",
      content: message,
      sources: messageSources
    };

    setChatMessages(prev => [...prev, newUserMsg]);
    setIsChatProcessing(true);
    setSidebarTab("chat");
    setShowTranscript(true);

    let activeChatId = currentChatIdRef.current;

    try {
      // AUTO-SAVE 1: Save User Message immediately to establish Chat ID
      const messagesWithUser = [...chatMessagesRef.current, newUserMsg];
      const saveUserResult = await saveChatConversation(messagesWithUser, undefined, activeChatId || undefined);
      
      if (saveUserResult.success && saveUserResult.chatId) {
        activeChatId = saveUserResult.chatId;
        setCurrentChatId(activeChatId); // Update State
        currentChatIdRef.current = activeChatId; // Update Ref for immediate use
        
        // Refetch chat list if it was a new chat
        if (!currentChatIdRef.current) {
             refetchChats();
        }
      }

      const fullSources = selectedVideoIds && selectedVideoIds.length > 0
        ? currentVideos.filter(v => selectedVideoIds.includes(v.id)).map(source => ({
              id: source.id,
              title: source.title,
              type: source.type,
              videoId: source.videoId,
              videoUrl: source.videoUrl,
              content: source.content,
            }))
        : undefined;

      const result = await sendChatMessage(
        message,
        chatMessagesRef.current, // Should technically be messagesWithUser, but ref might be stale? No, ref is synced.
        contextDataRef.current,
        isQuizMode,
        fullSources,
        undefined,
        chatMode
      );

      if (result.success && result.response) {
        const newAiMsg: ChatMessage = {
          role: "ai",
          content: result.response!,
          sources: messageSources,
          chatMode: chatMode as ChatMode | undefined,
        };

        if (result.feedbackId) {
          setChatMessages(prev => {
            const updated = [...prev];
            const lastUserMsgIndex = updated.length - 1;
            if (updated[lastUserMsgIndex]?.role === "user") {
              updated[lastUserMsgIndex] = {
                ...updated[lastUserMsgIndex],
                feedbackId: result.feedbackId,
              };
            }
            return updated;
          });
        }

        setChatMessages(prev => [...prev, newAiMsg]);

        // AUTO-SAVE 2: Save AI Message to the SAME chat ID
        const finalMessages = [...messagesWithUser, newAiMsg];
        // Ensure we save the feedbackId reference if it exists
        if (result.feedbackId) {
            const userMsgIdx = finalMessages.length - 2;
            if (finalMessages[userMsgIdx]?.role === 'user') {
                finalMessages[userMsgIdx].feedbackId = result.feedbackId;
            }
        }

        await saveChatConversation(finalMessages, undefined, activeChatId || undefined);

      } else {
        const errorMsg = result.error || "Failed to get response";
        setChatMessages(prev => [...prev, { role: "ai", content: errorMsg }]);
      }
    } catch (error) {
      console.error("Error sending chat message:");
      const errorMsg = "Sorry, I encountered an error. Please try again.";
      setChatMessages(prev => [...prev, { role: "ai", content: errorMsg }]);
    } finally {
      setIsChatProcessing(false);
    }
  }, [setShowTranscript, setSidebarTab, refetchChats]);

  const handleChatSelect = useCallback(async (chatId: string) => {
    try {
      // Save current chat before switching (whether existing or new)
      if (chatMessagesRef.current.length > 0) {
        await saveChatConversation(chatMessagesRef.current, undefined, currentChatIdRef.current || undefined);
        await refetchChats(); 
      }

      const result = await loadChatConversation(chatId);

      if (result.success && result.messages) {
        setCurrentChatId(chatId);
        setCurrentChatTitle(result.title || "Chat");
        setChatMessages(result.messages);
      } else {
        console.error("Failed to load chat:");
      }
    } catch (error) {
      console.error("Error loading chat:");
    }
  }, [refetchChats]); // Added refetchChats dependency

  const handleNewChat = useCallback(async (saveCurrentChat: boolean = false) => {
    if (saveCurrentChat && chatMessagesRef.current.length > 0) {
      try {
        const result = await saveChatConversation(chatMessagesRef.current, undefined, currentChatIdRef.current || undefined);
        if (result.success && result.chatId) {
          await refetchChats();
        }
      } catch (error) {
        console.error("Error saving conversation:");
      }
    }

    setChatMessages([]);
    setCurrentChatId(null);
    setCurrentChatTitle("New Chat");
    localStorage.removeItem('chat-messages');
    localStorage.removeItem('current-chat-id'); // Clear persisted ID
    setSidebarTab("chat");
  }, [setSidebarTab, refetchChats]);

  const handleDeleteChat = useCallback(async (chatId: string) => {
    try {
      const result = await deleteChatConversation(chatId);
      if (result.success) {
        if (chatId === currentChatIdRef.current) {
          handleNewChat(false);
        }
        await refetchChats();
      }
    } catch (error) {
      console.error("Error deleting chat:");
    }
  }, [handleNewChat, refetchChats]);

  const handleSelectSkill = useCallback(async (
    skillName: string,
    options?: {
      context?: Array<{ type: "pdf" | "url" | "video"; content: string; title: string }>;
      interviewMode?: "ai-asks" | "user-asks";
      systemPrompt?: string;
    }
  ) => {
    setSelectedSkillName(skillName);
    setSelectedSkillData(options || null);
    
    if (options?.interviewMode) setInterviewMode(options.interviewMode);
    if (options?.systemPrompt) setCustomSystemPrompt(options.systemPrompt);
    
    if (options?.context && options.context.length > 0) {
      setCurrentInterviewQuestion("Processing context sources...");
      const result = await processContexts(options.context); 
      if (result) {
        setCurrentInterviewQuestion(
          options.interviewMode === "user-asks" 
            ? "Context loaded! Ask me anything about it." 
            : "Context loaded! Ready to practice with this material."
        );
      } else {
        setCurrentInterviewQuestion("Failed to process context sources. Continuing without them.");
      }
    } else {
      setContextData(undefined);
      setCurrentInterviewQuestion("Ready to start? Hit record!");
    }
  }, [processContexts, setContextData]);

  const handleToggleSidebar = useCallback(() => toggleSidebar(), [toggleSidebar]);
  const handleTabChange = useCallback((tab: TabId) => setSidebarTab(tab as SidebarTabId), [setSidebarTab]);

  return {
    webcamRef,
    mediaRecorderRef,
    capturing,
    currentInterviewQuestion,
    interviewMessages,
    chatMessages,
    isProcessingAI,
    selectedSkillName,
    showTranscript,
    elapsedTime,
    isChatProcessing,
    savedChats,
    currentChatId,
    currentChatTitle,
    sidebarTab,
    skills,
    session,
    isListening,
    transcript,
    handleStartCapture,
    handleStopCapture,
    handleSendTranscript,
    handleSendChatMessage,
    handleNewChat,
    handleChatSelect,
    handleDeleteChat,
    handleSelectSkill,
    handleToggleSidebar,
    handleTabChange,
    formatTime,
  };
}
