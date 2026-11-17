"use client";

import React, { useState, useEffect } from "react";
import { GraduationCap, Briefcase, Target, Rocket } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "../../i18n/useTranslations";

// Demo content stays in English
const SKILLS = [
  {
    id: "english-coach",
    name: "English Coach",
    description: "Grammar & Fluency",
    icon: GraduationCap,
    activeBg: "bg-stone-900",
    activeText: "text-white",
    iconColor: "text-white",
    prompt: "Let's work on your pronunciation. Repeat after me: 'The squirrel queried the choir'."
  },
  {
    id: "job-interviewer",
    name: "Job Interviewer",
    description: "Behavioral Prep",
    icon: Briefcase,
    activeBg: "bg-stone-900",
    activeText: "text-white",
    iconColor: "text-white",
    prompt: "Tell me about a time you had to manage a conflict within your team."
  },
  {
    id: "debate-partner",
    name: "Debate Partner",
    description: "Critical Thinking",
    icon: Target,
    activeBg: "bg-stone-900",
    activeText: "text-white",
    iconColor: "text-white",
    prompt: "I believe universal basic income is inevitable. Convince me otherwise."
  },
  {
    id: "startup-pitch",
    name: "Startup Pitch",
    description: "YC Style",
    icon: Rocket,
    activeBg: "bg-stone-900",
    activeText: "text-white",
    iconColor: "text-white",
    prompt: "Stop. That's too vague. What is your unfair advantage in one sentence?"
  },
];

export const SkillsAndInterviewSection = React.memo(function SkillsAndInterviewSection() {
  const [activeSkillId, setActiveSkillId] = useState("english-coach");
  const activeSkill = SKILLS.find((s) => s.id === activeSkillId) || SKILLS[0];
  const t = useTranslations();
  
  // Auto-switch carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSkillId((prev) => {
        const currentIndex = SKILLS.findIndex(s => s.id === prev);
        const nextIndex = (currentIndex + 1) % SKILLS.length;
        return SKILLS[nextIndex].id;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="skills" className="py-32 px-6 bg-transparent overflow-hidden w-[90%] mx-auto rounded-[54px]">
      <div className="max-w-4xl mx-auto">
        
        <div className="text-center mb-16">
          <h2 className="text-4xl font-medium text-stone-900 tracking-tight mb-4" style={{ fontFamily: "var(--font-geist-sans)" }}>
            {t.skills.title}
          </h2>
          <p className="text-stone-500 text-lg">
            {t.skills.description}
          </p>
        </div>

        {/* Floating Skill Selector - Flat, no shadows */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {SKILLS.map((skill) => {
             const isActive = activeSkillId === skill.id;
             const Icon = skill.icon;
             
             return (
               <button
                 key={skill.id}
                 onClick={() => setActiveSkillId(skill.id)}
                 className={`
                    flex items-center gap-3 px-5 py-3 rounded-full transition-all duration-300
                    ${isActive 
                      ? `${skill.activeBg} ${skill.activeText}` 
                      : "bg-transparent text-stone-900"
                    }
                 `}
               >
                 <Icon className="w-4 h-4" />
                 <span className="text-sm font-medium">{skill.name}</span>
               </button>
             );
          })}
        </div>

        {/* The "Session" - A purely abstract representation of conversation */}
        <div className="relative">
            
           {/* Active Persona Background Glow - Ambient */}
           <AnimatePresence mode="popLayout">
               <motion.div 
                 key={activeSkillId}
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 0.6 }}
                 exit={{ opacity: 0 }}
                 transition={{ duration: 1 }}
                 className={`absolute inset-0 rounded-full ${activeSkill.activeBg}`}
               />
           </AnimatePresence>

           <div className="relative z-10 bg-white rounded-[3rem] p-12 md:p-20 text-center transition-colors duration-500">


               {/* Dynamic Prompt Text */}
               <div className="h-32 flex items-center justify-center max-w-2xl mx-auto mb-12">
                   <AnimatePresence mode="wait">
                       <motion.p
                         key={activeSkillId}
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         exit={{ opacity: 0, y: -10 }}
                         transition={{ duration: 0.4 }}
                         className="text-2xl md:text-3xl text-stone-900 font-medium leading-snug"
                         style={{ fontFamily: "var(--font-geist-sans)" }}
                       >
                         &quot;{activeSkill.prompt}&quot;
                       </motion.p>
                   </AnimatePresence>
               </div>

               {/* Minimal Controls */}
               <div className="flex flex-col items-center gap-6">
                   {/* Waveform Visualization */}
                   <div className="h-8 flex items-center justify-center gap-1.5 opacity-40">
                       {[...Array(12)].map((_, i) => (
                           <motion.div
                               key={i}
                               className="w-1.5 rounded-full bg-stone-900"
                               animate={{ 
                                   height: [8, 24, 8],
                                   opacity: 1
                               }}
                               transition={{
                                   duration: 0.8,
                                   repeat: Infinity,
                                   delay: i * 0.1,
                                   ease: "easeInOut"
                               }}
                           />
                       ))}
                   </div>
                   
                   <p className="text-xs font-medium text-stone-400 uppercase tracking-widest">
                       Listening...
                   </p>
               </div>

           </div>
        </div>

      </div>
    </section>
  );
});
