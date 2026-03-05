import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../app/api';
import { useTranslation } from 'react-i18next';

const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='100%' height='100%' fill='%23f5f5f5'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-family='Arial' font-size='18'>No image</text></svg>"
  );

export default function AdminProducts() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/api/admin/products', { auth: true })
      .then((d) => setItems(d.items || []))
      .catch((e) => setError(e.message || 'Failed'));
  }, []);

  async function remove(id) {
    if (!confirm('Delete this product?')) return;
    await api(`/api/admin/products/${id}`, { method: 'DELETE', auth: true });
    setItems((prev) => prev.filter((p) => p._id !== id));
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <div className="text-xl font-extrabold">{t('admin.products')}</div>
        <Link to="/admin/products/new" className="rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white hover:bg-neutral-800">
          {t('admin.newProduct')}
        </Link>
      </div>

      {error && <div className="mt-4 text-sm text-red-600">{error}</div>}

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-xs text-neutral-500">
              <th className="py-3">Product</th>
              <th className="py-3">Category</th>
              <th className="py-3">Price</th>
              <th className="py-3">Stock</th>
              <th className="py-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p._id} className="border-b border-neutral-100">
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <img src={p.images?.[0] || PLACEHOLDER} alt="" className="h-10 w-10 rounded-xl object-cover" onError={(e)=>{e.currentTarget.src=PLACEHOLDER;}} />
                    <div>
                      <div className="font-semibold">{p.title}</div>
                      <div className="text-xs text-neutral-500">/{p.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4">{p.category}</td>
                <td className="py-4 font-semibold">AFN {Number(p.price).toFixed(2)}</td>
                <td className="py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${p.inStock ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'}`}>
                    {p.inStock ? 'In Stock' : 'Out'}
                  </span>
                </td>
                <td className="py-4 text-right">
                  <Link className="mr-3 text-sm font-semibold text-neutral-900" to={`/admin/products/${p._id}`}>Edit</Link>
                  <button className="text-sm font-semibold text-red-600" onClick={() => remove(p._id)}>{t('admin.delete')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
