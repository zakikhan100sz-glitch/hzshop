import { useEffect, useState } from 'react';
import { api } from '../app/api';
import { useTranslation } from 'react-i18next';

export default function AdminOrders() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/api/admin/orders', { auth: true })
      .then((d) => setItems(d.items || []))
      .catch((e) => setError(e.message || 'Failed'));
  }, []);

  async function updateStatus(id, status) {
    const d = await api(`/api/admin/orders/${id}/status`, { method: 'PATCH', body: { status }, auth: true });
    setItems((prev) => prev.map((o) => (o._id === id ? d.order : o)));
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft">
      <div className="text-xl font-extrabold">{t('admin.orders')}</div>
      {error && <div className="mt-4 text-sm text-red-600">{error}</div>}

      <div className="mt-6 space-y-4">
        {items.map((o) => (
          <div key={o._id} className="rounded-2xl border border-neutral-200 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold">Order</div>
                <div className="text-xs text-neutral-500">{o._id}</div>
                <div className="mt-2 text-sm text-neutral-700">{o.customer?.fullName} — {o.customer?.phone}</div>
                <div className="text-sm text-neutral-700">Total: <span className="font-semibold">AFN {Number(o.total).toFixed(2)}</span></div>
                <div className="mt-2 text-xs text-neutral-500">{new Date(o.createdAt).toLocaleString()}</div>
              </div>

              <div className="min-w-[200px]">
                <div className="text-xs font-semibold text-neutral-600">{t('admin.status')}</div>
                <select
                  value={o.status}
                  onChange={(e) => updateStatus(o._id, e.target.value)}
                  className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm"
                >
                  <option value="pending">pending</option>
                  <option value="confirmed">confirmed</option>
                  <option value="shipped">shipped</option>
                  <option value="completed">completed</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-xs text-neutral-500">
                    <th className="py-2">Item</th>
                    <th className="py-2">Qty</th>
                    <th className="py-2">Price</th>
                    <th className="py-2">Color</th>
                    <th className="py-2">Size</th>
                  </tr>
                </thead>
                <tbody>
                  {(o.items || []).map((it, idx) => (
                    <tr key={idx} className="border-b border-neutral-100">
                      <td className="py-3 font-semibold">{it.title}</td>
                      <td className="py-3">{it.qty}</td>
                      <td className="py-3">AFN {Number(it.price).toFixed(2)}</td>
                      <td className="py-3">{it.color || '-'}</td>
                      <td className="py-3">{it.size || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {o.whatsappMessage ? (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-semibold text-neutral-900">WhatsApp message</summary>
                <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-neutral-50 p-4 text-xs text-neutral-700">{o.whatsappMessage}</pre>
              </details>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
