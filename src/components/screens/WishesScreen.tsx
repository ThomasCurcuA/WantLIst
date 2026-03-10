"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import { useT } from "@/lib/i18n";
import { PlusIcon, WalletIcon } from "@/lib/icons";
import WishCard from "@/components/WishCard";
import ShareWishlistScreen from "./ShareWishlistScreen";
import type { Wish } from "@/types";

export default function WishesScreen({ onAddWish, onSelectWish }: { onAddWish: () => void; onSelectWish?: (wish: Wish) => void }) {
  const { wishes, categories, deleteWish, markBought } = useApp();
  const t = useT();
  const [activeCategory, setActiveCategory] = useState("_all_");
  const [showShare, setShowShare] = useState(false);

  const activeWishes = wishes.filter((w) => !w.is_bought);
  const filteredWishes =
    activeCategory === "_all_"
      ? activeWishes
      : activeWishes.filter((w) => w.category === activeCategory);

  const totalValue = activeWishes.reduce((sum, w) => sum + w.price, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full"
    >
      {/* Header */}
      <div className="px-5 safe-top">
        <div className="flex items-center justify-between mt-2">
          <div>
            <p className="text-[11px] font-bold tracking-[2px] text-text-muted uppercase">
              {t("wishes.welcomeBack")}
            </p>
            <h1 className="text-[26px] font-bold text-foreground mt-0.5">
              {t("wishes.myWishes")} <span className="inline-block">&#10024;</span>
            </h1>
          </div>
          {activeWishes.length > 0 && (
            <button onClick={() => setShowShare(true)} className="w-10 h-10 rounded-full bg-card-bg shadow-card flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-foreground">
                <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            </button>
          )}
        </div>

        {/* Total Saved Value Card */}
        <div className="mt-5 bg-card-bg rounded-3xl p-5 shadow-card relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 opacity-10">
            <div className="w-full h-full bg-accent rounded-full -translate-y-1/4 translate-x-1/4" />
          </div>
          <p className="text-text-muted text-[13px]">{t("wishes.totalSaved")}</p>
          <p className="text-[32px] font-bold text-foreground mt-1">
            ${totalValue.toFixed(2)}
          </p>
          <span className="inline-block mt-1 bg-green-50 text-green-badge text-[12px] font-semibold px-2.5 py-0.5 rounded-full">
            {activeWishes.length} {t("wishes.items")}
          </span>
          <div className="absolute right-5 top-1/2 -translate-y-1/2">
            <WalletIcon className="text-accent opacity-40" />
          </div>
        </div>

        {/* Category Pills */}
        <div className="mt-5 flex gap-2 overflow-x-auto scrollable pb-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveCategory("_all_")}
            className={`px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors ${
              activeCategory === "_all_"
                ? "bg-accent text-white"
                : "bg-card-bg text-text-secondary shadow-card"
            }`}
          >
            {t("wishes.all")}
          </motion.button>
          {categories.map((cat) => (
            <motion.button
              key={cat.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(cat.name)}
              className={`px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat.name
                  ? "bg-accent text-white"
                  : "bg-card-bg text-text-secondary shadow-card"
              }`}
            >
              {cat.name}
            </motion.button>
          ))}
        </div>

        {/* Swipe hints */}
        {filteredWishes.length > 0 && (
          <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-text-muted/60 whitespace-nowrap">
            <span>{t("wishes.swipeBought")}</span>
            <span className="w-1 h-1 rounded-full bg-text-muted/30 flex-shrink-0" />
            <span>{t("wishes.swipeDelete")}</span>
          </div>
        )}
      </div>

      {/* Wish List */}
      <div className="flex-1 overflow-y-auto scrollable px-5 mt-4 pb-28">
        <AnimatePresence mode="popLayout">
          {filteredWishes.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-2 border-dashed border-border-light rounded-3xl p-8 flex flex-col items-center justify-center text-center"
            >
              <div className="w-14 h-14 rounded-full bg-surface flex items-center justify-center mb-4">
                <PlusIcon className="text-text-muted w-6 h-6" />
              </div>
              <h3 className="text-[17px] font-bold text-foreground">{t("wishes.noItems")}</h3>
              <p className="text-text-muted text-[14px] mt-1">
                {t("wishes.startAdding")}
              </p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onAddWish}
                className="mt-5 bg-accent text-white font-semibold text-[14px] px-6 py-3 rounded-full"
              >
                {t("wishes.addFirst")}
              </motion.button>
            </motion.div>
          ) : (
            filteredWishes.map((wish) => (
              <motion.div
                key={wish.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -200 }}
              >
                <WishCard wish={wish} onDelete={deleteWish} onBought={markBought} onTap={onSelectWish} />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showShare && <ShareWishlistScreen onClose={() => setShowShare(false)} />}
      </AnimatePresence>
    </motion.div>
  );
}
