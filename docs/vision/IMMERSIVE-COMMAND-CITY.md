# Immersive Command City

## Estado

Implementado el 2026-07-24 como nueva entrada principal de Command Center.

## Concepto

Command Center deja de presentarse como una colección de dashboards. La entrada es una ciudad
tecnológica continua donde cada dominio ocupa un lugar narrativo:

1. **Core City:** hero de pantalla completa y entrada al workspace.
2. **Project Districts:** seis distritos visualmente distintos conectados al núcleo.
3. **Knowledge Infrastructure:** grafo visible como red energética del sistema.
4. **Mission Trajectory:** evolución profesional representada como órbita.
5. **Analytics Command:** observatorio derivado de Evidence Engine y Knowledge Graph.
6. **Evidence Engine:** monolito de trazabilidad y fuentes verificables.
7. **Engineer Console:** identidad, principios y acceso al perfil.

## Arquitectura

`ExperienceGate` conserva el workspace existente. La landing no reemplaza los módulos: actúa como
una capa narrativa delante de `AppShell`.

```text
HomePage
  └─ WorkspaceProvider
      └─ ExperienceGate
          ├─ ExperienceModule
          └─ AppShell
```

Una llamada a la acción selecciona el módulo correspondiente en `WorkspaceStore` y abre el
workspace sin duplicar su estado ni su implementación.

## Datos

Las métricas visibles no se escriben manualmente:

- Proyectos: `PROJECTS`.
- Decisiones, tecnologías, lecciones y capacidades: `Evidence Engine`.
- Nodos y relaciones: `KNOWLEDGE_GRAPH`.
- Ranking tecnológico: `technologyExperiences`.

La cronología editorial del recorrido no representa todavía el Mission Log oficial completo. Es
una narrativa de producto hasta reemplazar los milestones `TODO` del repositorio por eventos reales.

## Visuales

Los fondos `command-city-hero.png` y `project-archipelago.png` fueron generados como arte original
para el proyecto usando la referencia únicamente como dirección de atmósfera. No contienen texto,
logos ni controles; toda la semántica permanece en HTML.

## Responsive y accesibilidad

- Navegación fija en escritorio y menú desplegable en viewport compacto.
- Hero de primer viewport con recorte independiente para móvil.
- Distritos espaciales en escritorio y matriz legible en móvil.
- Red, misión, analytics, evidencia y perfil se reconfiguran sin overflow horizontal.
- Controles nativos, headings semánticos y navegación por anchors.
- Las animaciones se desactivan con `prefers-reduced-motion`.

## Siguiente evolución

La implementación actual crea profundidad con composición 2.5D, CSS y visuales cinematográficos.
La siguiente etapa puede convertir el desplazamiento en navegación de cámara real:

1. Escena WebGL persistente compartida por las siete estaciones.
2. Cámara guiada con entrada manual accesible y fallback estático.
3. Edificios interactivos alimentados por los dominios reales.
4. Conexiones del grafo animadas entre distritos.
5. Carga progresiva y presupuesto de rendimiento para dispositivos móviles.

La ciudad WebGL debe ser una mejora progresiva; el contenido, la navegación y los módulos deben
seguir funcionando sin GPU ni movimiento.
