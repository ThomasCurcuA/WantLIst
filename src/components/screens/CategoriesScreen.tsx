"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import { useT } from "@/lib/i18n";
import { PlusIcon, ChevronRightIcon, ArrowLeftIcon } from "@/lib/icons";
import type { UserCategory } from "@/types";

const EMOJI_OPTIONS = ["💻", "👕", "💳", "🏠", "⭐", "📦", "🎮", "📱", "🎵", "📚", "🎨", "🍔", "✈️", "🏋️", "🎁", "💍", "🚗", "🐾", "🌱", "💊"];
const COLOR_OPTIONS = [
  { name: "indigo", bg: "bg-indigo-50", text: "text-indigo-600", dot: "bg-indigo-500" },
  { name: "pink", bg: "bg-pink-50", text: "text-pink-600", dot: "bg-pink-500" },
  { name: "purple", bg: "bg-purple-50", text: "text-purple-600", dot: "bg-purple-500" },
  { name: "orange", bg: "bg-orange-50", text: "text-orange-600", dot: "bg-orange-500" },
  { name: "emerald", bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-500" },
  { name: "gray", bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-500" },
  { name: "red", bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500" },
  { name: "sky", bg: "bg-sky-50", text: "text-sky-600", dot: "bg-sky-500" },
];

function getColorConfig(color: string) {
  return COLOR_OPTIONS.find((c) => c.name === color) || COLOR_OPTIONS[5]; // default gray
}

export default function CategoriesScreen() {
  const { wishes, categories, addCategory, updateCategory, deleteCategory } = useApp();
  const t = useT();
  const activeWishes = wishes.filter((w) => !w.is_bought);

  const [showForm, setShowForm] = useState(false);
  const [editingCat, setEditingCat] = useState<UserCategory | null>(null);
  const [formName, setFormName] = useState("");
  const [formIcon, setFormIcon] = useState("📦");
  const [formColor, setFormColor] = useState("gray");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const categoryCounts: Record<string, number> = {};
  activeWishes.forEach((w) => {
    categoryCounts[w.category] = (categoryCounts[w.category] || 0) + 1;
  });

  const totalItems = activeWishes.length;

  const openCreate = () => {
    setEditingCat(null);
    setFormName("");
    setFormIcon("📦");
    setFormColor("gray");
    setShowForm(true);
  };

  const openEdit = (cat: UserCategory) => {
    setEditingCat(cat);
    setFormName(cat.name);
    setFormIcon(cat.icon);
    setFormColor(cat.color);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) return;
    if (editingCat) {
      await updateCategory(editingCat.id, { name: formName.trim(), icon: formIcon, color: formColor });
    } else {
      await addCategory({ name: formName.trim(), icon: formIcon, color: formColor });
    }
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    await deleteCategory(id);
    setConfirmDelete(null);
  };

  // Category form modal
  if (showForm) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col h-full"
      >
        <div className="px-5 safe-top flex items-center gap-3 py-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowForm(false)}
            className="w-10 h-10 rounded-full bg-card-bg shadow-card flex items-center justify-center"
          >
            <ArrowLeftIcon className="text-foreground w-5 h-5" />
          </motion.button>
          <h1 className="text-[20px] font-bold text-foreground">
            {editingCat ? t("categories.editCategory") : t("categories.newCategory")}
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto scrollable px-5 pb-28">
          {/* Preview */}
          <div className="mt-5 flex justify-center">
            <div className={`w-20 h-20 rounded-3xl ${getColorConfig(formColor).bg} flex items-center justify-center`}>
              <span className="text-3xl">{formIcon}</span>
            </div>
          </div>

          {/* Name */}
          <div className="mt-6">
            <label className="text-[11px] font-bold tracking-wider uppercase text-foreground">
              {t("categories.categoryName")} <span className="text-accent">*</span>
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Gaming"
              className="w-full mt-2 bg-card-bg rounded-2xl px-4 py-3.5 text-[15px] text-foreground placeholder:text-text-muted/50 shadow-card outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>

          {/* Icon Picker */}
          <div className="mt-5">
            <label className="text-[11px] font-bold tracking-wider uppercase text-foreground">{t("categories.icon")}</label>
            <div className="mt-2 grid grid-cols-10 gap-2">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setFormIcon(emoji)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-colors ${
                    formIcon === emoji ? "bg-nav-dark scale-110" : "bg-card-bg shadow-card"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div className="mt-5">
            <label className="text-[11px] font-bold tracking-wider uppercase text-foreground">{t("categories.color")}</label>
            <div className="mt-2 flex flex-wrap gap-3">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setFormColor(c.name)}
                  className={`w-10 h-10 rounded-full ${c.dot} transition-all ${
                    formColor === c.name ? "ring-2 ring-offset-2 ring-nav-dark scale-110" : ""
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Delete button (edit mode only) */}
          {editingCat && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setConfirmDelete(editingCat.id)}
              className="mt-8 w-full bg-red-50 text-red-500 font-semibold text-[14px] py-3.5 rounded-2xl"
            >
              {t("categories.deleteCategory")}
            </motion.button>
          )}
        </div>

        {/* Save Button */}
        <div className="fixed bottom-0 left-0 right-0 px-5 pb-6 pt-3 bg-gradient-to-t from-background via-background to-transparent">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={!formName.trim()}
            className={`w-full py-4 rounded-2xl font-bold text-[16px] text-white flex items-center justify-center gap-2 ${
              formName.trim() ? "bg-accent" : "bg-accent/40"
            }`}
          >
            {editingCat ? t("categories.updateCategory") : t("categories.createCategory")}
          </motion.button>
        </div>

        {/* Delete Confirmation */}
        <AnimatePresence>
          {confirmDelete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center px-8"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-card-bg rounded-3xl p-6 w-full max-w-sm shadow-card-lg"
              >
                <h3 className="text-[18px] font-bold text-foreground text-center">{t("categories.deleteConfirm")}</h3>
                <p className="text-text-muted text-[14px] text-center mt-2">
                  {t("categories.deleteDesc")}
                </p>
                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="flex-1 py-3 rounded-2xl bg-surface font-semibold text-[14px] text-foreground"
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    onClick={() => handleDelete(confirmDelete)}
                    className="flex-1 py-3 rounded-2xl bg-red-500 font-semibold text-[14px] text-white"
                  >
                    {t("common.delete")}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

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
            <p className="text-[11px] font-bold tracking-[2px] text-text-muted uppercase">{t("categories.organize")}</p>
            <h1 className="text-[26px] font-bold text-foreground mt-0.5">{t("categories.title")}</h1>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={openCreate}
            className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shadow-card"
          >
            <PlusIcon className="text-white w-5 h-5" />
          </motion.button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollable px-5 pb-28">
        {/* Summary */}
        <div className="mt-5 flex items-center justify-between">
          <h2 className="text-[16px] font-bold text-foreground">{t("categories.yourCollections")}</h2>
          <span className="text-[13px] text-text-muted">
            {String(totalItems).padStart(2, "0")} {t("categories.totalItems")}
          </span>
        </div>

        {/* Horizontal scrollable cards */}
        <div className="flex gap-3 overflow-x-auto scrollable pb-2 mt-3">
          {categories.filter((cat) => (categoryCounts[cat.name] || 0) > 0).length > 0 ? (
            categories
              .filter((cat) => (categoryCounts[cat.name] || 0) > 0)
              .map((cat) => {
                const count = categoryCounts[cat.name] || 0;
                const colorConf = getColorConfig(cat.color);
                return (
                  <motion.div
                    key={cat.id}
                    whileTap={{ scale: 0.95 }}
                    className="min-w-[140px] bg-card-bg rounded-3xl p-5 shadow-card flex flex-col items-start"
                  >
                    <div className={`w-10 h-10 rounded-xl ${colorConf.bg} flex items-center justify-center`}>
                      <span className="text-lg">{cat.icon}</span>
                    </div>
                    <p className="font-bold text-[15px] text-foreground mt-3">{cat.name}</p>
                    <p className="text-text-muted text-[13px]">{count} {t("categories.items")}</p>
                  </motion.div>
                );
              })
          ) : (
            <div className="w-full text-center py-8 text-text-muted text-[14px]">
              {t("categories.noItems")}
            </div>
          )}
        </div>

        {/* All Categories List */}
        <div className="mt-6">
          <h2 className="text-[16px] font-bold text-foreground mb-3">{t("categories.allCategories")}</h2>
          <div className="space-y-3">
            {categories.map((cat) => {
              const count = categoryCounts[cat.name] || 0;
              const colorConf = getColorConfig(cat.color);
              return (
                <motion.div
                  key={cat.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openEdit(cat)}
                  className="bg-card-bg rounded-2xl p-4 shadow-card flex items-center gap-4 cursor-pointer"
                >
                  <div className={`w-10 h-10 rounded-xl ${colorConf.bg} flex items-center justify-center`}>
                    <span className="text-lg">{cat.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[15px] text-foreground">{cat.name}</p>
                    <p className="text-text-muted text-[13px]">{count} {t("categories.items")}</p>
                  </div>
                  <ChevronRightIcon className="text-text-muted" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
