"use client";

import React from "react";
import { useUIStore } from "@/core/store/ui-store";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/core/components/ui/sheet";

interface ResponsivePopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  desktopWidth?: string;
  desktopHeight?: string;
  mobileHeight?: string;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
}

export function ResponsivePopover({
  trigger,
  children,
  open,
  onOpenChange,
  desktopWidth = "w-[420px]",
  desktopHeight = "h-[480px]",
  mobileHeight = "h-[85vh]",
  align = "center",
  side = "bottom",
}: ResponsivePopoverProps) {
  const isMobile = useUIStore((state) => state.isMobile);

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        <SheetContent
          side="bottom"
          className={`${mobileHeight} rounded-t-3xl p-0 overflow-hidden`}
        >
          <div className="h-full overflow-auto">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        className={`${desktopWidth} ${desktopHeight} p-0 overflow-hidden`}
        align={align}
        side={side}
      >
        <div className="h-full overflow-auto">{children}</div>
      </PopoverContent>
    </Popover>
  );
}
