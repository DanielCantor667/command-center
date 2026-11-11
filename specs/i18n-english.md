# Spec: Versión en inglés del portafolio

> Plan 2026-11-11. Cada fase espera luz verde de Daniel. Nada de código antes de aprobar este spec.

## Objetivo

Que un reclutador o cliente que no lee español pueda recorrer el taller, leer los cuatro casos públicos y contactar a
Daniel en inglés, sin perder nada de lo que hoy existe en español.

## Decisiones (Daniel, 2026-11-11)

1. **Idioma por defecto: español.** `/` sigue siendo español; el inglés vive en `/en`. Sin redirección por
   `Accept-Language`: un botón ES / EN cambia de idioma.
2. **Alcance de contenido: los 4 casos públicos** (Kliniu, L'ORIGINE, 4U Studio Academy, Drokex), más perfil,
   trayectoria y la interfaz completa.
3. **Revisión: Daniel revisa todo al final**, antes del commit que publica `/en`.

## Medición inicial

| Qué | Tamaño aproximado |
| --- | --- |
| Cadenas de interfaz en español | ~370 en ~36 archivos (`workshop-game`, `projects`, `experience`, `shell`, `app`) |
| Contenido de casos públicos | ~980 líneas en `data/projects/{kliniu,lorigine,academy,drokex}.ts` |
| Archivos que importan `PROJECTS` directo | 26 |
| i18n existente | Ninguna; solo el CV del PC tiene ES / EN (`public/cv/`) |
| Texto dentro del canvas | `CanvasTexture` con nombres de proyecto y de tecnología (iguales en ambos idiomas); revisar texturas horneadas |

## Arquitectura

- **Rutas:** dos grupos con su propio root layout, para que `<html lang>` sea correcto sin JavaScript:
  `app/(es)/…` sirve `/` y `/creditos`; `app/(en)/en/…` sirve `/en` y `/en/creditos`. Los parámetros actuales
  (`?project=`, `?view=portfolio`, `?workshop=`, `#contacto`) funcionan igual bajo `/en`.
- **Interfaz:** diccionarios tipados en `apps/web/i18n/{es,en}.ts`. `en` se declara con el tipo de `es`: si falta una
  clave, **no compila** (sin texto de respaldo silencioso). Un `LocaleProvider` en cada layout entrega el diccionario a
  los componentes cliente; los server components lo importan directo.
- **Contenido:** `data/projects` sigue siendo la fuente en español. Las traducciones viven al lado,
  `data/projects/en/<id>.ts`, solo con los campos de texto (tagline, summary, description, features, challenges,
  decisions, lessons, role). `localizeProject(project, locale)` las combina. Un único acceso, `useProjects()` /
  `projectsFor(locale)`, reemplaza los 26 imports directos de `PROJECTS`.
- **Solo traducción:** las versiones en inglés traducen lo que existe. No se agregan métricas, resultados ni datos que
  no estén en español (regla de Daniel: nunca inventar datos).
- **Selector ES / EN:** en el landing, en el caso, en el portafolio clásico y en créditos. Cambia de ruta conservando
  los parámetros (`/?project=kliniu` ↔ `/en?project=kliniu`). Es un enlace real (`<a href>`), no un `<select>` nativo.
- **SEO:** metadatos por idioma, `alternates.languages` con `hreflang` es / en y `x-default` = es, `og:locale`
  `es_CO` / `en_US`, la misma imagen OG (no tiene texto), sitemap con las 4 URLs, JSON-LD en ambos.
- **PC del taller:** en `/en` el CV abre en EN por defecto. La terminal responde en el idioma de la página: palabras
  clave en ambos idiomas y respuestas desde los datos localizados. Los comandos (`ls`, `open`, `cv`…) no cambian.

## Fases

| Fase | Alcance | Criterio de aceptación |
| --- | --- | --- |
| **I.0** Auditoría | Inventario de cadenas por archivo y de texto en texturas horneadas o `CanvasTexture`. Sin código. | Lista revisada por Daniel; se confirma si alguna textura necesita versión en inglés. |
| **I.1** Infraestructura | Grupos de rutas, `LocaleProvider`, tipos de diccionario, `projectsFor(locale)` y migración de los 26 imports (sin traducir todavía), selector ES / EN, `hreflang`, sitemap. | `/` idéntico a hoy (tests y capturas); `/en` carga con `<html lang="en">`; el selector conserva parámetros; build, lint y tests verdes. |
| **I.2** Interfaz | Todas las cadenas de la interfaz: taller, casos (estructura), portafolio clásico, créditos, escritorio del PC, mensajes de error y de carga, `aria-label`. | Ninguna cadena en español en `/en` (test que recorre el DOM de `/en` buscando palabras en español frecuentes); accesibilidad sin cambios. |
| **I.3** Contenido | Los 4 casos, perfil (`availability`), trayectoria y metadatos en inglés. | Test: cada caso público tiene todos sus campos de texto en inglés. |
| **I.4** Terminal | Palabras clave en inglés para `ask()`, respuestas y `help` en inglés. | Tests equivalentes a los actuales en inglés ("what stack did you use in Kliniu?", "have you used Prisma?"). |
| **I.5** Revisión y publicación | Daniel revisa todo `/en`; correcciones; verificación en Playwright (escritorio y móvil) y en su iPhone. | Visto bueno de Daniel; commit y push. |

Orden: I.0 → I.1 → I.2 → I.3 → I.4 → I.5.

## Fuera de alcance

Traducir Vevi, Intranet ESS y Command Center; otros idiomas; detección automática de idioma; traducir las capturas de
los sitios (son los sitios reales en español); un CMS de traducciones.

## Bases (`~/.claude/BASES.md`)

- **2 Requerimientos:** alcance y fuera de alcance arriba.
- **3 Dominio:** el español es la fuente de verdad; el inglés solo traduce. Un caso no se publica en `/en` sin todos
  sus campos traducidos.
- **4 Arquitectura:** un único punto de acceso al contenido por idioma; los componentes no saben de qué archivo viene.
- **7 Frontend / UX:** selector visible y accesible, `lang` correcto para lectores de pantalla, sin saltos de layout
  al cambiar de idioma.
- **10 Seguridad:** sin cambios (sitio estático, sin entrada de usuario nueva).
- **11 Testing:** compilación como red para el diccionario, tests de completitud del contenido, test de cadenas en
  español dentro de `/en`, Playwright en ambos idiomas.
- **12 Errores:** sin respaldo silencioso al español; un hueco es un error de build o de test, no un texto mezclado.
- **13 Performance:** el diccionario y el contenido en inglés solo se cargan en `/en`; el JS inicial de `/` no crece más
  de 5 kB.
- **15 Deploy:** rutas nuevas en el sitemap; LinkedIn guarda en caché la vista previa (refrescar con Post Inspector).

## Preguntas abiertas (con recomendación)

1. **Los 3 proyectos no públicos en `/en`** (aparecen en la terminal y en listados internos): recomiendo **ocultarlos
   en `/en`** para no mezclar idiomas.
2. **Partes en inglés dentro de los casos en español** (retos de L'ORIGINE, rol de Intranet ESS): recomiendo
   traducirlas al español en I.3, para que `/` quede todo en español.

## I.0 Auditoría (2026-11-11)

Método: se siguen los imports (incluidos los `dynamic()`) desde `app/page.tsx`, `app/creditos/page.tsx` y
`app/layout.tsx` (267 archivos alcanzables) y se cuentan los literales y textos JSX en español. Es una estimación por
lo bajo: no detecta frases cortas sin tildes ni palabras frecuentes.

| Superficie | Cadenas | Palabras aprox. | Archivos principales |
| --- | --- | --- | --- |
| Taller (landing, navegación, lector, mapa, inspecciones) | 93 | 490 | `workshop-game/component.tsx`, `projects-inspection.tsx`, `world-map.tsx`, `lab-content.tsx`, `workshop-reader.tsx`, `stations.ts`, `experience-gate` |
| PC del taller | 68 | 710 | `pc/shell.ts`, `pc/pc-apps.tsx`, `pc/pc-desktop.tsx` (menús tipo macOS, apps, notas) |
| Casos: texto editorial y estructura | 242 | 1.170 | `portfolio-case/{kliniu,lorigine,academy,drokex}-case.tsx`, `component.tsx`, escenas 3D de cada caso (`*-sequence`, `*-gallery`, `*-studio`, `*-network`) |
| Portafolio clásico | 121 | 580 | `modules/experience/*`, `modules/scene-viewer/*` |
| Créditos | 28 | 165 | `app/creditos/page.tsx` |
| Perfil, trayectoria, tecnologías | 47 | 380 | `data/public-profile.ts`, `portfolio-career.ts`, `portfolio-technologies.ts` (etiquetas de categoría) |
| Workspace interno | 69 | 390 | `modules/{dashboard,analytics,capabilities,mission,lab,profile,communication}`, `shell/{top-bar,sidebar,status-bar}`, `data/dashboard.ts` |

Datos de los 4 casos públicos (`data/projects/*.ts`):

| Caso | Texto total | En español | En inglés |
| --- | --- | --- | --- |
| Kliniu | ~1.840 palabras | ~80 (tagline, summary, textos de imágenes) | ~1.750 (funcionalidades, retos, decisiones, rol…) |
| L'ORIGINE | ~1.780 | ~270 | ~1.510 |
| 4U Studio Academy | ~2.130 | ~530 | ~1.600 |
| Drokex | ~210 | ~210 | — |

### Hallazgos que corrigen el spec

1. **El texto editorial de los casos no está en `data/projects`, sino escrito en los componentes** (`*-case.tsx` y sus
   escenas). I.3 lo extrae a contenido por caso en ES / EN; la estructura de `data/projects` sola no basta.
2. **`data/projects` ya está mayormente en inglés** en Kliniu, L'ORIGINE y Academy (todo menos tagline, summary y los
   textos de imágenes). Para `/en` ese inglés se reutiliza tal cual; el trabajo grueso de I.3 es el inverso:
   **traducir esos campos al español** para `/` (pregunta abierta 2, aprobada). Drokex está todo en español.
3. **Ninguna textura horneada necesita versión en inglés.** Las etiquetas de categoría del tablero se dibujan en vivo
   desde los datos (`labelTexture(category.label)`), la pizarra y las pantallas son HTML. Las PNG con texto de
   `blender/generate_lab_textures.py` solo las usa el prototipo de Blender.
4. **El workspace interno es alcanzable por el público**: el pie del portafolio clásico tiene "Ver todos los
   proyectos" y "Laboratorio 3D", que abren `AppShell` (dashboard, análisis, capacidades, bitácora, laboratorio) con
   los 7 proyectos. No estaba en el alcance aprobado.
5. Las descripciones accesibles de las escenas 3D de cada caso ("Flechas para girar; Inicio para restablecer") y los
   `aria-label` cuentan como interfaz y entran en I.2.

### Pregunta nueva (con recomendación)

3. **El workspace interno en `/en`:** recomiendo **ocultar en `/en` los dos botones del pie** del portafolio clásico
   que llevan a él, igual que los 3 proyectos no públicos. Traducirlo agrega ~390 palabras y 23 archivos de una
   superficie que casi nadie visita.

## I.1 (2026-11-11, sin commit)

- Rutas: `app/(es)` y `app/(en)/en`, cada grupo con su root layout (`RootDocument` en `app/_root/`); metadatos por
  idioma en `app/_root/metadata.ts` (sin `next/font`, para que los tests de páginas no lo arrastren). `/creditos` y
  `/en/creditos` comparten `app/_root/credits.tsx`.
- `i18n/`: `config.ts` (`localePath`, `switchLocaleHref`), `es.ts` / `en.ts` (tipados; hoy solo selector y metadatos),
  `locale-provider.tsx`, `language-switch.tsx` (`<a href hreflang>` que conserva query y hash al hacer clic).
- Selector en las cabeceras del taller, de los 4 casos y del caso estándar, del portafolio clásico y de créditos.
- En `/en` se ocultan los dos botones del pie que llevan al workspace interno. Los enlaces a créditos y "Volver al
  taller" respetan el idioma.
- **Cambio de orden frente al plan:** la migración de los 26 imports de `PROJECTS` pasa a I.3 (con el contenido) y la
  terminal a I.4; en I.1 solo habría sido un refactor sin efecto que luego se repetía.
- Verificado (build de producción, Chrome): `/` idéntico salvo el botón EN (≤ 0,24 % de píxeles, solo en la
  cabecera) en landing, caso, portafolio y créditos, escritorio y móvil; `/en` con `lang="en"`, `og:locale` `en_US`,
  `hreflang` es / en / x-default, canonical propio; el selector lleva `/?project=kliniu#top` a
  `/en?project=kliniu#top`; sitemap con 4 URLs; 404 correcto. JS inicial de `/`: 201 → 202 kB.

## I.2 (2026-11-11, sin commit)

- Diccionarios `es` / `en` con secciones `workshop`, `pc`, `portfolio`, `technologies` y `credits`; `fill()` para
  variables (`{name}`): los diccionarios cruzan de servidor a cliente y no pueden llevar funciones.
- Localizados: landing, carga, recorrido, modo libre, inspecciones, lector, mapa, monitor y pizarra del taller;
  escritorio del PC (menús, apps, bloqueo, ajustes, CV que abre en el idioma de la página, fecha con `en-US`);
  portafolio clásico y su maqueta 3D; explorador de tecnologías; créditos.
- `STATIONS` ya no guarda textos (pasaron a `workshop.stations`); `placeNames()` reúne los nombres de lugares.
- `DomScreen` y el `Html` de drei montan en un root de React aparte, sin contexto: el texto se resuelve en el
  componente padre (dentro del `Canvas`, que sí recibe el contexto).
- `LocaleProvider` ya no empaqueta un diccionario por defecto: cada página trae solo el suyo (JS inicial de `/` sigue
  en 202 kB). Los tests usan español mediante `setLocaleFallback` en `vitest.setup.ts`.
- **Ajustes de alcance:** el caso estándar (`StandardPortfolioCase`) solo lo usan Vevi, Intranet ESS y Command
  Center, ocultos en `/en`: queda en español y sin selector. Las descripciones accesibles de las escenas 3D de cada
  caso y `kliniu-tour` (contenido de Kliniu) pasan a I.3 con el resto de cada caso. `scene-viewer` solo se usa desde
  el workspace interno (oculto en `/en`): no se traduce.
- Tests nuevos: paridad de diccionarios (mismas claves y largos, sin vacíos, mismas variables) y landing + mapa en
  inglés sin palabras frecuentes del español.
- Verificado (build de producción, Chrome): `/` idéntico a I.1 (0,00–0,01 %); en `/en` solo queda en español el
  contenido de I.3 (resúmenes de proyectos, trayectoria, categorías y descripciones de tecnologías) y la bio real de
  GitHub, que es dato público de Daniel. "Leer en español" es la etiqueta del selector, en español a propósito.

## I.3a (2026-11-11, sin commit)

**División de I.3:** en las superficies públicas, los campos técnicos en inglés de Kliniu, L'ORIGINE y Academy
(funcionalidades, retos, decisiones, lecciones; ~4.900 palabras) solo se ven en la terminal del PC. Su traducción al
español pasa a **I.3b, junto con I.4** (la terminal). I.3a cubre todo lo demás.

- **Contenido por idioma:** `data/content/content.tsx` (`useContent()`, `ContentProvider`, `localizeContent`). El
  español se lee de las fuentes de siempre; el inglés (`data/content/en/`) lo inyecta solo el layout `(en)`, así no
  viaja en los bundles de `/` (JS inicial sigue en 202 kB). En `/en` solo existen los 4 casos publicados; las
  tecnologías apuntan solo a ellos.
- **`ProjectCopy` / `localizeProject`:** todos los campos de texto de cada caso en inglés, en el mismo orden que la
  fuente; si cambia la cantidad de entradas, lanza error. El inglés que ya existía se copió por script desde los datos
  (no a mano); se tradujo lo que estaba en español (tagline, summary, textos de imágenes, descripción de L'ORIGINE,
  una lección de Kliniu y Drokex completo). Más trayectoria, disponibilidad, 37 descripciones de tecnologías, sus
  categorías y dos nombres ("MVC with PHP", "REST APIs").
- **Migrados a `useContent()`:** `experience-gate`, taller (landing, inspecciones, mapa, lector, pizarra, tablero de
  tecnologías), apps del PC, portafolio clásico, explorador de tecnologías y listas de tecnologías de los casos.
  `filterTechnologies` acepta la lista localizada como tercer parámetro opcional.
- **Casos:** cada caso tiene `portfolio-case/copy/<caso>.ts` con pares `[español, inglés]` (más `copy/common.ts` para
  los textos compartidos); `useCaseCopy()` elige el idioma. Generado por script a partir del JSX (157 textos únicos) y
  traducido a mano. Los arrays de vistas/etapas usan tuplas en su lugar con `usePick()` (`i18n/use-pick.ts`); también
  las etiquetas de teclado de las escenas 3D y el recorrido de Kliniu del portafolio clásico.
- **Pronombres:** ningún texto en inglés asume pronombres para Daniel (reescrito: "Daniel’s CV describes…").
- **Tests nuevos:** contenido en inglés (solo los 4 casos, en paso con la fuente, sin palabras frecuentes del
  español, cobertura de tecnologías/categorías/trayectoria).
- **Verificado (build de producción, Chrome):** `/` idéntico a I.2 (0,00 % en las 6 vistas); en `/en`, recorrido
  completo + los 4 casos sin texto en español salvo la bio real de GitHub; casos revisados a ojo en escritorio y móvil.
- **Conocido:** en `/en` la galería 3D sigue mostrando las pantallas de Vevi, Intranet ESS y Command Center (solo
  nombres propios); hacer clic en ellas no abre nada, porque esos casos no existen en inglés.

## Bug de las pantallas 3D (2026-11-11, sin commit)

`ProjectWall` solo dibuja las pantallas de los casos que existen en el idioma de la página: en `/en` las de Vevi,
Intranet ESS y Command Center ya no se dibujan ni son clicables (11 pantallas DOM en `/`, 8 en `/en`).

## I.3b (2026-11-11, sin commit)

Los campos técnicos que estaban en inglés en la fuente (`data/projects/{kliniu,lorigine,academy}.ts`: descripción de
Kliniu y Academy, funcionalidades, retos, decisiones, lecciones y responsabilidades; 286 textos, ~5.100 palabras) se
tradujeron al español en la misma fuente, reemplazando cada literal en orden con un script que falla si no lo
encuentra. El inglés original ya vivía en `data/content/en/`. Nombres propios, rutas de código y enums quedan igual.
Test nuevo: la fuente en español de los casos publicados no contiene frases en inglés. Se actualizó el título que
busca `graph-query.test.ts` (decisión de Academy, ahora en español).

## I.4 (2026-11-11, sin commit)

- `createShell(datos, textos)` en `pc/shell.ts` arma `run`, `complete`, `ask` e `isCommand` para un idioma;
  `useShell()` los da en el idioma de la página. Las exportaciones en español se mantienen (tests y callers sin React).
- Textos de la terminal en `pc.shell` de cada diccionario: ayuda, errores, easter eggs, respuestas y las palabras
  clave que reconoce cada idioma (estas listas quedan fuera de la paridad de largos del test).
- En inglés los archivos virtuales son `projects/`, `career.txt` y `contact.txt`; las notas del PC leen el archivo de
  trayectoria del idioma; las fechas usan `en-US`; solo existen los 4 casos publicados.
- Tests nuevos: terminal en inglés (archivos, casos, preguntas por proyecto, tecnologías, saludo y respaldo).
- Verificado en Chrome: la terminal responde en inglés en `/en` y en español en `/`, con retos traducidos en cada uno.
  `/` sigue idéntico (0,00 % en las 6 vistas); en `/en` solo queda en español la bio real de GitHub. JS inicial de
  `/`: 204 kB (+3 kB frente a los 201 kB previos a i18n; límite: +5 kB).

Siguiente: **I.5**, revisión completa de Daniel (copias de casos en `portfolio-case/copy/`, `data/content/en/`,
diccionarios `i18n/en.ts` y las traducciones al español de `data/projects/`).
