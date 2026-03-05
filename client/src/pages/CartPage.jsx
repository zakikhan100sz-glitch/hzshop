import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Container from "../components/Container";
import Button from "../components/Button";
import { useStore } from "../app/store";
import { useTranslation } from "react-i18next";
import { formatAFN } from "../utils/currency";

const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'><rect width='100%' height='100%' fill='%23f5f5f5'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-family='Arial' font-size='20'>No image</text></svg>"
  );

export default function CartPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const nav = useNavigate();
  const { cart, updateQty, removeItem } = useStore();

  const subtotal = useMemo(
    () => cart.reduce((s, i) => s + i.price * i.qty, 0),
    [cart]
  );

  const shipping = 0;
  const total = subtotal + shipping;

  return (
    <motion.main
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -25 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
    >
      <Container className="py-10">
        <div className="text-3xl font-extrabold">{t("cart.title")}</div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            {cart.length === 0 ? (
              <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-sm text-neutral-600">
                {t("cart.empty") || "Your cart is empty."}
              </div>
            ) : (
              cart.map((it) => (
                <div
                  key={it.key}
                  className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-soft"
                >
                  <img
                    src={it.image || PLACEHOLDER}
                    alt={it.title}
                    className="h-16 w-16 rounded-xl object-cover"
                    onError={(e) => {
                      e.currentTarget.src = PLACEHOLDER;
                    }}
                  />

                  <div className="flex-1">
                    {/* Clickable product title (optional but nice) */}
                    <Link
                      to={`/product/${it.productId}`}
                      className="font-semibold hover:underline"
                    >
                      {it.title}
                    </Link>

                    <div className="text-sm text-neutral-600">
                      {it.color ? `${t("cart.color") || "Color"}: ${it.color}` : ""}
                      {it.size ? ` • ${t("cart.size") || "Size"}: ${it.size}` : ""}
                    </div>

                    <div className="mt-3 inline-flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-2">
                      <button
                        type="button"
                        className="h-9 w-9 rounded-xl hover:bg-neutral-50"
                        onClick={() => updateQty(it.key, it.qty - 1)}
                        aria-label="decrease"
                      >
                        -
                      </button>

                      <div className="w-10 text-center text-sm font-semibold">
                        {it.qty}
                      </div>

                      <button
                        type="button"
                        className="h-9 w-9 rounded-xl hover:bg-neutral-50"
                        onClick={() => updateQty(it.key, it.qty + 1)}
                        aria-label="increase"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <button
                      type="button"
                      className="mb-2 text-sm text-red-500 hover:underline"
                      onClick={() => removeItem(it.key)}
                    >
                      {t("cart.remove") || "Remove"}
                    </button>

                    <div className="text-2xl font-extrabold">
                      {formatAFN(it.price * it.qty, lang)}
                    </div>

                    <div className="text-xs text-neutral-500">
                      {formatAFN(it.price, lang)} {t("cart.each") || "each"}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="h-fit rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft">
            <div className="text-xl font-extrabold">{t("cart.summary")}</div>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span>{t("cart.subtotal")}</span>
                <span>{formatAFN(subtotal, lang)}</span>
              </div>

              <div className="flex justify-between">
                <span>{t("cart.shipping")}</span>
                <span className="text-green-600">{t("cart.free") || "FREE"}</span>
              </div>

              <div className="flex justify-between border-t border-neutral-200 pt-3 text-base font-semibold">
                <span>{t("cart.total")}</span>
                <span>{formatAFN(total, lang)}</span>
              </div>
            </div>

            <Button
              className="mt-5 w-full rounded-2xl"
              onClick={() => nav("/checkout")}
              disabled={cart.length === 0}
            >
              {t("cart.checkout")}
            </Button>

            <Button
              variant="secondary"
              className="mt-3 w-full rounded-2xl"
              onClick={() => nav("/shop")}
            >
              {t("cart.continue")}
            </Button>

            <ul className="mt-5 space-y-2 text-xs text-neutral-600">
              <li>✓ {t("cart.freeShipping") || "Free shipping on all orders"}</li>
              <li>✓ {t("cart.securePayment") || "Secure WhatsApp payment"}</li>
              <li>✓ {t("cart.returnPolicy") || "30-day return policy"}</li>
            </ul>
          </div>
        </div>
      </Container>
    </motion.main>
  );
}