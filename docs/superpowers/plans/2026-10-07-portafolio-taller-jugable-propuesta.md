# Sprint 7 propuesto — El taller de Daniel como portafolio jugable

Fecha: 7 de octubre de 2026.
Estado: dirección aprobada para ejecución local por Daniel. Phase 7.1 quedó validada; Phase 7.2 fue autorizada con «lo veo bien, continúa con la fase 7.2» y su ejecución se registra en el plan específico. Phase 7.3 y siguientes requieren otra aprobación explícita. Este documento no modifica ni amplía las aprobaciones del Sprint 6.

## 1. Intención y criterio de éxito

Convertir el entorno del portafolio en un lugar 3D al que se pueda entrar: un taller a escala humana, con habitaciones y objetos que permitan descubrir proyectos, tecnologías, trayectoria y contacto. La exploración debe comunicar el trabajo de Daniel y facilitar abrir un caso real.

Lo pedido: experiencia tipo juego, acceso al taller, pantalla de carga y entorno general 3D. Dirección de las fases autorizadas: taller contemporáneo de realismo estilizado, cámara en primera persona sin avatar visible y navegación inicial por puntos de interés. Las ampliaciones de salas y controles permanecen sujetas a sus fases.

Éxito: desde la entrada se entiende dónde ir; se puede entrar, inspeccionar un objeto, abrir un proyecto y volver al mismo lugar. También se puede consultar el portafolio directamente, con teclado, desde móvil o sin WebGL.

## 2. Contexto comprobado del repositorio

- `apps/web/package.json` declara Next.js `^15.1.3`, React `^19.0.0`, Three.js `^0.171.0`, React Three Fiber `^9.0.0`, Drei `^10.0.0` y `lucide-react`. Se conservará el stack instalado; el plan no requiere actualizarlo.
- La experiencia pública vive en `apps/web/modules/experience`. `CityNavigator` usa una maqueta con cámara ortográfica; para entrar en habitaciones hará falta una cámara perspectiva y geometría a escala humana.
- `CityNavigatorLoader` ya aporta activación explícita, detección de WebGL, carga dinámica, manejo de errores y pérdida de contexto. Se reutilizarán esos comportamientos, sin asumir que el loader actual ya resuelve la carga del mundo completo.
- `workshop-state.ts` conserva estado de cámara y selección; `experience-gate` conecta el taller con los casos. Las transiciones aprobadas de fases anteriores son el punto de partida para preservar regresiones.
- Hay GLB y scripts Blender en el repo. Los pabellones existentes pueden servir como maquetas sobre mesas y referencias de identidad; no se presume que sus interiores permitan caminar sin remodelarlos.
- Los cuatro casos públicos actuales son Kliniu, L'ORIGINE, 4U Studio Academy y Drokex. Contenido y atribución se tomarán de los datos existentes, sin inventar resultados.
- Hay numerosos cambios previos preparados en Git. La propuesta se añade como documentación nueva, sin incluir esos cambios en commits.
- No se encontraron `~/.Codex/PERFIL.md` ni `~/.Codex/BLUEPRINT.md` en las rutas indicadas ni entre los archivos de contexto de `.codex` y `.agents`. Este plan se fundamenta en el repo; antes de implementar un módulo se deberá releer BLUEPRINT si vuelve a estar disponible.

## 3. Alternativas y recomendación

| Alternativa | Resultado | Coste y límite |
| --- | --- | --- |
| **Blender + Three.js/R3F, recomendada** | Espacio y assets propios en Blender; recorrido, puertas, cámara e interacciones en Three.js; texto accesible en HTML | Exige optimizar assets y comprobar que el GLB conserva la apariencia en navegador |
| Geometría principalmente procedural en Three.js | Primer recorrido rápido; fácil ajustar medidas y controles | Más trabajo para lograr una identidad visual rica; adecuada para el prototipo espacial |
| Renders Blender con transiciones entre vistas | Buena calidad visual y carga más predecible | No ofrece un espacio libre realmente recorrible; sirve como alternativa sin WebGL |

Blender y Three.js cumplen funciones complementarias. Exportaremos geometría y materiales compatibles como GLB. Three.js dispone de `GLTFLoader` y soporte para texturas KTX2; su uso concreto debe comprobarse contra las versiones instaladas, sin copiar APIs nuevas a ciegas.

