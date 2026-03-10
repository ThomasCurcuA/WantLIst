"use client";

import { motion } from "framer-motion";

export default function SplashScreen({ onFinished }: { onFinished?: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[200] bg-background flex flex-col items-center justify-center"
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      {/* Ambient glow behind logo */}
      <motion.div
        className="absolute w-56 h-56 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(233,61,93,0.15) 0%, transparent 70%)",
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      />

      {/* Logo icon */}
      <motion.div
        className="relative w-24 h-24 rounded-[28px] bg-accent flex items-center justify-center shadow-xl"
        style={{ boxShadow: "0 8px 40px rgba(233,61,93,0.35)" }}
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.1,
        }}
      >
        <motion.span
          className="text-white text-[44px] font-bold select-none"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
        >
          W
        </motion.span>
      </motion.div>

      {/* App name */}
      <motion.h1
        className="mt-6 text-[32px] font-extrabold text-foreground tracking-tight"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
      >
        Want<span className="text-accent">List</span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="mt-2 text-text-muted text-[14px] font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.75, duration: 0.5 }}
      >
        Track your dream purchases ✨
      </motion.p>

      {/* Loading bar */}
      <motion.div
        className="mt-10 w-40 h-1 rounded-full bg-surface overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.3 }}
      >
        <motion.div
          className="h-full rounded-full bg-accent"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{
            delay: 1,
            duration: 2,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          onAnimationComplete={onFinished}
        />
      </motion.div>

      {/* Decorative dots */}
      <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-accent/5"
            style={{
              width: [120, 80, 160][i],
              height: [120, 80, 160][i],
              left: ["10%", "65%", "40%"][i],
              bottom: [-30, -20, -60][i],
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.2, duration: 0.8 }}
          />
        ))}
      </div>
    </motion.div>
  );
}
