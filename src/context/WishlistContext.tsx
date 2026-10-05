import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import { productsApi, wishlistApi, type Product } from '../api';
import { useAuth } from './AuthContext';

const GUEST_KEY = 'cstyle-guest-wishlist';

interface WishlistContextType {
  items: Product[];
  loading: boolean;
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  toggleWishlist: (product: Product) => Promise<boolean>;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

const readGuestIds = (): string[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(GUEST_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter(x => typeof x === 'string') : [];
  } catch {
    return [];
  }
};
const writeGuestIds = (ids: string[]) => {
  try { localStorage.setItem(GUEST_KEY, JSON.stringify(ids)); } catch { /* storage unavailable */ }
};

/** Persistent wishlist: stored on the account when logged in, in the browser for guests. */
export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, ready } = useAuth();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const wasAuthenticated = useRef(false);

  useEffect(() => {
    if (!ready) return;
    const run = async () => {
      setLoading(true);
      try {
        if (isAuthenticated) {
          const guest = readGuestIds();
          const res = guest.length ? await wishlistApi.merge(guest) : await wishlistApi.get();
          writeGuestIds([]);
          setItems(res.data);
        } else if (wasAuthenticated.current) {
          setItems([]);
        } else {
          const ids = readGuestIds();
          setItems(ids.length ? (await productsApi.list({ ids: ids.join(','), limit: 100 })).data : []);
        }
      } catch {
        // Keep what we have if the API is unreachable.
      } finally {
        wasAuthenticated.current = isAuthenticated;
        setLoading(false);
      }
    };
    run();
  }, [isAuthenticated, ready]);

  const addToWishlist = useCallback(async (product: Product) => {
    if (isAuthenticated) {
      setItems((await wishlistApi.add(product.id)).data);
      return;
    }
    const ids = readGuestIds();
    if (!ids.includes(product.id)) writeGuestIds([...ids, product.id]);
    setItems(prev => (prev.some(p => p.id === product.id) ? prev : [...prev, product]));
  }, [isAuthenticated]);

  const removeFromWishlist = useCallback(async (productId: string) => {
    if (isAuthenticated) {
      setItems((await wishlistApi.remove(productId)).data);
      return;
    }
    writeGuestIds(readGuestIds().filter(id => id !== productId));
    setItems(prev => prev.filter(p => p.id !== productId));
  }, [isAuthenticated]);

  const isInWishlist = useCallback((productId: string) => items.some(p => p.id === productId), [items]);

  const toggleWishlist = useCallback(async (product: Product) => {
    if (items.some(p => p.id === product.id)) {
      await removeFromWishlist(product.id);
      return false;
    }
    await addToWishlist(product);
    return true;
  }, [items, addToWishlist, removeFromWishlist]);

  const value = useMemo(() => ({
    items, loading, addToWishlist, removeFromWishlist, toggleWishlist, isInWishlist,
  }), [items, loading, addToWishlist, removeFromWishlist, toggleWishlist, isInWishlist]);

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
