"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import { useT } from "@/lib/i18n";
import { ArrowLeftIcon, MinusIcon, PlusIcon } from "@/lib/icons";
import type { Wish, Priority } from "@/types";

const priorities: Priority[] = ["LOW", "MED", "HIGH"];

const priorityConfig = {
  LOW: { bg: "bg-green-100", text: "text-green-700", label: "Low" },
  MED: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Medium" },
  HIGH: { bg: "bg-red-100", text: "text-red-700", label: "High" },
};

export default function ProductDetailScreen({
  wish,
  onClose,
}: {
  wish: Wish;
  onClose: () => void;
}) {
  const { updateWish, deleteWish, markBought, markUnbought, categories } = useApp();
  const t = useT();

  const [name, setName] = useState(wish.name);
  const [notes, setNotes] = useState(wish.notes || "");
  const [price, setPrice] = useState(String(wish.price));
  const [priority, setPriority] = useState<Priority>(wish.priority);
  const [category, setCategory] = useState(wish.category);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const priorityIndex = priorities.indexOf(priority);

  const hasChanges =
    name !== wish.name ||
    (notes || "") !== (wish.notes || "") ||
    price !== String(wish.price) ||
    priority !== wish.priority ||
    category !== wish.category;

  const handleSave = async () => {
    if (!name.trim() || !hasChanges) return;
    setSaving(true);
    await updateWish(wish.id, {
      name: name.trim(),
      notes: notes.trim() || null,
      price: parseFloat(price) || 0,
      priority,
      category,
    });
    setSaving(false);
    onClose();
  };

  const handleDelete = async () => {
    await deleteWish(wish.id);
    onClose();
  };

  const handleToggleBought = async () => {
    if (wish.is_bought) {
      await markUnbought(wish.id);
    } else {
      await markBought(wish.id);
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
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-card-bg shadow-card flex items-center justify-center"
        >
          <ArrowLeftIcon className="text-foreground w-5 h-5" />
        </motion.button>
        <h1 className="text-[20px] font-bold text-foreground">{t("detail.title")}</h1>
      </div>

      <div className="flex-1 overflow-y-auto scrollable px-5 pb-48">
        {/* Product Image */}
        <div className="mt-3 rounded-3xl overflow-hidden h-56 bg-card-bg shadow-card relative">
          {wish.image_url ? (
            <img
              src={wish.image_url}
              alt={wish.name}
              className="w-full h-full object-contain bg-surface"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-accent/10 to-accent/5 flex items-center justify-center">
              <span className="text-5xl">
                {wish.category === "Tech"
                  ? "💻"
                  : wish.category === "Clothes"
                  ? "👕"
                  : wish.category === "Subscriptions"
                  ? "💳"
                  : wish.category === "Home"
                  ? "🏠"
                  : wish.category === "Experiences"
                  ? "⭐"
                  : "🎁"}
              </span>
            </div>
          )}
          {/* Status badge */}
          {wish.is_bought && (
            <div className="absolute top-3 right-3 bg-green-500 text-white text-[11px] font-bold px-3 py-1 rounded-full">
              {t("detail.purchasedBadge")}
            </div>
          )}
        </div>

        {/* Product Link */}
        {wish.product_link && (
          <motion.a
            whileTap={{ scale: 0.97 }}
            href={wish.product_link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 w-full bg-card-bg rounded-2xl px-4 py-3.5 shadow-card flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </div>
            <span className="text-[14px] text-blue-600 font-medium truncate flex-1">
              {t("detail.openLink")}
            </span>
          </motion.a>
        )}

        {/* Editable Name */}
        <div className="mt-5">
          <label className="text-[11px] font-bold tracking-wider uppercase text-foreground">
            {t("detail.productName")} <span className="text-accent">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mt-2 bg-card-bg rounded-2xl px-4 py-3.5 text-[15px] text-foreground shadow-card outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>

        {/* Editable Notes */}
        <div className="mt-5">
          <label className="text-[11px] font-bold tracking-wider uppercase text-foreground">
            {t("detail.notes")}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder={t("detail.notesPlaceholder")}
            className="w-full mt-2 bg-card-bg rounded-2xl px-4 py-3.5 text-[15px] text-foreground placeholder:text-text-muted/50 shadow-card outline-none focus:ring-2 focus:ring-accent/20 resize-none"
          />
        </div>

        {/* Price & Priority */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="min-w-0">
            <label className="text-[11px] font-bold tracking-wider uppercase text-foreground">
              {t("detail.price")}
            </label>
            <div className="mt-2 bg-card-bg rounded-2xl px-4 py-3.5 shadow-card flex items-center gap-1">
              <span className="text-text-muted font-semibold">$</span>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="flex-1 min-w-0 text-[15px] text-foreground placeholder:text-text-muted/50 outline-none bg-transparent"
              />
            </div>
          </div>
          <div className="min-w-0">
            <label className="text-[11px] font-bold tracking-wider uppercase text-foreground">
              {t("detail.priority")}
            </label>
            <div className="mt-2 bg-card-bg rounded-2xl px-2 py-2.5 shadow-card flex items-center justify-between gap-1">
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => setPriority(priorities[Math.max(0, priorityIndex - 1)])}
                className="w-8 h-8 rounded-full bg-surface flex items-center justify-center flex-shrink-0"
              >
                <MinusIcon className="text-text-muted" />
              </motion.button>
              <span
                className={`font-bold text-[13px] px-2 py-0.5 rounded-full ${priorityConfig[priority].bg} ${priorityConfig[priority].text}`}
              >
                {priority}
              </span>
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => setPriority(priorities[Math.min(2, priorityIndex + 1)])}
                className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0"
              >
                <PlusIcon className="text-accent w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Category */}
        <div className="mt-5">
          <label className="text-[11px] font-bold tracking-wider uppercase text-foreground">
            {t("detail.category")}
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCategory(cat.name)}
                className={`px-4 py-2.5 rounded-full text-[13px] font-medium transition-colors ${
                  category === cat.name
                    ? "bg-nav-dark text-white"
                    : "bg-card-bg text-text-secondary shadow-card"
                }`}
              >
                {cat.icon} {cat.name}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 space-y-3">
          {/* Toggle Bought/Unbought */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleToggleBought}
            className={`w-full py-3.5 rounded-2xl font-semibold text-[15px] flex items-center justify-center gap-2 ${
              wish.is_bought
                ? "bg-blue-50 text-blue-600 border border-blue-200"
                : "bg-green-50 text-green-600 border border-green-200"
            }`}
          >
            {wish.is_bought ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1014.85-3.36L23 6" />
                </svg>
                {t("detail.moveBack")}
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {t("detail.markBought")}
              </>
            )}
          </motion.button>

          {/* Delete */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full py-3.5 rounded-2xl font-semibold text-[15px] bg-red-50 text-red-500 border border-red-200 flex items-center justify-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
            {t("detail.deleteItem")}
          </motion.button>
        </div>
      </div>

      {/* Save Button - Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-6 pt-3 bg-gradient-to-t from-background via-background to-transparent">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={saving || !name.trim() || !hasChanges}
          className={`w-full py-4 rounded-2xl font-bold text-[16px] text-white flex items-center justify-center gap-2 ${
            hasChanges && name.trim() ? "bg-accent" : "bg-accent/30"
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {saving ? t("detail.saving") : t("detail.saveChanges")}
        </motion.button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[80] bg-black/50 flex items-center justify-center px-8"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card-bg rounded-3xl p-6 w-full max-w-sm shadow-xl"
          >
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
            </div>
            <h3 className="text-[18px] font-bold text-foreground text-center mt-4">
              {t("detail.deleteConfirm")}
            </h3>
            <p className="text-text-muted text-[14px] text-center mt-2">
              &quot;{wish.name}&quot; {t("detail.deleteDesc")}
            </p>
            <div className="mt-6 flex gap-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 rounded-2xl font-semibold text-[15px] bg-surface text-foreground"
              >
                {t("common.cancel")}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleDelete}
                className="flex-1 py-3 rounded-2xl font-semibold text-[15px] bg-red-500 text-white"
              >
                {t("common.delete")}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
