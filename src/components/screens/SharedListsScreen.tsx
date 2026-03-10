"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import { useT } from "@/lib/i18n";
import { useLanguage } from "@/lib/i18n";
import type { SharedList, SharedWishItem } from "@/types";

function SharedListCard({ list, onTap }: { list: SharedList; onTap: () => void }) {
  const t = useT();
  const { language } = useLanguage();
  const date = new Date(list.created_at).toLocaleDateString(
    language === "it" ? "it-IT" : "en-US",
    { day: "numeric", month: "short", year: "numeric" }
  );

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onTap}
      className="w-full bg-card-bg rounded-2xl p-4 shadow-card flex items-center gap-3 text-left"
    >
      <div className="w-11 h-11 rounded-full bg-surface overflow-hidden flex-shrink-0">
        {list.sender_avatar ? (
          <img src={list.sender_avatar} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center text-accent font-bold text-sm">
            {(list.sender_name?.[0] || "U").toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[15px] text-foreground truncate">{list.sender_name}</p>
        <p className="text-text-muted text-[12px]">
          {list.items.length} {t("shared.items")} · {date}
        </p>
      </div>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted flex-shrink-0">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </motion.button>
  );
}

function SharedItemDetail({ item, onClose }: { item: SharedWishItem; onClose: () => void }) {
  const t = useT();

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed inset-0 z-[80] bg-background flex flex-col"
    >
      <div className="px-5 safe-top">
        <div className="flex items-center gap-4 mt-2">
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-card-bg shadow-card flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-foreground">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-[20px] font-bold text-foreground flex-1 truncate">{t("detail.title")}</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollable px-5 pb-28 mt-4">
        {/* Product image */}
        {item.image_url && (
          <div className="w-full aspect-square rounded-3xl bg-card-bg shadow-card overflow-hidden mb-5">
            <img src={item.image_url} alt={item.name} className="w-full h-full object-contain" />
          </div>
        )}

        {/* Name & Price */}
        <div className="mb-4">
          <h2 className="text-[20px] font-bold text-foreground leading-tight">{item.name}</h2>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[24px] font-bold text-accent">${item.price.toFixed(2)}</span>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              item.priority === "HIGH" ? "bg-red-500/10 text-red-500" :
              item.priority === "MED" ? "bg-amber-500/10 text-amber-600" :
              "bg-green-500/10 text-green-600"
            }`}>
              {item.priority}
            </span>
          </div>
        </div>

        {/* Category */}
        <div className="bg-card-bg rounded-2xl p-4 shadow-card mb-3">
          <p className="text-[12px] font-medium text-text-muted mb-1">{t("detail.category")}</p>
          <p className="text-[15px] text-foreground">{item.category}</p>
        </div>

        {/* Notes */}
        {item.notes && (
          <div className="bg-card-bg rounded-2xl p-4 shadow-card mb-3">
            <p className="text-[12px] font-medium text-text-muted mb-1">{t("detail.notes")}</p>
            <p className="text-[14px] text-foreground leading-relaxed">{item.notes}</p>
          </div>
        )}

        {/* Product Link */}
        {item.product_link && (
          <a
            href={item.product_link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 w-full bg-accent text-white font-semibold text-[15px] py-4 rounded-2xl flex items-center justify-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            {t("detail.openLink")}
          </a>
        )}
      </div>
    </motion.div>
  );
}

function SharedListDetail({ list, onClose }: { list: SharedList; onClose: () => void }) {
  const t = useT();
  const { language } = useLanguage();
  const [selectedItem, setSelectedItem] = useState<SharedWishItem | null>(null);
  const date = new Date(list.created_at).toLocaleDateString(
    language === "it" ? "it-IT" : "en-US",
    { day: "numeric", month: "long", year: "numeric" }
  );

  return (
    <>
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed inset-0 z-[70] bg-background flex flex-col"
      >
        <div className="px-5 safe-top">
          <div className="flex items-center gap-4 mt-2">
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-card-bg shadow-card flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-foreground">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-[20px] font-bold text-foreground truncate">{list.sender_name}</h1>
              <p className="text-text-muted text-[12px]">{t("shared.received")} {date}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollable px-5 pb-28 mt-4">
          {/* Message */}
          {list.message && (
            <div className="bg-card-bg rounded-2xl p-4 shadow-card mb-4">
              <p className="text-[12px] font-medium text-text-muted mb-1">{t("shared.message")}</p>
              <p className="text-[14px] text-foreground">{list.message}</p>
            </div>
          )}

          {/* Items */}
          <div className="space-y-2">
            {list.items.map((item, i) => (
              <motion.button
                key={i}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedItem(item)}
                className="w-full bg-card-bg rounded-2xl p-3 shadow-card flex items-center gap-3 text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-surface overflow-hidden flex-shrink-0">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted text-xs">
                      {item.category.slice(0, 2)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[14px] text-foreground truncate">{item.name}</p>
                  <p className="text-text-muted text-[12px]">{item.category}</p>
                </div>
                <div className="text-right flex-shrink-0 flex items-center gap-2">
                  <div>
                    <p className="font-bold text-[15px] text-foreground">${item.price.toFixed(2)}</p>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                      item.priority === "HIGH" ? "bg-red-50 text-red-500" :
                      item.priority === "MED" ? "bg-amber-50 text-amber-600" :
                      "bg-green-50 text-green-600"
                    }`}>
                      {item.priority}
                    </span>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted/50 flex-shrink-0">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedItem && (
          <SharedItemDetail item={selectedItem} onClose={() => setSelectedItem(null)} />
        )}
      </AnimatePresence>
    </>
  );
}

export default function SharedListsScreen({ onClose }: { onClose: () => void }) {
  const { sharedLists } = useApp();
  const t = useT();
  const [selectedList, setSelectedList] = useState<SharedList | null>(null);

  return (
    <>
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed inset-0 z-[60] bg-background flex flex-col"
      >
        <div className="px-5 safe-top">
          <div className="flex items-center gap-4 mt-2">
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-card-bg shadow-card flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-foreground">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-[22px] font-bold text-foreground flex-1">{t("shared.title")}</h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollable px-5 pb-28 mt-4">
          {sharedLists.length === 0 ? (
            <div className="border-2 border-dashed border-border-light rounded-3xl p-8 flex flex-col items-center text-center mt-4">
              <div className="w-14 h-14 rounded-full bg-surface flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted">
                  <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
              </div>
              <h3 className="text-[17px] font-bold text-foreground">{t("shared.noLists")}</h3>
              <p className="text-text-muted text-[14px] mt-1">{t("shared.noListsDesc")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sharedLists.map((list) => (
                <SharedListCard key={list.id} list={list} onTap={() => setSelectedList(list)} />
              ))}
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedList && (
          <SharedListDetail list={selectedList} onClose={() => setSelectedList(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
