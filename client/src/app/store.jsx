import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, setToken, getToken } from './api';

const StoreContext = createContext(null);

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem('hzshop_cart') || '[]');
  } catch {
    return [];
  }
}

export function StoreProvider({ children }) {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState(loadCart());

  useEffect(() => {
    localStorage.setItem('hzshop_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    api('/api/auth/me', { auth: true })
      .then((d) => setUser(d.user))
      .catch(() => {
        setToken('');
        setUser(null);
      });
  }, []);

  const actions = useMemo(() => ({
    async login(email, password) {
      const d = await api('/api/auth/login', { method: 'POST', body: { email, password } });
      setToken(d.token);
      setUser(d.user);
    },
    async register(name, email, password) {
      const d = await api('/api/auth/register', { method: 'POST', body: { name, email, password } });
      setToken(d.token);
      setUser(d.user);
    },
    logout() {
      setToken('');
      setUser(null);
    },
    addToCart(product, { qty = 1, color = '', size = '' } = {}) {
      setCart((prev) => {
        const key = `${product._id}:${color}:${size}`;
        const idx = prev.findIndex((i) => i.key === key);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = { ...copy[idx], qty: copy[idx].qty + qty };
          return copy;
        }
        return [...prev, {
          key,
          productId: product._id,
          title: product.title,
          price: product.price,
          image: product.images?.[0] || '',
          color,
          size,
          qty
        }];
      });
    },
    updateQty(key, qty) {
      setCart((prev) => prev.map((i) => (i.key === key ? { ...i, qty: Math.max(1, qty) } : i)));
    },
    removeItem(key) {
      setCart((prev) => prev.filter((i) => i.key !== key));
    },
    clearCart() {
      setCart([]);
    }
  }), []);

  const value = useMemo(() => ({ user, cart, ...actions }), [user, cart, actions]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
