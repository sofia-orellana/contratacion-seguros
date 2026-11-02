export const FACTORES = { menos1: 1, '1a2': 1.1, mas2: 1.25 };

export function calcularCuota(valor, tasaAnual, antiguedad) {
  return Math.round(valor * tasaAnual / 12 * FACTORES[antiguedad]);
}

export const moneda = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);