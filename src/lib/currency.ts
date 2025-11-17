// lib/currency.ts

export type SupportedCurrency = "USD" | "INR";

export const APP_CURRENCY: SupportedCurrency = "USD";

export const APP_CURRENCY_SYMBOL: Record<SupportedCurrency, string> = {
  USD: "$",
  INR: "₹",
};

export function formatPrice(amount: number): string {
  return `${APP_CURRENCY_SYMBOL[APP_CURRENCY]}${amount.toFixed(2)}`;
}
