"use client";

import { Video, Youtube, FileText, MessageCircle } from "lucide-react";
import { useUIStore, MobileTabId } from "@/core/store/ui-store";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const { mobileActiveTab, setMobileActiveTab } = useUIStore();

  const tabs: { id: MobileTabId; label: string; icon: typeof Video }[] = [
    { id: "camera", label: "Camera", icon: Video },
    { id: "youtube", label: "YouTube", icon: Youtube },
    { id: "pdf", label: "PDF", icon: FileText },
    { id: "chat", label: "Chat", icon: MessageCircle },
  ];

  return (
    <nav data-tour="mobile-nav" className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-stone-200 safe-area-pb">
      <div className="flex items-center justify-around h-16">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            data-tour={`mobile-${id}`}
            onClick={() => setMobileActiveTab(id)}
            className={cn(
              "flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors",
              mobileActiveTab === id
                ? "text-[#1b5f4a] bg-[#dfecc870]"
                : "text-stone-400 hover:text-stone-600"
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
