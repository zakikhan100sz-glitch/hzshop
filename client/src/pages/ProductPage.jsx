import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Container from "../components/Container";
import Button from "../components/Button";
import { useStore } from "../app/store";
import { useTranslation } from "react-i18next";
import { formatAFN } from "../utils/currency";

const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'><rect width='100%' height='100%' fill='%23f5f5f5'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-family='Arial' font-size='24'>No image</text></svg>"
  );

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { addToCart } = useStore();

  const API_URL = useMemo(
    () => import.meta.env.VITE_API_URL || "http://localhost:5000",
    []
  );

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [uiError, setUiError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErrMsg("");
      setUiError("");
      setProduct(null);
      setActiveImg(0);
      setQty(1);
      setColor("");
      setSize("");

      try {
        const r = await fetch(`${API_URL}/api/products/${id}`);
        if (!r.ok) {
          const txt = await r.text().catch(() => "");
          throw new Error(txt || `Request failed: ${r.status}`);
        }

        const data = await r.json();
        const p = data?.product || null;

        if (!cancelled) {
          setProduct(p);
          if (p?.colors?.length) setColor(p.colors[0]);
          if (p?.sizes?.length) setSize(p.sizes[0]);
        }
      } catch (e) {
        if (!cancelled) setErrMsg(e?.message || "Failed to load product");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [API_URL, id]);

  if (loading) {
    return (
      <Container className="py-14">
        <div className="text-sm text-neutral-600">Loading...</div>
      </Container>
    );
  }

  if (errMsg || !product) {
    return (
      <Container className="py-14">
        <Link to="/shop" className="text-sm text-neutral-600 hover:text-neutral-900">
          ← Back to Shop
        </Link>

        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6">
          <div className="text-sm font-semibold text-neutral-900">Could not load product</div>
          <div className="mt-2 text-sm text-neutral-600">{errMsg || "Product not found"}</div>
        </div>
      </Container>
    );
  }

  const images = Array.isArray(product.images) ? product.images : [];
  const mainImg = images[activeImg] || images[0] || PLACEHOLDER;

  const sizesList = Array.isArray(product.sizes) ? product.sizes.filter(Boolean) : [];
  const needsSize = sizesList.length > 0;

  function handleAdd(nextPath) {
    setUiError("");

    if (needsSize && !size) {
      setUiError(t("product.selectSize") || "Please select a size.");
      return;
    }

    addToCart(product, { qty, color, size });
    navigate(nextPath);
  }

  return (
    <motion.main
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -25 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
    >
      <Container className="py-10">
        <Link to="/shop" className="text-sm text-neutral-600 hover:text-neutral-900">
          ← Back to Shop
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <div>
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-soft">
              <img
                src={mainImg}
                alt={product.title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = PLACEHOLDER;
                }}
              />
            </div>

            {images.length > 1 && (
              <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                {images.slice(0, 6).map((url, idx) => (
                  <button
                    key={`${url}-${idx}`}
                    type="button"
                    onClick={() => setActiveImg(idx)}
                    className={`overflow-hidden rounded-xl border ${
                      idx === activeImg ? "border-neutral-900" : "border-neutral-200"
                    } bg-white`}
                    aria-label={`image-${idx + 1}`}
                  >
                    <img
                      src={url}
                      alt=""
                      className="h-20 w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = PLACEHOLDER;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="text-xs font-semibold text-neutral-500">
              {(product.tags?.[0] || product.category || "").toLowerCase()}
            </div>

            <h1 className="mt-2 text-4xl font-extrabold">{product.title}</h1>

            <div className="mt-2 text-sm text-neutral-600">
              ★★★★★ ({product.reviewsCount || 0} reviews)
            </div>

            {sizesList.length > 0 && (
              <div className="mt-4 text-sm text-neutral-700">
                <span className="font-semibold">
                  {t("product.availableSizes") || "Available sizes"}:
                </span>{" "}
                {sizesList.join(" • ")}
              </div>
            )}

            <div className={`${sizesList.length > 0 ? "mt-2" : "mt-4"} text-4xl font-extrabold`}>
              {formatAFN(product.price, lang)}
            </div>

            <div className="mt-4 border-t border-neutral-200 pt-4 text-sm text-neutral-700">
              {product.description}
            </div>

            {!!product.colors?.length && (
              <div className="mt-6">
                <div className="text-sm font-semibold">{t("product.selectColor")}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`rounded-xl border px-4 py-2 text-sm ${
                        color === c
                          ? "border-neutral-900 bg-neutral-900 text-white"
                          : "border-neutral-200 bg-white hover:bg-neutral-50"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {sizesList.length > 0 && (
              <div className="mt-6">
                <div className="text-sm font-semibold">{t("product.selectSize") || "Select Size"}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {sizesList.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSize(s)}
                      className={`rounded-xl border px-4 py-2 text-sm ${
                        size === s
                          ? "border-neutral-900 bg-neutral-900 text-white"
                          : "border-neutral-200 bg-white hover:bg-neutral-50"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6">
              <div className="text-sm font-semibold">{t("product.quantity")}</div>
              <div className="mt-3 inline-flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-2">
                <button
                  type="button"
                  className="h-10 w-10 rounded-xl hover:bg-neutral-50"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  -
                </button>
                <div className="w-10 text-center text-sm font-semibold">{qty}</div>
                <button
                  type="button"
                  className="h-10 w-10 rounded-xl hover:bg-neutral-50"
                  onClick={() => setQty((q) => q + 1)}
                >
                  +
                </button>
              </div>
            </div>

            {uiError && (
              <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{uiError}</div>
            )}

            <div className="mt-8">
              <Button className="w-full rounded-2xl" onClick={() => handleAdd("/cart")}>
                {t("product.addToCart")}
              </Button>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <Button variant="secondary" className="rounded-2xl" onClick={() => handleAdd("/checkout")}>
                  {t("shop.buy")}
                </Button>

                <Button
                  variant="secondary"
                  className="rounded-2xl"
                  onClick={() => navigate("/shop")}
                >
                  {t("product.backToShop") || "Back to Shop"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </motion.main>
  );
}