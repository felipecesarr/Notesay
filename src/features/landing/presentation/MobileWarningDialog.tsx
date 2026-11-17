"use client";

import React, { useEffect, useState } from "react";
import { Laptop } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/core/components/ui/dialog";
import { Button } from "@/core/components/ui/button";

export function MobileWarningDialog() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      const isMobile = window.innerWidth <= 768; // Tailwind md breakpoint
      // Also check user agent for stricter detection if desired, 
      // but screen width is usually sufficient for layout warnings
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile || isMobileUA) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-sm rounded-4xl p-8 text-center bg-white border-none shadow-2xl [&>button]:hidden">
        <DialogTitle className="sr-only">Mobile Warning</DialogTitle>
        
        <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center">
                <Laptop className="w-8 h-8 text-stone-900" />
            </div>
        </div>

        <h3 className="text-xl font-bold text-stone-900 mb-3" style={{ fontFamily: "var(--font-geist-sans)" }}>
            Please Use a Desktop
        </h3>
        
        <p className="text-stone-500 text-sm leading-relaxed mb-8">
            Notesay AI is designed for a full-screen desktop experience to ensure the best practice session quality.
        </p>

        <Button 
            onClick={() => setIsOpen(false)}
            variant="outline" 
            className="w-full rounded-full border-stone-200 text-stone-500 hover:bg-stone-50 hover:text-stone-900 transition-colors"
        >
            Continue Anyway
        </Button>
      </DialogContent>
    </Dialog>
  );
}
