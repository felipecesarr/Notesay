"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/core/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
import { useLanguageStore, type Language } from "../store/language-store";
import { useTranslations } from "../i18n/useTranslations";

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: "en", label: "EN", flag: "🇺🇸" },
  { code: "pt", label: "PT", flag: "🇧🇷" },
  { code: "es", label: "ES", flag: "🇪🇸" },
  { code: "it", label: "IT", flag: "🇮🇹" },
  { code: "fr", label: "FR", flag: "🇫🇷" },
  { code: "de", label: "DE", flag: "🇩🇪" },
];

interface HeaderProps {
  onSignInClick: () => void;
  onGetStartedClick: () => void;
}

export const Header = React.memo(function Header({ onGetStartedClick }: HeaderProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const { language, setLanguage } = useLanguageStore();
  const t = useTranslations();

  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-transparent"
    >
      <div className="max-w-auto mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo + Nav */}
          <div className="flex items-center gap-8 bg-transparent hover:bg-stone-900/10 text-stone-900 backdrop-blur-sm rounded-full px-4 py-2 transition-colors">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <Image
                src="/logos/notelab-main.png"
                alt="Notesay AI"
                width={28}
                height={28}
              />
              <span
                className="text-lg font-bold text-stone-900"
                style={{ fontFamily: "Videotype, sans-serif" }}
              >
                Notesay AI
              </span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm text-stone-800 hover:text-stone-900 transition-colors">
                {t.header.features}
              </a>
              <a href="#skills" className="text-sm text-stone-800 hover:text-stone-900 transition-colors">
                {t.header.skills}
              </a>
              <a href="#pricing" className="text-sm text-stone-800 hover:text-stone-900 transition-colors">
                {t.header.pricing}
              </a>
              <a href="#faq" className="text-sm text-stone-800 hover:text-stone-900 transition-colors">
                {t.header.faq}
              </a>
            </nav>
          </div>

          {/* Right: Language + CTA */}
          <div className="hidden md:flex items-center gap-2">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-stone-900/5 hover:bg-stone-900/10 transition-colors text-sm"
              >
                <span>{currentLang.flag}</span>
                <span className="text-stone-700 font-medium">{currentLang.label}</span>
                <ChevronDown className="w-3 h-3 text-stone-500" />
              </button>

              {isLangOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsLangOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-stone-100 py-1 z-50 min-w-[120px]">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setIsLangOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-stone-50 transition-colors ${
                          language === lang.code ? "bg-stone-100" : ""
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span className="text-stone-700">{lang.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <Button
              onClick={onGetStartedClick}
              className="bg-stone-900/10 hover:bg-stone-900/20 text-stone-900 text-sm font-medium px-5 py-2 rounded-full"
            >
              {t.header.getStarted}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="md:hidden p-2 text-stone-600"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div className="md:hidden bg-white border-t border-stone-100 px-6 py-4 space-y-4">
          <a href="#features" className="block text-stone-600 py-2">{t.header.features}</a>
          <a href="#skills" className="block text-stone-600 py-2">{t.header.skills}</a>
          <a href="#pricing" className="block text-stone-600 py-2">{t.header.pricing}</a>
          <a href="#faq" className="block text-stone-600 py-2">{t.header.faq}</a>
          
          {/* Mobile Language Selector */}
          <div className="flex flex-wrap gap-2 py-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${
                  language === lang.code
                    ? "bg-stone-900 text-white"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>

          <Button
            onClick={onGetStartedClick}
            className="w-full bg-stone-900 text-white rounded-full mt-2"
          >
            {t.header.getStarted}
          </Button>
        </div>
      )}
    </header>
  );
});
