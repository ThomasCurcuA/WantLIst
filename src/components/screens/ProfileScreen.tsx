"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import { useT } from "@/lib/i18n";
import {
  TrendingUpIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  AccountIcon,
  AppearanceIcon,
} from "@/lib/icons";
import { HeartIcon } from "@/lib/icons";
import AccountScreen from "./AccountScreen";
import AppearanceScreen from "./AppearanceScreen";
import SharedListsScreen from "./SharedListsScreen";

export default function ProfileScreen() {
  const { profile, wishes, sharedLists, signOut, setActiveTab } = useApp();
  const t = useT();
  const [showAccount, setShowAccount] = useState(false);
  const [showAppearance, setShowAppearance] = useState(false);
  const [showSharedLists, setShowSharedLists] = useState(false);

  const activeWishes = wishes.filter((w) => !w.is_bought);
  const boughtWishes = wishes.filter((w) => w.is_bought);
  const totalValue = activeWishes.reduce((sum, w) => sum + w.price, 0);

  // Top categories
  const categoryCounts: Record<string, number> = {};
  activeWishes.forEach((w) => {
    categoryCounts[w.category] = (categoryCounts[w.category] || 0) + 1;
  });
  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const memberYear = profile?.created_at
    ? new Date(profile.created_at).getFullYear()
    : new Date().getFullYear();

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col h-full"
      >
        {/* Header */}
        <div className="px-5 safe-top">
          <div className="mt-2">
            <h1 className="text-[26px] font-bold text-foreground">{t("profile.title")}</h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollable px-5 pb-28">
          {/* Profile Card */}
          <div className="mt-5 bg-card-bg rounded-3xl p-5 shadow-card flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-surface overflow-hidden flex-shrink-0">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center text-accent font-bold text-xl">
                  {(profile?.username?.[0] || "W").toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h2 className="font-bold text-[17px] text-foreground">
                {profile?.username || "WantList User"}
              </h2>
              <p className="text-text-muted text-[13px]">{t("profile.memberSince")} {memberYear}</p>
              <span className="inline-block mt-1 bg-accent text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full tracking-wider uppercase">
                {t("profile.active")}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-card-bg rounded-2xl p-4 shadow-card text-center">
              <HeartIcon filled className="text-indigo-500 mx-auto mb-2" />
              <p className="text-[24px] font-bold text-foreground">{activeWishes.length}</p>
              <p className="text-text-muted text-[12px]">{t("profile.totalWishes")}</p>
            </div>
            <div className="bg-card-bg rounded-2xl p-4 shadow-card text-center">
              <CheckCircleIcon className="mx-auto mb-2" />
              <p className="text-[24px] font-bold text-foreground">{boughtWishes.length}</p>
              <p className="text-text-muted text-[12px]">{t("profile.purchased")}</p>
            </div>
          </div>

          {/* Total Value Saved - Dark Card */}
          <div className="mt-4 bg-gradient-to-br from-nav-dark to-[#2D3147] rounded-3xl p-5 text-white relative overflow-hidden">
            <div className="absolute right-4 top-4 w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <TrendingUpIcon className="text-white/70" />
            </div>
            <p className="text-white/50 text-[11px] font-bold tracking-wider uppercase">
              {t("profile.totalValueSaved")}
            </p>
            <p className="text-[32px] font-bold mt-1">${totalValue.toFixed(2)}</p>

            {topCategories.length > 0 && (
              <div className="mt-4">
                <p className="text-white/50 text-[11px] font-bold tracking-wider uppercase mb-2">
                  {t("profile.topCategories")}
                </p>
                {topCategories.map(([cat, count]) => (
                  <div key={cat} className="flex items-center justify-between py-1">
                    <span className="text-white/80 text-[14px]">{cat}</span>
                    <span className="text-white font-bold text-[14px]">{count} {t("common.items")}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Purchased Items — navigates to Bought tab */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab(2)}
            className="mt-4 bg-card-bg rounded-2xl p-4 shadow-card flex items-center gap-4 cursor-pointer"
          >
            <CheckCircleIcon />
            <div className="flex-1">
              <p className="font-semibold text-[15px] text-foreground">{t("profile.purchasedItems")}</p>
              <p className="text-text-muted text-[13px]">{boughtWishes.length} {t("profile.itemsBought")}</p>
            </div>
            <ChevronRightIcon className="text-text-muted" />
          </motion.div>

          {/* Settings */}
          <div className="mt-6">
            <h3 className="text-[13px] font-bold tracking-wider uppercase text-text-muted mb-3">
              {t("profile.settings")}
            </h3>
            <div className="space-y-3">
              <motion.div
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAccount(true)}
                className="bg-card-bg rounded-2xl p-4 shadow-card flex items-center gap-4 cursor-pointer"
              >
                <AccountIcon className="text-foreground" />
                <span className="flex-1 font-semibold text-[15px] text-foreground">{t("profile.accountDetails")}</span>
                <ChevronRightIcon className="text-text-muted" />
              </motion.div>

              <motion.div
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAppearance(true)}
                className="bg-card-bg rounded-2xl p-4 shadow-card flex items-center gap-4 cursor-pointer"
              >
                <AppearanceIcon className="text-foreground" />
                <span className="flex-1 font-semibold text-[15px] text-foreground">{t("profile.appearance")}</span>
                <ChevronRightIcon className="text-text-muted" />
              </motion.div>

              <motion.div
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowSharedLists(true)}
                className="bg-card-bg rounded-2xl p-4 shadow-card flex items-center gap-4 cursor-pointer"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-foreground">
                  <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
                <span className="flex-1 font-semibold text-[15px] text-foreground">{t("profile.sharedLists")}</span>
                {sharedLists.length > 0 && (
                  <span className="bg-accent text-white text-[11px] font-bold px-2 py-0.5 rounded-full">{sharedLists.length}</span>
                )}
                <ChevronRightIcon className="text-text-muted" />
              </motion.div>
            </div>
          </div>

          {/* Sign Out */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={signOut}
            className="mt-6 w-full bg-red-50 text-red-500 font-semibold text-[14px] py-3.5 rounded-2xl"
          >
            {t("profile.signOut")}
          </motion.button>
        </div>
      </motion.div>

      {/* Sub-screens as modals */}
      <AnimatePresence>
        {showAccount && <AccountScreen onClose={() => setShowAccount(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showAppearance && <AppearanceScreen onClose={() => setShowAppearance(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showSharedLists && <SharedListsScreen onClose={() => setShowSharedLists(false)} />}
      </AnimatePresence>
    </>
  );
}
