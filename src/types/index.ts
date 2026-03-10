export type Priority = "LOW" | "MED" | "HIGH";

export interface UserCategory {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  created_at: string;
}

export interface Wish {
  id: string;
  user_id: string;
  name: string;
  price: number;
  notes: string | null;
  priority: Priority;
  category: string;
  image_url: string | null;
  product_link: string | null;
  is_bought: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface ScrapedProduct {
  name: string;
  price: number | null;
  image_url: string | null;
  notes: string | null;
}

export interface SharedList {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar: string | null;
  recipient_id: string;
  items: SharedWishItem[];
  message: string | null;
  created_at: string;
}

export interface SharedWishItem {
  name: string;
  price: number;
  image_url: string | null;
  category: string;
  priority: Priority;
  notes: string | null;
  product_link: string | null;
}
