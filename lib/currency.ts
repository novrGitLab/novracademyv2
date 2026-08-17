/** Currencies supported for course pricing. NGN is the default. */
export const CURRENCIES = ["NGN", "USD", "GBP", "EUR", "GHS", "KES", "ZAR"] as const;

const SYMBOLS: Record<string, string> = {
  NGN: "\u20A6",
  USD: "$",
  GBP: "\u00A3",
  EUR: "\u20AC",
  GHS: "\u20B5",
  KES: "KSh",
  ZAR: "R",
};

/** Formats a minor-unit price (priceCents) for display, e.g. ₦25,000 or $25. */
export function formatPrice(priceCents: number, currency = "NGN"): string {
  if (!priceCents) return "Free";
  const amount = priceCents / 100;
  const symbol = SYMBOLS[currency];
  if (symbol) {
    return `${symbol}${amount.toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;
  }
  return `${amount.toFixed(2)} ${currency}`;
}
