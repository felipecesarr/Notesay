import React from "react";
import { Trash2, X, Edit2, MoreHorizontal } from "lucide-react";
import { ICON_MAP } from "./constants";
import { Skill } from "./types";

interface SkillCardProps {
  skill: Skill;
  isSelected?: boolean;
  isExpanded: boolean;
  isDeleting: boolean;
  onSelect: () => void;
  onExpand: () => void;
  onCollapse: () => void;
  onEdit: () => void;
  onDeleteStart: () => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
}

export const SkillCard = React.memo(({
  skill,
  isExpanded,
  isDeleting,
  onSelect,
  onExpand,
  onCollapse,
  onEdit,
  onDeleteStart,
  onDeleteConfirm,
  onDeleteCancel
}: SkillCardProps) => {
  const IconComponent = ICON_MAP[skill.icon] || ICON_MAP.Sparkles;

  return (
    <div className="relative group m-2">
      {isDeleting ? (
        // Delete Confirmation
        <div className="flex flex-col justify-between p-3 rounded-xl h-28 bg-red-50/40">
          <p className="text-[10px] font-medium text-red-700">
            Delete this skill?
          </p>
          <div className="flex gap-1 mt-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteConfirm();
              }}
              className="flex-1 p-1.5 hover:bg-red-100 rounded text-red-600 transition-colors text-xs font-medium"
              title="Confirm delete"
            >
              <Trash2 className="w-3 h-3 mx-auto" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteCancel();
              }}
              className="flex-1 p-1.5 hover:bg-stone-100 rounded text-stone-500 transition-colors text-xs font-medium"
              title="Cancel"
            >
              <X className="w-3 h-3 mx-auto" />
            </button>
          </div>
        </div>
      ) : (
        // Normal Skill Card
        <div
          onClick={onSelect}
          className="flex flex-col justify-between p-3 rounded-xl cursor-pointer bg-white shadow-sm shadow-stone-200 h-28 hover:shadow-md transition-all border border-transparent hover:border-stone-200"
        >
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#defcc8] text-[#1b5f4a]">
              <IconComponent className="w-3.5 h-3.5" />
            </div>
            
            {/* Ellipsis that expands inline */}
            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {isExpanded ? (
                // Expanded: Edit/Delete/Cancel buttons
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCollapse();
                      onEdit();
                    }}
                    className="p-1 hover:bg-stone-100 rounded text-stone-500 hover:text-stone-700 transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCollapse();
                      onDeleteStart();
                    }}
                    className="p-1 hover:bg-rose-50 rounded text-stone-500 hover:text-rose-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCollapse();
                    }}
                    className="p-1 hover:bg-stone-100 rounded text-stone-500 hover:text-stone-700 transition-colors"
                    title="Cancel"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </>
              ) : (
                // Collapsed: Just ellipsis
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onExpand();
                  }}
                  className="p-1 hover:bg-stone-100 rounded text-stone-400 hover:text-stone-600 transition-colors"
                  title="Options"
                >
                  <MoreHorizontal className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto">
            <h3 className="font-semibold text-stone-900 text-[11px] leading-tight mb-0.5 truncate">
              {skill.name}
            </h3>
            <p className="text-[9px] text-stone-400 font-medium leading-tight line-clamp-1">
              {skill.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
});

SkillCard.displayName = "SkillCard";
