---
name: landing-design
description: Guía de diseño exclusiva para la landing pública de Pelito (hero, pricing, FAQ, navbar de marketing, mockups ilustrativos). No aplica a las pantallas internas del panel (Owner/Barber/Admin) — esas usan el skill frontend-design.
---

# Contexto de estilos — Pelito

Este archivo define la línea visual oficial para **Pelito**. Cada vez que se cree o modifique una pantalla, sección, componente, card, navbar, botón, tabla, mockup, pricing, FAQ o cualquier elemento visual del proyecto, se debe leer y respetar este contexto antes de escribir código.

La prioridad es mantener una identidad visual consistente: **SaaS moderno, limpio, redondeado, celeste, amable, sobrio y premium**.

---

## 1. Identidad visual general

Pelito debe sentirse como un software simple y confiable para dueños de barberías. No debe parecer una barbería vintage ni una web de peluquería tradicional. La estética tiene que comunicar gestión, claridad, números, rentabilidad y control, pero de una manera amigable y fácil de entender.

La dirección visual es:

- SaaS moderno.
- Formal pero no frío.
- Fancy pero no cargado.
- Redondeado y amable.
- Blanco, celeste y azul oscuro como base.
- Mucho aire visual.
- Cards suaves.
- Sombras livianas.
- Componentes flotantes.
- Interfaz clara y tranquila.

La sensación buscada es:

> “Esto se ve simple, moderno y ordenado. Me va a ayudar a entender mi barbería sin complicarme.”

---

## 2. Paleta oficial

Usar estos colores como base principal. No inventar otros colores dominantes salvo que sea estrictamente necesario para estados puntuales.

### Primary

**Celeste principal**  
`brand-primary`

Uso:

- Botones principales.
- Highlights de títulos.
- Íconos principales.
- Badges activos.
- Líneas de progreso.
- Estados seleccionados.
- Detalles visuales de dashboard.

Variantes permitidas:

- Celeste claro para fondos: `brand-primary-soft`, `brand-primary-tint`, `brand-primary-muted`.
- Celeste hover: `brand-primary-hover`.
- Celeste pressed: `brand-primary-pressed`.

No usar celestes verdosos ni azules demasiado oscuros como color primario.

### Secondary

**Azul oscuro / negro azulado**  
`brand-text`

Uso:

- Títulos principales.
- Texto fuerte.
- Cards oscuras de contraste.
- Footer si se usa oscuro.
- Plan premium / cadena.

Este color reemplaza al negro puro. No usar negro puro (`#000000`) para texto principal salvo casos excepcionales.

### Tertiary

**Gris azulado**  
`brand-text-secondary`

Uso:

- Textos secundarios.
- Bajadas.
- Descripciones.
- Labels suaves.
- Metadata.
- Texto de cards.

### Neutral

**Fondo claro**  
`brand-bg`

Uso:

- Fondos de secciones.
- Bloques alternados.
- Fondos suaves de dashboard.
- Áreas amplias.

Variantes permitidas:

- Blanco puro para cards: `brand-surface`.
- Gris muy suave: `brand-surface-alt`.
- Borde suave: `brand-border`.
- Borde más sutil: `brand-border-subtle`.

---

## 3. Tipografías

La tipografía oficial de titulares es:

**Hanken Grotesk**

La tipografía para cuerpo puede ser:

**Inter**

Jerarquía:

- Headline: Hanken Grotesk, peso 700/800.
- Subheadline: Hanken Grotesk o Inter, peso 500/600.
- Body: Inter, peso 400/500.
- Labels: Inter, peso 600/700, tamaño chico, letter-spacing moderado.

No usar tipografías serif.  
No usar tipografías decorativas.  
No usar tipografías con estética vintage/barbería.

---

## 4. Estilo de layout

El layout debe ser ancho, limpio y centrado.

### Contenedor principal

- Máximo ancho recomendado: `1180px` a `1280px`.
- Padding lateral desktop: `24px` a `32px`.
- Padding lateral mobile: `16px` a `20px`.
- Separación vertical entre secciones: `80px` a `120px` en desktop.
- Separación vertical en mobile: `56px` a `80px`.

### Fondos

Usar principalmente:

- Blanco.
- Blanco azulado.
- Degradados muy suaves celestes.
- Bloques alternados con `brand-bg`.

Ejemplo de fondo válido:

```css
background: radial-gradient(circle at top right, rgba(brand-primary, 0.12), transparent 35%), brand-bg;
```

Los degradados deben ser sutiles. No usar fondos saturados ni patrones agresivos.

---

## 5. Navbar

