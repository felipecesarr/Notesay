"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

interface Skill {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  isCustom: boolean;
}

interface SkillSelectionPopoverProps {
  skills: Skill[];
  selectedSkillId: string | null;
  onSelectSkill: (skillId: string | null) => void;
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement>;
}

export function SkillSelectionPopover({
  skills,
  selectedSkillId,
  onSelectSkill,
  isOpen,
  onClose,
}: SkillSelectionPopoverProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Popover */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="absolute bottom-full left-0 mb-2 z-50 w-72 max-h-80 bg-white/10 backdrop-blur-sm rounded-xl border border-stone-200/50 shadow-lg overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Skills List */}
          <div className="overflow-y-auto max-h-80 scrollbar-hide">
            {skills.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <p className="text-xs text-stone-400 text-center">
                  No skills available
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {skills.map((skill) => {
                  const isSelected = selectedSkillId === skill.id;
                  const Icon = skill.icon;

                  return (
                    <button
                      key={skill.id}
                      onClick={() => {
                        onSelectSkill(isSelected ? null : skill.id);
                        onClose();
                      }}
                      className="w-full flex items-center gap-3 p-2.5 rounded-md bg-transparent hover:bg-stone-200/40 transition-all"
                    >
                      {/* Skill Icon */}
                      <div className="shrink-0 w-4 h-4 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-stone-600" />
                      </div>

                      {/* Skill Name */}
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-[10px] font-medium text-stone-700 truncate">
                          {skill.name}
                        </p>
                      </div>

                      {/* Checkmark */}
                      {isSelected && (
                        <div className="shrink-0 w-3.5 h-3.5 p-0.5 bg-stone-200 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-stone-600" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
