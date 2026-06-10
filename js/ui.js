// ============================================================
// ui.js — Capa de presentación
// Responsabilidad única: manipular el DOM y los estados de interfaz.
// No realiza peticiones de red (eso corresponde a api.js).
// ============================================================

const refs = {
  lista: document.getElementById('lista-citas'),
  cargando: document.getElementById('estado-cargando'),
  cargandoTexto: document.getElementById('estado-cargando-texto'),
  vacio: document.getElementById('estado-vacio'),
  error: document.getElementById('estado-error'),
  errorTexto: document.getElementById('estado-error-texto'),
  conteo: document.getElementById('conteo'),
  raza: document.getElementById('raza'),
  dialogo: document.getElementById('dialogo-detalle'),
  dialogoTitulo: document.getElementById('dialogo-titulo'),
  dialogoCuerpo: document.getElementById('dialogo-cuerpo'),
  formMensaje: document.getElementById('form-mensaje'),
  btnTema: document.getElementById('btn-tema'),
};

const CLAVE_TEMA = 'biopet-tema'; // clave de Web Storage (localStorage)

// --- Utilidades ---
function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function formatearFecha(iso) {
  // iso en formato yyyy-mm-dd
  const [a, m, d] = iso.split('-');
  const fecha = new Date(Number(a), Number(m) - 1, Number(d));
  return fecha.toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' });
}

function claseBadge(tipo) {
  if (tipo === 'Emergencia') return 'badge--emergencia';
  if (tipo === 'Vacunación') return 'badge--vacunacion';
  return 'badge--general';
}

// --- Catálogo de razas (poblar el <select>) ---
export function poblarRazas(razas) {
  refs.raza.innerHTML = '';
  const placeholder = new Option('Selecciona una raza', '');
  placeholder.disabled = true;
  placeholder.selected = true;
  refs.raza.appendChild(placeholder);
  for (const r of razas) {
    refs.raza.appendChild(new Option(capitalizar(r), r));
  }
}

// --- Estados de la lista ---
export function mostrarCargando(visible, texto = 'Cargando…') {
  refs.cargandoTexto.textContent = texto;
  refs.cargando.hidden = !visible;
}

export function mostrarError(mensaje) {
  refs.errorTexto.textContent = mensaje;
  refs.error.hidden = false;
}

export function limpiarError() {
  refs.error.hidden = true;
  refs.errorTexto.textContent = '';
}

export function actualizarConteo(n) {
  refs.conteo.textContent = String(n);
}

/**
 * Renderiza las tarjetas de citas. Distingue lista vacía total de filtro sin
 * resultados mediante el parámetro hayCitas. Usa textContent para evitar XSS.
 */
export function renderizarCitas(citas, hayCitas = true) {
  refs.lista.innerHTML = '';

  if (citas.length === 0) {
    refs.vacio.textContent = hayCitas
      ? 'No se encontraron citas que coincidan con la búsqueda.'
      : 'Aún no hay citas agendadas. Completa el formulario para agendar la primera.';
    refs.vacio.hidden = false;
    return;
  }
  refs.vacio.hidden = true;

  const fragmento = document.createDocumentFragment();
  for (const cita of citas) {
    fragmento.appendChild(crearTarjeta(cita));
  }
  refs.lista.appendChild(fragmento);
}

function crearTarjeta(cita) {
  const art = document.createElement('article');
  art.className = 'tarjeta';

  // Foto (o marcador de posición si no se obtuvo imagen)
  if (cita.imagen) {
    const img = document.createElement('img');
    img.className = 'tarjeta__foto';
    img.src = cita.imagen;
    img.alt = `Imagen referencial de la raza ${capitalizar(cita.raza)}`;
    img.loading = 'lazy';
    img.width = 300;
    img.height = 160;
    art.appendChild(img);
  } else {
    const ph = document.createElement('div');
    ph.className = 'tarjeta__foto tarjeta__foto--ph';
    ph.setAttribute('aria-hidden', 'true');
    ph.textContent = '🐾';
    art.appendChild(ph);
  }

  const cuerpo = document.createElement('div');
  cuerpo.className = 'tarjeta__cuerpo';

  const nombre = document.createElement('h3');
  nombre.className = 'tarjeta__nombre';
  nombre.textContent = cita.mascota;

  const fecha = document.createElement('span');
  fecha.className = 'chip';
  fecha.textContent = `${formatearFecha(cita.fecha)} · ${cita.hora}`;

  const dueno = document.createElement('p');
  dueno.className = 'tarjeta__dato';
  dueno.textContent = `Dueño: ${cita.dueno}`;

  const badge = document.createElement('span');
  badge.className = `badge ${claseBadge(cita.tipo)}`;
  badge.textContent = cita.tipo;

  cuerpo.append(nombre, fecha, dueno, badge);

  // Acciones
  const acciones = document.createElement('div');
  acciones.className = 'tarjeta__acciones';

  const btnDetalle = document.createElement('button');
  btnDetalle.type = 'button';
  btnDetalle.className = 'boton boton--sutil boton--small';
  btnDetalle.dataset.detalle = String(cita.id);
  btnDetalle.textContent = 'Ver detalles';

  const btnCancelar = document.createElement('button');
  btnCancelar.type = 'button';
  btnCancelar.className = 'boton boton--peligro boton--small';
  btnCancelar.dataset.cancelar = String(cita.id);
  btnCancelar.textContent = 'Cancelar';
  const oculto = document.createElement('span');
  oculto.className = 'visualmente-oculto';
  oculto.textContent = ` cita de ${cita.mascota}`;
  btnCancelar.appendChild(oculto);

  acciones.append(btnDetalle, btnCancelar);
  cuerpo.appendChild(acciones);

  art.appendChild(cuerpo);
  return art;
}

