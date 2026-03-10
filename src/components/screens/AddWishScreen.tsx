"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import { useT } from "@/lib/i18n";
import { ArrowLeftIcon, CameraIcon, ImageIcon, LinkIcon, MinusIcon, PlusIcon } from "@/lib/icons";
import type { Priority, ScrapedProduct } from "@/types";

const priorities: Priority[] = ["LOW", "MED", "HIGH"];

type InputMode = "manual" | "link";

// Search icon component
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

export default function AddWishScreen({ onClose, initialUrl }: { onClose: () => void; initialUrl?: string }) {
  const { addWish, categories } = useApp();
  const t = useT();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasAutoScraped = useRef(false);

  // Mode toggle — start in link mode if shared URL provided
  const [mode, setMode] = useState<InputMode>(initialUrl ? "link" : "manual");

  // Shared fields
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [price, setPrice] = useState("");
  const [priority, setPriority] = useState<Priority>("MED");
  const [category, setCategory] = useState("");
  const [saving, setSaving] = useState(false);

  // Manual mode: file upload
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Link mode — pre-fill URL if shared from another app
  const [productUrl, setProductUrl] = useState(initialUrl || "");
  const [scraping, setScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState("");
  const [scraped, setScraped] = useState<ScrapedProduct | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // Image search
  const [showImageSearch, setShowImageSearch] = useState(false);
  const [imageSearchQuery, setImageSearchQuery] = useState("");
  const [imageSearchResults, setImageSearchResults] = useState<string[]>([]);
  const [searchingImages, setSearchingImages] = useState(false);
  const [imageSearchError, setImageSearchError] = useState("");

  const priorityIndex = priorities.indexOf(priority);

  // Auto-scrape when opened with a shared URL
  useEffect(() => {
    if (initialUrl && !hasAutoScraped.current) {
      hasAutoScraped.current = true;
      // Small delay to let the UI render first
      const timer = setTimeout(() => {
        handleScrapeAuto(initialUrl);
      }, 300);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUrl]);

  const handleScrapeAuto = async (url: string) => {
    setScraping(true);
    setScrapeError("");
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setScrapeError(data.error || "Failed to scrape");
        return;
      }
      setScraped(data);
      setName(data.name || "");
      setNotes(data.notes || "");
      setPrice(data.price != null ? String(data.price) : "");
      setImagePreview(data.image_url || null);
      setImageSearchQuery(data.name || "");
      setShowConfirm(true);
    } catch {
      setScrapeError("Network error");
    } finally {
      setScraping(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const uploadImageToSupabase = async (): Promise<string | null> => {
    if (!imageFile) return null;
    return imagePreview;
  };

  const handleScrape = async () => {
    if (!productUrl.trim()) return;
    setScraping(true);
    setScrapeError("");
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: productUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setScrapeError(data.error || "Failed to scrape");
        return;
      }
      setScraped(data);
      setName(data.name || "");
      setNotes(data.notes || "");
      setPrice(data.price != null ? String(data.price) : "");
      setImagePreview(data.image_url || null);
      setImageSearchQuery(data.name || "");
      setShowConfirm(true);
    } catch {
      setScrapeError(t("add.networkError"));
    } finally {
      setScraping(false);
    }
  };

  const handleImageSearch = async () => {
    if (!imageSearchQuery.trim()) return;
    setSearchingImages(true);
    setImageSearchError("");
    setImageSearchResults([]);
    try {
      const res = await fetch("/api/image-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: imageSearchQuery.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setImageSearchError(data.error || "Search failed");
        return;
      }
      if (data.images && data.images.length > 0) {
        setImageSearchResults(data.images);
      } else {
        setImageSearchError(t("add.noImagesFound"));
      }
    } catch {
      setImageSearchError(t("add.networkError"));
    } finally {
      setSearchingImages(false);
    }
  };

  const selectSearchImage = (url: string) => {
    setImagePreview(url);
    setShowImageSearch(false);
    setImageSearchResults([]);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    let imageUrl = imagePreview;
    if (mode === "manual" && imageFile) {
      imageUrl = await uploadImageToSupabase();
    }
    await addWish({
      name: name.trim(),
      notes: notes.trim() || null,
      price: parseFloat(price) || 0,
      priority,
      category: category || (categories.length > 0 ? categories[0].name : "Other"),
      image_url: imageUrl || (scraped?.image_url ?? null),
      product_link: mode === "link" ? productUrl.trim() || null : null,
    });
    setSaving(false);
    onClose();
  };

  // ─── Image Search Modal ───
  if (showImageSearch) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] bg-background flex flex-col"
      >
        <div className="px-5 safe-top flex items-center gap-3 py-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => { setShowImageSearch(false); setImageSearchResults([]); }}
            className="w-10 h-10 rounded-full bg-card-bg shadow-card flex items-center justify-center"
          >
            <ArrowLeftIcon className="text-foreground w-5 h-5" />
          </motion.button>
          <h1 className="text-[20px] font-bold text-foreground">{t("add.searchImage")}</h1>
        </div>

        <div className="px-5 mt-2">
          <div className="bg-card-bg rounded-2xl px-4 py-3 shadow-card flex items-center gap-3">
            <SearchIcon className="text-text-muted/40 flex-shrink-0" />
            <input
              type="text"
              value={imageSearchQuery}
              onChange={(e) => setImageSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleImageSearch()}
              placeholder={t("add.searchPlaceholder")}
              className="flex-1 text-[15px] text-foreground placeholder:text-text-muted/50 outline-none bg-transparent"
              autoFocus
            />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleImageSearch}
              disabled={searchingImages || !imageSearchQuery.trim()}
              className="bg-accent text-white rounded-xl px-4 py-2 text-[13px] font-semibold flex-shrink-0"
            >
              {searchingImages ? "..." : t("add.search")}
            </motion.button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollable px-5 pb-8 mt-4">
          {imageSearchError && (
            <p className="text-red-500 text-[13px] text-center py-4">{imageSearchError}</p>
          )}

          {searchingImages && (
            <div className="flex flex-col items-center justify-center py-12">
              <svg className="animate-spin w-8 h-8 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="20" />
              </svg>
              <p className="text-text-muted text-[14px] mt-3">{t("add.searchingImages")}</p>
            </div>
          )}

          {!searchingImages && imageSearchResults.length === 0 && !imageSearchError && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-14 h-14 rounded-full bg-surface flex items-center justify-center mb-3">
                <ImageIcon className="text-text-muted w-6 h-6" />
              </div>
              <p className="text-text-muted text-[14px]">
                {t("add.searchForImages")}
              </p>
              <p className="text-text-muted/50 text-[12px] mt-1">
                {t("add.tapToSelect")}
              </p>
            </div>
          )}

          {imageSearchResults.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {imageSearchResults.map((url, i) => (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => selectSearchImage(url)}
                  className="aspect-square rounded-2xl overflow-hidden bg-card-bg shadow-card relative group"
                >
                  <img
                    src={url}
                    alt={`Result ${i + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-active:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-active:opacity-100 transition-opacity bg-white rounded-full p-2 shadow-card">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E93D5D" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // ─── Confirmation screen after scraping ───
  if (showConfirm && scraped) {
    return (
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="fixed inset-0 z-[60] bg-background flex flex-col"
      >
        <div className="px-5 safe-top flex items-center gap-3 py-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowConfirm(false)}
            className="w-10 h-10 rounded-full bg-card-bg shadow-card flex items-center justify-center"
          >
            <ArrowLeftIcon className="text-foreground w-5 h-5" />
          </motion.button>
          <h1 className="text-[20px] font-bold text-foreground">{t("add.confirmProduct")}</h1>
        </div>

        <div className="flex-1 overflow-y-auto scrollable px-5 pb-32">
          {/* Image area */}
          <div className="mt-4 rounded-3xl overflow-hidden h-56 bg-surface shadow-card relative">
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="Product" className="w-full h-full object-contain" />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => { setImageSearchQuery(name); setShowImageSearch(true); }}
                  className="absolute bottom-3 right-3 bg-card-bg/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-card flex items-center gap-1.5"
                >
                  <SearchIcon className="text-foreground w-4 h-4" />
                  <span className="text-[12px] font-semibold text-foreground">{t("add.change")}</span>
                </motion.button>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
                  <ImageIcon className="text-accent w-6 h-6" />
                </div>
                <p className="text-text-muted text-[13px]">{t("add.noImage")}</p>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setImageSearchQuery(name); setShowImageSearch(true); }}
                  className="bg-accent text-white rounded-full px-5 py-2.5 text-[13px] font-semibold flex items-center gap-2 shadow-card"
                >
                  <SearchIcon className="text-white w-4 h-4" />
                  {t("add.searchImageOnline")}
                </motion.button>
              </div>
            )}
          </div>

          {/* Editable fields */}
          <div className="mt-5">
            <label className="text-[11px] font-bold tracking-wider uppercase text-foreground">
              {t("add.itemName")} <span className="text-accent">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-2 bg-card-bg rounded-2xl px-4 py-3.5 text-[15px] text-foreground shadow-card outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div className="mt-5">
            <label className="text-[11px] font-bold tracking-wider uppercase text-foreground">
              {t("add.description")}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full mt-2 bg-card-bg rounded-2xl px-4 py-3.5 text-[15px] text-foreground shadow-card outline-none focus:ring-2 focus:ring-accent/20 resize-none"
            />
          </div>

          {/* Price & Priority */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="min-w-0">
              <label className="text-[11px] font-bold tracking-wider uppercase text-foreground">{t("add.price")}</label>
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
              <label className="text-[11px] font-bold tracking-wider uppercase text-foreground">{t("add.priority")}</label>
              <div className="mt-2 bg-card-bg rounded-2xl px-2 py-2.5 shadow-card flex items-center justify-between gap-1">
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setPriority(priorities[Math.max(0, priorityIndex - 1)])}
                  className="w-8 h-8 rounded-full bg-surface flex items-center justify-center flex-shrink-0"
                >
                  <MinusIcon className="text-text-muted" />
                </motion.button>
                <span className="font-bold text-[16px] text-foreground">{priority}</span>
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
            <label className="text-[11px] font-bold tracking-wider uppercase text-foreground">{t("add.category")}</label>
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
        </div>

        {/* Confirm Button */}
        <div className="fixed bottom-0 left-0 right-0 px-5 pb-6 pt-3 bg-gradient-to-t from-background via-background to-transparent">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className={`w-full py-4 rounded-2xl font-bold text-[16px] text-white flex items-center justify-center gap-2 ${
              name.trim() ? "bg-accent" : "bg-accent/40"
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {saving ? t("add.saving") : t("add.confirmSave")}
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // ─── Main Add Wish screen ───
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
        <h1 className="text-[20px] font-bold text-foreground">{t("add.title")}</h1>
      </div>

      {/* Mode Toggle */}
      <div className="px-5 mt-2">
        <div className="bg-card-bg rounded-2xl p-1 shadow-card flex">
          <button
            onClick={() => setMode("manual")}
            className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-colors flex items-center justify-center gap-2 ${
              mode === "manual" ? "bg-nav-dark text-white" : "text-text-muted"
            }`}
          >
            <CameraIcon className={`w-4 h-4 ${mode === "manual" ? "text-white" : "text-text-muted"}`} />
            {t("add.manual")}
          </button>
          <button
            onClick={() => setMode("link")}
            className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-colors flex items-center justify-center gap-2 ${
              mode === "link" ? "bg-nav-dark text-white" : "text-text-muted"
            }`}
          >
            <LinkIcon className={`w-4 h-4 ${mode === "link" ? "text-white" : "text-text-muted"}`} />
            {t("add.fromLink")}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollable px-5 pb-32">
        <AnimatePresence mode="wait">
          {mode === "link" ? (
            <motion.div
              key="link-mode"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* URL Input */}
              <div className="mt-5">
                <label className="text-[11px] font-bold tracking-wider uppercase text-foreground">
                  {t("add.productUrl")} <span className="text-accent">*</span>
                </label>
                <div className="mt-2 bg-card-bg rounded-2xl px-4 py-3.5 shadow-card flex items-center gap-3">
                  <LinkIcon className="text-text-muted/40 flex-shrink-0" />
                  <input
                    type="url"
                    value={productUrl}
                    onChange={(e) => { setProductUrl(e.target.value); setScrapeError(""); }}
                    placeholder="https://www.example.com/product..."
                    className="flex-1 text-[15px] text-foreground placeholder:text-text-muted/50 outline-none bg-transparent"
                  />
                </div>
              </div>

              {scrapeError && (
                <p className="mt-2 text-red-500 text-[13px] px-1">{scrapeError}</p>
              )}

              {/* How it works */}
              <div className="mt-6 bg-card-bg/60 rounded-2xl p-5 border border-border-light">
                <h3 className="text-[14px] font-bold text-foreground mb-3">{t("add.howItWorks")}</h3>
                <div className="space-y-3">
                  {[
                    { step: "1", text: t("add.step1") },
                    { step: "2", text: t("add.step2") },
                    { step: "3", text: t("add.step3") },
                  ].map((item) => (
                    <div key={item.step} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-accent text-[12px] font-bold">{item.step}</span>
                      </div>
                      <span className="text-text-secondary text-[14px]">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scrape Button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleScrape}
                disabled={scraping || !productUrl.trim()}
                className={`w-full mt-6 py-4 rounded-2xl font-bold text-[16px] text-white flex items-center justify-center gap-2 ${
                  productUrl.trim() ? "bg-accent" : "bg-accent/40"
                }`}
              >
                {scraping ? (
                  <>
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="20" />
                    </svg>
                    {t("add.extracting")}
                  </>
                ) : (
                  <>
                    <LinkIcon className="text-white w-5 h-5" />
                    {t("add.extractData")}
                  </>
                )}
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="manual-mode"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Image Upload Area */}
              <div
                className="mt-4 border-2 border-dashed border-border-light rounded-3xl h-56 flex flex-col items-center justify-center cursor-pointer overflow-hidden relative bg-surface"
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <p className="text-white text-[14px] font-semibold">{t("add.tapToChange")}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                      <CameraIcon className="text-accent w-6 h-6" />
                    </div>
                    <p className="text-text-muted text-[14px] mt-2 font-medium">{t("add.tapToUpload")}</p>
                    <p className="text-text-muted/50 text-[12px] mt-0.5">{t("add.fileTypes")}</p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Item Name */}
              <div className="mt-6">
                <label className="text-[11px] font-bold tracking-wider uppercase text-foreground">
                  {t("add.itemName")} <span className="text-accent">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sony Headphones"
                  className="w-full mt-2 bg-card-bg rounded-2xl px-4 py-3.5 text-[15px] text-foreground placeholder:text-text-muted/50 shadow-card outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>

              {/* Notes */}
              <div className="mt-5">
                <label className="text-[11px] font-bold tracking-wider uppercase text-foreground">{t("add.notes")}</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t("add.notesPlaceholder")}
                  rows={3}
                  className="w-full mt-2 bg-card-bg rounded-2xl px-4 py-3.5 text-[15px] text-foreground placeholder:text-text-muted/50 shadow-card outline-none focus:ring-2 focus:ring-accent/20 resize-none"
                />
              </div>

              {/* Price & Priority */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="min-w-0">
                  <label className="text-[11px] font-bold tracking-wider uppercase text-foreground">{t("add.price")}</label>
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
                  <label className="text-[11px] font-bold tracking-wider uppercase text-foreground">{t("add.priority")}</label>
                  <div className="mt-2 bg-card-bg rounded-2xl px-2 py-2.5 shadow-card flex items-center justify-between gap-1">
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => setPriority(priorities[Math.max(0, priorityIndex - 1)])}
                      className="w-8 h-8 rounded-full bg-surface flex items-center justify-center flex-shrink-0"
                    >
                      <MinusIcon className="text-text-muted" />
                    </motion.button>
                    <span className="font-bold text-[16px] text-foreground">{priority}</span>
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
                <label className="text-[11px] font-bold tracking-wider uppercase text-foreground">{t("add.category")}</label>
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Save Button (manual mode only) */}
      {mode === "manual" && (
        <div className="fixed bottom-0 left-0 right-0 px-5 pb-6 pt-3 bg-gradient-to-t from-background via-background to-transparent">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className={`w-full py-4 rounded-2xl font-bold text-[16px] text-white flex items-center justify-center gap-2 ${
              name.trim() ? "bg-accent" : "bg-accent/40"
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {saving ? t("add.saving") : t("add.saveToWishlist")}
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}
