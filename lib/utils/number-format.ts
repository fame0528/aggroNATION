/**
 * Format a number to a human-readable string using Intl.NumberFormat
 * @param num The number to format
 * @param options Formatting options
 * @returns Formatted number string
 */
export function formatNumber(
  num: number | string,
  options: {
    /** Number of decimal places (default: 0) */
    decimals?: number;
    /** Locale (default: 'en-US') */
    locale?: string;
  } = {},
): string {
  const { decimals = 0, locale = 'en-US' } = options;

  const numValue = typeof num === 'string' ? parseFloat(num) : num;

  if (isNaN(numValue)) {
    return '0';
  }

  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(numValue);
}

/**
 * Format a number to a compact, human-readable string (e.g., 1000 → 1K)
 * @param num The number to format
 * @returns Compact formatted number string
 */
export function formatCompactNumber(num: number | string): string {
  const numValue = typeof num === 'string' ? parseFloat(num) : num;

  if (isNaN(numValue)) {
    return '0';
  }

  if (numValue >= 1000000000) {
    return (numValue / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
  } else if (numValue >= 1000000) {
    return (numValue / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  } else if (numValue >= 1000) {
    return (numValue / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  } else {
    return numValue.toString();
  }
}

/**
 * Format a number as a percentage
 * @param num The number to format (0-1 range)
 * @param decimals Number of decimal places (default: 1)
 * @returns Percentage string
 */
export function formatPercentage(num: number, decimals: number = 1): string {
  if (isNaN(num)) {
    return '0%';
  }

  return `${(num * 100).toFixed(decimals)}%`;
}

/**
 * Format a number as currency
 * @param num The number to format
 * @param currency Currency symbol (default: '$')
 * @param decimals Number of decimal places (default: 2)
 * @returns Currency string
 */
export function formatCurrency(
  num: number | string,
  currency: string = '$',
  decimals: number = 2,
): string {
  const numValue = typeof num === 'string' ? parseFloat(num) : num;

  if (isNaN(numValue)) {
    return `${currency}0`;
  }

  const formatted = formatNumber(numValue, { decimals });
  return `${currency}${formatted}`;
}
