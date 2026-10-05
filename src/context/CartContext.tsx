import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import { cartApi, productsApi, type CartLine, type CartSummary, type LineInput, type Product } from '../api';
import { useAuth } from './AuthContext';

const GUEST_KEY = 'cstyle-guest-cart';

export interface AddToCartInput {
  product: Product;
  size?: string;
  color?: string;
  quantity?: number;
}

interface CartContextType {
  items: CartLine[];
  totalItems: number;
  /** Sum of available lines at current prices. */
  totalPrice: number;
  loading: boolean;
  addToCart: (input: AddToCartInput) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeFromCart: (lineId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  /** Lines in the shape the order / quote APIs expect. */
  toLineInputs: () => LineInput[];
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

const readGuest = (): CartLine[] => {
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeGuest = (lines: CartLine[]) => {
  try { localStorage.setItem(GUEST_KEY, JSON.stringify(lines)); } catch { /* storage unavailable */ }
};

const findVariant = (product: Product, size?: string, color?: string) =>
  product.variants?.find(v => (v.size || '') === (size || '') && (v.color || '').toLowerCase() === (color || '').toLowerCase());

const stockFor = (product: Product, variantId: string | null) => {
  if (!product.variants?.length) return product.stock;
  return product.variants.find(v => v._id === variantId)?.stock ?? 0;
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, ready } = useAuth();
  const [items, setItems] = useState<CartLine[]>([]);
  const [loading, setLoading] = useState(false);
  const wasAuthenticated = useRef(false);

  const applySummary = (summary: CartSummary) => setItems(summary.items);

  // Re-prices guest lines from the API so the cart never shows stale prices or stock.
  const refreshGuest = useCallback(async () => {
    const lines = readGuest();
    if (!lines.length) {
      setItems([]);
      return;
    }
    try {
      const ids = [...new Set(lines.map(l => l.productId))].join(',');
      const res = await productsApi.list({ ids, limit: 100 });
      const byId = new Map(res.data.map(p => [p.id, p]));
      const next = lines.map(l => {
        const p = byId.get(l.productId);
        if (!p) return { ...l, available: false, stock: 0 };
        const stock = stockFor(p, l.variantId);
        return {
          ...l,
          name: p.name,
          image: p.thumbnail,
          unitPrice: p.finalPrice,
          originalPrice: p.price,
          lineTotal: p.finalPrice * l.quantity,
          stock,
          available: stock >= l.quantity,
        };
      });
      writeGuest(next);
      setItems(next);
    } catch {
      setItems(lines);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (isAuthenticated) {
      const res = await cartApi.get();
      applySummary(res.data);
    } else {
      await refreshGuest();
    }
  }, [isAuthenticated, refreshGuest]);

  // Load the right cart when the session changes; move a guest cart into the account on login.
  useEffect(() => {
    if (!ready) return;
    const run = async () => {
      setLoading(true);
      try {
        if (isAuthenticated) {
          const guest = readGuest();
          if (guest.length) {
            const res = await cartApi.merge(guest.map(l => ({
              productId: l.productId, variantId: l.variantId, size: l.size, color: l.color, quantity: l.quantity,
            })));
            writeGuest([]);
            applySummary(res.data);
          } else {
            applySummary((await cartApi.get()).data);
          }
        } else if (wasAuthenticated.current) {
          // Logged out: the account cart stays on the server.
          setItems([]);
        } else {
          await refreshGuest();
        }
      } catch {
        // Leave the current cart in place if the API is unreachable.
      } finally {
        wasAuthenticated.current = isAuthenticated;
        setLoading(false);
      }
    };
    run();
  }, [isAuthenticated, ready, refreshGuest]);

  const addToCart = useCallback(async ({ product, size = '', color = '', quantity = 1 }: AddToCartInput) => {
    const variant = findVariant(product, size, color);
    if (product.variants?.length && !variant) throw new Error('Please choose a size and colour');
    if (isAuthenticated) {
      const res = await cartApi.add({ productId: product.id, variantId: variant?._id, size, color, quantity });
      applySummary(res.data);
      return;
    }
    const stock = variant ? variant.stock : product.stock;
    const lines = readGuest();
    const id = `${product.id}:${variant?._id || ''}`;
    const existing = lines.find(l => l.id === id);
    const wanted = (existing?.quantity || 0) + quantity;
    if (wanted > stock) {
      throw new Error(stock > 0 ? `Only ${stock} available for ${product.name}` : `${product.name} is out of stock`);
    }
    const next = existing
      ? lines.map(l => (l.id === id ? { ...l, quantity: wanted, lineTotal: l.unitPrice * wanted } : l))
      : [...lines, {
        id,
        productId: product.id,
        variantId: variant?._id || null,
        name: product.name,
        slug: product.slug,
        image: product.thumbnail,
        size: variant?.size || size,
        color: variant?.color || color,
        quantity,
        unitPrice: product.finalPrice,
        originalPrice: product.price,
        lineTotal: product.finalPrice * quantity,
        stock,
        available: true,
      }];
    writeGuest(next);
    setItems(next);
  }, [isAuthenticated]);

  const updateQuantity = useCallback(async (lineId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCartRef.current(lineId);
      return;
    }
    if (isAuthenticated) {
      applySummary((await cartApi.update(lineId, quantity)).data);
      return;
    }
    const lines = readGuest();
    const line = lines.find(l => l.id === lineId);
    if (!line) return;
    if (quantity > line.stock) throw new Error(`Only ${line.stock} available for ${line.name}`);
    const next = lines.map(l => (l.id === lineId ? { ...l, quantity, lineTotal: l.unitPrice * quantity, available: true } : l));
    writeGuest(next);
    setItems(next);
  }, [isAuthenticated]);

  const removeFromCart = useCallback(async (lineId: string) => {
    if (isAuthenticated) {
      applySummary((await cartApi.remove(lineId)).data);
      return;
    }
    const next = readGuest().filter(l => l.id !== lineId);
    writeGuest(next);
    setItems(next);
  }, [isAuthenticated]);

  const removeFromCartRef = useRef(removeFromCart);
  removeFromCartRef.current = removeFromCart;

  const clearCart = useCallback(async () => {
    if (isAuthenticated) {
      try { applySummary((await cartApi.clear()).data); } catch { setItems([]); }
      return;
    }
    writeGuest([]);
    setItems([]);
  }, [isAuthenticated]);

  const toLineInputs = useCallback(() => items
    .filter(i => i.available)
    .map(i => ({ productId: i.productId, variantId: i.variantId, size: i.size, color: i.color, quantity: i.quantity })), [items]);

  const value = useMemo<CartContextType>(() => ({
    items,
    totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
    totalPrice: items.filter(i => i.available).reduce((sum, i) => sum + i.lineTotal, 0),
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    toLineInputs,
    refresh,
  }), [items, loading, addToCart, updateQuantity, removeFromCart, clearCart, toLineInputs, refresh]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
