// ============================================================
// api.js — Capa de comunicación con la API pública (Dog CEO)
// Responsabilidad única: obtener datos del servidor.
// Documentación: https://dog.ceo/dog-api/
// ============================================================

const BASE_URL = 'https://dog.ceo/api';

/**
 * Obtiene el catálogo de razas caninas.
 * @param {AbortSignal} [signal] - Señal para cancelar la petición.
 * @returns {Promise<string[]>} Arreglo de razas (claves en minúscula), ordenado.
 * @throws {Error} Si la respuesta HTTP no es satisfactoria.
 */
export async function obtenerRazas(signal) {
  const respuesta = await fetch(`${BASE_URL}/breeds/list/all`, { signal });

  // fetch NO rechaza ante 4xx/5xx: se comprueba response.ok de forma explícita.
  if (!respuesta.ok) {
    throw new Error(`Error HTTP ${respuesta.status} (${respuesta.statusText})`);
  }
  const datos = await respuesta.json();
  if (datos.status !== 'success') {
    throw new Error('La API devolvió una respuesta no válida.');
  }
  return Object.keys(datos.message).sort();
}

/**
 * Obtiene la URL de una imagen aleatoria. Si se indica una raza válida,
 * devuelve una imagen de esa raza; en caso contrario, una imagen aleatoria.
 * @param {string} [raza] - Clave de la raza (minúscula).
 * @param {AbortSignal} [signal]
 * @returns {Promise<string>} URL de la imagen.
 * @throws {Error} Si la respuesta HTTP no es satisfactoria.
 */
export async function obtenerImagenRaza(raza, signal) {
  const url = raza
    ? `${BASE_URL}/breed/${encodeURIComponent(raza)}/images/random`
    : `${BASE_URL}/breeds/image/random`;

  const respuesta = await fetch(url, { signal });
  if (!respuesta.ok) {
    throw new Error(`Error HTTP ${respuesta.status} (${respuesta.statusText})`);
  }
  const datos = await respuesta.json();
  if (datos.status !== 'success') {
    throw new Error('La API devolvió una respuesta no válida.');
  }
  return datos.message; // URL de la imagen
}