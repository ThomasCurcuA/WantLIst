"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeftIcon } from "@/lib/icons";
import { useT, useLanguage, type Language } from "@/lib/i18n";

const ACCENT_COLORS = [
  { nameKey: "color.rose", value: "#E93D5D" },
  { nameKey: "color.blue", value: "#3B82F6" },
  { nameKey: "color.purple", value: "#8B5CF6" },
  { nameKey: "color.green", value: "#22C55E" },
  { nameKey: "color.amber", value: "#F59E0B" },
  { nameKey: "color.teal", value: "#14B8A6" },
  { nameKey: "color.indigo", value: "#6366F1" },
  { nameKey: "color.slate", value: "#64748B" },
];

const CARD_STYLES = [
  { nameKey: "style.rounded", value: "24px" },
  { nameKey: "style.soft", value: "16px" },
  { nameKey: "style.sharp", value: "8px" },
];

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
];

type ThemeMode = "light" | "dark";

const STORAGE_KEY = "wantlist-theme";

interface ThemeSettings {
  accentColor: string;
  cardRadius: string;
  mode: ThemeMode;
}

function getStoredTheme(): ThemeSettings {
  if (typeof window === "undefined") return { accentColor: "#E93D5D", cardRadius: "24px", mode: "light" };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        accentColor: parsed.accentColor || "#E93D5D",
        cardRadius: parsed.cardRadius || "24px",
        mode: parsed.mode || "light",
      };
    }
  } catch { /* ignore */ }
  return { accentColor: "#E93D5D", cardRadius: "24px", mode: "light" };
}

