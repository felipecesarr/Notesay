"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/components/ui/popover";

interface DeleteConfirmPopoverProps {
  children: React.ReactNode;
  onConfirm: () => void;
  title: string;
}

export function DeleteConfirmPopover({
  children,
  onConfirm,
  title,
}: DeleteConfirmPopoverProps) {
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
        className="w-80 p-0 bg-white/70 backdrop-blur-md border-0 shadow-xl rounded-2xl overflow-hidden"
        align="center"
        sideOffset={8}
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
            Delete Video?
          </h3>
          <p className="text-xs text-stone-600 mb-1.5">
            Are you sure you want to delete
          </p>
          <p className="text-xs font-semibold text-stone-900 line-clamp-2 mb-3 px-2">
            &quot;{title}&quot;
          </p>
          <p className="text-[11px] text-stone-500 leading-relaxed">
            This action cannot be undone. All progress will be lost.
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
