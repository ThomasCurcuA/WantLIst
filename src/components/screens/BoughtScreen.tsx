"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import { useT } from "@/lib/i18n";
import { CheckCircleIcon } from "@/lib/icons";
import type { Wish } from "@/types";

interface BoughtCardProps {
  wish: Wish;
  onDelete: (id: string) => void;
  onUnbought: (id: string) => void;
  onTap: (wish: Wish) => void;
}

function BoughtCard({ wish, onDelete, onUnbought, onTap }: BoughtCardProps) {
  const t = useT();
  const [isDismissed, setIsDismissed] = useState(false);
  const draggedRef = useRef(false);
  const x = useMotionValue(0);
  const bgLeft = useTransform(x, [0, 100], ["rgba(59,130,246,0)", "rgba(59,130,246,0.15)"]);
  const bgRight = useTransform(x, [-100, 0], ["rgba(239,68,68,0.15)", "rgba(239,68,68,0)"]);

  const handleDragStart = () => {
    draggedRef.current = false;
  };

  const handleDrag = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 10) {
      draggedRef.current = true;
    }
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > 120) {
      setIsDismissed(true);
      setTimeout(() => onUnbought(wish.id), 300);
    } else if (info.offset.x < -120) {
      setIsDismissed(true);
      setTimeout(() => onDelete(wish.id), 300);
    }
  };

  const handleClick = () => {
    if (!draggedRef.current) {
      onTap(wish);
    }
  };

  if (isDismissed) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Swipe backgrounds */}
      <motion.div
        style={{ backgroundColor: bgLeft as unknown as string }}
        className="absolute inset-0 flex items-center pl-5 rounded-2xl"
      >
        <div className="flex items-center gap-1.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1014.85-3.36L23 6" />
          </svg>
          <span className="text-blue-600 font-semibold text-[12px]">{t("bought.restore")}</span>
        </div>
      </motion.div>
      <motion.div
        style={{ backgroundColor: bgRight as unknown as string }}
        className="absolute inset-0 flex items-center justify-end pr-5 rounded-2xl"
      >
        <div className="flex items-center gap-1.5">
          <span className="text-red-500 font-semibold text-[12px]">{t("bought.delete")}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
        </div>
      </motion.div>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.4}
        style={{ x }}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onClick={handleClick}
        whileTap={{ scale: 0.98 }}
        className="relative bg-card-bg rounded-2xl p-4 shadow-card flex items-center gap-4 cursor-pointer"
      >
        <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {wish.image_url ? (
            <img
              src={wish.image_url}
              alt={wish.name}
              className="w-full h-full rounded-xl object-cover"
              loading="lazy"
            />
          ) : (
            <CheckCircleIcon />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[15px] text-foreground truncate">
            {wish.name}
          </p>
          <p className="text-text-muted text-[13px]">{wish.category}</p>
        </div>
        <p className="font-bold text-green-600 text-[15px]">${wish.price.toFixed(2)}</p>
      </motion.div>
    </div>
  );
}

export default function BoughtScreen({ onSelectWish }: { onSelectWish?: (wish: Wish) => void }) {
  const { wishes, deleteWish, markUnbought } = useApp();
  const t = useT();
  const boughtWishes = wishes.filter((w) => w.is_bought);
  const totalSaved = boughtWishes.reduce((sum, w) => sum + w.price, 0);

  const handleTap = (wish: Wish) => {
    if (onSelectWish) onSelectWish(wish);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full"
    >
      <div className="px-5 safe-top">
        <p className="text-[11px] font-bold tracking-[2px] text-text-muted uppercase mt-2">
          {t("bought.completed")}
        </p>
        <h1 className="text-[26px] font-bold text-foreground mt-0.5">{t("bought.purchased")}</h1>
      </div>

      <div className="flex-1 overflow-y-auto scrollable px-5 pb-28">
        {/* Summary Card */}
        <div className="mt-5 bg-gradient-to-br from-nav-dark to-[#2D3147] rounded-3xl p-5 text-white">
          <p className="text-white/60 text-[12px] font-bold tracking-wider uppercase">
            {t("bought.totalSpent")}
          </p>
          <p className="text-[32px] font-bold mt-1">${totalSaved.toFixed(2)}</p>
          <p className="text-white/60 text-[13px] mt-1">
            {boughtWishes.length} {t("bought.itemsPurchased")}
          </p>
        </div>

        {/* Swipe hints */}
        {boughtWishes.length > 0 && (
          <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-text-muted/60 whitespace-nowrap">
            <span>{t("bought.swipeRestore")}</span>
            <span className="w-1 h-1 rounded-full bg-text-muted/30 flex-shrink-0" />
            <span>{t("bought.swipeDelete")}</span>
          </div>
        )}

        {/* Bought items list */}
        <div className="mt-3 space-y-3">
          <AnimatePresence mode="popLayout">
            {boughtWishes.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-2 border-dashed border-border-light rounded-3xl p-8 flex flex-col items-center text-center mt-2"
              >
                <CheckCircleIcon className="w-12 h-12 mb-3 opacity-30" />
                <h3 className="text-[17px] font-bold text-foreground">{t("bought.noPurchases")}</h3>
                <p className="text-text-muted text-[14px] mt-1">
                  {t("bought.swipeHint")}
                </p>
              </motion.div>
            ) : (
              boughtWishes.map((wish) => (
                <motion.div
                  key={wish.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -200 }}
                >
                  <BoughtCard
                    wish={wish}
                    onDelete={deleteWish}
                    onUnbought={markUnbought}
                    onTap={handleTap}
                  />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
