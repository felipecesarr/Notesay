"use client";

import { useState } from "react";
import { Cog } from "lucide-react";
import Image from "next/image";
import { ResponsivePopover } from "./ResponsivePopover";
import { SettingsPopover } from "@/features/auth/presentation/SettingsPopover";
import { Button } from "@/core/components/ui/button";

export function MobileHeader() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border border-stone-100 shrink-0 rounded-lg">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Image src="/logos/notelab-main.png" alt="Notesay" width={24} height={24} />
        <span className="text-sm font-bold text-stone-800" style={{ fontFamily: 'Videotype, sans-serif' }}>
          Notesay
        </span>
      </div>

      {/* Settings Button */}
      <ResponsivePopover
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        trigger={
          <Button variant="ghost" size="icon" className="text-stone-500 hover:bg-[#dfecc8]! w-8 h-8">
            <Cog className="w-5 h-5" />
          </Button>
        }
        desktopWidth="w-[320px]"
        desktopHeight="h-[400px]"
        mobileHeight="h-[70vh]"
      >
        <SettingsPopover onClose={() => setSettingsOpen(false)} />
      </ResponsivePopover>
    </header>
  );
}
