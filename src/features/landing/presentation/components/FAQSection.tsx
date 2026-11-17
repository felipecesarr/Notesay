"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "../../i18n/useTranslations";

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
  index: number;
}

function FAQItem({ question, answer, isOpen, onClick, index }: FAQItemProps) {
  return (
    <div className="border-b border-white/5 last:border-b-0">
      <button
        onClick={onClick}
        className="w-full py-6 px-6 md:px-8 flex items-center justify-between text-left hover:bg-white/5 rounded-2xl transition-colors group"
      >
        <div className="flex items-center gap-4 pr-4">
          <span className="text-sm font-bold bg-gradient-to-r from-[#dfecc8] to-[#C4B4FF] bg-clip-text text-transparent">
            {/* {String(index + 1).padStart(2, "0")} */}
          </span>
          <span className="text-lg font-medium text-black group-hover:text-stone-700 transition-colors">
            {question}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <ChevronDown className="w-5 h-5 text-stone-500" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 md:px-8 pb-6 pl-[4.5rem]">
              <p className="text-stone-600 leading-relaxed">{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export const FAQSection = React.memo(function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const t = useTranslations();

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const questions = [
    t.faq.questions.q1,
    t.faq.questions.q2,
    t.faq.questions.q3,
    t.faq.questions.q4,
    t.faq.questions.q5,
    t.faq.questions.q6,
    t.faq.questions.q7,
    t.faq.questions.q8,
    t.faq.questions.q9,
    t.faq.questions.q10,
  ];

  return (
    <section id="faq" className="py-24 px-6 relative z-10 w-full max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2
          className="text-4xl font-normal text-stone-900 mb-6 tracking-tight"
          style={{ fontFamily: "var(--font-geist-sans)" }}
        >
          {t.faq.title}
        </h2>
        <p className="text-lg text-black max-w-2xl mx-auto">{t.faq.subtitle}</p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="rounded-[3rem] bg-stone-900/20 overflow-hidden">
          <div className="p-4 md:p-6">
            {questions.map((item, index) => (
              <FAQItem
                key={index}
                question={item.question}
                answer={item.answer}
                isOpen={openIndex === index}
                onClick={() => handleToggle(index)}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});
