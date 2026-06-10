# BIOPET — Agendar cita veterinaria (Práctica Experimental Unidad I)

Módulo de *agendamiento de citas* del sistema *BIOPET*, implementado como
*frontend* con *HTML5 semántico, **CSS3 responsivo* (Grid + Flexbox) y
*JavaScript ES6+ modular. Consume la API pública **Dog CEO* y cumple los
principios de accesibilidad *WCAG 2.1 nivel AA*.

> Nota: esta es la aplicación de la *Práctica Experimental de la Unidad I*
> (fundamentos de frontend con una API pública). El sistema completo BIOPET
> (Angular + API REST en ASP.NET Core + PostgreSQL + JWT) corresponde al Proyecto
> Fin de Curso y se desarrolla por separado.

*Asignatura:* Aplicaciones Web · Software (Rediseño) · UTEQ
*EQUIPO H:* Carvajal Loor Johan Stalin · Fajardo Montes Michael Xavier · Mariscal Cabrera Jaime Josué

---

## Estructura del proyecto
.
├── index.html          # Estructura semántica + formulario de cita (10+ tipos de input)
├── css/
│   └── styles.css      # Variables, Grid, Flexbox, @keyframes, modo oscuro
└── js/
├── api.js          # Capa de datos (Dog CEO: razas e imágenes)
├── ui.js           # Capa de presentación (DOM, estados, diálogo, validación, tema)
└── app.js          # Orquestador (estado, localStorage, eventos)
## Cómo ejecutar

1. Clonar el repositorio o descargar el código.
2. Abrir la carpeta en *VS Code*.
3. Clic derecho sobre index.html → *"Open with Live Server"* (extensión de Ritwick Dey).
4. La app abrirá en http://localhost:5500.

> Debe abrirse con un servidor (http://), no con doble clic (file://),
> porque los módulos ES6 (type="module") requieren un servidor.

## Funcionalidades

- *Consumo de API (Dog CEO)* con fetch / async / await:
  - Al cargar: obtiene el catálogo de razas y lo coloca en el select de raza
    (con indicador de carga y manejo de error con lista de respaldo + reintentar).
  - Al agendar: obtiene una foto referencial de la raza para la tarjeta de la cita.
- *Agendar cita* con validación nativa accesible (text, number, email, tel, date,
  time, range, file, select, radio, checkbox, textarea).
- *Lista de citas* con búsqueda en vivo, estado vacío y **persistencia en
  localStorage** (las citas se conservan al recargar).
- *Diálogo de detalle* accesible (<dialog>: foco atrapado y Escape nativos).
- *Cancelar cita* (elimina del DOM y del almacenamiento).
- *Tema claro/oscuro* automático (prefers-color-scheme) y conmutador manual
  persistido en localStorage.

## Auditorías de calidad

| Métrica | Resultado | Objetivo |
|---|---|---|
| Lighthouse — Rendimiento | 100 | ≥ 70 |
| Lighthouse — Accesibilidad | 100 | ≥ 90 |
| Lighthouse — Buenas Prácticas | 100 | ≥ 90 |
| Lighthouse — SEO | 100 | — |
| WAVE — Errores | 0 | 0 |
| Validador W3C HTML | 0 errores | 0 |
| Validador W3C CSS | 0 errores | 0 |

## Tecnología

- API pública: *Dog CEO* — https://dog.ceo/dog-api/
- Sin frameworks ni dependencias externas.

---

© 2026 BIOPET / EQUIPO H — Universidad Técnica Estatal de Quevedo.
