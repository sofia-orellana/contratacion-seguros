import { solicitud, leer, errores } from './estado.js';
import { CAMPOS } from './validaciones.js';
import { calcularCuota, moneda } from './cotizador.js';

const $ = (s) => document.querySelector(s);
const PASOS = ['Cotizar', 'Plan', 'Datos', 'Pago'];
const TITULOS = ['Cotizá tu seguro', 'Elegí tu plan', 'Tus datos', 'Pago'];
const RES = { // clases del resumen en mobile según el paso (en desktop siempre es card lateral)
  2: 'max-lg:fixed max-lg:inset-x-0 max-lg:bottom-[var(--alto-footer)] max-lg:z-20 max-lg:rounded-none max-lg:border-0 max-lg:border-t max-lg:bg-white max-lg:py-3',
  3: 'max-lg:hidden',
  4: 'max-lg:order-first',
};
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const fila = (l, v, extra = '') =>
  `<div class="flex justify-between gap-4 ${extra}"><span class="text-slate-500">${l}</span><strong>${esc(v)}</strong></div>`;
let ultimoPaso = null;

const planActual = () => solicitud.planes.find((p) => p.id === solicitud.plan);
const cuotaDe = (p) => calcularCuota(solicitud.equipo.valor, p.tasaAnual, solicitud.equipo.antiguedad);

export function render() {
  const p = solicitud.paso;
  document.querySelectorAll('[data-paso]').forEach((s) => {
    s.hidden = Number(s.dataset.paso) !== p;
  });
  $('#checkout').hidden = p < 1 || p > 4;
  $('#cabecera').classList.toggle('max-lg:hidden', p !== 0);
  $('#encabezado').hidden = p < 1 || p > 4; // barra + stepper solo en los pasos 1 a 4
  $('#titulo-paso').textContent = TITULOS[p - 1] || '';
  $('#aviso').hidden = !solicitud.aviso;
  $('#aviso section').textContent = solicitud.aviso;
  if (p !== ultimoPaso) { ultimoPaso = p; window.scrollTo(0, 0); }
  renderStepper();
  renderPlanes();
  renderCampos();
  renderErrores();
  renderBotones();
  renderResumen();
  renderFinal();
  // la barra de resumen de mobile se apoya justo encima del footer fijo
  const pie = document.querySelector('[data-paso]:not([hidden]) .pie');
  document.documentElement.style.setProperty('--alto-footer', (pie ? pie.offsetHeight : 0) + 'px');
}

function renderStepper() {
  const actual = Math.min(solicitud.paso, 4);
  const CLS = {
    ok: 'bg-emerald-600 text-white',
    act: 'bg-indigo-600 text-white',
    pend: 'border border-slate-200 bg-white text-slate-500',
  };
  const TXT = { ok: 'text-emerald-600', act: 'text-indigo-600', pend: 'text-slate-500' };
  $('#stepper').innerHTML = PASOS.map((n, i) => {
    const num = i + 1;
    const est = num < actual ? 'ok' : num === actual ? 'act' : 'pend';
    return `<li class="flex items-center gap-1.5 ${i < 3 ? 'flex-1' : ''}" ${est === 'act' ? 'aria-current="step"' : ''}>
      <span class="grid size-5 shrink-0 place-items-center rounded-full text-[11px] font-bold ${CLS[est]}">${est === 'ok' ? '<span class="icono i-check size-3" aria-hidden="true"></span>' : num}</span>
      <span class="text-xs font-semibold ${TXT[est]}">${n}</span>
      ${i < 3 ? `<span class="h-0.5 flex-1 rounded ${est === 'ok' ? 'bg-emerald-600' : 'bg-slate-200'}"></span>` : ''}</li>`;
  }).join('');
}

function renderPlanes() {
  const el = $('#planes');
  if (!solicitud.planes.length || !solicitud.equipo.antiguedad) return;
  const lista = (p, i) => {
    const sig = solicitud.planes[i + 1];
    const no = sig ? sig.coberturas.filter((c) => !p.coberturas.includes(c)) : [];
    return p.coberturas.map((c) => `<li class="flex items-center gap-1.5"><span class="icono i-check size-3.5 text-emerald-600" aria-hidden="true"></span>${c}</li>`).join('') +
      no.map((c) => `<li class="flex items-center gap-1.5 text-slate-400"><span class="icono i-x size-3.5" aria-hidden="true"></span>${c}</li>`).join('');
  };
  const html = solicitud.planes.map((p, i) => `
    <label class="plan relative block cursor-pointer">
      <input type="radio" name="plan" value="${p.id}" data-campo="plan">
      <div class="card"><section class="grid gap-2">
        <span class="ind"></span>
        <div class="flex flex-wrap items-center gap-x-2 gap-y-1 pr-7"><h3 class="font-bold">${p.nombre}</h3>${p.recomendado ? '<span class="badge shrink-0">Recomendado</span>' : ''}</div>
        <p class="text-2xl font-extrabold">${moneda(cuotaDe(p))}<span class="text-xs font-normal text-slate-500"> / mes</span></p>
        <ul class="grid gap-1 text-xs text-slate-500">${lista(p, i)}</ul>
      </section></div>
    </label>`).join('');
  if (el._html !== html) { el.innerHTML = html; el._html = html; }
}

