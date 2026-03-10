"use client";

import { useState, useRef } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { useT } from "@/lib/i18n";
import type { Wish } from "@/types";
import confetti from "canvas-confetti";

const priorityColors = {
  LOW: "bg-green-100 text-green-700",
  MED: "bg-yellow-100 text-yellow-700",
  HIGH: "bg-red-100 text-red-700",
};

interface WishCardProps {
  wish: Wish;
  onDelete: (id: string) => void;
  onBought: (id: string) => void;
  onTap?: (wish: Wish) => void;
}

export default function WishCard({ wish, onDelete, onBought, onTap }: WishCardProps) {
  const t = useT();
  const [isDismissed, setIsDismissed] = useState(false);
  const constraintsRef = useRef(null);
  const draggedRef = useRef(false);
  const x = useMotionValue(0);
  const bgLeft = useTransform(x, [0, 100], ["rgba(34,197,94,0)", "rgba(34,197,94,0.15)"]);
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
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#E93D5D", "#22C55E", "#3B82F6", "#F59E0B"],
      });
      setTimeout(() => onBought(wish.id), 300);
    } else if (info.offset.x < -120) {
      setIsDismissed(true);
      setTimeout(() => onDelete(wish.id), 300);
    }
  };

  const handleClick = () => {
    if (!draggedRef.current && onTap) {
      onTap(wish);
    }
  };

  if (isDismissed) return null;

  return (
    <div ref={constraintsRef} className="relative overflow-hidden rounded-3xl mb-3">
      {/* Swipe backgrounds */}
      <motion.div
        style={{ backgroundColor: bgLeft as unknown as string }}
        className="absolute inset-0 flex items-center pl-6 rounded-3xl"
      >
        <span className="text-green-600 font-semibold text-sm">{t("card.bought")}</span>
      </motion.div>
      <motion.div
        style={{ backgroundColor: bgRight as unknown as string }}
        className="absolute inset-0 flex items-center justify-end pr-6 rounded-3xl"
      >
        <span className="text-red-500 font-semibold text-sm">{t("card.delete")}</span>
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
        className="relative bg-card-bg rounded-3xl p-4 shadow-card flex items-center gap-4 cursor-pointer"
      >
        {/* Image */}
        <div className="w-16 h-16 rounded-2xl bg-surface overflow-hidden flex-shrink-0 flex items-center justify-center">
          {wish.image_url ? (
            <img
              src={wish.image_url}
              alt={wish.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-accent/10 to-accent/5 flex items-center justify-center">
              <span className="text-2xl">
                {wish.category === "Tech" ? "💻" : wish.category === "Clothes" ? "👕" : wish.category === "Subscriptions" ? "💳" : "🎁"}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[15px] text-foreground truncate">{wish.name}</h3>
          <p className="text-text-muted text-[13px] mt-0.5">${wish.price.toFixed(2)}</p>
        </div>

        {/* Priority badge */}
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${priorityColors[wish.priority]}`}>
          {wish.priority}
        </span>
      </motion.div>
    </div>
  );
}
