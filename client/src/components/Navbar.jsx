import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, LogOut, LayoutGrid, Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../app/store';
import { useEffect, useMemo, useState } from 'react';

function LangSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language;
  return (
    <select
      value={current}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      className="rounded-full border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-800"
      aria-label="language"
    >
      <option value="en">English</option>
      <option value="fa">فارسی</option>
    </select>
  );
}

export default function Navbar() {
  const { t } = useTranslation();
  const { user, cart, logout } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  // read q from URL (works on home + shop)
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const qFromUrl = params.get('q') || '';
  const [search, setSearch] = useState(qFromUrl);

  useEffect(() => {
    setSearch(qFromUrl);
  }, [qFromUrl]);

  // always navigate to /shop?q=... (no mixing with other params)
  function goSearch(nextQ) {
    const q = (nextQ || '').trim();
    if (q) navigate(`/shop?q=${encodeURIComponent(q)}`);
    else navigate('/shop');
  }

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white sm:bg-white/80 sm:backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-4">
        {/* Left */}
        <div className="flex items-center justify-between sm:gap-6">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-neutral-900 text-white">hz</div>
              <span className="text-lg font-bold">hzShop</span>
            </Link>

            <nav className="hidden items-center gap-2 sm:flex">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `inline-flex items-center rounded-full px-3 py-2 ${
                    isActive ? 'font-semibold text-neutral-900' : 'text-neutral-600 hover:text-neutral-900'
                  }`
                }
              >
                {t('nav.home') || 'Home'}
              </NavLink>
              <NavLink
                to="/shop"
                className={({ isActive }) =>
                  `inline-flex items-center rounded-full px-3 py-2 ${
                    isActive ? 'font-semibold text-neutral-900' : 'text-neutral-600 hover:text-neutral-900'
                  }`
                }
              >
                {t('nav.shop') || 'Shop'}
              </NavLink>
            </nav>
          </div>

          <button
            className="grid h-10 w-10 place-items-center rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 sm:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Search */}
        <div className="w-full flex-1">
          <input
            value={search}
            onChange={(e) => {
              const v = e.target.value;
              setSearch(v);
              goSearch(v); // realtime search
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') goSearch(search);
            }}
            placeholder={t('shop.search')}
            className="w-full rounded-full border border-neutral-200 bg-white px-5 py-3 text-sm outline-none focus:border-neutral-400"
          />
        </div>

        {/* Right desktop */}
        <div className="hidden items-center gap-3 sm:flex">
          {(user?.role === 'admin' || user?.role === 'owner') && (
            <NavLink
              to="/admin"
              className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 hover:bg-neutral-50"
            >
              <LayoutGrid size={16} /> {t('nav.admin') || 'Admin'}
            </NavLink>
          )}

          {user ? (
            <div className="hidden items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 md:flex">
              <User size={16} />
              <span className="max-w-[120px] truncate">{user.name}</span>
            </div>
          ) : (
            <NavLink
              to="/login"
              className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 hover:bg-neutral-50"
            >
              <User size={16} /> {t('nav.login')}
            </NavLink>
          )}

          <LangSwitcher />

          <button
            className="relative inline-flex items-center gap-2 rounded-full px-3 py-2 hover:bg-neutral-100"
            onClick={() => navigate('/cart')}
            aria-label="cart"
          >
            <ShoppingCart size={18} />
            <span className="text-sm font-medium text-neutral-800">{t('nav.cart') || 'Cart'}</span>
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-neutral-900 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>

          {user && (
            <button
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 hover:bg-neutral-100"
              onClick={() => {
                logout();
                navigate('/');
              }}
              title={t('nav.logout')}
            >
              <LogOut size={18} />
              <span className="text-sm font-medium">{t('nav.logout') || 'Logout'}</span>
            </button>
          )}
        </div>

        {/* Mobile sidebar (unchanged) */}
        {open && (
          <div className="sm:hidden">
            <div className="fixed inset-0 z-50 bg-black/30" onClick={() => setOpen(false)} />
            <aside
              className="fixed right-0 top-0 z-50 h-full w-72 border-l border-neutral-200 bg-white p-4 shadow-xl"
              dir={document.documentElement.getAttribute('dir') || 'ltr'}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">{t('nav.menu') || 'Menu'}</div>
                <button
                  className="grid h-10 w-10 place-items-center rounded-full border border-neutral-200 hover:bg-neutral-50"
                  onClick={() => setOpen(false)}
                  aria-label="close"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <NavLink
                  to="/"
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `rounded-xl px-4 py-3 text-sm ${
                      isActive ? 'bg-neutral-900 text-white' : 'text-neutral-800 hover:bg-neutral-50'
                    }`
                  }
                >
                  {t('nav.home')}
                </NavLink>

                <NavLink
                  to="/shop"
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `rounded-xl px-4 py-3 text-sm ${
                      isActive ? 'bg-neutral-900 text-white' : 'text-neutral-800 hover:bg-neutral-50'
                    }`
                  }
                >
                  {t('nav.shop')}
                </NavLink>

                <button
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-sm text-neutral-800 hover:bg-neutral-50"
                  onClick={() => {
                    setOpen(false);
                    navigate('/cart');
                  }}
                >
                  <span className="inline-flex items-center gap-2">
                    <ShoppingCart size={16} /> {t('nav.cart') || 'Cart'}
                  </span>
                  {cartCount > 0 && (
                    <span className="grid h-6 min-w-[24px] place-items-center rounded-full bg-neutral-900 px-2 text-[10px] font-bold text-white">
                      {cartCount}
                    </span>
                  )}
                </button>

                {(user?.role === 'admin' || user?.role === 'owner') && (
                  <NavLink
                    to="/admin"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-neutral-800 hover:bg-neutral-50"
                  >
                    <LayoutGrid size={16} /> {t('nav.admin') || 'Admin'}
                  </NavLink>
                )}

                {user ? (
                  <button
                    className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-neutral-800 hover:bg-neutral-50"
                    onClick={() => {
                      logout();
                      setOpen(false);
                      navigate('/');
                    }}
                  >
                    <LogOut size={16} /> {t('nav.logout') || 'Logout'}
                  </button>
                ) : (
                  <NavLink
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-neutral-800 hover:bg-neutral-50"
                  >
                    <User size={16} /> {t('nav.login')}
                  </NavLink>
                )}

                <div className="mt-4">
                  <LangSwitcher />
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </header>
  );
}