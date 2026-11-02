import { solicitud, escribir, irAPaso, reiniciar, errores } from './estado.js';
import { render } from './render.js';
import { simularPago, generarPoliza } from './pago.js';

const $ = (s) => document.querySelector(s);

async function verPlanes() {
  try {
    if (!solicitud.planes.length) solicitud.planes = await (await fetch('data/planes.json')).json();
    irAPaso(2);
  } catch {
    solicitud.aviso = 'No pudimos cargar los planes. Abrí el sitio con Live Server (no con doble click).';
    render();
  }
}

async function pagar() {
  if (solicitud.procesando) return; // evita el doble click
  solicitud.procesando = true;
  render();
  const r = await simularPago(solicitud.pago.tarjeta);
  solicitud.procesando = false;
  if (r.ok) { solicitud.poliza = generarPoliza(); irAPaso(5); }
  else { solicitud.errorPago = r.motivo; irAPaso(6); }
}

// Revalida todo el paso; si hay errores los muestra y lleva el foco al primero
function intentar(paso) {
  const e = errores(paso);
  e.forEach((r) => (solicitud.tocados[r] = true));
  if (e.length) { render(); $(`[data-campo="${e[0]}"]`).focus(); }
  return e.length === 0;
}

document.addEventListener('submit', (e) => {
  e.preventDefault();
  const paso = Number(e.target.closest('[data-paso]').dataset.paso);
  if (paso === 1) intentar(1) && verPlanes();
  else if (paso === 2) irAPaso(3);
  else if (paso === 3) intentar(3) && irAPaso(4);
  else if (paso === 4) intentar(4) && pagar();
});

function alEditar(e) {
  const el = e.target.closest('[data-campo]');
  if (!el) return;
  const ruta = el.dataset.campo;
  escribir(ruta,
    el.type === 'checkbox' ? el.checked
    : ruta === 'equipo.valor' ? Number(el.value.replace(/\D/g, ''))
    : el.value);
  render();
}
document.addEventListener('input', alEditar);
document.addEventListener('change', alEditar);

// Error en línea al salir del campo (blur)
document.addEventListener('focusout', (e) => {
  const el = e.target.closest?.('[data-campo]');
  if (!el) return;
  solicitud.tocados[el.dataset.campo] = true;
  render();
});

document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-accion]');
  if (!b) return;
  const a = b.dataset.accion;
  if (a === 'iniciar') irAPaso(1);
  else if (a === 'volver') irAPaso(solicitud.paso - 1);
  else if (a === 'inicio') reiniciar();
  else if (a === 'reintentar') { irAPaso(4); $('#btn-pagar').focus(); }
  else if (a === 'cambiar-medio') { irAPaso(4); $('[data-campo="pago.metodo"]').focus(); }
    else if (a === 'imprimir') window.print();
});

render();