La navbar debe ser flotante, redondeada y liviana, similar a una barra SaaS premium.

Características:

- Fondo blanco o blanco translúcido.
- Borde suave `brand-border`.
- Sombra sutil.
- Border radius alto, entre `22px` y `999px`.
- Altura aproximada: `56px` a `68px`.
- Separada del borde superior por `12px` a `20px`.
- Contenido centrado en un contenedor máximo.
- Sticky si no rompe la experiencia.

Links:

- Color normal: `brand-text-secondary` o `brand-text-strong`.
- Hover: `brand-text`.
- Activo: `brand-primary`.
- Tamaño: 14px / 15px.
- Peso: 600.

CTA de navbar:

- Botón pill celeste.
- Fondo `brand-primary`.
- Texto blanco.
- Sombra celeste suave.
- Hover levemente más oscuro.

No hacer una navbar rectangular dura. No usar bordes negros. No usar menú pesado.

---

## 6. Botones

Todos los botones deben ser redondeados, claros y consistentes.

### Botón primario

Uso: acción principal.

Estilo:

```css
background: brand-primary;
color: brand-surface;
border-radius: 999px;
font-weight: 700;
box-shadow: shadow-brand-cta;
```

Hover:

- Fondo `brand-primary-hover`.
- Mover apenas hacia arriba si hay animaciones suaves.
- Mantener sombra suave.

Textos recomendados:

- “Probar gratis”
- “Ver demo”
- “Hablar por WhatsApp”
- “Empezar ahora”

### Botón secundario

Uso: acción alternativa.

Estilo:

```css
background: brand-surface;
color: brand-text;
border: 1px solid brand-border;
border-radius: 999px;
```

Hover:

- Fondo `brand-bg`.
- Borde `brand-primary-muted`.

### Botón invertido

Uso: sobre fondos oscuros.

```css
background: brand-surface;
color: brand-text;
border-radius: 999px;
```

### Botón outline

Uso: pricing o acciones de menor prioridad.

```css
background: transparent;
color: brand-text;
border: 1px solid brand-primary;
border-radius: 999px;
```

No usar botones cuadrados. No usar botones con sombras duras. No usar gradientes fuertes en botones.

---

## 7. Cards

Las cards son una parte central de la identidad visual.

Estilo base:

```css
background: brand-surface;
border: 1px solid brand-border;
border-radius: 22px;
box-shadow: shadow-brand-card;
```

Características:

- Bordes redondeados grandes.
- Padding generoso: `24px` a `32px`.
- Aire interno.
- Títulos claros.
- Descripciones breves.
- Íconos dentro de cuadrados/círculos suaves.

Hover opcional:

```css
transform: translateY(-3px);
box-shadow: shadow-brand-card-hover;
```

No abusar de hover si la página queda demasiado animada.

---

## 8. Íconos

Los íconos deben ser simples, lineales y modernos.

Uso recomendado:

- Íconos lineales.
- Trazos finos/medios.
- Color principal `brand-primary`.
- Fondo suave `brand-primary-soft`.
- Contenedor redondeado de 36px a 48px.

Evitar:

- Íconos vintage de barbería.
- Navajas, tijeras o barber poles como recurso principal.
- Íconos muy detallados.
- Emojis como íconos principales.

---

## 9. Hero

El hero debe ser una de las secciones más cuidadas.

Estructura recomendada:

- Texto a la izquierda.
- Mockup/dashboard a la derecha.
- Fondo claro con degradado celeste sutil.
- Badge pequeño arriba del título.
- Título grande con parte destacada en celeste.
- Bajada clara.
- Dos CTAs.
- Microcopy de confianza.

Título recomendado:

> Vos encargate de cortar.  
> Pelito ordena tu barbería.

El texto “Pelito ordena tu barbería” puede ir en celeste.

Subtítulo recomendado:

> Registrá servicios, medí la productividad de tus barberos y conocé la rentabilidad real de tu negocio mes a mes.

Badge superior recomendado:

> SISTEMA DE GESTIÓN PARA BARBERÍAS

No usar “Sistemas a medida” en Pelito, porque Pelito es producto SaaS, no servicio a medida.

---

## 10. Mockups de dashboard

Cuando no haya capturas reales, crear mockups con HTML/CSS. El mockup debe verse como una interfaz real, no como una ilustración genérica.

Debe incluir cards como:

- Facturación del mes.
- Ganancia neta.
- Servicios realizados.
- Barbero destacado.
- Medio de pago principal.
- Servicios más vendidos.
- Ranking de barberos.
- Neto por sucursal.

Estilo del mockup:

