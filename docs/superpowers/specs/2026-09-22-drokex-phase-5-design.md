# Fase 5 - Drokex: comercio conectado

Estado: aprobado por Daniel el 22 septiembre 2026: "apruebo, dale".

## Contexto verificado

Lectura del registro local drokex.ts, auditoria de evidencia y generador
refine_remaining_pavilions.py. Navegacion publica en Chrome el 22 septiembre
2026: https://drokex.com/. Portada con identidad negra/lima, entradas para
empresas y compradores, productos, directorio y globo Drokex World.
Referencia: docs/product/portfolio-3d-evidence/drokex-phase5-reference.png.
No se probaron cuentas, cotizaciones, pagos ni operaciones privadas.
Los numeros y testimonios visibles en la portada no prueban resultados del
trabajo de Daniel; no se trasladaran al caso como metricas verificadas.

## Alternativas

1. Mesa de comercio conectado (recomendada): aprovechar el globo, kioscos y
   muestras del pabellon actual, con materiales y encuadres mas detallados.
   Relacion directa con el producto y continuidad con la ciudad.
2. Terminal logistica: mayor presencia de contenedores y transporte. Riesgo
   de presentar Drokex como operador logistico en vez de catalogo/directorio.
3. Escena de personaje futurista: cercana a la portada actual, pero requiere
   activos autorizados y desvía la atencion del producto. Fuera del alcance.

## Direccion visual recomendada

Grafito, aluminio claro y blanco; verde lima puntual y naranja secundario
solo donde ayude a diferenciar los dos recorridos publicos. Fondo iluminado
para inspeccionar el modelo, sin bloom excesivo ni particulas decorativas.
Globo sobre soporte mecanico, meridianos finos, kioscos de catalogo y muestras
de envio con cantos, juntas y materiales diferenciados. Conexiones visuales
conceptuales, nunca rutas comerciales o actividad presentadas como datos reales.

Portada a sangre con Drokex como H1, render grande sin marco y acceso al caso.
Secciones: contexto y participacion; escena interactiva; catalogo/directorio
con capturas publicas; decisiones documentadas; tecnologias y contacto.
Mantener atribucion del CV y propiedad no confirmada. No autoría exclusiva.

## Recorrido

- Red: encuadre completo del pabellon y globo.
- Detalle: retirar cubierta/fachada y aproximar muestras y kioscos.
- Plataforma: captura real, ampliable, sin canvas montado.

Cambio mediante controles explicitos, sin scroll secuestrado ni sonido.
Canvas opt-in, arrastre, flechas, Inicio, reset y cierre con foco restaurado.
Poster durante carga y fallback ante ausencia de WebGL, fallo de GLB o perdida
de contexto. Reduced motion sin interpolacion. Desmontaje fuera de pantalla.

## Alcance tecnico propuesto

Blender: clonar drokex Brand v3, conservar originales y cinco capas existentes.
Crear blender/refine_drokex_v4.py, editable en blender/output/drokex-v4/,
GLB drokex-interactive-v4.glb y cuatro renders (general, detalle, hero ancho,
hero movil) convertidos a WebP. Objetivos de presupuesto, no mediciones actuales:
GLB <=3 MB y <=80k triangulos; reducir geometria si se exceden antes de integrar.

Frontend: DrokexCase, DrokexNetwork y DrokexNetworkScene con CSS Modules y
pruebas propias dentro de modules/projects/components/portfolio-case.
Usar PortfolioCaseProps, R3F/drei/Three.js y lucide-react existentes.
Modificar unicamente derivacion Drokex del router y version del modelo en
blender-pavilion.tsx. No extraer abstracciones compartidas en esta fase.
Render bajo demanda, DPR maximo 1.5 y sin recursos HDR externos.

## Secuencia de ejecucion tras aprobar

1. Evidencia: visitar rutas publicas observadas /productos y /directorio,
   revisar participacion local y capturar escritorio/movil sin formularios.
2. Blender: inspeccion MCP, clon independiente, refinamiento, renders,
   inspeccion visual, exportacion y comprobacion de capas/peso.
3. Caso: pruebas RED de entrada, vistas, fallback, retorno y proyecto anterior;
   implementar composicion y pasar GREEN sin debilitar atribucion de evidencia.
4. Visor: integrar GLB y controles, transiciones y estados de fallo/foco.
5. QA: Chrome 1440/1920/390/320, capturas y pixeles de canvas; comprobar
   encuadre, giro, teclado, reset, retorno, ausencia de overflow y targets 44px.
   Probar reduced motion, sin WebGL, GLB fallido y contextlost.
6. Regresion de los tres casos existentes, Vitest completo, tsc, ESLint,
   revision independiente y evidencia final. Servidor local en puerto libre.

## No implementar

Sin cambios en repositorios de marca, metricas ficticias, login, pagos,
backend, nuevas dependencias, servicios o cuentas. Sin commit, push o deploy.
Sin rediseñar la ciudad ni las transiciones globales. Sin iniciar Fase 6.
El estudio es conceptual, no una replica de instalaciones de Drokex.

## Aprobacion requerida

Confirmar direccion Mesa de comercio conectado y recorrido Red / Detalle /
Plataforma antes de escribir codigo o modificar escenas Blender.
