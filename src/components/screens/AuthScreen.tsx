"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import { useT } from "@/lib/i18n";

export default function AuthScreen() {
  const { signIn, signUp, signInWithGoogle } = useApp();
  const t = useT();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError(t("auth.fillFields"));
      return;
    }
    if (!isLogin && !username.trim()) {
      setError(t("auth.usernameRequired"));
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (isLogin) {
      const result = await signIn(email, password);
      if (result.error) setError(result.error);
    } else {
      const result = await signUp(email, password, username.trim());
      if (result.error) {
        setError(result.error);
      } else if (result.confirmEmail) {
        setSuccess(t("auth.accountCreated"));
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-8"
        >
          <div className="w-20 h-20 rounded-3xl bg-accent flex items-center justify-center shadow-card-lg">
            <span className="text-white text-3xl font-bold">W</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-[28px] font-bold text-foreground"
        >
          WantList
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-text-muted text-[15px] mt-1"
        >
          {t("auth.tagline")}
        </motion.p>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full mt-8 max-w-sm"
        >
          {/* Toggle */}
          <div className="flex bg-card-bg rounded-2xl p-1 shadow-card mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 rounded-xl text-[14px] font-semibold transition-colors ${
                isLogin ? "bg-nav-dark text-white" : "text-text-muted"
              }`}
            >
              {t("auth.signIn")}
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 rounded-xl text-[14px] font-semibold transition-colors ${
                !isLogin ? "bg-nav-dark text-white" : "text-text-muted"
              }`}
            >
              {t("auth.signUp")}
            </button>
          </div>

          {/* Form */}
          <div className="space-y-3">
            {!isLogin && (
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t("auth.username")}
                className="w-full bg-card-bg rounded-2xl px-4 py-3.5 text-[15px] text-foreground placeholder:text-text-muted/50 shadow-card outline-none focus:ring-2 focus:ring-accent/20"
              />
            )}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("auth.email")}
              className="w-full bg-card-bg rounded-2xl px-4 py-3.5 text-[15px] text-foreground placeholder:text-text-muted/50 shadow-card outline-none focus:ring-2 focus:ring-accent/20"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("auth.password")}
              className="w-full bg-card-bg rounded-2xl px-4 py-3.5 text-[15px] text-foreground placeholder:text-text-muted/50 shadow-card outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-[13px] mt-3 text-center"
            >
              {error}
            </motion.p>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 bg-green-50 border border-green-200 rounded-2xl px-4 py-3 text-center"
            >
              <p className="text-green-700 text-[13px] font-medium">{success}</p>
            </motion.div>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-5 bg-accent text-white font-bold text-[15px] py-3.5 rounded-2xl"
          >
            {loading ? t("auth.loading") : isLogin ? t("auth.signIn") : t("auth.createAccount")}
          </motion.button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px bg-border-light" />
            <span className="text-text-muted text-[13px]">{t("auth.or")}</span>
            <div className="flex-1 h-px bg-border-light" />
          </div>

          {/* Google */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={signInWithGoogle}
            className="w-full bg-card-bg text-foreground font-semibold text-[15px] py-3.5 rounded-2xl shadow-card flex items-center justify-center gap-3"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {t("auth.google")}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
