"use client";

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

export type CartItem = {
  key: string;
  productId: number;
  slug: string;
  name: string;
  image: string;
  price: number;
  mrp: number;
  size: string;
  color: string;
  qty: number;
};

type User = { id: number; name: string; email: string; role: string } | null;

type StoreCtx = {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "key" | "qty">, qty?: number) => void;
  updateQty: (key: string, qty: number) => void;
  removeFromCart: (key: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  cartMrp: number;
  wishlist: number[];
  toggleWishlist: (productId: number) => void;
  isWishlisted: (productId: number) => boolean;
  user: User;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
  quickViewSlug: string | null;
  setQuickViewSlug: (v: string | null) => void;
  saveForLater: CartItem[];
  moveToSaveLater: (key: string) => void;
  moveToCart: (key: string) => void;
};

const Ctx = createContext<StoreCtx | null>(null);

function readLS<T>(k: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeLS(k: string, v: unknown) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {}
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [user, setUser] = useState<User>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [quickViewSlug, setQuickViewSlug] = useState<string | null>(null);
  const [saveForLater, setSaveForLater] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCart(readLS("nyc_cart", []));
    setWishlist(readLS("nyc_wishlist", []));
    setSaveForLater(readLS("nyc_savelater", []));
    setHydrated(true);
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (hydrated) writeLS("nyc_cart", cart);
  }, [cart, hydrated]);
  useEffect(() => {
    if (hydrated) writeLS("nyc_wishlist", wishlist);
  }, [wishlist, hydrated]);
  useEffect(() => {
    if (hydrated) writeLS("nyc_savelater", saveForLater);
  }, [saveForLater, hydrated]);

  const refreshUser = useCallback(async () => {
    try {
      const r = await fetch("/api/auth", { method: "GET" });
      const j = await r.json();
      setUser(j.user ?? null);
      if (j.user) {
        const w = await fetch("/api/wishlist").then((x) => x.json()).catch(() => null);
        if (w?.ids?.length) {
          setWishlist((prev) => Array.from(new Set([...prev, ...w.ids])));
        }
      }
    } catch {
      setUser(null);
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth", { method: "DELETE" }).catch(() => {});
    setUser(null);
  }, []);

  const addToCart = useCallback((item: Omit<CartItem, "key" | "qty">, qty = 1) => {
    const key = `${item.productId}-${item.size}-${item.color}`;
    setCart((prev) => {
      const found = prev.find((p) => p.key === key);
      if (found) return prev.map((p) => (p.key === key ? { ...p, qty: Math.min(10, p.qty + qty) } : p));
      return [...prev, { ...item, key, qty }];
    });
    setCartOpen(true);
  }, []);

  const updateQty = useCallback((key: string, qty: number) => {
    setCart((prev) =>
      qty <= 0 ? prev.filter((p) => p.key !== key) : prev.map((p) => (p.key === key ? { ...p, qty: Math.min(10, qty) } : p))
    );
  }, []);

  const removeFromCart = useCallback((key: string) => {
    setCart((prev) => prev.filter((p) => p.key !== key));
  }, []);
  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback(
    (productId: number) => {
      setWishlist((prev) => {
        const has = prev.includes(productId);
        const next = has ? prev.filter((x) => x !== productId) : [...prev, productId];
        if (user) {
          fetch("/api/wishlist", {
            method: has ? "DELETE" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId }),
          }).catch(() => {});
        }
        return next;
      });
    },
    [user]
  );
  const isWishlisted = useCallback((id: number) => wishlist.includes(id), [wishlist]);

  const moveToSaveLater = useCallback((key: string) => {
    setCart((prev) => {
      const item = prev.find((p) => p.key === key);
      if (item) setSaveForLater((s) => [...s.filter((x) => x.key !== key), item]);
      return prev.filter((p) => p.key !== key);
    });
  }, []);
  const moveToCart = useCallback((key: string) => {
    setSaveForLater((prev) => {
      const item = prev.find((p) => p.key === key);
      if (item) setCart((c) => [...c, item]);
      return prev.filter((p) => p.key !== key);
    });
  }, []);

  const { cartCount, cartSubtotal, cartMrp } = useMemo(() => {
    return {
      cartCount: cart.reduce((a, b) => a + b.qty, 0),
      cartSubtotal: cart.reduce((a, b) => a + b.price * b.qty, 0),
      cartMrp: cart.reduce((a, b) => a + b.mrp * b.qty, 0),
    };
  }, [cart]);

  const value: StoreCtx = {
    cart, addToCart, updateQty, removeFromCart, clearCart, cartCount, cartSubtotal, cartMrp,
    wishlist, toggleWishlist, isWishlisted, user, refreshUser, logout,
    cartOpen, setCartOpen, searchOpen, setSearchOpen, menuOpen, setMenuOpen,
    quickViewSlug, setQuickViewSlug, saveForLater, moveToSaveLater, moveToCart,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): StoreCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore must be used within StoreProvider");
  return v;
}