// --- Diálogo de detalle (accesibilidad dinámica) ---
export function abrirDetalle(cita) {
  refs.dialogoTitulo.textContent = `Cita de ${cita.mascota}`;
  refs.dialogoCuerpo.innerHTML = '';

  if (cita.imagen) {
    const img = document.createElement('img');
    img.className = 'dialogo__foto';
    img.src = cita.imagen;
    img.alt = `Imagen referencial de la raza ${capitalizar(cita.raza)}`;
    refs.dialogoCuerpo.appendChild(img);
  }

  const filas = [
    ['Especie', capitalizar(cita.especie)],
    ['Raza', capitalizar(cita.raza)],
    ['Edad', cita.edad ? `${cita.edad} años` : 'No indicada'],
    ['Dueño', cita.dueno],
    ['Correo', cita.correo],
    ['Teléfono', cita.telefono || 'No indicado'],
    ['Fecha', formatearFecha(cita.fecha)],
    ['Hora', cita.hora],
    ['Veterinario', cita.veterinario],
    ['Tipo', cita.tipo],
    ['Urgencia', `${cita.urgencia}/5`],
    ['Motivo', cita.motivo || 'No indicado'],
  ];

  const dl = document.createElement('dl');
  dl.className = 'detalle';
  for (const [clave, valor] of filas) {
    const dt = document.createElement('dt');
    dt.textContent = clave;
    const dd = document.createElement('dd');
    dd.textContent = valor;
    dl.append(dt, dd);
  }
  refs.dialogoCuerpo.appendChild(dl);

  // showModal() atrapa el foco, oscurece el fondo y habilita Escape de forma nativa.
  refs.dialogo.showModal();
}

export function cerrarDetalle() {
  refs.dialogo.close();
}

// --- Formulario: validación accesible ---
function mensajeError(c) {
  const v = c.validity;
  if (v.valueMissing) {
    return c.type === 'checkbox' ? 'Debes aceptar para continuar.' : 'Este campo es obligatorio.';
  }
  if (v.typeMismatch && c.type === 'email') return 'Ingresa un correo electrónico válido.';
  if (v.patternMismatch) return c.title || 'El formato no es válido.';
  if (v.rangeUnderflow) return `El valor mínimo permitido es ${c.min}.`;
  if (v.rangeOverflow) return `El valor máximo permitido es ${c.max}.`;
  return 'Revisa este campo.';
}

/**
 * Valida el formulario sin bloquear datos válidos.
 * @param {HTMLFormElement} form
 * @returns {boolean} true si es válido.
 */
export function validarFormulario(form) {
  refs.formMensaje.hidden = true;
  let primerInvalido = null;

  const campos = form.querySelectorAll('input, select, textarea');
  campos.forEach((c) => {
    const valido = c.checkValidity();
    c.setAttribute('aria-invalid', valido ? 'false' : 'true');

    const spanError = document.getElementById('err-' + c.id);
    if (spanError) spanError.textContent = valido ? '' : mensajeError(c);

    if (!valido && !primerInvalido) primerInvalido = c;
  });

  if (primerInvalido) {
    primerInvalido.focus(); // gestión explícita del foco hacia el primer error
    return false;
  }
  return true;
}

/** Lee los datos del formulario y los devuelve como objeto de cita. */
export function leerFormulario(form) {
  const d = new FormData(form);
  return {
    mascota: d.get('mascota').trim(),
    especie: d.get('especie'),
    raza: d.get('raza'),
    edad: d.get('edad'),
    dueno: d.get('dueno').trim(),
    correo: d.get('correo').trim(),
    telefono: (d.get('telefono') || '').trim(),
    fecha: d.get('fecha'),
    hora: d.get('hora'),
    veterinario: d.get('veterinario'),
    urgencia: d.get('urgencia'),
    tipo: d.get('tipo'),
    motivo: (d.get('motivo') || '').trim(),
  };
}

export function exitoFormulario(mensaje) {
  refs.formMensaje.textContent = mensaje;
  refs.formMensaje.hidden = false;
}

// --- Tema (Web Storage: persistencia con localStorage) ---
function temaEfectivoEsOscuro() {
  const forzado = document.documentElement.getAttribute('data-tema');
  if (forzado === 'oscuro') return true;
  if (forzado === 'claro') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function sincronizarBoton(esOscuro) {
  refs.btnTema.setAttribute('aria-pressed', String(esOscuro));
}

export function aplicarTemaGuardado() {
  const guardado = localStorage.getItem(CLAVE_TEMA);
  if (guardado === 'oscuro' || guardado === 'claro') {
    document.documentElement.setAttribute('data-tema', guardado);
  }
  sincronizarBoton(temaEfectivoEsOscuro());
}

export function alternarTema() {
  const nuevo = temaEfectivoEsOscuro() ? 'claro' : 'oscuro';
  document.documentElement.setAttribute('data-tema', nuevo);
  localStorage.setItem(CLAVE_TEMA, nuevo);
  sincronizarBoton(nuevo === 'oscuro');
}