import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Container from '../components/Container';
import ProductCard from '../components/ProductCard';
import { api } from '../app/api';
import { useTranslation } from 'react-i18next';

const COLORS = ['Brown','Black','Tan','Beige','Navy','Light Blue','Dark Blue','White','Gray','Burgundy','Khaki','Olive'];

export default function ShopPage() {
  const { t } = useTranslation();
  const location = useLocation();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [category, setCategory] = useState('all');
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [sort, setSort] = useState('newest');

  // Read q from URL (/shop?q=...)
  const q = useMemo(() => {
    const p = new URLSearchParams(location.search);
    return (p.get('q') || '').trim();
  }, [location.search]);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    params.set('limit', '48');
    params.set('sort', sort);

    if (q) params.set('q', q);
    if (category !== 'all') params.set('category', category);
    if (colors.length) params.set('colors', colors.join(','));
    if (sizes.length) params.set('sizes', sizes.join(','));

    return params.toString();
  }, [q, category, colors, sizes, sort]);

  useEffect(() => {
    setLoading(true);
    api(`/api/products?${query}`)
      .then((d) => setItems(d.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [query]);

  function toggle(list, value, setter) {
    setter((prev) => (prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]));
  }

  function clear() {
    setCategory('all');
    setColors([]);
    setSizes([]);
    setSort('newest');
  }

  // Better: build sizes from current items (works well)
  // If you want sizes from ALL products in DB always, tell me and I’ll add 1 extra API call.
  const allSizes = useMemo(() => {
    const set = new Set();
    (items || []).forEach((p) => (p.sizes || []).forEach((s) => set.add(String(s))));
    const arr = Array.from(set);
    arr.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    return arr;
  }, [items]);

  return (
    <motion.main
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -25 }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
    >
      <Container className="py-10">
        <div className="text-3xl font-extrabold">{t('shop.title')}</div>
        <div className="mt-1 text-sm text-neutral-600">
          {items.length} {t('shop.found') || 'products found'}
          {q ? ` — "${q}"` : ''}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
          {/*  Filters (desktop only) */}
          <aside className="hidden lg:block h-fit rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft">
            <div className="text-sm font-semibold">{t('shop.filters')}</div>

            {/* Category */}
            <div className="mt-6">
              <div className="text-sm font-semibold">{t('shop.category')}</div>
              <div className="mt-3 space-y-2 text-sm">
                {['all', 'Bags', 'Clothing'].map((c) => (
                  <label key={c} className="flex items-center gap-2">
                    <input type="radio" checked={category === c} onChange={() => setCategory(c)} />
                    <span>{c === 'all' ? (t('shop.allProducts') || 'All Products') : c}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="mt-6">
              <div className="text-sm font-semibold">{t('shop.color')}</div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                {COLORS.map((c) => (
                  <label key={c} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={colors.includes(c)}
                      onChange={() => toggle(colors, c, setColors)}
                    />
                    <span>{c}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="mt-6">
              <div className="text-sm font-semibold">{t('shop.size')}</div>

              {allSizes.length === 0 ? (
                <div className="mt-2 text-sm text-neutral-500">—</div>
              ) : (
                <div className="mt-3 flex flex-wrap gap-2">
                  {allSizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggle(sizes, s, setSizes)}
                      className={`rounded-xl border px-4 py-2 text-sm ${
                        sizes.includes(s)
                          ? 'border-neutral-900 bg-neutral-900 text-white'
                          : 'border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={clear}
              className="mt-6 w-full rounded-xl border border-neutral-200 bg-white py-3 text-sm font-semibold hover:bg-neutral-50"
            >
              {t('shop.clear')}
            </button>
          </aside>

          {/* Products */}
          <section>
            <div className="flex items-center justify-end gap-3">
              <div className="text-sm text-neutral-600">{t('shop.sort')}:</div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm"
              >
                <option value="newest">{t('shop.newest')}</option>
                <option value="price_asc">{t('shop.priceLow')}</option>
                <option value="price_desc">{t('shop.priceHigh')}</option>
              </select>
            </div>

            {loading ? (
              <div className="mt-10 text-sm text-neutral-600">Loading...</div>
            ) : (
              <div className="mt-6 grid gap-6 md:grid-cols-3">
                {items.map((p) => (
                  <ProductCard key={p._id} p={p} />
                ))}
              </div>
            )}
          </section>
        </div>
      </Container>
    </motion.main>
  );
}