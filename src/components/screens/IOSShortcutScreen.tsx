"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeftIcon } from "@/lib/icons";
import { useT } from "@/lib/i18n";

const SHORTCUT_URL = "https://want-l-ist.vercel.app/?shared_url=";

export default function IOSShortcutScreen({ onClose }: { onClose: () => void }) {
  const t = useT();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SHORTCUT_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const steps = [
    {
      num: 1,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      ),
      title: t("shortcut.step1"),
      desc: null,
    },
    {
      num: 2,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      ),
      title: t("shortcut.step2"),
      desc: null,
    },
    {
      num: 3,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      ),
      title: t("shortcut.step3"),
      desc: null,
    },
    {
      num: 4,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="4 7 4 4 20 4 20 7" />
          <line x1="9" y1="20" x2="15" y2="20" />
          <line x1="12" y1="4" x2="12" y2="20" />
        </svg>
      ),
      title: t("shortcut.step4title"),
      desc: t("shortcut.step4desc"),
    },
    {
      num: 5,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      ),
      title: t("shortcut.step5title"),
      desc: t("shortcut.step5desc"),
    },
    {
      num: 6,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
      ),
      title: t("shortcut.step6title"),
      desc: t("shortcut.step6desc"),
    },
  ];

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 300 }}
      className="fixed inset-0 z-[60] bg-background flex flex-col"
    >
      {/* Header */}
      <div className="px-5 safe-top flex items-center gap-3 py-3">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-card-bg shadow-card flex items-center justify-center"
        >
          <ArrowLeftIcon className="text-foreground w-5 h-5" />
        </motion.button>
        <h1 className="text-[20px] font-bold text-foreground">{t("shortcut.title")}</h1>
      </div>

      <div className="flex-1 overflow-y-auto scrollable px-5 pb-32">
        {/* Intro Card */}
        <div className="mt-4 bg-gradient-to-br from-[#1A1D2E] to-[#2D3147] rounded-3xl p-5 text-white relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
              {/* Shortcuts icon */}
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" rx="1.5" fill="#FF6482" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" fill="#47C2FF" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" fill="#47C2FF" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" fill="#FF6482" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-bold text-[16px]">{t("shortcut.subtitle")}</p>
              <p className="text-white/60 text-[13px] mt-1">{t("shortcut.intro")}</p>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="mt-6 space-y-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-card-bg rounded-2xl p-4 shadow-card flex items-start gap-4"
            >
              {/* Step number */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-[14px]"
                style={{ backgroundColor: "var(--accent-color, #E93D5D)" }}
              >
                {step.num}
              </div>
              {/* Icon */}
              <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center flex-shrink-0 text-foreground">
                {step.icon}
              </div>
              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[14px] text-foreground leading-snug">{step.title}</p>
                {step.desc && (
                  <p className="text-text-muted text-[12px] mt-1 leading-relaxed">{step.desc}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* URL to copy */}
        <div className="mt-6">
          <label className="text-[11px] font-bold tracking-wider uppercase text-text-muted mb-2 block">
            URL
          </label>
          <div className="bg-card-bg rounded-2xl shadow-card p-4 flex items-center gap-3">
            <code className="flex-1 text-[12px] text-foreground font-mono break-all leading-relaxed">
              {SHORTCUT_URL}
            </code>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleCopy}
              className="px-4 py-2 rounded-xl text-white text-[13px] font-bold flex-shrink-0"
              style={{ backgroundColor: copied ? "#22C55E" : "var(--accent-color, #E93D5D)" }}
            >
              {copied ? (
                <span className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {t("shortcut.copied")}
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                  {t("shortcut.copyUrl")}
                </span>
              )}
            </motion.button>
          </div>
        </div>

        {/* Done message */}
        <div className="mt-6 bg-accent/10 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color, #E93D5D)" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="text-[13px] text-foreground leading-relaxed flex-1">
            {t("shortcut.done")}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
