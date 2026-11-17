"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, ChevronRight, ChevronDown, Check, AlertTriangle, Lightbulb, RefreshCw } from 'lucide-react';
import { useFeedbackSummary } from '@/features/feedback/hooks/useFeedbackSummary';
import { type ChatMessage } from '@/features/chat/procedure';

interface FeedbackSection {
    title: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    items: string[];
}

export function FeedbackSummaryModal({ isOpen, onClose, chatId, messages }: { isOpen: boolean; onClose: () => void; chatId?: string; messages?: ChatMessage[] }) {
    // Extract user messages content if provided
    const userMessages = useMemo(() => 
        messages ? messages.filter(m => m.role === 'user').map(m => m.content) : undefined,
    [messages]);

    // Fetch summary using TanStack Query
    const { data: summary, isLoading: loading, error: queryError, refetch } = useFeedbackSummary(
        isOpen ? chatId : undefined,
        isOpen ? userMessages : undefined
    );
    
    const error = queryError instanceof Error ? queryError.message : (queryError ? String(queryError) : null);
    
    // Expand/collapse state for each section
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        strengths: true,
        errors: false,
        improve: false,
    });

    const toggleSection = useCallback((key: string) => {
        setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
    }, []);

    const handleRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    // Parse the markdown into sections
    const sections = useMemo((): FeedbackSection[] => {
        if (!summary) return [];
        
        const result: FeedbackSection[] = [];
        // Split by markdown headers (## Title)
        const parts = summary.split(/##\s+([^\n]+)/);
        
        for (let i = 1; i < parts.length; i += 2) {
            const title = parts[i]?.trim() || '';
            const content = parts[i + 1]?.trim() || '';
            
            const items = content
                .split('\n')
                .map((line: string) => line.replace(/^[-•]\s*/, '').trim())
                .filter((line: string) => line.length > 0);
            
            if (items.length === 0) continue;
            
            // Determine section type and styling
            let icon: React.ReactNode = <Check className="w-3 h-3" />;
            let color = 'text-[#1b5f4a]';
            let bgColor = 'bg-[#defcc8]';
            
            const lowerTitle = title.toLowerCase();
            if (lowerTitle.includes('error') || lowerTitle.includes('mistake') || lowerTitle.includes('wrong')) {
                icon = <AlertTriangle className="w-3 h-3" />;
                color = 'text-amber-700';
                bgColor = 'bg-amber-100';
            } else if (lowerTitle.includes('better') || lowerTitle.includes('improve') || lowerTitle.includes('tip')) {
                icon = <Lightbulb className="w-3 h-3" />;
                color = 'text-violet-700';
                bgColor = 'bg-violet-100';
            }
            
            result.push({ title, icon, color, bgColor, items });
        }
        
        return result;
    }, [summary]);

    if (!isOpen) return null;

    return (
        <div 
            className="absolute top-14 right-3 w-[340px] max-h-[80vh] z-50 bg-white rounded-lg shadow-lg border border-stone-200/60 flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-stone-100">
                <span className="text-[11px] font-medium text-stone-500">Quick Review</span>
                <div className="flex items-center gap-1">
                    <button 
                        onClick={handleRefresh}
                        disabled={loading}
                        className="p-1 hover:bg-stone-100 rounded transition-colors text-stone-400 hover:text-stone-600 disabled:opacity-50"
                        title="Refresh"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button 
                        onClick={onClose} 
                        className="p-1 hover:bg-stone-100 rounded transition-colors text-stone-400 hover:text-stone-600"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-stone-300" />
                        <p className="text-[10px] text-stone-400">Analyzing...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                        <p className="text-[10px] text-stone-500 text-center">{error}</p>
                    </div>
                ) : sections.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 gap-2">
                        <Check className="w-5 h-5 text-stone-300" />
                        <p className="text-[10px] text-stone-400 text-center">{summary || "No feedback yet."}</p>
                    </div>
                ) : (
                    <div className="p-2 space-y-1">
                        {sections.map((section, idx) => {
                            const sectionKey = section.title.toLowerCase().includes('error') ? 'errors' 
                                : section.title.toLowerCase().includes('better') ? 'improve' 
                                : 'strengths';
                            const isExpanded = expandedSections[sectionKey] ?? true;
                            
                            return (
                                <div key={idx}>
                                    {/* Section Header - Collapsible */}
                                    <button
                                        onClick={() => toggleSection(sectionKey)}
                                        className="w-full flex items-center gap-2 px-2 py-2 hover:bg-stone-50 rounded-md transition-colors"
                                    >
                                        {/* Chevron */}
                                        {isExpanded ? (
                                            <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                                        ) : (
                                            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                                        )}
                                        
                                        {/* Badge with Icon */}
                                        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded ${section.bgColor} ${section.color}`}>
                                            {section.icon}
                                            <span className="text-[10px] font-semibold">{section.title}</span>
                                        </div>
                                        
                                        {/* Count */}
                                        <span className="text-[9px] text-stone-400 ml-auto">{section.items.length}</span>
                                    </button>
                                    
                                    {/* Section Content - Animated */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.15 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="pl-7 pr-2 pb-2 space-y-2 mt-2">
                                                    {section.items.map((item, itemIdx) => {
                                                        const isStrengths = sectionKey === 'strengths';
                                                        
                                                        if (isStrengths) {
                                                            // Strengths: Simple text with bold for quoted parts
                                                            return (
                                                                <div key={itemIdx} className="text-[11px] text-stone-600 leading-relaxed flex items-start gap-2">
                                                                    <span className="text-stone-300 mt-0.5">•</span>
                                                                    <span>
                                                                        {item.split(/(\*[^*]+\*|"[^"]+"|'[^']+')/g).map((part, partIdx) => {
                                                                            if ((part.startsWith('*') && part.endsWith('*')) ||
                                                                                (part.startsWith('"') && part.endsWith('"')) ||
                                                                                (part.startsWith("'") && part.endsWith("'"))) {
                                                                                const clean = part.replace(/^[*"']|[*"']$/g, '');
                                                                                return <strong key={partIdx} className="font-semibold text-stone-700">{clean}</strong>;
                                                                            }
                                                                            return <span key={partIdx}>{part}</span>;
                                                                        })}
                                                                    </span>
                                                                </div>
                                                            );
                                                        }
                                                        
                                                        // Errors / Could be better: Card style with wrong → correct
                                                        const hasCorrection = item.includes('→') || item.includes('->');
                                                        
                                                        if (hasCorrection) {
                                                            const [wrongPart, rightPart] = item.split(/→|->/).map(s => s.trim());
                                                            const wrongText = wrongPart?.replace(/~~|^\*|\*$/g, '').replace(/^[-•]\s*/, '').trim() || '';
                                                            
                                                            // Parse right part for correction and explanation
                                                            const explanationMatch = rightPart?.match(/(.+?)\s*[-—–]\s*(.+)$/);
                                                            const correctText = explanationMatch ? explanationMatch[1].replace(/\*/g, '').trim() : rightPart?.replace(/\*/g, '').trim() || '';
                                                            const explanation = explanationMatch ? explanationMatch[2].trim() : '';
                                                            
                                                            return (
                                                                <div key={itemIdx} className="bg-stone-50 rounded-md p-2.5 space-y-1 mt-2">
                                                                    <div className="flex items-center gap-2 text-[10px]">
                                                                        <span className="text-rose-400">✗</span>
                                                                        <span className="text-rose-500 font-serif">{wrongText}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 text-[10px]">
                                                                        <span className="text-emerald-500">✓</span>
                                                                        <span className="text-[#1b5f4a] font-medium">{correctText}</span>
                                                                    </div>
                                                                    {explanation && (
                                                                        <p className="text-[9px] text-stone-400 pl-4 italic">{explanation}</p>
                                                                    )}
                                                                </div>
                                                            );
                                                        }
                                                        
                                                        // Fallback: regular bullet
                                                        return (
                                                            <div key={itemIdx} className="text-[11px] text-stone-600 leading-relaxed flex items-start gap-2">
                                                                <span className="text-stone-300 mt-0.5">•</span>
                                                                <span>{item}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
