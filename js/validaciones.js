const t = (v) => String(v ?? '').trim();
const si = (ok, msg) => (ok ? null : msg);
const letras = (v) => (t(v).match(/\p{L}/gu) || []).length;

export const validarMarca = (v) => si(t(v) !== '', 'Elegí una marca');
export const validarModelo = (v) => si(t(v).length >= 2 && t(v).length <= 40, 'Ingresá el modelo del equipo');
export const validarValor = (v) => si(Number(v) >= 100000 && Number(v) <= 2500000, 'El valor debe estar entre $100.000 y $2.500.000');
export const validarAntiguedad = (v) => si(t(v) !== '', 'Indicá la antigüedad');
export const validarNombre = (v) => si(letras(v) >= 2, 'Ingresá tu nombre');
export const validarApellido = (v) => si(letras(v) >= 2, 'Ingresá tu apellido');
export const validarDni = (v) => si(/^\d{7,8}$/.test(t(v)), 'El DNI debe tener 7 u 8 números');

export function validarNacimiento(v) {
  const n = new Date(t(v) + 'T00:00:00');
  const h = new Date();
  let edad = h.getFullYear() - n.getFullYear();
  if (h < new Date(h.getFullYear(), n.getMonth(), n.getDate())) edad--;
  return si(edad >= 18, 'Tenés que ser mayor de edad');
}

export const validarEmail = (v) => si(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t(v)), 'Ingresá un email válido');

export function validarCelular(v) {
  const n = t(v).replace(/[\s-]/g, '');
  return si(/^\d{10}$/.test(n) && !/^(0|15)/.test(n), 'Ingresá 10 dígitos, sin 0 ni 15. Ej.: 11 5555-1234');
}

export const validarTerminos = (v) => si(v === true, 'Tenés que aceptar los términos');
export const validarTarjeta = (v) => si(/^\d{16}$/.test(t(v).replace(/\s/g, '')), 'Número de tarjeta inválido');

export function validarVencimiento(v) {
  const m = /^(\d{2})\/(\d{2})$/.exec(t(v));
  const ok = m && Number(m[1]) >= 1 && Number(m[1]) <= 12 &&
    new Date(2000 + Number(m[2]), Number(m[1]), 1) > new Date(); // vale hasta fin de mes
  return si(ok, 'Vencimiento inválido');
}

export const validarCvv = (v) => si(/^\d{3}$/.test(t(v)), 'CVV inválido');
export const validarTitularTarjeta = (v) => si(t(v) !== '', 'Ingresá el nombre del titular');

export const CAMPOS = {
  'equipo.marca': { label: 'Marca', validar: validarMarca },
  'equipo.modelo': { label: 'Modelo', validar: validarModelo },
  'equipo.valor': { label: 'Valor del equipo', validar: validarValor },
  'equipo.antiguedad': { label: 'Antigüedad', validar: validarAntiguedad },
  'titular.nombre': { label: 'Nombre', validar: validarNombre },
  'titular.apellido': { label: 'Apellido', validar: validarApellido },
  'titular.dni': { label: 'DNI', validar: validarDni },
  'titular.nacimiento': { label: 'Fecha de nacimiento', validar: validarNacimiento },
  'titular.email': { label: 'Email', validar: validarEmail },
  'titular.celular': { label: 'Celular', validar: validarCelular },
  'titular.terminos': { label: 'Términos', validar: validarTerminos },
  'pago.tarjeta': { label: 'Tarjeta', validar: validarTarjeta },
  'pago.vencimiento': { label: 'Vencimiento', validar: validarVencimiento },
  'pago.cvv': { label: 'CVV', validar: validarCvv },
  'pago.titular': { label: 'Titular', validar: validarTitularTarjeta },
};

export const POR_PASO = {
  1: ['equipo.marca', 'equipo.modelo', 'equipo.valor', 'equipo.antiguedad'],
  3: ['titular.nombre', 'titular.apellido', 'titular.dni', 'titular.nacimiento', 'titular.email', 'titular.celular', 'titular.terminos'],
  4: ['pago.tarjeta', 'pago.vencimiento', 'pago.cvv', 'pago.titular'],
};