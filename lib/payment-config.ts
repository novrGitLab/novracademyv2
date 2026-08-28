/**
 * Payment configuration for client-side use.
 * Only contains public keys and non-sensitive configuration.
 */

export const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";

export const PAYMENT_PROVIDERS = {
  PAYSTACK: "PAYSTACK",
  STRIPE: "STRIPE",
} as const;

export type PaymentProvider = typeof PAYMENT_PROVIDERS[keyof typeof PAYMENT_PROVIDERS];

/**
 * Validates that Paystack is properly configured for client-side use.
 */
export function isPaystackConfigured(): boolean {
  return Boolean(PAYSTACK_PUBLIC_KEY);
}

/**
 * Currencies supported by Paystack.
 * Paystack supports multiple currencies and handles conversion.
 */
export const PAYSTACK_SUPPORTED_CURRENCIES = ["NGN", "USD", "GBP", "EUR", "ZAR"] as const;

/**
 * Get Paystack currency code. Paystack uses 3-letter ISO codes.
 * Falls back to the provided currency if it's supported.
 */
export function getPaystackCurrency(currency: string): string {
  return PAYSTACK_SUPPORTED_CURRENCIES.includes(currency as any) ? currency : "NGN";
}
