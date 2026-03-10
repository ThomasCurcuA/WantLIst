"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { AppProvider, useApp } from "@/contexts/AppContext";
import { LanguageProvider } from "@/lib/i18n";
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
  const [showAddWish, setShowAddWish] = useState(false);
  const [sharedUrl, setSharedUrl] = useState<string | null>(null);
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
