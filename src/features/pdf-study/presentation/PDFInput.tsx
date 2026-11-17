"use client";

import React, { useState, useRef } from "react";
import { ArrowRight, FileUp, X, FileText } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

interface PDFInputProps {
  onProcess: (file: File) => void;
  isProcessing: boolean;
  recentPDFs?: { id: string; title: string; fileName: string; createdAt: Date }[];
  onSelectRecent?: (id: string) => void;
}

export function PDFInput({
  onProcess,
  isProcessing,
  recentPDFs = [],
  onSelectRecent,
}: PDFInputProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        setSelectedFile(file);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (selectedFile && !isProcessing) {
      onProcess(selectedFile);
    }
  };

  return (
    <div data-tour="pdf-input" className="flex flex-col items-center justify-center h-full w-full px-6">
      <motion.div
        animate={{
          y: [0, -20, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="mb-16"
      >
        <Image
          src="/logos/notelab-input.png"
          alt="Notesay Logo"
          width={80}
          height={80}
          className="-rotate-12"
        />
      </motion.div>

      <div className="relative w-full max-w-lg">
        {/* Gradient glow background matching VideoInput */}
        <div className="absolute inset-0 bg-linear-to-t from-violet-200 to-[#dfecc8] blur-md opacity-150 rounded-4xl" />
        
        {/* Main Input Card - Matching VideoInput structure */}
        <div className="relative w-full bg-white border border-stone-50 rounded-4xl p-4">
          <form onSubmit={handleSubmit} className="flex flex-col min-h-[120px]">
             
            {/* Drop Zone - Restyled to match card aesthetic */}
            <div 
                className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all min-h-[140px] relative overflow-hidden group
                    ${dragActive ? "border-[#1b5f4a] bg-stone-50" : "border-stone-100"}
                    ${selectedFile ? "border-solid border-[#1b5f4a]/10 bg-[#fbfdf7]" : "hover:border-stone-200 hover:bg-stone-50/50"}
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
            >
                <input 
                    ref={inputRef}
                    type="file" 
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleChange}
                    disabled={isProcessing}
                />

                {selectedFile ? (
                    <div className="flex flex-col items-center gap-2 p-4 text-center z-10 w-full px-8">
                        <div className="w-10 h-10 bg-[#1b5f4a]/10 rounded-xl flex items-center justify-center text-[#1b5f4a] mb-1">
                            <FileText className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-semibold text-stone-800 truncate w-full">
                            {selectedFile.name}
                        </p>
                        <span className="text-[10px] uppercase tracking-wide font-medium text-stone-400 bg-stone-100 px-2 py-1 rounded-full">
                            {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                        </span>
                        
                        <button 
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFile(null);
                            }}
                            className="absolute top-2 right-2 p-1.5 text-stone-400 hover:text-red-500 hover:bg-stone-100 rounded-full transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 p-6 text-center cursor-pointer">
                        <div className="w-10 h-10 bg-stone-100/80 rounded-full flex items-center justify-center text-stone-400 group-hover:scale-110 transition-transform duration-300">
                            <FileUp className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-medium text-stone-500 max-w-[180px]">
                            Click or drag to upload PDF
                        </p>
                    </div>
                )}
            </div>

            {/* Submit Button Row */}
            <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  disabled={!selectedFile || isProcessing}
                  onClick={handleSubmit}
                  className={`
                  flex items-center justify-center gap-2 px-4 py-3 rounded-full text-xs font-medium transition-all
                  ${
                    selectedFile && !isProcessing
                      ? "bg-[#1b5f4a] text-[#dfecc8] hover:shadow-md hover:scale-105 active:scale-95"
                      : "bg-[#dfecc870] text-[#1b5f4a] cursor-not-allowed"
                  }
                `}
                >
                  {isProcessing ? (
                    <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Processing...</span>
                    </>
                  ) : (
                    <>
                        <span>Start Study</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
            </div>
          </form>
        </div>
      </div>

      {/* Recent PDFs - Matching VideoInput recent items (no border, cleaner) */}
      {recentPDFs.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mt-8 max-w-2xl">
          {recentPDFs.slice(0, 3).map((pdf) => (
            <button
              key={pdf.id}
              onClick={() => onSelectRecent?.(pdf.id)}
              className="flex items-center gap-2 px-4 py-2 bg-stone-100 rounded-lg text-xs font-medium text-stone-600 transition-colors hover:bg-stone-200"
            >
              <div className="w-3.5 h-3.5 shrink-0 text-stone-400">
                 <FileText className="w-full h-full" />
              </div>
              <span className="truncate max-w-[150px]">{pdf.title || pdf.fileName}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