function renderCampos() {
  document.querySelectorAll('[data-campo]').forEach((el) => {
    const ruta = el.dataset.campo;
    const v = leer(ruta);
    if (el.type === 'radio') el.checked = String(v) === el.value;
    else if (el.type === 'checkbox') el.checked = v;
    else if (el !== document.activeElement) {
      el.value = ruta === 'equipo.valor' && v ? `$ ${v.toLocaleString('es-AR')}` : v || '';
    }
  });
}

function renderErrores() {
  document.querySelectorAll('[data-error]').forEach((p) => {
    const r = p.dataset.error;
    const msg = solicitud.tocados[r] ? CAMPOS[r].validar(leer(r)) : null;
    p.textContent = msg || '';
    p.hidden = !msg;
    p.closest('.field').toggleAttribute('data-invalid', !!msg);
    document.querySelectorAll(`[data-campo="${r}"]`).forEach((i) => i.setAttribute('aria-invalid', !!msg));
  });
}

function renderBotones() {
  document.querySelectorAll('[data-valida]').forEach((b) => {
    const n = b.dataset.valida;
    const e = errores(Number(n));
    b.disabled = e.length > 0 || solicitud.procesando;
    $(`[data-falta="${n}"]`).textContent = e.length
      ? (n === '3' ? 'El botón se habilita cuando el formulario es válido. ' : '') + 'Falta: ' + e.map((r) => CAMPOS[r].label).join(', ')
      : '';
  });
  $('#btn-pagar').textContent = solicitud.procesando ? 'Procesando…' : 'Pagar y contratar';
}

function renderResumen() {
  const p = solicitud.paso;
  const el = $('#resumen');
  el.hidden = p < 2 || p > 4;
  const plan = planActual();
  if (el.hidden || !plan) return;
  el.className = `card gap-3 border-indigo-100 bg-indigo-50 py-4 lg:sticky lg:top-6 lg:self-start ${RES[p]}`;
  const { equipo, titular } = solicitud;
  const total = moneda(cuotaDe(plan));
  const completo = `
    <section class="grid gap-1.5 text-sm ${p === 2 ? 'max-lg:hidden' : ''}">
      ${fila('Seguro', `Celular · Plan ${plan.nombre}`)}
      ${fila('Equipo', `${equipo.marca} ${equipo.modelo}`)}
      ${p === 4 ? fila('Titular', `${titular.nombre} ${titular.apellido}`) : ''}
      <div class="flex items-baseline justify-between border-t pt-2"><span class="text-slate-500">Total mensual</span><strong class="text-base">${total}</strong></div>
    </section>`;
  // paso 2 en mobile: una sola línea arriba del botón fijo
  el.innerHTML = p === 2
    ? `<div class="flex justify-between px-4 text-sm lg:hidden"><span class="text-slate-500">Plan ${plan.nombre} · ${esc(equipo.modelo)}</span><strong>${total}/mes</strong></div>${completo}`
    : completo;
}

function renderFinal() {
  const { paso, titular, poliza } = solicitud;
  if (paso === 5) {
    const plan = planActual();
    $('#exito').innerHTML = `
      <div class="mx-auto grid size-[76px] place-items-center rounded-full bg-emerald-50 text-emerald-600"><span class="icono i-check size-9" aria-hidden="true"></span></div>
      <h2 class="text-xl font-extrabold">¡Listo, ${esc(titular.nombre)}!<br>Tu celular ya está protegido</h2>
      <p class="text-sm text-slate-500">Te enviamos la póliza a ${esc(titular.email)}</p>
      <div class="mx-auto rounded-xl bg-indigo-50 px-5 py-3 text-lg font-extrabold tracking-wider text-indigo-800">${esc(poliza)}</div>
      <div class="grid gap-2 rounded-xl border bg-white p-4 text-left text-sm">
        ${fila('Plan', plan.nombre)}${fila('Vigencia desde', new Date().toLocaleDateString('es-AR'))}${fila('Cuota mensual', moneda(cuotaDe(plan)))}
      </div>`;
  }
  if (paso === 6) $('#motivo').textContent = `${solicitud.errorPago}. Revisá los datos o probá con otro medio de pago. Tus datos quedaron guardados.`;
}