---
name: frontend-design
description: Guía de dirección visual para construir o rediseñar pantallas del panel de BarberSys (dashboards, tablas, formularios, navegación). Usar en cualquier tarea que implique crear o modificar UI.
---

# Frontend Design — BarberSys

Encará cada pantalla como si fueras el diseñador líder de un estudio que se destaca por darle a cada producto una identidad visual propia, no plantillas genéricas. BarberSys es una herramienta de uso diario para dueños y barberos — no es un sitio de marketing, es una herramienta de trabajo. La belleza acá se mide en claridad, jerarquía y velocidad de uso, no en efectos.

## Principios de diseño

**Definí un sistema de tokens y respetalo en todo el panel.** Antes de construir una pantalla nueva, revisá si ya existe una paleta, tipografía y espaciado definidos en el proyecto (Tailwind config, componentes ya construidos). Nunca inventes colores o espaciados nuevos por pantalla — la consistencia entre Owner, Barber y Admin es lo que hace sentir el producto como una sola herramienta, no tres apps distintas pegadas con cinta.

**La jerarquía de información manda.** En un dashboard, lo primero que ve el ojo debe ser el dato más accionable (ej. "te queda 1 barbero disponible en tu plan"), no un encabezado decorativo. Cuestioná cualquier elemento que no ayude a leer más rápido: si una card, un ícono o un borde no aporta jerarquía, sacalo.

**Evitá los defaults reconocibles de IA**: grids de 3 cards idénticas con ícono + título + texto, azul-violeta como paleta por defecto, sombras difusas en todo, bordes redondeados exagerados en todo. Elegí una paleta acotada (2-3 colores + neutros) que tenga sentido para una barbería (considerá tonos cálidos, tierra, cuero, sobrios — no el azul SaaS genérico) y sostenela en todo el panel.

**Las tablas y formularios son el corazón del producto.** BarberSys se usa para cargar cortes y ver métricas todos los días — priorizá densidad de información legible, estados vacíos con mensaje claro y accionable, y feedback inmediato ante cada acción (guardado, error, límite alcanzado) por sobre cualquier animación decorativa.

**Motion con propósito, no decoración.** Transiciones cortas en cambios de estado (loading, guardado exitoso, error) sí; animaciones de entrada elaboradas en cada card, no. Respetá `prefers-reduced-motion`.

**Restricción de accesibilidad no negociable**: contraste legible, foco de teclado visible, tamaños de touch target usables en mobile (los barberos van a cargar cortes desde el celular).

## Proceso

Antes de escribir código de una pantalla nueva: (1) confirmá qué patrones de diseño ya existen en el proyecto y reusalos, (2) si es una pantalla realmente nueva sin precedente, proponé brevemente paleta/tipografía/layout antes de construir, (3) construí, (4) revisá tu propio resultado contra este documento antes de darlo por terminado — específicamente: ¿esto se ve como cualquier dashboard de IA genérico, o tiene una identidad propia coherente con el resto del panel?

## Escritura de textos en la UI

Los textos son parte del diseño, no relleno. Nombrá las cosas como las nombraría un barbero o un dueño de barbería, no como las nombra el sistema técnicamente (ej. "Cargar corte", no "Crear registro de servicio"). Usá voz activa: un botón dice "Guardar cambios", no "Enviar". Los mensajes de error explican qué pasó y qué hacer, sin tono robótico ni disculpas genéricas. Los estados vacíos invitan a actuar (ej. "Todavía no cargaste ningún corte hoy" + botón de acción, no solo "Sin datos").

## Mobile-first, sin excepción

Toda pantalla se construye primero para mobile (viewport ~375px) y recién después se adapta a breakpoints mayores. En Tailwind esto es literal: las clases sin prefijo (`flex-col`, `p-4`, `text-sm`) son la base mobile; `sm:`/`md:`/`lg:`/`xl:` solo agregan o sobreescriben comportamiento para pantallas más grandes. Nunca al revés — no escribas el layout de escritorio primero y le agregues `sm:` para "achicarlo" después.

Esto importa especialmente para BarberSys porque los barberos van a cargar cortes desde el celular en el día a día — esa es la pantalla que más se usa y la que menos margen tiene para fallar en mobile.

Checklist antes de dar una pantalla por terminada:
- El layout tiene sentido en ~375px de ancho sin scroll horizontal.
- Los formularios y tablas priorizan lo esencial en mobile (columnas secundarias de una tabla pueden colapsarse u ocultarse con `hidden md:table-cell`, no forzar la tabla completa en una pantalla chica).
- Los touch targets (botones, links de navegación) tienen al menos 44px de alto en mobile.
- La navegación mobile (probablemente un menú hamburguesa o tab bar) está resuelta explícitamente, no es el menú de escritorio comprimido.
- Recién después de validar mobile, se agregan los breakpoints `md:`/`lg:` para aprovechar el espacio extra de escritorio (más columnas visibles, navegación lateral en vez de hamburguesa, etc.).

## Paleta de marca

La paleta vigente vive en `tailwind.config.js`, bajo `theme.extend.colors.brand`. Es la única fuente de verdad — no repliques valores hex en componentes ni en este documento.

Regla estricta: nunca uses clases de color crudas de Tailwind (`amber-500`, `violet-600`, `zinc-900`, etc.) directamente en JSX. Usá siempre los tokens semánticos (`brand-primary`, `brand-nav-bg`, `brand-danger`, etc.). Si necesitás un color que no existe como token, agregalo primero a `tailwind.config.js` con un nombre semántico, y después usalo — nunca al revés.

La marca (nombre, paleta final, tipografía) todavía no está cerrada — el sistema de tokens existe justamente para que ese cambio, cuando llegue, sea una edición de un archivo y no una reescritura del panel.