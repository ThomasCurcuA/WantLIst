"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import { useT, useLanguage } from "@/lib/i18n";
import { ArrowLeftIcon } from "@/lib/icons";

export default function AccountScreen({ onClose }: { onClose: () => void }) {
  const { profile, updateProfile } = useApp();
  const t = useT();
  const { language } = useLanguage();

  const [username, setUsername] = useState(profile?.username || "");
  const [saving, setSaving] = useState(false);

  const memberDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(language === "it" ? "it-IT" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown";

  const hasChanges = username !== (profile?.username || "");

  const handleSave = async () => {
    if (!hasChanges || !username.trim()) return;
    setSaving(true);
    await updateProfile({ username: username.trim() });
    setSaving(false);
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
        <h1 className="text-[20px] font-bold text-foreground">{t("account.title")}</h1>
      </div>

      <div className="flex-1 overflow-y-auto scrollable px-5 pb-32">
        {/* Avatar */}
        <div className="mt-6 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-surface overflow-hidden">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center text-accent font-bold text-3xl">
                {(profile?.username?.[0] || "W").toUpperCase()}
              </div>
            )}
          </div>
          <p className="text-text-muted text-[13px] mt-2">
            {t("account.avatarHint")}
          </p>
        </div>

        {/* Username */}
        <div className="mt-8">
          <label className="text-[11px] font-bold tracking-wider uppercase text-foreground">
            {t("account.username")}
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={t("account.displayName")}
            className="w-full mt-2 bg-card-bg rounded-2xl px-4 py-3.5 text-[15px] text-foreground placeholder:text-text-muted/50 shadow-card outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>

        {/* Email (read-only) */}
        <div className="mt-5">
          <label className="text-[11px] font-bold tracking-wider uppercase text-foreground">
            {t("account.email")}
          </label>
          <div className="mt-2 bg-surface rounded-2xl px-4 py-3.5 text-[15px] text-text-muted">
            {profile?.email || "\u2014"}
          </div>
        </div>

        {/* Member Since (read-only) */}
        <div className="mt-5">
          <label className="text-[11px] font-bold tracking-wider uppercase text-foreground">
            {t("account.memberSince")}
          </label>
          <div className="mt-2 bg-surface rounded-2xl px-4 py-3.5 text-[15px] text-text-muted">
            {memberDate}
          </div>
        </div>

        {/* Account ID */}
        <div className="mt-5">
          <label className="text-[11px] font-bold tracking-wider uppercase text-foreground">
            {t("account.accountId")}
          </label>
          <div className="mt-2 bg-surface rounded-2xl px-4 py-3.5 text-[13px] text-text-muted/60 font-mono truncate">
            {profile?.id || "\u2014"}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-6 pt-3 bg-gradient-to-t from-background via-background to-transparent">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={saving || !hasChanges || !username.trim()}
          className={`w-full py-4 rounded-2xl font-bold text-[16px] text-white flex items-center justify-center gap-2 ${
            hasChanges && username.trim() ? "bg-accent" : "bg-accent/30"
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {saving ? t("account.saving") : t("account.saveChanges")}
        </motion.button>
      </div>
    </motion.div>
  );
}
