import { useMemo, useState } from "react";
import Container from "../components/Container";
import Button from "../components/Button";
import { useStore } from "../app/store";
import { api } from "../app/api";
import { useTranslation } from "react-i18next";

function normalizePhone(raw) {
  return String(raw || "").replace(/[^\d+]/g, "").trim();
}

function isValidPhone(raw) {
  const p = normalizePhone(raw);
  const digits = p.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 16) return false;
  return true;
}

export default function CheckoutPage() {
  const { t } = useTranslation();
  const { cart, clearCart } = useStore();

  const subtotal = useMemo(
    () => cart.reduce((s, i) => s + i.price * i.qty, 0),
    [cart]
  );
  const total = subtotal;

  // removed: email, zip
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });

  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const errors = useMemo(() => {
    const e = {};

    if (!form.fullName.trim())
      e.fullName = t("checkout.errors.fullNameRequired") || "Full name is required";

    if (!form.city.trim())
      e.city = t("checkout.errors.cityRequired") || "City is required";

    const phone = form.phone.trim();
    if (!phone) e.phone = t("checkout.errors.phoneRequired") || "Phone number is required";
    else if (!isValidPhone(phone))
      e.phone = t("checkout.errors.phoneInvalid") || "Phone number looks invalid";

    return e;
  }, [form, t]);

  const isFormValid = Object.keys(errors).length === 0;
  const canSubmit = cart.length > 0 && isFormValid && !loading;

  function markTouched(name) {
    setTouched((prev) => ({ ...prev, [name]: true }));
  }

  function inputClass(name) {
    const base = "mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none transition";
    const hasErr = touched[name] && errors[name];
    if (hasErr) return `${base} border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200`;
    return `${base} border-neutral-200 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200`;
  }

  function setField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validateAllAndShow() {
    setTouched((prev) => ({
      ...prev,
      fullName: true,
      phone: true,
      city: true,
    }));
  }

  async function submit() {
    setError("");

    if (cart.length === 0) {
      setError(t("checkout.errors.cartEmpty") || "Cart is empty");
      return;
    }

    validateAllAndShow();
    if (!isFormValid) {
      setError(t("checkout.errors.fixForm") || "Please fix the highlighted fields.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        items: cart.map((i) => ({
          productId: i.productId,
          qty: i.qty,
          color: i.color || "",
          size: i.size || "",
        })),
        customer: {
          fullName: form.fullName.trim(),
          phone: normalizePhone(form.phone),
          address: form.address.trim(),
          city: form.city.trim(),
          notes: form.notes.trim(),
        },
      };

      const d = await api("/api/orders", { method: "POST", body: payload });
      clearCart();

      // open WhatsApp link from backend
      window.location.href = d.whatsappLink;
    } catch (e) {
      setError(e?.message || t("checkout.errors.failed") || "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <Container className="py-10">
        <div className="text-3xl font-extrabold">{t("checkout.title")}</div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px]">
          {/* LEFT: FORM */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft">
            <div className="text-lg font-extrabold">{t("checkout.shippingInfo")}</div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold">
                  {t("checkout.fullName")} <span className="text-red-500">*</span>
                </label>
                <input
                  className={inputClass("fullName")}
                  value={form.fullName}
                  onChange={(e) => setField("fullName", e.target.value)}
                  onBlur={() => markTouched("fullName")}
                  placeholder="e.g. Zaki Khan"
                  autoComplete="name"
                />
                {touched.fullName && errors.fullName ? (
                  <div className="mt-1 text-xs text-red-600">{errors.fullName}</div>
                ) : null}
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold">
                  {t("checkout.phone")} <span className="text-red-500">*</span>
                </label>
                <input
                  className={inputClass("phone")}
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  onBlur={() => markTouched("phone")}
                  placeholder="e.g. +7 777 123 4567"
                  autoComplete="tel"
                />
                {touched.phone && errors.phone ? (
                  <div className="mt-1 text-xs text-red-600">{errors.phone}</div>
                ) : null}
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold">{t("checkout.address")}</label>
                <input
                  className={inputClass("address")}
                  value={form.address}
                  onChange={(e) => setField("address", e.target.value)}
                  placeholder={t("checkout.optional") || "optional"}
                  autoComplete="street-address"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold">
                  {t("checkout.city")} <span className="text-red-500">*</span>
                </label>
                <input
                  className={inputClass("city")}
                  value={form.city}
                  onChange={(e) => setField("city", e.target.value)}
                  onBlur={() => markTouched("city")}
                  placeholder="e.g. Astana"
                  autoComplete="address-level2"
                />
                {touched.city && errors.city ? (
                  <div className="mt-1 text-xs text-red-600">{errors.city}</div>
                ) : null}
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold">{t("checkout.notes")}</label>
                <textarea
                  className={inputClass("notes")}
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setField("notes", e.target.value)}
                  placeholder={t("checkout.optional") || "optional"}
                />
              </div>
            </div>

            {error ? <div className="mt-4 text-sm text-red-600">{error}</div> : null}
          </div>

          {/* RIGHT: SUMMARY */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft">
              <div className="text-xl font-extrabold">
                {t("checkout.orderSummary") || "Order Summary"}
              </div>

              {cart.length === 0 ? (
                <div className="mt-4 text-sm text-neutral-600">
                  {t("checkout.emptySummary") || "Your cart is empty."}
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  {cart.map((item, idx) => {
                    const lineTotal = item.price * item.qty;
                    return (
                      <div key={`${item.productId}-${idx}`} className="flex gap-3">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                          {item.image ? (
                            <img src={item.image} alt={item.title || ""} className="h-full w-full object-cover" />
                          ) : null}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold">{item.title || "—"}</div>
                              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-neutral-600">
                                {item.color ? <span>Color: {item.color}</span> : null}
                                {item.size ? <span>Size: {item.size}</span> : null}
                                <span>Qty: {item.qty}</span>
                              </div>
                            </div>

                            <div className="text-right text-sm font-semibold">
                              AFN {lineTotal.toFixed(2)}
                              <div className="text-xs font-normal text-neutral-500">
                                {item.qty} × AFN {item.price.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>{t("cart.subtotal")}</span>
                  <span>AFN {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("cart.shipping")}</span>
                  <span className="text-green-600">FREE</span>
                </div>
                <div className="flex justify-between border-t border-neutral-200 pt-3 text-base font-semibold">
                  <span>{t("cart.total")}</span>
                  <span>AFN {total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                className="mt-5 w-full rounded-2xl bg-green-600 hover:bg-green-700 disabled:opacity-60"
                onClick={submit}
                disabled={!canSubmit}
              >
                {loading ? (t("checkout.processing") || "Processing...") : (t("checkout.complete") || "Complete Order via WhatsApp")}
              </Button>

              {!isFormValid && (touched.fullName || touched.phone || touched.city) ? (
                <div className="mt-3 text-xs text-neutral-500">
                  {t("checkout.hintFix") || "Please fix the highlighted fields to continue."}
                </div>
              ) : null}

              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-neutral-500">
                <span>🔒</span> {t("checkout.secure") || "Secure checkout"}
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                💬 {t("checkout.stepsTitle") || "WhatsApp Payment"}
              </div>

              <div className="mt-3 rounded-2xl border border-emerald-200 bg-white/50 p-4 text-sm text-emerald-900">
                <div className="font-semibold">✓ {t("checkout.complete") || "Complete Order via WhatsApp"}</div>
                <p className="mt-2 text-xs text-emerald-900/80">
                  When you click "{t("checkout.complete") || "Complete Order via WhatsApp"}", your order details will be sent to our WhatsApp business number.
                </p>
              </div>

              <ol className="mt-4 space-y-2 text-xs text-emerald-900/80">
                <li>1) {t("checkout.step1") || "Fill in your shipping information above"}</li>
                <li>2) {t("checkout.step2") || "Click the WhatsApp button"}</li>
                <li>3) {t("checkout.step3") || "Send the message to complete your order"}</li>
                <li>4) {t("checkout.step4") || "Follow payment instructions from our team"}</li>
              </ol>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}