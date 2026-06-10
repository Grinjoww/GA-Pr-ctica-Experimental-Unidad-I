// ============================================================
// app.js — Orquestador
// Responsabilidad única: coordinar api.js y ui.js, y manejar eventos.
// ============================================================

import { obtenerRazas, obtenerImagenRaza } from './api.js';
import * as ui from './ui.js';

const CLAVE_CITAS = 'biopet-citas'; // Web Storage (localStorage)
const RAZAS_FALLBACK = ['labrador', 'bulldog', 'poodle', 'beagle', 'hound', 'boxer', 'dalmatian', 'pug'];

let citas = [];          // estado de la aplicación en memoria
let ctrlRazas = null;    // AbortController del catálogo
let ctrlImagen = null;   // AbortController de la imagen

// --- Persistencia ---
function cargarCitas() {
  try {
    const guardado = localStorage.getItem(CLAVE_CITAS);
    citas = guardado ? JSON.parse(guardado) : [];
  } catch {
    citas = [];
  }
}

function guardarCitas() {
  localStorage.setItem(CLAVE_CITAS, JSON.stringify(citas));
}

// --- Catálogo de razas desde la API ---
async function cargarRazas() {
  if (ctrlRazas) ctrlRazas.abort();
  ctrlRazas = new AbortController();
  try {
    ui.limpiarError();
    ui.mostrarCargando(true, 'Cargando catálogo de razas…');
    const razas = await obtenerRazas(ctrlRazas.signal);
    ui.poblarRazas(razas);
  } catch (e) {
    if (e.name !== 'AbortError') {
      ui.poblarRazas(RAZAS_FALLBACK); // la app sigue siendo usable
      ui.mostrarError('No se pudo cargar el catálogo de razas desde la API. Se usa una lista básica.');
    }
  } finally {
    ui.mostrarCargando(false);
  }
}

// --- Filtro (funcionalidad del DOM) ---
function filtrar(termino) {
  const q = termino.trim().toLowerCase();
  const filtradas = citas.filter((c) =>
    c.mascota.toLowerCase().includes(q) ||
    c.dueno.toLowerCase().includes(q) ||
    c.veterinario.toLowerCase().includes(q)
  );
  ui.renderizarCitas(filtradas, citas.length > 0);
}

// --- Agendar una cita ---
async function agendar(form) {
  if (!ui.validarFormulario(form)) return;

  const datos = ui.leerFormulario(form);

  // Obtiene una foto referencial de la raza desde la API (async/await).
  if (ctrlImagen) ctrlImagen.abort();
  ctrlImagen = new AbortController();
  try {
    ui.mostrarCargando(true, 'Agendando cita…');
    datos.imagen = await obtenerImagenRaza(datos.raza, ctrlImagen.signal);
  } catch (e) {
    if (e.name === 'AbortError') return;
    datos.imagen = ''; // se mostrará un marcador de posición
  } finally {
    ui.mostrarCargando(false);
  }

  const cita = { id: Date.now(), ...datos };
  citas.unshift(cita);
  guardarCitas();
  ui.actualizarConteo(citas.length);
  ui.renderizarCitas(citas, true);
  ui.exitoFormulario('Cita agendada correctamente.');

  form.reset();
  document.getElementById('valor-urgencia').textContent = '3';
}

// --- Cancelar una cita ---
function cancelar(id) {
  citas = citas.filter((c) => String(c.id) !== id);
  guardarCitas();
  ui.actualizarConteo(citas.length);
  const termino = document.getElementById('buscador').value;
  filtrar(termino);
}

// --- Conexión de eventos ---
function conectarEventos() {
  // Búsqueda en vivo
  const buscador = document.getElementById('buscador');
  buscador.addEventListener('input', () => filtrar(buscador.value));

  // Reintentar la carga del catálogo
  document.getElementById('btn-reintentar').addEventListener('click', cargarRazas);

  // Delegación de eventos sobre la lista de citas
  document.getElementById('lista-citas').addEventListener('click', (ev) => {
    const verDetalle = ev.target.closest('button[data-detalle]');
    if (verDetalle) {
      const cita = citas.find((c) => String(c.id) === verDetalle.dataset.detalle);
      if (cita) ui.abrirDetalle(cita);
      return;
    }
    const cancelarBtn = ev.target.closest('button[data-cancelar]');
    if (cancelarBtn) cancelar(cancelarBtn.dataset.cancelar);
  });

  // Cerrar el diálogo
  document.getElementById('dialogo-cerrar').addEventListener('click', ui.cerrarDetalle);

  // Conmutar el tema
  document.getElementById('btn-tema').addEventListener('click', ui.alternarTema);

  // Reflejar el valor del rango en su <output>
  const urgencia = document.getElementById('urgencia');
  const salida = document.getElementById('valor-urgencia');
  urgencia.addEventListener('input', () => { salida.textContent = urgencia.value; });

  // Envío del formulario
  const form = document.getElementById('form-cita');
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    agendar(form);
  });
}

// --- Punto de entrada ---
function init() {
  ui.aplicarTemaGuardado();

  // Impide agendar en fechas pasadas.
  document.getElementById('fecha').min = new Date().toISOString().split('T')[0];

  cargarCitas();
  ui.actualizarConteo(citas.length);
  ui.renderizarCitas(citas, citas.length > 0);

  conectarEventos();
  cargarRazas();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}