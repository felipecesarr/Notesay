"use client";

import React, { useState } from "react";
import { Check, Gift, Copy, Loader2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "../../i18n/useTranslations";

interface PricingSectionProps {
  onGetStartedClick?: () => void;
}

export const PricingSection = React.memo(function PricingSection({ onGetStartedClick }: PricingSectionProps) {
  const [couponState, setCouponState] = useState<"idle" | "generating" | "revealed">("idle");
  const [copied, setCopied] = useState(false);
  const t = useTranslations();

  const handleGenerateCoupon = React.useCallback(() => {
    setCouponState("generating");
    const timer = setTimeout(() => {
      setCouponState("revealed");
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleCopyCoupon = React.useCallback(async () => {
    try {
        if (navigator?.clipboard?.writeText) {
             await navigator.clipboard.writeText("HELLONOTESAY20");
             setCopied(true);
             const timer = setTimeout(() => setCopied(false), 2000);
             return () => clearTimeout(timer);
        }
    } catch (err) {
        console.error("Failed to copy");
    }
  }, []);

  return (
    <section id="pricing" className="py-24 px-6 relative z-10 w-full max-w-7xl mx-auto">
       <div className="text-center mb-16">
          <h2 className="text-4xl font-normal text-stone-900 mb-6 tracking-tight" style={{ fontFamily: "var(--font-geist-sans)" }}>
            {t.pricing.title}
          </h2>
          <p className="text-lg text-black max-w-2xl mx-auto">
            {t.pricing.description}
          </p>
       </div>

       <div className="max-w-5xl mx-auto">
          {/* Horizontal Minimal Card - Flat Stone-900 (Dark Theme) */}
          <div className="rounded-[3rem] bg-stone-900/20 text-black overflow-hidden relative">
             
             <div className="grid lg:grid-cols-5 relative z-10">
                
                {/* Left: Features & Value */}
                <div className="lg:col-span-3 p-10 md:p-14 border-b lg:border-b-0 lg:border-r border-white/5">
                    
                    <h3 className="text-3xl font-medium mb-8 leading-tight tracking-tight">
                        {t.pricing.unlimitedAccess} <br/> {t.pricing.zeroLimits}
                    </h3>
                    
                    <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8 mb-12">
                        {t.pricing.features.map((feature) => (
                            <div key={feature} className="flex items-start gap-3 text-black text-sm font-medium">
                                <div className="w-4 h-4 rounded-full bg-black/40 flex items-center justify-center shrink-0 mt-0.5">
                                    <Check className="w-2.5 h-2.5 text-white" />
                                </div>
                                {feature}
                            </div>
                        ))}
                    </div>

                    {/* Minimal Coupon Area */}
                    <div className="bg-stone-800/30 rounded-xl p-5 border border-white/5">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-stone-900/30 flex items-center justify-center shrink-0">
                                    <Gift className="w-4 h-4 text-stone-300" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">{t.pricing.firstYearDiscount}</p>
                                    <p className="text-xs text-white">{t.pricing.save20}</p>
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                {couponState === "idle" ? (
                                    <motion.button 
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        onClick={handleGenerateCoupon}
                                        className="px-4 py-2 bg-white text-stone-900 rounded-lg text-xs font-bold hover:bg-stone-200 transition-colors"
                                    >
                                        {t.pricing.revealCode}
                                    </motion.button>
                                ) : couponState === "generating" ? (
                                    <motion.div 
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="px-4 py-2"
                                    >
                                        <Loader2 className="w-4 h-4 animate-spin text-stone-400" />
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                        className="flex items-center gap-2 bg-stone-950 rounded-lg p-1 pr-3 border border-stone-700"
                                    >
                                        <div className="px-2 py-1 font-mono text-sm tracking-wider font-regular bg-linear-to-r from-[#dfecc8] to-[#C4B4FF] bg-clip-text text-transparent">
                                            HELLONOTESAY20
                                        </div>
                                        <button 
                                            onClick={handleCopyCoupon}
                                            className="text-stone-500 hover:text-white transition-colors"
                                        >
                                            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Right: Price & CTA - Clean & Dark */}
                <div className="lg:col-span-2 p-10 md:p-14 bg-stone-900/20 flex flex-col justify-center items-center text-center relative">
                    <div className="mb-2 text-white text-xs font-bold uppercase tracking-widest">{t.pricing.monthlyMembership}</div>
                    
                    <div className="flex flex-col items-center mb-10">
                         <div className="flex items-center justify-center gap-2">
                             {couponState === "revealed" ? (
                                 <>
                                     <span className="text-2xl text-stone-600 line-through font-medium opacity-60">$20</span>
                                     <span className="text-6xl font-medium text-white tracking-tighter">$16</span>
                                 </>
                             ) : (
                                 <span className="text-6xl font-medium text-white tracking-tighter">$20</span>
                             )}
                         </div>
                         <span className="text-stone-500 text-lg mt-1">{t.pricing.month}</span>
                         
                         {couponState === "revealed" && (
                             <p className="text-xs mt-2 font-medium bg-stone-900 px-3 py-1 rounded-full border border-stone-800">
                                <span className="bg-linear-to-r from-[#dfecc8] to-[#C4B4FF] bg-clip-text text-transparent">
                                    {t.pricing.offApplied}
                                </span>
                             </p>
                         )}
                    </div>
                    
                    {/* BUTTON MATCHING HEADER UI (Adapted for Dark Mode) */}
                    <button 
                        onClick={onGetStartedClick}
                        className="w-full py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition-all flex items-center justify-center gap-2 group border border-white/5"
                    >
                        {t.pricing.startNow}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                    
                    <p className="text-[10px] text-white mt-6 font-medium">
                        {t.pricing.securePayment}
                    </p>
                </div>

             </div>
          </div>
       </div>
    </section>
  );
});
