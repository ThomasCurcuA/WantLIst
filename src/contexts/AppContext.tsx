"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import type { Wish, Profile, UserCategory, SharedList, SharedWishItem } from "@/types";

interface UserLike {
  id: string;
  email?: string;
  user_metadata?: Record<string, string>;
}

const DEFAULT_CATEGORIES: UserCategory[] = [
  { id: "default-tech", user_id: "", name: "Tech", icon: "💻", color: "indigo", created_at: "" },
  { id: "default-clothes", user_id: "", name: "Clothes", icon: "👕", color: "pink", created_at: "" },
  { id: "default-subs", user_id: "", name: "Subscriptions", icon: "💳", color: "purple", created_at: "" },
  { id: "default-home", user_id: "", name: "Home", icon: "🏠", color: "orange", created_at: "" },
  { id: "default-exp", user_id: "", name: "Experiences", icon: "⭐", color: "emerald", created_at: "" },
  { id: "default-other", user_id: "", name: "Other", icon: "📦", color: "gray", created_at: "" },
];

interface AppState {
  user: UserLike | null;
  profile: Profile | null;
  wishes: Wish[];
  categories: UserCategory[];
  loading: boolean;
  activeTab: number;
  demoMode: boolean;
  setActiveTab: (tab: number) => void;
  fetchWishes: () => Promise<void>;
  addWish: (wish: Omit<Wish, "id" | "user_id" | "created_at" | "is_bought">) => Promise<void>;
  updateWish: (id: string, updates: Partial<Omit<Wish, "id" | "user_id" | "created_at">>) => Promise<void>;
  deleteWish: (id: string) => Promise<void>;
  markBought: (id: string) => Promise<void>;
  markUnbought: (id: string) => Promise<void>;
  addCategory: (cat: Pick<UserCategory, "name" | "icon" | "color">) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Pick<UserCategory, "name" | "icon" | "color">>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, username?: string) => Promise<{ error: string | null; confirmEmail: boolean }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<Profile, "username" | "avatar_url">>) => Promise<void>;
  searchUsers: (query: string) => Promise<Profile[]>;
  shareWishes: (recipientId: string, items: SharedWishItem[], message?: string) => Promise<{ error: string | null }>;
  sharedLists: SharedList[];
  fetchSharedLists: () => Promise<void>;
}

const AppContext = createContext<AppState | null>(null);

const DEMO_PROFILE: Profile = {
  id: "demo-user",
  email: "demo@wantlist.app",
  username: "WantList User",
  avatar_url: null,
  created_at: "2026-01-01T00:00:00Z",
};

