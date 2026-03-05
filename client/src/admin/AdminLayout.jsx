import { NavLink, Outlet } from 'react-router-dom';
import Container from '../components/Container';
import { useTranslation } from 'react-i18next';
import { useStore } from '../app/store';

export default function AdminLayout() {
  const { t } = useTranslation();
  const { user } = useStore(); 

  return (
    <main>
      <Container className="py-10">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-sm font-semibold text-neutral-500">hzShop</div>
            <div className="text-3xl font-extrabold">{t('admin.dashboard')}</div>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="h-fit rounded-2xl border border-neutral-200 bg-white p-4 shadow-soft">
            <NavLink
              to="products"
              className={({ isActive }) =>
                `block rounded-xl px-4 py-3 text-sm font-semibold ${
                  isActive ? 'bg-neutral-900 text-white' : 'text-neutral-700 hover:bg-neutral-50'
                }`
              }
            >
              {t('admin.products')}
            </NavLink>

            <NavLink
              to="orders"
              className={({ isActive }) =>
                `mt-2 block rounded-xl px-4 py-3 text-sm font-semibold ${
                  isActive ? 'bg-neutral-900 text-white' : 'text-neutral-700 hover:bg-neutral-50'
                }`
              }
            >
              {t('admin.orders')}
            </NavLink>
            {user?.role === 'owner' && (
              <NavLink
                to="users"
                className={({ isActive }) =>
                  `mt-2 block rounded-xl px-4 py-3 text-sm font-semibold ${
                    isActive ? 'bg-neutral-900 text-white' : 'text-neutral-700 hover:bg-neutral-50'
                  }`
                }
              >
                {t('admin.createAdmin') || 'Create Admin'}
              </NavLink>
            )}
          </aside>

          <section className="min-w-0">
            <Outlet />
          </section>
        </div>
      </Container>
    </main>
  );
}