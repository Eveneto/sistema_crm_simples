/**
 * Formata um número como valor monetário em Real (BRL)
 * @param value - Valor numérico a ser formatado
 * @returns String formatada como R$ 1.234,56
 *
 * @example
 * formatCurrency(1234.56) // "R$ 1.234,56"
 * formatCurrency(0) // "R$ 0,00"
 * formatCurrency(1000000) // "R$ 1.000.000,00"
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Formata um número como valor compacto (K, M, B)
 * @param value - Valor numérico a ser formatado
 * @returns String formatada como R$ 1,2K ou R$ 1,5M
 *
 * @example
 * formatCompactCurrency(1234) // "R$ 1,2K"
 * formatCompactCurrency(1500000) // "R$ 1,5M"
 * formatCompactCurrency(1000000000) // "R$ 1B"
 */
export function formatCompactCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Formata um número como percentual
 * @param value - Valor entre 0 e 100
 * @returns String formatada como 15,5%
 *
 * @example
 * formatPercentage(15.5) // "15,5%"
 * formatPercentage(100) // "100%"
 */
export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value / 100);
}

/**
 * Formata um número simples com separador de milhares
 * @param value - Valor numérico
 * @returns String formatada como 1.234
 *
 * @example
 * formatNumber(1234) // "1.234"
 * formatNumber(1000000) // "1.000.000"
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}