const DEMO_USER: UserLike = { id: "demo-user", email: "demo@wantlist.app" };

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserLike | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [categories, setCategories] = useState<UserCategory[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [sharedLists, setSharedLists] = useState<SharedList[]>([]);
  const demoMode = !supabaseConfigured;

  useEffect(() => {
    if (demoMode) {
      setUser(DEMO_USER);
      setProfile(DEMO_PROFILE);
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [demoMode]);

  useEffect(() => {
    if (demoMode || !user) {
      if (!demoMode) setProfile(null);
      return;
    }
    const fetchProfile = async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) setProfile(data);
      else {
        const newProfile: Profile = {
          id: user.id,
          email: user.email || "",
          username: user.user_metadata?.full_name || "WantList User",
          avatar_url: user.user_metadata?.avatar_url || null,
          created_at: new Date().toISOString(),
        };
        await supabase.from("profiles").upsert(newProfile);
        setProfile(newProfile);
      }
    };
    fetchProfile();
  }, [user, demoMode]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    if (demoMode || !user) return;
    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    if (data && data.length > 0) {
      setCategories(data);
    } else {
      // Seed default categories for new users
      const defaults = DEFAULT_CATEGORIES.map((c) => ({
        name: c.name,
        icon: c.icon,
        color: c.color,
        user_id: user.id,
      }));
      const { data: inserted } = await supabase.from("categories").insert(defaults).select();
      if (inserted) setCategories(inserted);
    }
  }, [user, demoMode]);

  useEffect(() => {
    if (!demoMode && user) fetchCategories();
  }, [user, fetchCategories, demoMode]);

  const fetchWishes = useCallback(async () => {
    if (demoMode || !user) return;
    const { data } = await supabase
      .from("wishes").select("*").eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setWishes(data);
  }, [user, demoMode]);

  useEffect(() => {
    if (!demoMode && user) fetchWishes();
    else if (!demoMode) setWishes([]);
  }, [user, fetchWishes, demoMode]);

  const addWish = async (wish: Omit<Wish, "id" | "user_id" | "created_at" | "is_bought">) => {
    if (!user) return;
    if (demoMode) {
      const newWish: Wish = {
        ...wish, id: crypto.randomUUID(), user_id: user.id,
        is_bought: false, created_at: new Date().toISOString(),
      };
      setWishes((prev) => [newWish, ...prev]);
      return;
    }
    const { data, error } = await supabase
      .from("wishes").insert({ ...wish, user_id: user.id, is_bought: false })
      .select().single();
    if (data && !error) setWishes((prev) => [data, ...prev]);
  };

  const deleteWish = async (id: string) => {
    if (!demoMode) await supabase.from("wishes").delete().eq("id", id);
    setWishes((prev) => prev.filter((w) => w.id !== id));
  };

  const updateWish = async (id: string, updates: Partial<Omit<Wish, "id" | "user_id" | "created_at">>) => {
    if (demoMode) {
      setWishes((prev) => prev.map((w) => (w.id === id ? { ...w, ...updates } : w)));
      return;
    }
    const { data } = await supabase
      .from("wishes").update(updates).eq("id", id).select().single();
    if (data) setWishes((prev) => prev.map((w) => (w.id === id ? data : w)));
  };

  const markBought = async (id: string) => {
    if (demoMode) {
      setWishes((prev) => prev.map((w) => (w.id === id ? { ...w, is_bought: true } : w)));
      return;
    }
    const { data } = await supabase
      .from("wishes").update({ is_bought: true }).eq("id", id).select().single();
    if (data) setWishes((prev) => prev.map((w) => (w.id === id ? data : w)));
  };

  const markUnbought = async (id: string) => {
    if (demoMode) {
      setWishes((prev) => prev.map((w) => (w.id === id ? { ...w, is_bought: false } : w)));
      return;
    }
    const { data } = await supabase
      .from("wishes").update({ is_bought: false }).eq("id", id).select().single();
    if (data) setWishes((prev) => prev.map((w) => (w.id === id ? data : w)));
  };

  // Category CRUD
  const addCategory = async (cat: Pick<UserCategory, "name" | "icon" | "color">) => {
    if (!user) return;
    if (demoMode) {
      const newCat: UserCategory = {
        ...cat, id: crypto.randomUUID(), user_id: user.id,
        created_at: new Date().toISOString(),
      };
      setCategories((prev) => [...prev, newCat]);
      return;
    }
    const { data, error } = await supabase
      .from("categories").insert({ ...cat, user_id: user.id })
      .select().single();
    if (data && !error) setCategories((prev) => [...prev, data]);
  };

  const updateCategory = async (id: string, updates: Partial<Pick<UserCategory, "name" | "icon" | "color">>) => {
    if (demoMode) {
      setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
      return;
    }
    const { data } = await supabase
      .from("categories").update(updates).eq("id", id).select().single();
    if (data) setCategories((prev) => prev.map((c) => (c.id === id ? data : c)));
  };

  const deleteCategory = async (id: string) => {
    if (!demoMode) await supabase.from("categories").delete().eq("id", id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const searchUsers = async (query: string): Promise<Profile[]> => {
    if (demoMode || !user) return [];
    try {
      const res = await fetch("/api/search-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, userId: user.id }),
      });
      const data = await res.json();
      return data.users || [];
    } catch {
      return [];
    }
  };

  const shareWishes = async (recipientId: string, items: SharedWishItem[], message?: string): Promise<{ error: string | null }> => {
    if (!user || !profile) return { error: "Not authenticated" };
    if (demoMode) return { error: "Sharing not available in demo mode" };
    try {
      const res = await fetch("/api/share-wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: user.id,
          senderName: profile.username || "Unknown",
          senderAvatar: profile.avatar_url,
          recipientId,
          items,
          message: message || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || "Share failed" };
      return { error: null };
    } catch {
      return { error: "Network error" };
    }
  };

  const fetchSharedLists = useCallback(async () => {
    if (demoMode || !user) return;
    const { data } = await supabase
      .from("shared_lists")
      .select("*")
      .eq("recipient_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setSharedLists(data);
  }, [user, demoMode]);

  useEffect(() => {
    if (!demoMode && user) fetchSharedLists();
  }, [user, fetchSharedLists, demoMode]);

  const signIn = async (email: string, password: string) => {
    if (demoMode) { setUser(DEMO_USER); setProfile(DEMO_PROFILE); return { error: null }; }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string, username?: string): Promise<{ error: string | null; confirmEmail: boolean }> => {
    if (demoMode) { setUser(DEMO_USER); setProfile(DEMO_PROFILE); return { error: null, confirmEmail: false }; }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: username || "WantList User" } },
    });
    if (error) return { error: error.message, confirmEmail: false };

    // If user is immediately available (no email confirm), create profile with username
    if (data.user) {
      const newProfile: Profile = {
        id: data.user.id,
        email,
        username: username || "WantList User",
        avatar_url: null,
        created_at: new Date().toISOString(),
      };
      await supabase.from("profiles").upsert(newProfile);
    }

    const needsConfirm = !!data.user && !data.session;
    return { error: null, confirmEmail: needsConfirm };
  };

  const signOut = async () => {
    if (!demoMode) await supabase.auth.signOut();
    setUser(null); setProfile(null); setWishes([]); setCategories(DEFAULT_CATEGORIES);
  };

  const updateProfile = async (updates: Partial<Pick<Profile, "username" | "avatar_url">>) => {
    if (!profile) return;
    const updated = { ...profile, ...updates };
    if (demoMode) {
      setProfile(updated);
      return;
    }
    await supabase.from("profiles").update(updates).eq("id", profile.id);
    setProfile(updated);
  };

  const signInWithGoogle = async () => {
    if (demoMode) { setUser(DEMO_USER); setProfile(DEMO_PROFILE); return; }
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } });
  };

  return (
    <AppContext.Provider value={{
      user, profile, wishes, categories, loading, activeTab, demoMode, setActiveTab,
      fetchWishes, addWish, updateWish, deleteWish, markBought, markUnbought,
      addCategory, updateCategory, deleteCategory,
      signIn, signUp, signOut, signInWithGoogle, updateProfile,
      searchUsers, shareWishes, sharedLists, fetchSharedLists,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