- Card grande blanca.
- Border radius 24px a 32px.
- Sombra amplia y suave.
- Header interno con icono celeste.
- Mini cards internas.
- Números grandes y oscuros.
- Porcentajes en verde suave si son positivos.
- Detalles secundarios en gris.

Ejemplo de datos ficticios permitidos para mockup:

- Facturación: `$1.240.000`
- Ganancia neta: `$480.000`
- Servicios: `386`
- Medio principal: `Transferencia`
- Barbero destacado: `Lucas R.`
- Servicio más vendido: `Corte clásico`

Los datos del mockup deben ser verosímiles para una barbería. No usar métricas genéricas tipo “clientes nuevos”, “pedidos activos” o “tasa de conversión” salvo que tenga sentido en el contexto.

---

## 11. Secciones de problema

Las secciones de problema deben usar textos directos y cards limpias.

Ejemplo de título:

> ¿Manejás tu barbería a ojo?

Cards válidas:

1. **No sabés cuánto factura cada uno**  
   A fin de mes es un dolor de cabeza calcular comisiones y productividad sin errores.

2. **Cuentas en cuadernos**  
   Hojas, tachones y planillas terminan escondiendo información importante del negocio.

3. **No ves ganancia neta**  
   Facturás mucho, pero no sabés cuánto queda realmente después de sueldos y gastos.

Estilo:

- Cards blancas.
- Íconos rojos solo para problemas o alertas.
- Mantener rojo en dosis bajas.
- No transformar la sección en algo agresivo.

Rojo permitido para alertas:

- `brand-danger`
- Fondo suave: `brand-danger-soft`

---

## 12. Secciones de funcionalidades

Las funcionalidades deben mostrarse como herramientas profesionales, no como una lista plana.

Título sugerido:

> Herramientas profesionales para ordenar tu barbería

Funcionalidades principales:

- Registro de servicios.
- Catálogo de servicios.
- Productividad por barbero.
- Facturación por barbero.
- Facturación por sucursal.
- Medios de pago.
- Sueldos y gastos.
- Ganancia neta.
- Panel multi-sucursal.
- Ranking de productividad.

Estilo:

- Grilla de cards.
- Algunas cards pueden ser más grandes que otras.
- Una card destacada puede usar fondo oscuro `brand-text` con texto blanco y botón celeste.
- Mantener equilibrio visual.

---

## 13. Sección “Cómo funciona”

Debe ser muy simple, idealmente en 3 pasos.

Título:

> 3 pasos para el control total

Pasos:

1. **Cargás datos**  
   Configurás tus barberías, servicios, barberos y comisiones.

2. **Registrás día a día**  
   Tus barberos o encargados cargan cada servicio apenas termina.

3. **Mirás el panel**  
   Entrás desde el celular o PC y ves cómo va tu negocio en tiempo real.

Estilo:

- Timeline horizontal en desktop.
- Cards o pasos verticales en mobile.
- Círculos numerados.
- Línea fina gris/celeste.
- Paso activo o principal con celeste.

---

## 14. Pricing / planes

La sección de precios debe ser clara, confiable y marketinera.

Título:

> Planes simples para negocios reales

Subtítulo recomendado:

> Probá gratis y elegí el plan que mejor acompaña el tamaño de tu barbería.

Planes oficiales:

### Base

Para una barbería chica que quiere ordenar sus números.

Precio sugerido visible:

- Mostrar como: `$15k /mes` si se usa punto medio.
- O mostrar rango: `$12k - $18k /mes`.

Incluye:

- 1 barbería.
- Hasta 3 barberos.
- Incluye al dueño si corta.
- Registro de servicios.
- Catálogo de servicios.
- Medios de pago.
- Módulo financiero.
- Sueldos y gastos.
- Métricas básicas de facturación.

### Crecimiento

Debe ser el plan recomendado.

Precio sugerido visible:

- `$35k /mes` si se usa punto medio.
- O rango: `$28k - $38k /mes`.

Incluye:

- Hasta 2 barberías.
- Hasta 6 barberos.
- Todo lo del plan Base.
- Panel consolidado entre barberías.
- Ranking de productividad por barbero.
- Comparación entre sucursales.
- Métricas más completas.

Visual:

- Borde celeste.
- Badge “RECOMENDADO”.
- Botón principal celeste.

### Expansión

Precio sugerido visible:

- `$65k /mes` si se usa punto medio.
- O rango: `$55k - $75k /mes`.

Incluye:

- Hasta 5 barberías.
- Barberos ilimitados.
- Todo lo del plan Crecimiento.
- Panel consolidado ampliado.
- Neto por sucursal.
- Neto total del negocio.
- Sin límite de barberos por sucursal.

