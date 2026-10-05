/**
 * Centralized Currency & Number Formatting Utility for TradeGuard AI.
 * Adheres strictly to Indian Financial Standards (Lakhs, Crores, INR ₹)
 * with robust multi-currency (USD, EUR, GBP) fallback support.
 */

export interface CurrencyFormatOptions {
  compact?: boolean;
  showDecimals?: boolean;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  prefix?: string;
}

/**
 * Formats a financial number into localized currency string.
 * Defaults to Indian Rupee (INR - ₹) with standard Indian comma grouping (en-IN).
 * Example: 125000 -> "₹1,25,000.00" or compact "₹1.25 L"
 * Example: 10000000 -> "₹1,00,00,000.00" or compact "₹1.00 Cr"
 */
export function formatCurrency(
  value: number | string | null | undefined,
  currency: string = "INR",
  options: CurrencyFormatOptions = {}
): string {
  if (value === null || value === undefined || value === "") {
    return currency === "INR" || currency === "₹" ? "₹0.00" : "$0.00";
  }

  const num = typeof value === "number" ? value : parseFloat(value.toString().replace(/[^0-9.-]+/g, ""));
  if (isNaN(num)) {
    return currency === "INR" || currency === "₹" ? "₹0.00" : "$0.00";
  }

  const normCurrency = (currency || "INR").toUpperCase().trim();
  const isINR = normCurrency === "INR" || normCurrency === "₹" || normCurrency.includes("INR");

  // Compact Indian Notation (Lakhs and Crores)
  if (options.compact && isINR) {
    const absNum = Math.abs(num);
    const sign = num < 0 ? "-" : "";

    if (absNum >= 10000000) {
      // 1 Crore = 1,00,00,000
      const cr = absNum / 10000000;
      return `${sign}₹${cr.toFixed(2)} Cr`;
    } else if (absNum >= 100000) {
      // 1 Lakh = 1,00,000
      const lakh = absNum / 100000;
      return `${sign}₹${lakh.toFixed(2)} L`;
    } else if (absNum >= 1000) {
      const k = absNum / 1000;
      return `${sign}₹${k.toFixed(1)} K`;
    }
  }

  // Standard Localized Formatting using Intl
  try {
    const locale = isINR ? "en-IN" : "en-US";
    const currCode = isINR ? "INR" : (normCurrency === "USD" || normCurrency === "$" ? "USD" : normCurrency);

    const minDecimals = options.showDecimals === false 
      ? 0 
      : (options.minimumFractionDigits !== undefined ? options.minimumFractionDigits : (Math.abs(num) >= 1000 ? 2 : 2));
    const maxDecimals = options.showDecimals === false 
      ? 0 
      : (options.maximumFractionDigits !== undefined ? options.maximumFractionDigits : 2);

    const formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currCode,
      minimumFractionDigits: minDecimals,
      maximumFractionDigits: maxDecimals,
    });

    return formatter.format(num);
  } catch {
    // Resilient fallback with manual Indian grouping
    const symbol = isINR ? "₹" : "$";
    return `${symbol}${formatIndianNumber(num, options.showDecimals !== false ? 2 : 0)}`;
  }
}

/**
 * Formats a plain number with Indian numbering conventions (en-IN).
 * Examples:
 * 1000 -> "1,000"
 * 100000 -> "1,00,000"
 * 1000000 -> "10,00,000"
 * 10000000 -> "1,00,00,000"
 */
export function formatIndianNumber(value: number, decimals: number = 2): string {
  if (isNaN(value)) return "0";
  const [intPart, decPart] = value.toFixed(decimals).split(".");
  const sign = value < 0 ? "-" : "";
  const cleanInt = Math.abs(parseInt(intPart, 10)).toString();

  if (cleanInt.length <= 3) {
    return decimals > 0 ? `${sign}${cleanInt}.${decPart}` : `${sign}${cleanInt}`;
  }

  // Last 3 digits
  const lastThree = cleanInt.substring(cleanInt.length - 3);
  // Remaining digits grouped by 2
  const otherDigits = cleanInt.substring(0, cleanInt.length - 3);
  const formattedOthers = otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ",");

  const formattedInt = `${formattedOthers},${lastThree}`;
  return decimals > 0 ? `${sign}${formattedInt}.${decPart}` : `${sign}${formattedInt}`;
}

/**
 * Returns appropriate currency symbol ('₹' for INR, '$' for USD).
 */
export function getCurrencySymbol(currency: string = "INR"): string {
  const norm = (currency || "INR").toUpperCase().trim();
  if (norm === "INR" || norm === "₹" || norm.includes("INR")) return "₹";
  if (norm === "EUR") return "€";
  if (norm === "GBP") return "£";
  return "$";
}
