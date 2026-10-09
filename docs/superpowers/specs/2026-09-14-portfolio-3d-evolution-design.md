# Portfolio 3D Evolution Design

Estado: propuesta para revisión. Esta especificación no autoriza despliegue ni avance de fase sin aprobación explícita.

## Objetivo

Elevar el portafolio público de Daniel Cantor para que el 3D no sea un bloque decorativo sino el sistema narrativo principal: proyectos como distritos, tecnologías como objetos físicos y trayectoria como ruta de construcción. La página debe comunicar trabajo real, criterio técnico y calidad de producto desde la primera pantalla.

## Contexto Actual

El proyecto ya tiene una experiencia pública en `apps/web/modules/experience`, una maqueta 3D cargada con React Three Fiber, escenas procedurales por distrito, catálogo de tecnologías, capturas reales de proyectos y documentación previa del "Taller de Daniel". La sensación actual todavía depende demasiado de texto, listas y paneles; el 3D aparece como una gran pieza central, pero no gobierna todas las secciones.

## Dirección Visual

La dirección recomendada es "control room / taller arquitectónico": una mesa 3D clara, táctil y editorial donde cada distrito explica un producto. La estética conserva papel, piedra, tinta y verde, pero sube la presencia de volumen, sombras, capas, cámara y objetos técnicos.

Principios:

- El primer viewport debe tener una señal 3D dominante.
- Cada pieza 3D debe explicar algo del trabajo, no decorar.
- La interfaz HTML debe seguir siendo la ruta principal de lectura y accesibilidad.
- El canvas debe sentirse integrado con copy, navegación y casos, no como un iframe aislado.
- No usar emojis literales en UI, `alert()` ni `<select>` nativo.
- No inventar métricas, porcentajes, seniority ni datos de negocio.

## Mockups

Mockup visual revisable: `/Users/creativo/.codex/visualizations/2026/09/14/01a0a036-a47b-7471-8d09-b3f09c2b5bb7/portfolio-3d-mockups.html`.

Los mockups cubren:

- Home con maqueta 3D dominante y selector de proyectos.
- Caso de proyecto con distrito 3D explicando arquitectura.
- Biblioteca técnica con tecnologías en órbita 3D.
- Trayectoria como ruta espacial.
- Mobile con poster 3D, activación explícita y contenido completo sin WebGL.

## Experiencia Objetivo

### Home

La home abre con Daniel Cantor visible, navegación mínima y una maqueta 3D dominante. El texto se reduce a promesa clara y acciones. La selección de un proyecto actualiza el resumen inferior, ilumina el distrito y prepara el acceso al caso.

### Proyecto

La vista de proyecto deja de ser captura + resumen. Cada caso tiene un "distrito" con módulos que representan partes del producto: frontend, operaciones, datos, integraciones y automatización cuando aplique. Las capturas reales se mantienen como evidencia.

### Tecnologías

La biblioteca técnica se presenta como un conjunto de objetos 3D alrededor del centro de la mesa. Seleccionar una tecnología muestra:

- cómo la usa Daniel;
- en qué proyectos aparece;
- por qué fue relevante;
- qué proyectos se destacan en la maqueta.

### Trayectoria

La trayectoria se presenta como una ruta espacial conectada a formación, experiencia e idiomas. Debe parecer parte del taller, no una sección de CV pegada al final.

### Contacto

El contacto mantiene canales públicos actuales y tono directo. No publicar teléfono ni correo privado sin autorización explícita.

## Arquitectura Técnica

Mantener `ExperienceModule` como orquestador de navegación pública. Extraer unidades pequeñas donde la escena crezca:

- `PortfolioHero3D`: layout del primer viewport.
- `PortfolioSceneShell`: contenedor de canvas, fallback, toolbar y estado de carga.
- `CityNavigator`: escena R3F principal con cámara por modo.
- `ProjectDistrictFocus`: overlays y geometría de enfoque por proyecto.
- `TechnologyOrbit`: biblioteca 3D central.
- `JourneyPath`: representación visual de trayectoria en HTML/CSS primero; 3D ligero si no compromete rendimiento.

La lógica de datos debe seguir en `apps/web/data`. La escena consume ids, nombres, colores y relaciones; no debe contener contenido editorial duplicado salvo labels visuales mínimos.

## Estados

- `overview`: maqueta general.
- `project`: proyecto seleccionado con cámara enfocada.
- `project-detail`: distrito ampliado con módulos visibles.
- `technologies`: biblioteca técnica activa.
- `journey`: trayectoria visible sin montar un segundo canvas pesado.
- `fallback`: contenido HTML completo sin WebGL.

## Performance

- Una escena WebGL principal activa por viewport.
- Carga dinámica del canvas con `ssr: false`.
- `frameloop="demand"` salvo interacciones concretas.
- DPR limitado a `[1, 1.5]`.
- Texturas y GLB existentes reutilizados.
- Mobile inicia con poster y activa 3D solo por acción explícita.
- Respetar `prefers-reduced-motion`.

## Accesibilidad

- Todo proyecto y tecnología debe poder abrirse sin usar canvas.
- Foco visible en navegación, tabs y acciones.
- Labels HTML para piezas principales.
- Los cambios de selección actualizan contenido HTML legible.
- La reducción de movimiento desactiva transiciones largas.
- A 320 px no debe existir overflow horizontal.

## Fases

### Fase 1.1: Hero 3D y navegación principal

Rediseñar el primer viewport para que la maqueta sea dominante, compactar copy y mejorar selector de proyectos. No cambiar todavía todos los casos internos.

### Fase 1.2: Distrito de proyecto

Ampliar la vista de proyecto para mostrar módulos de arquitectura y evidencia real. Empezar con Kliniu como patrón y repetir solo cuando el patrón esté aprobado.

### Fase 1.3: Biblioteca técnica 3D

Convertir el modo tecnologías en una biblioteca visual con relación tecnología-proyecto clara. Mantener búsqueda, filtros y estado vacío.

### Fase 1.4: Trayectoria espacial

Rehacer trayectoria como ruta visual y conectarla con experiencia, formación e idiomas documentados.

### Fase 1.5: Pulido, verificación y cierre

Auditar responsive, fallback, rendimiento, accesibilidad, navegación y capturas. No cerrar sin Playwright en navegador real.

## Criterios de Aceptación

- El primer viewport se entiende como experiencia 3D, no como página con un widget.
- Cada proyecto público puede seleccionarse desde HTML y desde la escena.
- Las tecnologías relacionadas iluminan proyectos reales.
- Las capturas reales siguen visibles.
- El contenido funciona sin WebGL.
- Mobile a 320 px y 390 px no tiene solapes ni scroll horizontal.
- No hay datos inventados.
- Playwright verifica home, proyecto, tecnología, trayectoria, fallback y navegación.

## Fuera de Alcance

- Despliegue en Vercel.
- Nuevas cuentas o servicios.
- Rediseñar el dashboard privado.
- Reescribir el sistema completo de `scene-viewer`.
- Publicar datos personales no aprobados.
