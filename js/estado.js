import { render } from './render.js';
import { CAMPOS, POR_PASO } from './validaciones.js';

const inicial = () => ({
  paso: 0, // 0 = inicio, 1..4 = checkout, 5 = éxito, 6 = error
  equipo: { marca: '', modelo: '', valor: 0, antiguedad: '' },
  plan: 'plus',
  titular: { nombre: '', apellido: '', dni: '', nacimiento: '', email: '', celular: '', terminos: false },
  pago: { metodo: 'credito', tarjeta: '', vencimiento: '', cvv: '', titular: '' },
  poliza: null,
  // apoyo de la interfaz
  planes: [], tocados: {}, procesando: false, errorPago: '', aviso: '',
});

export const solicitud = inicial();

export function irAPaso(n) {
  solicitud.paso = n;
  solicitud.aviso = '';
  render(); // siempre después de cambiar el estado
}

export function reiniciar() {
  const planes = solicitud.planes; // el JSON ya cargado se conserva
  Object.assign(solicitud, inicial(), { planes });
  render();
}

export const leer = (ruta) => ruta.split('.').reduce((o, k) => o[k], solicitud);

export function escribir(ruta, valor) {
  const ks = ruta.split('.');
  const ultima = ks.pop();
  ks.reduce((o, k) => o[k], solicitud)[ultima] = valor;
}

export const errores = (paso) => (POR_PASO[paso] || []).filter((r) => CAMPOS[r].validar(leer(r)));