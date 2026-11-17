"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/components/ui/popover";

interface DeleteNotePopoverProps {
  children: React.ReactNode;
  onConfirm: () => void;
  title: string;
}

export function DeleteNotePopover({
  children,
  onConfirm,
  title,
}: DeleteNotePopoverProps) {
  const [open, setOpen] = React.useState(false);

  const handleConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    onConfirm();
    setOpen(false);
  };


  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
        {children}
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0 bg-white/10 mr-16 backdrop-blur-sm border-0 shadow-sm rounded-2xl overflow-hidden"
        align="start"
        sideOffset={0}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* Icon Header */}
        <div className="flex items-center justify-center pt-6 pb-3">
          <div className="w-12 h-12 bg-rose-200 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
          </div>
        </div>

        {/* Content */}
        <div className="px-5 pb-5 text-center">
          <h3 className="text-base font-bold text-stone-900 mb-2">
            Delete Note?
          </h3>
          <p className="text-xs text-stone-600 mb-1.5">
            Are you sure you want to delete
          </p>
          <p className="text-xs font-semibold text-stone-900 line-clamp-2 mb-3 px-2">{title}</p>
          <p className="text-[11px] text-stone-500 leading-relaxed">
            This action cannot be undone.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-4 pb-4">
          <button
            onClick={handleConfirm}
            className="flex-1 px-3 py-2 bg-rose-600 text-white font-semibold rounded-md hover:bg-rose-700 transition-colors text-xs"
          >
            Delete
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
