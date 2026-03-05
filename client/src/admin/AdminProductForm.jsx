import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, API_URL, getToken } from '../app/api';
import { useTranslation } from 'react-i18next';

const empty = {
  title: '',
  slug: '',
  category: 'Bags',
  description: '',
  highlights: [],
  price: 0,
  compareAtPrice: null,
  images: [],
  colors: [],
  sizes: [],
  inStock: true,
  stockQty: 100,
  tags: []
};

const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'><rect width='100%' height='100%' fill='%23f5f5f5'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-family='Arial' font-size='24'>No image</text></svg>"
  );

export default function AdminProductForm({ mode }) {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { id } = useParams();

  const [p, setP] = useState(empty);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // ✅ ONE uploader (always uses /api/upload/multi)
  async function uploadImages(files) {
    const token = getToken();
    if (!token) throw new Error('Unauthorized');

    const form = new FormData();
    files.forEach((file) => form.append('images', file));

    const res = await fetch(`${API_URL}/api/upload/multi`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: form
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Upload failed');

    return (data.files || []).map((x) => x.url).filter(Boolean);
  }

  useEffect(() => {
    if (mode !== 'edit') return;

    api('/api/admin/products', { auth: true })
      .then((d) => {
        const found = (d.items || []).find((x) => x._id === id);
        if (found) setP({ ...empty, ...found });
      })
      .catch((e) => setError(e.message || 'Failed'));
  }, [mode, id]);

  const title = mode === 'create' ? 'Create Product' : 'Edit Product';

  function splitLines(val) {
    if (Array.isArray(val)) return val;
    return String(val || '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function splitComma(val) {
    if (Array.isArray(val)) return val;
    return String(val || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  async function save() {
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...p,
        price: Number(p.price),
        compareAtPrice:
          p.compareAtPrice === '' ? null : p.compareAtPrice === null ? null : Number(p.compareAtPrice),
        highlights: splitLines(p.highlights),
        images: splitLines(p.images),
        colors: splitComma(p.colors),
        sizes: splitComma(p.sizes),
        tags: splitComma(p.tags)
      };

      if (mode === 'create') {
        await api('/api/admin/products', { method: 'POST', body: payload, auth: true });
      } else {
        await api(`/api/admin/products/${id}`, { method: 'PUT', body: payload, auth: true });
      }

      nav('/admin/products');
    } catch (e) {
      setError(e.message || 'Failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <div className="text-xl font-extrabold">{title}</div>
        <button
          className="rounded-full border border-neutral-200 px-5 py-3 text-sm font-semibold hover:bg-neutral-50"
          onClick={() => nav(-1)}
        >
          Back
        </button>
      </div>

      {error && <div className="mt-4 text-sm text-red-600">{error}</div>}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold">Title</label>
          <input
            className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm"
            value={p.title}
            onChange={(e) => setP({ ...p, title: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs font-semibold">Slug (optional)</label>
          <input
            className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm"
            value={p.slug || ''}
            onChange={(e) => setP({ ...p, slug: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs font-semibold">Category</label>
          <select
            className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm"
            value={p.category}
            onChange={(e) => setP({ ...p, category: e.target.value })}
          >
            <option>Bags</option>
            <option>Clothing</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold">Price</label>
          <input
            type="number"
            className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm"
            value={p.price}
            onChange={(e) => setP({ ...p, price: e.target.value })}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-xs font-semibold">Description</label>
          <textarea
            rows="4"
            className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm"
            value={p.description}
            onChange={(e) => setP({ ...p, description: e.target.value })}
          />
        </div>

    
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold">Images</label>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="file"
              accept="image/*"
              multiple
              className="block w-full text-sm"
              onChange={async (e) => {
                const files = Array.from(e.target.files || []).filter(Boolean);
                if (!files.length) return;

                setUploading(true);
                setError('');

                try {
                  const current = Array.isArray(p.images)
                    ? p.images
                    : String(p.images || '')
                        .split('\n')
                        .map((s) => s.trim())
                        .filter(Boolean);

                  const remaining = Math.max(0, 3 - current.length);
                  if (remaining === 0) {
                    throw new Error('You can upload up to 3 images per product. Remove one to add another.');
                  }

                  const take = files.slice(0, remaining);

   
                  const urls = await uploadImages(take);

                  setP({ ...p, images: [...current, ...urls] });
                } catch (err) {
                  setError(err.message || 'Upload failed');
                } finally {
                  setUploading(false);
                  e.target.value = '';
                }
              }}
            />

            <div className="text-xs text-neutral-600">
              {uploading ? 'Uploading to Cloudinary…' : 'Upload up to 3 images from your laptop (Cloudinary)'}
            </div>
          </div>

          {Array.isArray(p.images) && p.images.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {p.images.slice(0, 12).map((url) => (
                <div key={url} className="relative">
                  <img
                    src={url}
                    alt=""
                    className="h-20 w-full rounded-xl border border-neutral-200 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = PLACEHOLDER;
                    }}
                  />
                  <button
                    type="button"
                    className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-white/90 text-xs font-bold text-neutral-800 shadow"
                    title="Remove"
                    onClick={() => {
                      const current = Array.isArray(p.images) ? p.images : splitLines(p.images);
                      setP({ ...p, images: current.filter((x) => x !== url) });
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="text-xs font-semibold">Colors (comma separated)</label>
          <input
            className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm"
            value={Array.isArray(p.colors) ? p.colors.join(', ') : p.colors}
            onChange={(e) => setP({ ...p, colors: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs font-semibold">Sizes (comma separated)</label>
          <input
            className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm"
            value={Array.isArray(p.sizes) ? p.sizes.join(', ') : p.sizes}
            onChange={(e) => setP({ ...p, sizes: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs font-semibold">Tags (comma separated)</label>
          <input
            className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm"
            value={Array.isArray(p.tags) ? p.tags.join(', ') : p.tags}
            onChange={(e) => setP({ ...p, tags: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs font-semibold">In Stock</label>
          <div className="mt-3 flex items-center gap-2">
            <input
              type="checkbox"
              checked={p.inStock}
              onChange={(e) => setP({ ...p, inStock: e.target.checked })}
            />
            <span className="text-sm text-neutral-700">Available</span>
          </div>
        </div>
      </div>

      <button
        className="mt-6 rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-60"
        onClick={save}
        disabled={saving}
      >
        {saving ? 'Saving...' : t('admin.save')}
      </button>
    </div>
  );
}