"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import { useT } from "@/lib/i18n";
import type { Profile } from "@/types";
import type { SharedWishItem } from "@/types";

export default function ShareWishlistScreen({ onClose }: { onClose: () => void }) {
  const { wishes, searchUsers, shareWishes } = useApp();
  const t = useT();
  const activeWishes = wishes.filter((w) => !w.is_bought);

  const [step, setStep] = useState<"recipient" | "items">("recipient");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (value.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      const results = await searchUsers(value.trim());
      setSearchResults(results);
      setSearching(false);
    }, 400);
  };

  const handleSelectUser = (user: Profile) => {
    setSelectedUser(user);
    setStep("items");
  };

  const toggleItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === activeWishes.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(activeWishes.map((w) => w.id)));
    }
  };

  const handleShare = async () => {
    if (!selectedUser || selectedIds.size === 0) return;
    setSending(true);
    setShareError(null);
    const items: SharedWishItem[] = activeWishes
      .filter((w) => selectedIds.has(w.id))
      .map((w) => ({
        name: w.name,
        price: w.price,
        image_url: w.image_url,
        category: w.category,
        priority: w.priority,
        notes: w.notes || null,
        product_link: w.product_link || null,
      }));
    const { error } = await shareWishes(selectedUser.id, items, message || undefined);
    setSending(false);
    if (error) {
      console.error("[share] error:", error);
      setShareError(error);
    } else {
      setSent(true);
      setTimeout(onClose, 1200);
    }
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed inset-0 z-[60] bg-background flex flex-col"
    >
      {/* Header */}
      <div className="px-5 safe-top">
        <div className="flex items-center gap-4 mt-2">
          <button onClick={step === "items" && !sent ? () => setStep("recipient") : onClose} className="w-10 h-10 rounded-full bg-card-bg shadow-card flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-foreground">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-[22px] font-bold text-foreground flex-1">{t("share.title")}</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollable px-5 pb-28 mt-4">
        <AnimatePresence mode="wait">
          {step === "recipient" && (
            <motion.div key="recipient" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder={t("share.searchPlaceholder")}
                  className="w-full bg-card-bg rounded-2xl px-4 py-3.5 text-[15px] text-foreground placeholder:text-text-muted shadow-card outline-none focus:ring-2 focus:ring-accent/30"
                />
                {searching && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Results */}
              <div className="mt-4 space-y-2">
                {searchResults.map((user) => (
                  <motion.button
                    key={user.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectUser(user)}
                    className="w-full bg-card-bg rounded-2xl p-4 shadow-card flex items-center gap-3 text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-surface overflow-hidden flex-shrink-0">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center text-accent font-bold text-sm">
                          {(user.username?.[0] || "U").toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[15px] text-foreground truncate">{user.username || "User"}</p>
                      <p className="text-text-muted text-[13px] truncate">{user.email}</p>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted flex-shrink-0">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </motion.button>
                ))}
                {searchQuery.trim().length >= 2 && !searching && searchResults.length === 0 && (
                  <p className="text-center text-text-muted text-[14px] py-8">{t("share.noResults")}</p>
                )}
              </div>
            </motion.div>
          )}

          {step === "items" && !sent && (
            <motion.div key="items" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {/* Selected user */}
              <div className="bg-card-bg rounded-2xl p-4 shadow-card flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface overflow-hidden flex-shrink-0">
                  {selectedUser?.avatar_url ? (
                    <img src={selectedUser.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center text-accent font-bold text-sm">
                      {(selectedUser?.username?.[0] || "U").toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[15px] text-foreground truncate">{selectedUser?.username || "User"}</p>
                  <p className="text-text-muted text-[13px] truncate">{selectedUser?.email}</p>
                </div>
              </div>

              {/* Select items header */}
              <div className="mt-5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-[15px] text-foreground truncate">{t("share.selectItems")}</p>
                  <p className="text-accent text-[13px] font-medium">{selectedIds.size} {t("share.selectedCount")}</p>
                </div>
                <button onClick={toggleAll} className="text-accent text-[13px] font-medium whitespace-nowrap flex-shrink-0">
                  {selectedIds.size === activeWishes.length ? t("share.deselectAll") : t("share.selectAll")}
                </button>
              </div>

              {/* Wish items */}
              <div className="mt-3 space-y-2">
                {activeWishes.map((wish) => (
                  <motion.button
                    key={wish.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleItem(wish.id)}
                    className={`w-full rounded-2xl p-3 flex items-center gap-3 text-left transition-colors ${
                      selectedIds.has(wish.id)
                        ? "bg-accent/10 ring-2 ring-accent/40"
                        : "bg-card-bg shadow-card"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      selectedIds.has(wish.id) ? "bg-accent border-accent" : "border-border-light"
                    }`}>
                      {selectedIds.has(wish.id) && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-surface overflow-hidden flex-shrink-0">
                      {wish.image_url ? (
                        <img src={wish.image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-muted text-xs">
                          {wish.category.slice(0, 2)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[14px] text-foreground truncate">{wish.name}</p>
                      <p className="text-text-muted text-[12px]">{wish.category}</p>
                    </div>
                    <p className="font-bold text-[14px] text-foreground flex-shrink-0">${wish.price.toFixed(2)}</p>
                  </motion.button>
                ))}
              </div>

              {/* Message */}
              <div className="mt-5">
                <label className="text-[13px] font-medium text-text-secondary mb-1.5 block">{t("share.message")}</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t("share.messagePlaceholder")}
                  rows={2}
                  className="w-full bg-card-bg rounded-2xl px-4 py-3 text-[14px] text-foreground placeholder:text-text-muted shadow-card outline-none focus:ring-2 focus:ring-accent/30 resize-none"
                />
              </div>

              {/* Error message */}
              {shareError && (
                <p className="mt-3 text-red-500 text-[13px] text-center">{shareError}</p>
              )}

              {/* Share button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                disabled={sending || selectedIds.size === 0}
                className={`mt-5 w-full py-4 rounded-2xl font-semibold text-[15px] text-white transition-opacity ${
                  selectedIds.size === 0 ? "bg-text-muted opacity-50" : "bg-accent"
                }`}
              >
                {sending ? t("share.sending") : `${t("share.send")} (${selectedIds.size})`}
              </motion.button>
            </motion.div>
          )}

          {sent && (
            <motion.div
              key="sent"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-[20px] font-bold text-foreground">{t("share.sent")}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
