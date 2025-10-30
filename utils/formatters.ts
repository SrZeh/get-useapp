/**
 * Shared formatting utilities
 */

/**
 * Format a number as Brazilian Real (BRL) currency
 * @param n - Number to format
 * @returns Formatted currency string (e.g., "R$ 100,00") or empty string if invalid
 */
export function formatBRL(n?: number): string {
  if (typeof n !== 'number' || !isFinite(n)) return '';
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(n);
  } catch {
    // Fallback if Intl.NumberFormat fails
    return `R$ ${n.toFixed(2).replace('.', ',')}`;
  }
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 * @param arr - Array to shuffle
 * @returns New shuffled array (original array is not modified)
 */
export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice(); // Create a copy
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Format CEP (Brazilian postal code) input: 00000-000
 * @param value - Raw CEP input
 * @returns Formatted CEP string
 */
export function formatCEP(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 5) {
    return digits;
  }
  return `${digits.substring(0, 5)}-${digits.substring(5, 8)}`;
}

