import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'><rect width='100%' height='100%' fill='%23f5f5f5'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-family='Arial' font-size='24'>No image</text></svg>"
  );

export default function ProductCard({ p }) {
  const { i18n } = useTranslation();

  const img = p.images?.[0] || PLACEHOLDER;

  // currency text depending on language
  const currency = i18n.language === 'fa' ? 'افغانی' : 'AFN';

  return (
    <Link to={`/product/${p._id}`} className="group">
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-soft transition group-hover:-translate-y-0.5">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={img}
            alt={p.title}
            className="h-full w-full object-cover"
            onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
          />

          <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-neutral-700">
            {(p.tags?.[0] || p.category || '').toLowerCase()}
          </div>
        </div>

        <div className="p-5">
          <div className="text-sm font-semibold text-neutral-900">
            {p.title}
          </div>

          <div className="mt-2 line-clamp-2 text-sm text-neutral-600">
            {p.description}
          </div>

          <div className="mt-4 flex items-end justify-between">
            <div className="text-2xl font-bold text-neutral-900">
              {currency} {Number(p.price).toFixed(2)}
            </div>

            <div className="text-xs text-neutral-500">
              {p.sizes?.length ? `${p.sizes.length} sizes` : ''}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}