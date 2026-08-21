import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import type { BotUser, Category, Order, Product } from "../types";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (cancelled) return;
      if (error) {
        setError(error.message);
      } else {
        setCategories(data ?? []);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { categories, loading, error };
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_available", true)
        .order("sort_order", { ascending: true });

      if (cancelled) return;
      if (error) {
        setError(error.message);
      } else {
        setProducts(data ?? []);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { products, loading, error };
}

export function useBotUser(telegramId: number | null) {
  const [botUser, setBotUser] = useState<BotUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (telegramId == null) {
      setBotUser(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("bot_users")
        .select("telegram_id, full_name, phone")
        .eq("telegram_id", telegramId)
        .maybeSingle();

      if (cancelled) return;
      if (error) {
        console.error("bot_users so'rovida xatolik:", error.message);
      } else {
        setBotUser(data);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [telegramId]);

  return { botUser, loading };
}

const ORDERS_SELECT = "id, order_number, customer_name, order_type, grand_total, status, created_at, order_items(product_name, quantity)";

export function useMyOrders(telegramId: number | null) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (telegramId == null) {
      setOrders([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select(ORDERS_SELECT)
        .eq("user_telegram_id", telegramId)
        .order("created_at", { ascending: false });

      if (cancelled) return;
      if (error) {
        setError(error.message);
      } else {
        setOrders((data as unknown as Order[]) ?? []);
      }
      setLoading(false);
    }

    load();

    // Faol buyurtma holati real vaqtda o'zgarishi uchun 'orders' jadvaliga obuna
    const channel = supabase
      .channel(`orders-user-${telegramId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `user_telegram_id=eq.${telegramId}`,
        },
        () => {
          load();
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [telegramId]);

  return { orders, loading, error };
}
