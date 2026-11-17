"use client";

import React from "react";
import Webcam from "react-webcam";
import { InterviewLayout } from "./InterviewLayout";
import { useInterviewSession } from "./hooks/useInterviewSession";

export default function InterviewSession() {
  const {
    webcamRef,
    // mediaRecorderRef, // Not needed in Layout?
    capturing,
    currentInterviewQuestion,
    // interviewMessages, // Not passed to Layout?
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
  } = useInterviewSession();

  return (
    <InterviewLayout
      selectedSkillName={selectedSkillName}
      transcript={transcript}
      chatMessages={chatMessages}
      savedChats={savedChats}
      currentChatId={currentChatId}
      currentChatTitle={currentChatTitle}
      sidebarTab={sidebarTab}
      showTranscript={showTranscript}
      capturing={capturing}
      elapsedTime={elapsedTime}
      currentInterviewQuestion={currentInterviewQuestion}
      isProcessingAI={isProcessingAI}
      isChatProcessing={isChatProcessing}
      webcamRef={webcamRef as React.RefObject<Webcam>}
      userImage={(session?.user as { image?: string | null })?.image || undefined}
      skills={skills}
      isListening={isListening}
      onSelectSkill={handleSelectSkill}
      onSendChatMessage={handleSendChatMessage}
      onStartCapture={handleStartCapture}
      onStopCapture={handleStopCapture}
      onToggleSidebar={handleToggleSidebar}
      onSendTranscript={handleSendTranscript}
      onTabChange={handleTabChange}
      onNewChat={handleNewChat}
      onChatSelect={handleChatSelect}
      onDeleteChat={handleDeleteChat}
      formatTime={formatTime}
    />
  );
}
