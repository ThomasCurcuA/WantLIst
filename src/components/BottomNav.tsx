"use client";

import { motion } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import { HeartIcon, GridIcon, CheckSquareIcon, UserIcon, PlusIcon } from "@/lib/icons";
import { useT } from "@/lib/i18n";

export default function BottomNav({ onFabPress }: { onFabPress: () => void }) {
  const { activeTab, setActiveTab } = useApp();
  const t = useT();

  const tabs = [
    { labelKey: "nav.wishes", icon: HeartIcon, filledOnActive: true },
    { labelKey: "nav.categories", icon: GridIcon },
    { labelKey: "fab", icon: PlusIcon },
    { labelKey: "nav.bought", icon: CheckSquareIcon },
    { labelKey: "nav.profile", icon: UserIcon },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
      <div className="mx-4 mb-2 bg-card-bg rounded-[28px] shadow-nav flex items-center justify-around px-2 py-2 relative">
        {tabs.map((tab, i) => {
          if (tab.labelKey === "fab") {
            return (
              <motion.button
                key="fab"
                whileTap={{ scale: 0.9 }}
                onClick={onFabPress}
                className="w-14 h-14 -mt-8 rounded-full bg-accent flex items-center justify-center shadow-card-lg"
              >
                <PlusIcon className="text-white w-7 h-7" />
              </motion.button>
            );
          }

          const tabIndex = i > 2 ? i - 1 : i;
          const isActive = activeTab === tabIndex;

          return (
            <motion.button
              key={tab.labelKey}
              whileTap={{ scale: 0.9 }}
              onClick={() => setActiveTab(tabIndex)}
              className="flex flex-col items-center justify-center w-14 py-1 relative"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute top-[-8px] w-8 h-[3px] bg-accent rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <tab.icon
                filled={tab.filledOnActive && isActive}
                className={isActive ? "text-accent" : "text-text-muted"}
              />
              <span
                className={`text-[10px] mt-0.5 font-medium ${
                  isActive ? "text-accent" : "text-text-muted"
                }`}
              >
                {t(tab.labelKey)}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
