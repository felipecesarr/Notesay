"use client";

import React from "react";
import Image from "next/image";
import { useTranslations } from "../../i18n/useTranslations";

interface FooterProps {
  onSignInClick?: () => void;
  onGetStartedClick?: () => void;
}

export function Footer({ onSignInClick }: FooterProps) {
  const t = useTranslations();

  return (
    <footer className="py-20 px-6 relative z-10 border-t border-stone-200/30">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
            <Image
                src="/logos/notelab-main.png"
                alt="Notesay AI"
                width={32}
                height={32}
                className="opacity-90"
            />
            <span className="text-xl font-bold text-stone-900" style={{ fontFamily: "Videotype, sans-serif" }}>
                Notesay AI
            </span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors">{t.header.features}</a>
            <a href="#pricing" className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors">{t.header.pricing}</a>
            <button 
                onClick={onSignInClick}
                className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
            >
                {t.header.login}
            </button>
        </div>

        {/* Copyright */}
        <p className="text-xs text-stone-500 font-medium">
            © {new Date().getFullYear()} Notesay AI. {t.footer.allRightsReserved}
        </p>

      </div>
    </footer>
  );
}