### Cadena

Para operaciones grandes o con alto volumen.

Precio:

- `A medida`
- También puede mostrarse como `Custom` solo si el resto de la landing mantiene español. Preferir `A medida`.

Incluye:

- Más de 5 barberías.
- Mayor volumen de barberos.
- Todo lo del plan Expansión.
- Roles y permisos por sucursal.
- Reportes exportables.
- Soporte prioritario.
- Configuración adaptada a la operación.

Visual:

- Card oscura `brand-text`.
- Texto blanco.
- Botón blanco.

No inventar precios que no estén definidos. Si se elige mostrar un único precio, usar el punto medio de cada rango.

---

## 15. FAQ

La FAQ debe ser limpia, tipo accordion.

Estilo:

- Contenedor centrado.
- Ancho máximo 720px a 860px.
- Items blancos.
- Bordes suaves.
- Radius 14px a 18px.
- Texto oscuro.
- Ícono de flecha simple.

Preguntas importantes:

- ¿Pelito reemplaza mi sistema de turnos?
- ¿Puedo ver los números desde mi casa?
- ¿Cómo se pagan las comisiones?
- ¿Sirve para una sola barbería?
- ¿Puedo administrar varias sucursales?
- ¿Puedo registrar efectivo, transferencia y tarjeta?
- ¿Puedo calcular la ganancia neta?
- ¿Necesito instalar algo?

Respuesta clave sobre turnos:

> No. Pelito no es un turnero. Podés seguir usando WhatsApp, agenda o el sistema de turnos que ya tengas. Pelito se enfoca en la gestión interna, productividad, facturación, gastos y rentabilidad.

---

## 16. Badges y labels

Los badges deben ser redondeados y suaves.

Estilo:

```css
background: brand-primary-tint;
color: brand-primary-soft-text;
border-radius: 999px;
font-size: 12px;
font-weight: 700;
letter-spacing: 0.08em;
text-transform: uppercase;
```

Uso:

- “SISTEMA DE GESTIÓN PARA BARBERÍAS”
- “RECOMENDADO”
- “NO ES UN TURNERO”
- “MULTI-SUCURSAL”

No usar badges grandes ni muy saturados.

---

## 17. Logos / confianza

Si se muestran logos de barberías o marcas, deben verse sutiles.

Estilo:

- Escala de grises.
- Opacidad moderada.
- Alineados horizontalmente en desktop.
- Scroll o grilla simple en mobile.

No inventar clientes reales si no existen. Si se usan nombres ficticios, no presentarlos como clientes reales. Preferir frases genéricas como:

> Diseñado para barberías que quieren dejar atrás el cuaderno.

---

## 18. Cards oscuras

Usar cards oscuras con moderación para destacar una funcionalidad importante o el plan más alto.

Estilo:

```css
background: brand-nav-bg;
color: brand-surface;
border-radius: 24px;
```

Dentro de cards oscuras:

- Títulos blancos.
- Texto secundario `brand-text-on-dark`.
- Botones celestes o blancos.
- No usar demasiados colores.

---

## 19. Estados y colores semánticos

### Éxito

Usar verde solo para métricas positivas.

- Verde: `brand-success`
- Fondo suave: `brand-success-soft`

Ejemplo:

> +12% vs mes anterior

### Alerta / problema

Usar rojo solo en secciones de dolor o advertencias.

- Rojo: `brand-danger`
- Fondo suave: `brand-danger-soft`

### Info

Usar celeste para información positiva o neutra.

- Celeste: `brand-primary`
- Fondo suave: `brand-primary-soft`

---

## 20. Bordes y sombras

Los bordes deben ser sutiles.

Bordes recomendados:

- `brand-border`
- `brand-border-subtle`
- `rgba(brand-nav-bg, 0.08)`

Sombras recomendadas:

```css
box-shadow: shadow-brand-card;
```

Para elementos flotantes importantes:

```css
box-shadow: shadow-brand-floating;
```

Para botones primarios:

```css
box-shadow: shadow-brand-cta;
```

No usar sombras negras fuertes.
No usar bordes demasiado oscuros.

---

## 21. Radius oficial

Usar bordes redondeados grandes.

- Botones: `999px`.
- Badges: `999px`.
- Inputs: `12px` a `16px`.
- Cards chicas: `18px` a `22px`.
- Cards grandes / mockups: `24px` a `32px`.
- Navbar: `22px` a `999px`.

No usar radius menor a 10px salvo elementos internos muy pequeños.

---

## 22. Inputs y formularios

