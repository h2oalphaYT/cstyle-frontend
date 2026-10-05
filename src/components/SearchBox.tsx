import { forwardRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { productsApi, type Category } from '../api';
import { useTheme } from '../context/ThemeContext';
import SafeImage from './SafeImage';

type Suggestion = { id: string; name: string; slug: string; thumbnail: string; price: number };

interface SearchBoxProps {
  className?: string;
  inputClassName?: string;
  onDone?: () => void;
  showButton?: boolean;
}

/** Product search with live suggestions (products and categories) from the API. */
const SearchBox = forwardRef<HTMLInputElement, SearchBoxProps>(({ className = '', inputClassName = '', onDone, showButton }, ref) => {
  const navigate = useNavigate();
  const { formatPrice } = useTheme();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<Suggestion[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setProducts([]);
      setCategories([]);
      return undefined;
    }
    const controller = new AbortController();
    const t = setTimeout(() => {
      productsApi.suggestions(term, controller.signal)
        .then(res => {
          setProducts(res.data.products);
          setCategories(res.data.categories);
        })
        .catch(() => undefined);
    }, 250);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [query]);

  const go = (path: string) => {
    navigate(path);
    setQuery('');
    setOpen(false);
    onDone?.();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) go(`/shop?search=${encodeURIComponent(query.trim())}`);
  };

  const hasSuggestions = open && (products.length > 0 || categories.length > 0);

  return (
    <form onSubmit={submit} className={`relative ${className}`} role="search">
      <input
        ref={ref}
        type="search"
        placeholder="Search products, SKU, category…"
        aria-label="Search products"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className={inputClassName}
        autoComplete="off"
      />
      {showButton && (
        <button type="submit" className="absolute right-0 top-1/2 -translate-y-1/2" aria-label="Search">
          <Search className="w-4 h-4 text-brand-muted hover:text-brand-champagne transition-colors" />
        </button>
      )}
      {hasSuggestions && (
        <div className="absolute left-0 right-0 sm:right-auto sm:w-80 top-full mt-2 z-50 bg-brand-surface border border-white/10 shadow-2xl py-2">
          {categories.map(c => (
            <button type="button" key={c.id} onMouseDown={(e) => e.preventDefault()} onClick={() => go(`/shop?category=${c.slug}`)}
              className="w-full text-left px-4 py-2 text-[11px] uppercase tracking-[0.15em] text-brand-champagne hover:bg-white/5">
              Category · {c.name}
            </button>
          ))}
          {products.map(p => (
            <button type="button" key={p.id} onMouseDown={(e) => e.preventDefault()} onClick={() => go(`/product/${p.slug || p.id}`)}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/5 text-left">
              <SafeImage src={p.thumbnail} alt="" wrapperClassName="w-9 h-11 flex-shrink-0" className="w-full h-full object-cover" />
              <span className="flex-1 min-w-0">
                <span className="block text-xs text-white truncate">{p.name}</span>
                <span className="block text-[11px] text-brand-muted">{formatPrice(p.price)}</span>
              </span>
            </button>
          ))}
          <button type="submit" onMouseDown={(e) => e.preventDefault()}
            className="w-full text-left px-4 py-2 text-[11px] text-brand-muted hover:text-white uppercase tracking-[0.15em] border-t border-white/6 mt-1">
            See all results for "{query.trim()}"
          </button>
        </div>
      )}
    </form>
  );
});

SearchBox.displayName = 'SearchBox';
export default SearchBox;
