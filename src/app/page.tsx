"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AppProvider, useApp } from "@/contexts/AppContext";
import { LanguageProvider, useT } from "@/lib/i18n";
import BottomNav from "@/components/BottomNav";
import WishesScreen from "@/components/screens/WishesScreen";
import CategoriesScreen from "@/components/screens/CategoriesScreen";
import BoughtScreen from "@/components/screens/BoughtScreen";
import ProfileScreen from "@/components/screens/ProfileScreen";
import AddWishScreen from "@/components/screens/AddWishScreen";
import ProductDetailScreen from "@/components/screens/ProductDetailScreen";
import AuthScreen from "@/components/screens/AuthScreen";
import { loadThemeFromStorage } from "@/components/screens/AppearanceScreen";
import SplashScreen from "@/components/SplashScreen";
import type { Wish } from "@/types";

function AppContent() {
  const { user, loading, activeTab } = useApp();
  const t = useT();
  const [showAddWish, setShowAddWish] = useState(false);
  const [sharedUrl, setSharedUrl] = useState<string | null>(null);
  const [clipboardUrl, setClipboardUrl] = useState<string | null>(null);
  const hasCheckedClipboard = useRef(false);
  const [selectedWish, setSelectedWish] = useState<Wish | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [splashAnimDone, setSplashAnimDone] = useState(false);

  // Register service worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  // Load saved theme on mount
  useEffect(() => {
    loadThemeFromStorage();
  }, []);

  // Check for shared URL from Web Share Target
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const url = params.get("shared_url");
    if (url) {
      setSharedUrl(url);
      // Clean URL without reloading page
      window.history.replaceState({}, "", "/");
    }
  }, []);

  // Auto-open AddWish when shared URL is detected and splash is done
  useEffect(() => {
    if (sharedUrl && !showSplash && user) {
      setShowAddWish(true);
    }
  }, [sharedUrl, showSplash, user]);

  // Dismiss splash when both data is loaded AND animation is complete
  useEffect(() => {
    if (!loading && splashAnimDone) {
      // Small delay for the exit animation to feel natural
      const timer = setTimeout(() => setShowSplash(false), 300);
      return () => clearTimeout(timer);
    }
  }, [loading, splashAnimDone]);

  // Check clipboard for URLs after splash is done and user is authenticated
  useEffect(() => {
    if (showSplash || !user || sharedUrl || hasCheckedClipboard.current) return;
    hasCheckedClipboard.current = true;

    const checkClipboard = async () => {
      try {
        const text = await navigator.clipboard.readText();
        const trimmed = text?.trim();
        if (trimmed && /^https?:\/\/[^\s]+$/.test(trimmed)) {
          setClipboardUrl(trimmed);
        }
      } catch {
        // Permission denied or clipboard empty — ignore silently
      }
    };

    const timer = setTimeout(checkClipboard, 500);
    return () => clearTimeout(timer);
  }, [showSplash, user, sharedUrl]);

  const handleClipboardAdd = () => {
    if (clipboardUrl) {
      setSharedUrl(clipboardUrl);
      setClipboardUrl(null);
      setShowAddWish(true);
    }
  };

  const handleSplashFinished = useCallback(() => {
    setSplashAnimDone(true);
  }, []);

  if (!user && !loading && !showSplash) {
    return <AuthScreen />;
  }

  const handleSelectWish = (wish: Wish) => {
    setSelectedWish(wish);
  };

  const screens = [
    <WishesScreen key="wishes" onAddWish={() => setShowAddWish(true)} onSelectWish={handleSelectWish} />,
    <CategoriesScreen key="categories" />,
    <BoughtScreen key="bought" onSelectWish={handleSelectWish} />,
    <ProfileScreen key="profile" />,
  ];

  return (
    <div className="h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Splash Screen */}
      <AnimatePresence>
        {showSplash && <SplashScreen onFinished={handleSplashFinished} />}
      </AnimatePresence>

      {!showSplash && user && (
        <>
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              {screens[activeTab]}
            </AnimatePresence>
          </div>

          <BottomNav onFabPress={() => setShowAddWish(true)} />

          {/* Clipboard URL Banner */}
          <AnimatePresence>
            {clipboardUrl && (
              <motion.div
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 80, opacity: 0 }}
                transition={{ type: "spring", damping: 24, stiffness: 300 }}
                className="fixed bottom-20 left-4 right-4 z-50"
              >
                <div className="bg-card-bg rounded-2xl shadow-card-lg p-4 flex items-center gap-3 border border-border">
                  {/* Link icon */}
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color, #E93D5D)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                    </svg>
                  </div>
                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-foreground">{t("clipboard.found")}</p>
                    <p className="text-[12px] text-text-muted truncate">{clipboardUrl}</p>
                  </div>
                  {/* Add button */}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleClipboardAdd}
                    className="bg-accent text-white text-[13px] font-bold px-4 py-2 rounded-xl flex-shrink-0"
                  >
                    {t("clipboard.add")}
                  </motion.button>
                  {/* Dismiss */}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setClipboardUrl(null)}
                    className="w-8 h-8 flex items-center justify-center text-text-muted flex-shrink-0"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showAddWish && (
              <AddWishScreen
                onClose={() => { setShowAddWish(false); setSharedUrl(null); }}
                initialUrl={sharedUrl || undefined}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {selectedWish && (
              <ProductDetailScreen
                wish={selectedWish}
                onClose={() => setSelectedWish(null)}
              />
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <LanguageProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </LanguageProvider>
  );
}