Si se crean formularios, deben ser simples y limpios.

Input base:

```css
background: brand-bg;
border: 1px solid brand-border;
border-radius: 14px;
color: brand-text;
```

Focus:

```css
border-color: brand-primary;
box-shadow: 0 0 0 4px rgba(brand-primary, 0.12);
```

Labels:

- Texto `brand-text`.
- Peso 600.
- Tamaño 14px.

No usar formularios largos si el objetivo es conversión. Pedir lo mínimo posible.

---

## 23. Componentes flotantes

Se pueden usar pequeñas cards flotantes alrededor de mockups para dar vida visual.

Ejemplos:

- “Reporte enviado”
- “Ganancia neta +8.5%”
- “Transferencia 62%”
- “Lucas R. lidera el mes”

Estilo:

- Fondo blanco.
- Borde suave.
- Sombra media.
- Radius 16px a 20px.
- Ícono pequeño celeste o verde.

No saturar el hero con demasiadas floating cards.

---

## 24. Animaciones

Las animaciones deben ser sutiles.

Permitido:

- Fade in suave.
- TranslateY pequeño.
- Hover de cards leve.
- Hover de botones leve.
- Transiciones de 150ms a 250ms.

Evitar:

- Animaciones exageradas.
- Rebotes fuertes.
- Rotaciones innecesarias.
- Parallax pesado.
- Efectos que hagan parecer la landing infantil.

---

## 25. Responsive

La experiencia mobile debe estar cuidada.

Reglas:

- Hero en una columna.
- Mockup debajo del texto.
- Navbar colapsada o adaptada correctamente.
- Pricing en una columna.
- Cards en una columna.
- Timeline vertical.
- Botones full width si mejora la usabilidad.
- Padding lateral mínimo 16px.

No permitir overflow horizontal.
No dejar mockups gigantes cortados en mobile.

---

## 26. Copy visual y tono dentro de componentes

Los textos deben ser claros y concretos.

Preferir:

- “Facturación por barbero”
- “Ganancia neta”
- “Medios de pago”
- “Servicios más vendidos”
- “Neto por sucursal”
- “Ranking de productividad”

Evitar:

- “Solución integral innovadora”
- “Transformación digital de alto impacto”
- “Optimización empresarial”
- “Dashboard analítico avanzado” si suena demasiado corporativo.

El dueño de barbería tiene que entenderlo en 5 segundos.

---

## 27. Qué NO hacer

No hacer:

- Estética vintage de barbería.
- Web oscura dominante.
- Dorados de lujo exagerado.
- Fondos con fotos stock oscuras.
- Tijeras, navajas o barber poles como protagonistas.
- Colores fuera de paleta.
- Botones cuadrados.
- Cards con bordes duros.
- Tipografías decorativas.
- Sombras negras fuertes.
- Interfaces genéricas de SaaS que no hablen de barberías.
- Textos lorem ipsum.
- Clientes o cifras falsas.

---

## 28. Qué SÍ hacer

Sí hacer:

- Usar blanco, celeste y azul oscuro.
- Usar Hanken Grotesk e Inter.
- Usar cards redondeadas.
- Usar navbar flotante.
- Usar botones pill.
- Usar dashboard/métricas como recurso principal.
- Hablar de facturación, barberos, sucursales, gastos y ganancia neta.
- Mantener mucho aire visual.
- Transmitir simplicidad y control.
- Hacer que cada componente parezca parte del mismo sistema.

---

## 29. Checklist antes de entregar un componente

Antes de finalizar cualquier componente, verificar:

- ¿Usa la paleta oficial?
- ¿Respeta los radius grandes?
- ¿Tiene suficiente aire visual?
- ¿Los textos son claros y específicos para barberías?
- ¿No parece una web vintage de barbería?
- ¿Los botones son consistentes?
- ¿Las cards tienen borde y sombra suave?
- ¿Funciona bien en mobile?
- ¿El componente podría convivir visualmente con la landing actual?
- ¿El diseño se siente SaaS moderno, soft, premium y amigable?

Si alguna respuesta es “no”, ajustar antes de entregar.

---

## 30. Resumen ultra corto para Codex

Cuando haya dudas, seguir esta regla:

> Pelito debe verse como un SaaS moderno y amable: blanco, celeste `brand-primary`, azul oscuro `brand-text`, tipografía Hanken Grotesk/Inter, cards redondeadas, sombras suaves, navbar flotante, botones pill y mockups de dashboard. Nada vintage, nada oscuro pesado, nada recargado. Todo debe comunicar claridad, control y rentabilidad para dueños de barberías.
