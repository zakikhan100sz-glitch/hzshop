// src/utils/currency.js
export function formatAFN(price, lang = "en") {
  const isFa = String(lang || "").startsWith("fa");
  const currency = isFa ? "افغانی" : "AFN";

  const num = Number(price || 0);

  const formatted = new Intl.NumberFormat(isFa ? "fa-AF" : "en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);

  return `${currency} ${formatted}`;
} 