La iluminación de un render Blender no se conserva automáticamente: luces de área, iluminación del mundo y efectos del compositor requieren recreación compatible en web o texturas horneadas. El objetivo visual deberá aprobarse también sobre el GLB ejecutado en navegador.

Fuentes oficiales: [exportación glTF de Blender](https://docs.blender.org/manual/en/5.0/addons/import_export/scene_gltf2.html), [GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html) y [KTX2Loader](https://threejs.org/docs/pages/KTX2Loader.html).

## 4. Dirección visual propuesta

**El taller de Daniel:** un estudio industrial contemporáneo, abierto y luminoso, donde los productos aparecen como piezas que se diseñan, construyen y prueban. La página ocupa todo el viewport con el entorno; desaparece la sensación de un canvas rectangular insertado en una landing.

- Arquitectura: acceso desde un pequeño exterior, puerta corrediza, nave principal, banco de trabajo, salas laterales y archivo de trayectoria.
- Escala: proporciones humanas; el visitante mira desde dentro del espacio. Las maquetas se conservan como objetos sobre la mesa.
- Materiales: concreto claro, acero verde, madera, vidrio esmerilado y detalles de latón. Evitar superficies excesivamente reflectantes que obliguen a efectos caros.
- Luz: día suave, lámparas cálidas locales y acentos vinculados a proyectos. El modo nocturno se mantiene fuera del primer alcance.
- Paleta de concepto: concreto `#D7DAD5`, verde `#315749`, latón `#BC9B63`, madera `#9E7958`, grafito `#252D29`. Los tokens definitivos se contrastarán con el sistema existente al implementar.
- Tipografía: conservar inicialmente la del repo para navegación y lectura; los mockups exploran una serif editorial en títulos, pendiente de aprobación y contraste con el sistema existente. Letreros físicos sencillos; priorizar contraste y tamaño legible sobre texto incrustado en texturas.
- Movimiento: puertas y objetos responden a acciones; cámara sin cabeceo, sin giros automáticos continuos ni secuencias que impidan salir.
- Interfaz: controles discretos sobre el entorno, iconos de `lucide-react`, menús y modales propios portalizados. Sin emojis literales, `alert()` ni selects nativos.

Los mockups son conceptos generados con imagegen. No son capturas de una web implementada, modelos 3D exportables ni evidencia del producto. Cualquier pantalla de proyecto dibujada en ellos representa una ubicación; al implementar se sustituirá por capturas reales del repo.

Mockups: [vista del acceso](../../product/workshop-game-concept/2026-10-07-entrada-conceptual.png) y [hoja con carga, entrada, exploración, proyecto, tecnologías y móvil](../../product/workshop-game-concept/2026-10-07-recorrido-conceptual.png). [Prompts de generación](../../product/workshop-game-concept/2026-10-07-imagegen-prompts.json).

La señalética pequeña de la imagen de acceso no conserva con precisión el nombre Kliniu incluso tras una corrección generativa. La nomenclatura válida es la del contenido y esta propuesta; los letreros definitivos se crearán como texto controlado en la escena/UI.

## 5. Recorrido completo

### A. Entrada y carga

El primer HTML muestra la identidad de Daniel, un poster del taller y dos rutas: **Entrar al taller** y **Ver portafolio**. Al entrar se cargan solamente el acceso y la sala central. Las otras salas se solicitan al acercarse o seleccionarlas.

La pantalla de carga muestra un plano del taller y estados reales: cargar espacio, preparar materiales y preparar la escena. No tendrá un temporizador que simule progreso. Solo habrá porcentaje si se conoce un total fiable; cuando no se conozca, se mostrará la fase actual con actividad indeterminada.

La escena se considera lista cuando están disponibles los assets esenciales y se ha renderizado el primer frame utilizable. No se espera a cargar todas las salas ni se añade un tiempo mínimo artificial al loader. Tras elegir **Entrar al taller**, la carga continúa con la apertura cuando la escena está lista, sin exigir un segundo clic. Elegir **Ver portafolio** cancela esa entrada pendiente.

Si hay error se ofrece **Reintentar** y **Ver portafolio**; con carga lenta la alternativa sigue disponible. La puerta tiene una transición breve y cancelable. Con movimiento reducido se entra directamente a la vista estable.

### B. Sala principal

El visitante entra con la mesa de trabajo como referencia. Desde ahí se ven las salas de proyectos y los destinos Tecnologías, Trayectoria y Contacto. Los objetos interactivos reciben una señal visual al apuntarlos o enfocarlos, acompañada de una acción concreta: **Ver Kliniu**, **Explorar tecnologías**, etc.

Cada destino tiene acceso equivalente desde la navegación HTML. No hay que completar tareas, desbloquear puertas o encontrar una clave para ver el trabajo.

### C. Proyectos como habitaciones

| Sala | Identidad espacial | Evidencia y contenido |
| --- | --- | --- |
| Kliniu | Showroom y banco de operaciones, acentos teal y módulos de catálogo | Capturas reales, catálogo/cotizaciones y participación documentada |
| L'ORIGINE | Galería de marca, materiales claros y exhibición de producto | Tienda y capturas publicadas, decisiones documentadas |
| 4U Studio Academy | Estudio musical con instrumentos y área de aprendizaje | Sitio y lecciones documentadas |
| Drokex | Instalación de red, directorio y conexiones entre módulos | Capturas del directorio y productos; mantener la atribución y propiedad no confirmada donde corresponde |

Al acercarse al objeto principal se puede inspeccionarlo y abrir **Ver caso**. El caso conserva texto, capturas, enlaces y atribución verificables en HTML. El 3D permanece como entorno cuando el dispositivo lo permita, pausando su animación mientras se lee. La evidencia no se renderiza exclusivamente como textura de un monitor.

**Volver al taller** devuelve al punto y orientación anteriores. Atrás/adelante del navegador y un enlace directo deben abrir el mismo contenido sin exigir el recorrido completo.

### D. Tecnologías, trayectoria y contacto

- **Tecnologías:** herramientas y módulos sobre una pared técnica. Seleccionar abre cómo se usa esa tecnología y sus proyectos relacionados, desde `PORTFOLIO_TECHNOLOGIES`.
- **Trayectoria:** archivo espacial con hitos tomados de `PORTFOLIO_CAREER`; no se fabrican fechas, cargos ni diplomas. Puede ubicarse visualmente en el mezzanine, con acceso directo equivalente.
- **Contacto:** escritorio con acciones basadas en `PUBLIC_PROFILE`; mantener solo los canales públicos autorizados. El cierre facilita contactar sin volver a recorrer salas.

El mapa es una representación navegable del taller; no un mapa de mundo abierto. Un contador de lugares visitados, si se incorpora más adelante, representará acciones reales de esa sesión y nunca métricas profesionales.

## 6. Controles propuestos

Primera versión: cámara de primera persona movida entre puntos seguros mediante clic/toque; arrastrar para mirar con límites cómodos, seleccionar objetos y usar botones para cambiar de sala. No requiere pointer lock.

| Dispositivo o preferencia | Comportamiento |
| --- | --- |
| Desktop con ratón | Clic en destinos y objetos; arrastrar para mirar; navegación visible |
| Teclado | Tab recorre destinos equivalentes; Enter activa; Escape cierra la inspección y devuelve foco |
| Móvil | Poster inicial y activación explícita; toque para ir a puntos; navegación al alcance del pulgar, sin depender de hover |
| Movimiento reducido | Cambios inmediatos de cámara o fundido discreto; sin recorridos forzados |
| Sin WebGL / fallo GPU | Portafolio HTML completo con posters de cada espacio y enlaces funcionales |

La libre circulación con WASD, colisiones y pointer lock sería una ampliación posterior si Daniel la prefiere y la prueba espacial lo justifica. No se aprobará ni implementará por inferencia. La navegación por puntos permite comprobar primero si la experiencia comunica bien los proyectos.

## 7. Arquitectura propuesta

Mantener el contenido en `apps/web/data`. Añadir unidades de responsabilidad acotada junto a la experiencia actual; los nombres son orientativos, no instrucciones para crear archivos ahora.

- **WorldShell:** un solo canvas persistente para el entorno, adaptación de calidad, pausa y recuperación de fallos.
- **WorldLoader:** manifiesto de assets esenciales/opcionales, progreso verificable, reintento y disponibilidad del primer frame.
- **WorkshopWorld:** exterior, nave central y puntos de acceso.
- **RoomRegistry:** id de sala, id de proyecto, assets, poster, punto de entrada y acciones. Diferenciar ids de ubicación y ids de contenido.
- **NavigationController:** cámara perspectiva, destinos, restricciones, cancelación de transición y captura/restauración del estado.
- **InteractionLayer:** selección de objetos y acciones equivalentes mediante HTML; una única acción compartida entre hotspot y botón.
- **ProjectOverlay:** casos existentes adaptados a lectura sobre el entorno, enlaces directos y restitución de foco. Cerrar el caso vuelve al mundo sin perder el punto anterior.
- **PortfolioFallback:** lectura completa sin WebGL. No requiere que termine un loader fallido.

Estado de experiencia: `landing → loading-core → ready → entering → exploring → inspecting/reading-case → exploring`. Fallo de carga o GPU conduce a `fallback`, con reintento explícito. Una visita directa a un caso puede entrar por HTML sin pasar por `loading-core`.

Separar estado de navegación del mundo, estado de carga y contenido seleccionado. Cancelar o sustituir una transición invalida sus callbacks tardíos; cargas opcionales no pueden sobrescribir una sala más reciente. Reutilizar las garantías existentes de continuidad sin forzar snapshots ortográficos sobre una cámara perspectiva.

La experiencia se limita al portafolio público. No cambia el dashboard privado, auth, base de datos, workers ni render pipeline.

## 8. Producción Blender y rendimiento

Construir primero un kit modular: suelo, paredes, puerta, ventanas, mesa, lámparas y letreros. La misma escena `.blend` origina los GLB y posters; evitar inventar un taller distinto en cada página.

Entregables de cada asset: fuente editable, GLB, medidas/pivote, versión, materiales compatibles, preview, licencia cuando aplique y presupuesto registrado. Objetos interactivos separados y con ids estables; el decorado puede agruparse. Preferir materiales compartidos, instancias, texturas horneadas y carga por sala.

Presupuestos iniciales propuestos, todavía sin medir ni garantizar:

| Medida | Objetivo |
| --- | --- |
| Descarga esencial para entrar | Hasta 8 MB comprimidos desktop; hasta 5 MB en perfil móvil |
| Texturas | Atlas compartidos; 1K habitual, 2K solo en piezas justificadas |
| DPR | Tope inicial 1.5 desktop y 1 móvil, ajustable según la prueba |
| Frames | Objetivo 60 fps desktop y 30 fps en el móvil real acordado |
| Escenas activas | Un canvas; sala actual y lo estrictamente visible |
| Animación | Pausar pestaña oculta y lectura de casos; render bajo demanda cuando no hay actividad |

No cargar un motor de físicas por defecto. Ajustar calidad por perfil explícito, medidas reales y preferencias; no solo por ancho de pantalla. Si un asset incumple el presupuesto, se simplifica antes de continuar con más salas. Compresión Meshopt/Draco y KTX2 se evaluarán según herramientas/versiones disponibles, sin instalar ni actualizar por este documento.

## 9. Fases propuestas y gates

Cada fase necesita luz verde explícita antes de empezar. No se autoriza la siguiente al cerrar la anterior.

### Phase 7.0 — Plan y mockups: entrega de esta solicitud

Entregar esta propuesta, una vista principal del acceso y una hoja con carga, entrada, exploración, proyecto, tecnologías y móvil. Aprobar dirección visual, modo de navegación y primer alcance. No hay código de producto, modelos nuevos ni despliegue.

### Phase 7.1 — Prueba espacial local

Después de aprobación: prototipo con geometría simple del acceso y sala central, loader real, cámara perspectiva, una puerta y un objeto que abra el caso existente de Kliniu. Clic/toque, teclado, Escape, vuelta y fallback.

**Gate:** Daniel prueba entrar y orientarse en navegador. En móvil puede entrar y abrir Kliniu. No se construyen aún las cuatro salas definitivas ni circulación libre.

### Phase 7.2 — Taller base e identidad 3D

Después de aprobación: escena maestra Blender, kit modular, materiales, puerta, iluminación compatible, GLB optimizado y poster. Sustituir la geometría del prototipo conservando interacciones.

**Gate:** revisar el taller ejecutado en navegador junto al mockup y comprobar descarga/rendimiento real. No se aprueba solo mediante un render Blender.

### Phase 7.3 — Salas de proyectos

Después de aprobación: terminar Kliniu como patrón, revisarlo y extender a L'ORIGINE, Academy y Drokex dentro del alcance autorizado. Carga diferida, inspección, lectura, enlaces y regreso consistente.

**Gate:** cuatro casos accesibles desde sala y navegación, evidencia real, atribución correcta y conservación de posición al volver. Si se autoriza únicamente Kliniu, las otras salas quedan pendientes.

### Phase 7.4 — Taller completo

Después de aprobación: tecnologías, archivo de trayectoria, contacto y mapa de destinos. Ajustar navegación móvil y lectura sobre el entorno. Circulación libre, sonido y avatar permanecen excluidos salvo nueva aprobación específica.

**Gate:** todos los destinos disponibles sin buscar objetos obligatorios, con contenido equivalente en HTML y teclado.

### Phase 7.5 — Verificación y cierre local

Después de aprobación: comprobar recorridos completos, carga lenta/errores, calidad adaptativa, movimiento reducido, responsive, accesibilidad y regresiones. Guardar mediciones y capturas reales. Commit, push y publicación se tratarán únicamente según la autorización posterior de Daniel.

## 10. Verificación exigida al implementar

Antes de probar en navegador, identificar y detener el `next dev` viejo del puerto 3000; iniciar la versión del trabajo local. Usar navegador real/Playwright, además de las comprobaciones de código correspondientes. `tsc` y `curl` no prueban este recorrido.

Viewports de referencia: 1920×1080, 1440×1000, 390×844 y 320×568. Complementar emulación con un móvil real para validar GPU, temperatura, tacto y frames; la emulación desktop no demuestra rendimiento móvil.

Criterios observables:

1. Landing disponible antes de cargar WebGL; alternativa HTML siempre alcanzable.
2. Loader representa tareas reales; no termina antes del primer frame ni bloquea por assets opcionales.
3. Entrada, selección, inspección, apertura y regreso funcionan; no hay atraviesos visibles en trayectos por puntos.
4. Se pueden cancelar transiciones y abrir otro destino sin callbacks que lleven a la sala incorrecta.
5. Todos los casos tienen enlaces directos; atrás/adelante y Escape conservan contenido y foco apropiados.
6. Teclado alcanza acciones equivalentes; no hay foco atrapado en el canvas ni objetos solo accesibles por hover.
7. Móvil no tiene solapes ni overflow horizontal a 320 px; controles no quedan debajo de safe areas.
8. Sin WebGL, GLB fallido y pérdida de contexto conservan lectura, navegación y contacto.
9. Movimiento reducido elimina desplazamientos largos; audio no se reproduce automáticamente.
10. Se registran bytes esenciales, tiempos de entrada, frames y perfil/dispositivo usado. Las metas incumplidas se indican como tales.
11. No aparecen métricas inventadas, nuevas atribuciones ni datos personales no autorizados.
12. Los casos y transiciones previos se revisan contra la evidencia de Sprint 6; dashboard privado permanece fuera del cambio.

## 11. No implementar todavía

- Mundo abierto, avatar, multijugador, misiones obligatorias, puntos, premios o cuentas.
- WASD libre, física general y pointer lock.
- Audio ambiental, ciclo día/noche y efectos avanzados de postproducción.
- Reconstruir el backend, cambiar la base de datos o actualizar el stack.
- Instalar assets/CLIs de terceros sin verificar origen y licencia.
- Provisionar servicios, cuentas, Vercel o Supabase.
- Commit, push, deploy o cambio de fase por el solo hecho de entregar este plan.

## 12. Decisiones para la revisión

Recomendación concreta: aprobar como dirección **Blender + Three.js**, taller luminoso a escala humana, primera persona con destinos por clic/toque y una primera prueba local que permita **entrar → acercarse a Kliniu → abrir caso → volver**.

Daniel puede pedir cambiar el estilo o priorizar caminar libremente antes de aprobar. Los mockups definen la intención visual; la fidelidad final se comprobará con el GLB y controles reales. La ejecución requiere el plan detallado de la fase que se autorice.
