# Sprint 11 — Escritorio protagonista y recorrido guiado

Estado (2026-10-14): **propuesta, sin aprobar**. Ninguna fase arranca sin luz verde explícita.
Alcance: `workshop-game` y la portada del portafolio. Antecedentes: Sprint 9 (luz, props, sonido), Sprint 10 (composición, tecnologías, huellas personales).

## Por qué

El taller es correcto pero "sin alma". Las referencias que gustan (chrisp.design, maximeguillon.com) no son técnicamente superiores; tienen:

1. Un solo concepto ("un escritorio", "una isla con casa").
2. Dirección de arte cerrada: paleta corta, un estilo.
3. Un objeto protagonista.
4. Cámara guiada (clic o scroll), no una sala grande donde perderse.
5. Texto integrado en la escena, con carácter.
6. Personalidad en lo pequeño (carga, etiquetas, textos).

Referencia técnica observada: chrisp.design usa Spline en un único canvas sin scroll; maximeguillon.com usa Vite + R3F con un `House.glb` Draco y cámara por scroll. No se copian escenas, islas ni IP (la casa de Maxime remite a Dragon Ball).

## Capas

| Capa | Qué | Referencia |
| --- | --- | --- |
| A. Escritorio protagonista | Mesa de trabajo vista de frente: monitor central con carrusel de proyectos reales, portátil = trayectoria, libreta = contacto, tocadiscos = sonido, vitrina Kliniu. Hover con parallax; clic acerca la cámara y abre el contenido | Chris |
| B. Recorrido por scroll | La cámara recorre el taller: entrada → hub → salas → tecnologías → contacto, con titular grande integrado en cada parada | Maxime |
| C. Dirección de arte | Paleta única, gradación, tipografía, pantalla de carga con carácter | ambas |

El taller actual sigue como "modo explorar"; nada se elimina.

## Fases

| Fase | Qué se hace | Créditos |
| --- | --- | --- |
| **11.1 Dirección de arte** | 2 propuestas de paleta con muestras; tipografía; pantalla de carga; gradación de color en la escena. Se elige una | 0 |
| **11.2 Escritorio protagonista** | Escena nueva `desk-hero` reutilizando props existentes (tocadiscos, portátil, vitrina, lámpara); monitor con las capturas reales de `portfolio-projects`; sin datos nuevos | 0 |
| **11.3 Interacción** | Etiquetas flotantes de tamaño constante, hover con parallax, clic → cámara → contenido existente (explorador de proyectos/tecnologías) | 0 |
| **11.4 Recorrido por scroll** | Paradas definidas sobre el taller actual; teclado (flechas), `prefers-reduced-motion` → saltos sin animación; el texto de cada parada también en el DOM | 0 |
| **11.5 Móvil, accesibilidad, peso** | Verificar 1440, 1920, 390 y 320; fallback sin WebGL; medir peso y fps; salvaguarda de calidad existente | 0 |
| **11.6 Unificación de estilo (opcional)** | Solo si 11.1 lo pide: retexturizar o regenerar props que desentonen. Se mide con `simulate_cost` antes de gastar | por medir |

## No se hace

- Spline u otro runtime/editor adicional.
- Scroll secuestrado sin teclado ni reduced motion.
- Personas ni guante blanco (siguen sin decidir).
- Marcas, nombres de artistas o datos inventados.
- Subir presupuestos de peso por defecto (prop ≤300 KB, sala ≤2 MB, total ≤5 MB).

## Reglas que se mantienen

- Capa aditiva: no se modifican `room-*-v1.glb`; cambios como `v2` con hash y registro en `manifest.json`.
- Verificación en navegador real antes de dar nada por hecho.
- Magnific: proyecto `tmp`, descargar y borrar en el mismo turno; `simulate_cost` antes de cada gasto.

## Decisiones que necesito

1. ¿Escritorio (A), recorrido (B) o ambos? Recomendación: A primero, B después.
2. ¿El escritorio sustituye la portada actual o vive dentro del taller? Recomendación: portada nueva, taller como "modo explorar".
3. Paleta: ¿colores prohibidos u obligatorios? Si no, 2 opciones en 11.1.
4. Móvil: ¿misma escena simplificada o versión estática? Recomendación: misma escena, calidad reducida.

## Riesgos

- La dirección de arte es subjetiva: sin paleta decidida, A y B se ven como hoy con otra cámara.
- Los props generados son más realistas que la arquitectura estilizada; 11.6 puede ser necesaria.
- Una escena de escritorio completa en teléfono real debe medirse, no suponerse.