export function applyTheme(theme: ThemeSettings) {
  if (typeof document === "undefined") return;
  document.documentElement.style.setProperty("--accent-color", theme.accentColor);
  document.documentElement.style.setProperty("--card-radius", theme.cardRadius);
  if (theme.mode === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
}

export function loadThemeFromStorage() {
  const theme = getStoredTheme();
  applyTheme(theme);
}

export default function AppearanceScreen({ onClose }: { onClose: () => void }) {
  const t = useT();
  const { language, setLanguage } = useLanguage();
  const stored = getStoredTheme();

  const [accentColor, setAccentColor] = useState(stored.accentColor);
  const [cardRadius, setCardRadius] = useState(stored.cardRadius);
  const [themeMode, setThemeMode] = useState<ThemeMode>(stored.mode);
  const [pendingLang, setPendingLang] = useState<Language>(language);
  const [saved, setSaved] = useState(false);

  const hasChanges =
    accentColor !== stored.accentColor ||
    cardRadius !== stored.cardRadius ||
    themeMode !== stored.mode ||
    pendingLang !== language;

  // Live preview: apply changes as user selects
  useEffect(() => {
    applyTheme({ accentColor, cardRadius, mode: themeMode });
  }, [accentColor, cardRadius, themeMode]);

  const handleApply = () => {
    const theme: ThemeSettings = { accentColor, cardRadius, mode: themeMode };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
    applyTheme(theme);
    if (pendingLang !== language) {
      setLanguage(pendingLang);
    }
    setSaved(true);
    setTimeout(() => onClose(), 600);
  };

  const handleClose = () => {
    // Revert if not saved
    if (!saved) {
      applyTheme(stored);
    }
    onClose();
  };

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
          onClick={handleClose}
          className="w-10 h-10 rounded-full bg-card-bg shadow-card flex items-center justify-center"
        >
          <ArrowLeftIcon className="text-foreground w-5 h-5" />
        </motion.button>
        <h1 className="text-[20px] font-bold text-foreground">{t("appearance.title")}</h1>
      </div>

      <div className="flex-1 overflow-y-auto scrollable px-5 pb-32">
        {/* Theme Mode */}
        <div className="mt-6">
          <label className="text-[11px] font-bold tracking-wider uppercase text-foreground">
            {t("appearance.theme")}
          </label>
          <p className="text-text-muted text-[13px] mt-1">
            {t("appearance.themeDesc")}
          </p>
          <div className="mt-3 bg-card-bg rounded-2xl p-1 shadow-card flex">
            <button
              onClick={() => setThemeMode("light")}
              className={`flex-1 py-3 rounded-xl text-[14px] font-semibold transition-colors flex items-center justify-center gap-2 ${
                themeMode === "light" ? "bg-surface text-foreground" : "text-text-muted"
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
              {t("appearance.light")}
            </button>
            <button
              onClick={() => setThemeMode("dark")}
              className={`flex-1 py-3 rounded-xl text-[14px] font-semibold transition-colors flex items-center justify-center gap-2 ${
                themeMode === "dark" ? "bg-surface text-foreground" : "text-text-muted"
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
              {t("appearance.dark")}
            </button>
          </div>
        </div>

        {/* Language */}
        <div className="mt-8">
          <label className="text-[11px] font-bold tracking-wider uppercase text-foreground">
            {t("appearance.language")}
          </label>
          <p className="text-text-muted text-[13px] mt-1">
            {t("appearance.languageDesc")}
          </p>
          <div className="mt-3 space-y-2">
            {LANGUAGES.map((lang) => (
              <motion.button
                key={lang.code}
                whileTap={{ scale: 0.97 }}
                onClick={() => setPendingLang(lang.code)}
                className={`w-full p-4 bg-card-bg shadow-card flex items-center gap-4 rounded-2xl transition-all ${
                  pendingLang === lang.code ? "ring-2 ring-accent" : ""
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className="flex-1 text-left font-semibold text-[15px] text-foreground">
                  {lang.label}
                </span>
                {pendingLang === lang.code && (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: accentColor }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Accent Color */}
        <div className="mt-8">
          <label className="text-[11px] font-bold tracking-wider uppercase text-foreground">
            {t("appearance.accentColor")}
          </label>
          <p className="text-text-muted text-[13px] mt-1">
            {t("appearance.accentDesc")}
          </p>
          <div className="mt-4 grid grid-cols-4 gap-4">
            {ACCENT_COLORS.map((color) => (
              <motion.button
                key={color.value}
                whileTap={{ scale: 0.9 }}
                onClick={() => setAccentColor(color.value)}
                className="flex flex-col items-center gap-2"
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                    accentColor === color.value
                      ? "ring-[3px] ring-offset-2 ring-offset-background"
                      : ""
                  }`}
                  style={{
                    backgroundColor: color.value,
                    boxShadow: accentColor === color.value ? `0 0 0 3px ${color.value}40, 0 0 0 5px var(--color-card)` : undefined,
                  }}
                >
                  {accentColor === color.value && (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <span className="text-[11px] text-text-muted font-medium">{t(color.nameKey)}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Card Style */}
        <div className="mt-8">
          <label className="text-[11px] font-bold tracking-wider uppercase text-foreground">
            {t("appearance.cardStyle")}
          </label>
          <p className="text-text-muted text-[13px] mt-1">
            {t("appearance.cardDesc")}
          </p>
          <div className="mt-4 space-y-3">
            {CARD_STYLES.map((style) => (
              <motion.button
                key={style.value}
                whileTap={{ scale: 0.97 }}
                onClick={() => setCardRadius(style.value)}
                className={`w-full p-4 bg-card-bg shadow-card flex items-center gap-4 transition-all ${
                  cardRadius === style.value ? "ring-2 ring-accent" : ""
                }`}
                style={{ borderRadius: style.value }}
              >
                {/* Preview shape */}
                <div
                  className="w-12 h-12 flex-shrink-0"
                  style={{
                    borderRadius: style.value,
                    backgroundColor: cardRadius === style.value ? accentColor : "var(--color-border)",
                  }}
                />
                <div className="flex-1 text-left">
                  <p className="font-semibold text-[15px] text-foreground">{t(style.nameKey)}</p>
                  <p className="text-text-muted text-[12px]">
                    {style.value} {t("appearance.borderRadius")}
                  </p>
                </div>
                {cardRadius === style.value && (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: accentColor }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Preview Card */}
        <div className="mt-8">
          <label className="text-[11px] font-bold tracking-wider uppercase text-foreground">
            {t("appearance.preview")}
          </label>
          <div
            className="mt-3 bg-card-bg shadow-card p-5 transition-all"
            style={{ borderRadius: cardRadius }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 flex-shrink-0 flex items-center justify-center"
                style={{ borderRadius: `calc(${cardRadius} - 8px)`, backgroundColor: accentColor + "15" }}
              >
                <span className="text-xl">🎁</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[15px] text-foreground">{t("appearance.sampleItem")}</p>
                <p className="text-text-muted text-[13px]">$49.99</p>
              </div>
              <span
                className="text-[11px] font-bold px-2.5 py-1 text-white"
                style={{ borderRadius: cardRadius, backgroundColor: accentColor }}
              >
                MED
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Button */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-6 pt-3 bg-gradient-to-t from-background via-background to-transparent">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleApply}
          className="w-full py-4 rounded-2xl font-bold text-[16px] text-white flex items-center justify-center gap-2"
          style={{ backgroundColor: accentColor }}
        >
          {saved ? (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {t("appearance.saved")}
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                <circle cx="12" cy="12" r="4" />
              </svg>
              {t("appearance.apply")}
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
