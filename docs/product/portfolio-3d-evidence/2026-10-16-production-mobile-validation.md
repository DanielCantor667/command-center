# Build de producción y fichas móviles

Verificación final: 16 de octubre de 2026. Alcance autorizado: generar el build de producción, revisar las cuatro fichas en móvil y corregir los problemas encontrados. Continúa el pulido local documentado en `../workshop-game-evidence/2026-10-15-polish-validation.md`.

## Problemas corregidos

- Academy: la columna del relato móvil conservaba un mínimo intrínseco de 260 px y desbordaba a 280 px de viewport. `minmax(0, 1fr)` permite que texto e imagen respeten la columna disponible.
- L’ORIGINE: los botones de perspectivas desbordaban a 280 px. El breakpoint de 360 px reduce separación y padding, conservando los 48 px de altura táctil.
- Heroes de L’ORIGINE, Academy y Drokex: el `picture` inmediato de las imágenes `fill` tenía posición estática y caja de tamaño cero. Ahora ocupa el hero con posición absoluta; Drokex también contiene la escala de entrada de su imagen.
- Kliniu: activar/cerrar/fallar el visor podía perder el foco; el canvas carecía de acceso por teclado. Se enfoca el control de cierre o el aviso estático según el resultado, se restaura el activador al cerrar y el canvas admite flechas/Home con foco visible.
- Kliniu: perder el contexto WebGL durante la carga del modelo dejaba el visor sin recuperación. La guardia está fuera de Suspense, detecta también un contexto previamente perdido y retira sus listeners al desmontar.
- L’ORIGINE: activación y fallo del visor no gestionaban explícitamente el foco. Aplica el patrón existente en Academy y Drokex para activar, cerrar y enfocar el aviso estático.

## Build y código

Desde `apps/web`, se ejecutó `node node_modules/prisma/build/index.js generate && node node_modules/next/dist/bin/next build`. Exit 0: compilación, lint, tipos y generación de 8 páginas estáticas completados. Se generó el cliente Prisma, sin ejecutar operaciones de base de datos.

Se sirvió ese resultado con `next start --hostname 127.0.0.1 --port 3000`. No había un servidor previo escuchando en ese puerto al retomar la verificación final.

- Vitest: 42/42 pruebas de fichas, 9 archivos. Incluye las regresiones nuevas de foco, teclado y contexto WebGL. Los cuatro tests nuevos de L’ORIGINE se reprodujeron fallando antes del parche final.
- ESLint de los seis TSX nuevos/modificados: exit 0.
- `git diff --check`: limpio.
- Revisión independiente estática del diff de esta fase: sin hallazgos accionables.

## Navegador real sobre producción local

Chromium con tamaños emulados; no equivale a una prueba en teléfono físico.

| Comprobación | Resultado observado |
| --- | --- |
| Kliniu, L’ORIGINE, Academy y Drokex a 280×531, 320×640, 390×844 y 844×390 | 16 combinaciones sin desbordamiento horizontal ni texto, figuras o controles fuera del ancho útil |
| Tres heroes con `picture` | Caja del ancho del hero, altura no nula y posición absoluta; fuente móvil hasta 760 px y fuente ancha en horizontal a 844 px |
| Tres perspectivas estáticas de cada ficha | 12 botones cambian su estado y las 12 imágenes terminan de decodificar con ancho natural positivo |
| Los cuatro visores 3D a 390×844 | Llegan a `data-live=true`; foco en cerrar al activar, restaurado al activador al cerrar; ningún canvas retenido después del cierre |
| Canvas de los cuatro casos | `tabIndex=0` y nombre accesible con instrucciones de teclado |
| Kliniu: flecha derecha y Home | Ambos producen cambios de píxeles en el canvas real; foco visible con outline sólido |
| WebGL no disponible, inyectado en una página separada | Los cuatro casos muestran su aviso estático, lo enfocan y no crean un canvas persistente |
| Kliniu: modelo GLB bloqueado y pérdida real de contexto antes de estar listo | Aparece el aviso estático enfocado, se desmonta el canvas y permanece visible el poster |
| L’ORIGINE: pérdida real de contexto después de estar listo | Aviso estático enfocado y canvas desmontado |
| Siguiente Kliniu → L’ORIGINE → Academy → Drokex y anterior a Academy | IDs y URL correctos; cada nueva ficha comienza en scroll 0 |
| Academy → Volver al taller | Elimina `project` de la URL |
| Academy → TypeScript → Cerrar lectura | Abre Tecnologías con TypeScript; cierra hacia la portada con foco en Entrar al taller |

No se registraron excepciones JavaScript en los recorridos normales de layout, vistas y navegación. La consola local devuelve 404 para `/_vercel/insights/script.js` y `/_vercel/speed-insights/script.js`, endpoints de telemetría de Vercel ausentes en `next start` local. Las pérdidas de contexto se provocaron expresamente para comprobar la recuperación.

Capturas locales, ignoradas por Git: [Kliniu 320](2026-10-16-case-prod-final-kliniu-320.png), [L’ORIGINE 320](2026-10-16-case-prod-final-lorigine-320.png), [Academy 320](2026-10-16-case-prod-final-4ustudio-academy-320.png), [Drokex 320](2026-10-16-case-prod-final-drokex-320.png), [controles 280](2026-10-16-case-prod-final-lorigine-controls-280.png), [relato Academy 280](2026-10-16-case-prod-final-academy-story-280.png), [Kliniu con teclado](2026-10-16-case-prod-final-kliniu-keyboard-390.png).

Trabajo local, sin commit, push ni publicación.
