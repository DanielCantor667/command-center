# Sistema de oficinas 3D

## Propósito

El sistema convierte una necesidad de negocio —por ejemplo, “oficina tecnológica para 24
personas”— en una escena 3D editable, validable y exportable. La intención actual es construir
un flujo de diseño conceptual: ayuda a explorar distribuciones, capacidad, estilo y mobiliario.
No produce planos constructivos ni certifica cumplimiento normativo.

## Estado del producto

Estado: **vertical slice funcional en desarrollo**.

El flujo completo ya existe dentro del repositorio:

1. El usuario define personas, estilo y una instrucción opcional en **3D Office Lab**.
2. La API selecciona el planner determinista o el generador con IA.
3. La escena se valida contra un contrato compartido.
4. El editor carga assets GLB, permite modificar la escena y calcula advertencias.
5. La escena puede guardarse como un proyecto versionado en Supabase o intercambiarse como JSON.
6. Un render job procesa una revisión exacta con Blender, exporta una escena ensamblada y
   produce un PNG.

Este estado es apto para desarrollo, demostración y validación del concepto. Todavía no es una
herramienta multiusuario ni un sistema de diseño arquitectónico de producción.

## Arquitectura

```text
Workplace Design System
  conocimiento de dominio, estilos, módulos y reglas
                    │
                    ▼
Scene Planner ───────────── Scene Generator + proveedor de IA
  plan determinista              plan opcional por prompt
                    │
                    ▼
              Scene Schema v1
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
     Scene Builder       Blender pipeline
          │                   │
          ▼                   ▼
  React Three Fiber       GLB + PNG
  editor y visor
```

La dirección de dependencias es deliberada:

- El conocimiento arquitectónico no conoce la UI ni Blender.
- Planner y generador producen el mismo tipo `Scene`.
- Web y Blender consumen el mismo catálogo ubicado en `apps/web/public/models`.
- El schema es el límite de confianza para API, importación, persistencia y render.

## Componentes y responsabilidades

| Componente | Ubicación | Responsabilidad |
|---|---|---|
| Workplace Design System | `packages/workplace-design-system` | Módulos, relaciones, estilos, materiales, presets y reglas espaciales |
| Scene Schema y catálogo | `packages/ai-renderer` | Contrato `Scene` v1, IDs permitidos y metadatos de assets |
| Scene Planner | `packages/scene-planner` | Convierte capacidad y estilo en una escena determinista |
| Scene Generator | `packages/scene-generator` | Convierte un prompt en una escena mediante un cliente de IA |
| Scene Builder | `packages/scene-builder` | Resuelve los objetos y metadatos que consume el visor |
| API de escenas | `apps/web/app/api/scenes/route.ts` | Valida capacidad y elige planner o IA |
| 3D Office Lab | `apps/web/modules/lab` | Formulario y orquestación del flujo de generación |
| Scene Viewer | `apps/web/modules/scene-viewer` | Canvas, selección, edición, galería y readiness |
| Catálogo GLB | `apps/web/public/models` | Doce modelos compartidos por la web y Blender |
| Pipeline Blender | `blender` | Validación, importación, ensamblado, exportación y render |

## Contrato de escena

El schema actual tiene versión literal `1`:

```json
{
  "version": 1,
  "id": "office-24-tech_startup",
  "metadata": {
    "name": "Tech Startup · 24 people",
    "createdAt": "opcional"
  },
  "objects": [
    {
      "id": "desk-1",
      "asset": "desk",
      "transform": {
        "position": { "x": 0, "y": 0, "z": 0 },
        "rotation": { "x": 0, "y": 0, "z": 0 },
        "scale": 1
      },
      "properties": {}
    }
  ]
}
```

Principios del contrato:

- Cada objeto tiene un `id` único dentro de la escena.
- `asset` debe pertenecer al catálogo cerrado de doce IDs.
- Las transformaciones usan posición y rotación tridimensionales, más escala uniforme.
- Los consumidores deben ejecutar `sceneSchema.parse` antes de confiar en JSON externo.
- Una futura modificación incompatible requiere `Scene` v2 y una migración explícita.

## Catálogo de assets

El catálogo v1 contiene:

| Categoría | Assets |
|---|---|
| Espacios | `office`, `meeting_room`, `warehouse`, `factory` |
| Oficina | `desk`, `chair`, `computer`, `reception` |
| Soporte | `rack` |
| Personas y naturaleza | `employee`, `tree` |
| Logística | `truck` |

Los modelos actuales son low-poly y se generan desde primitivas Blender. Son suficientes para
probar escala, carga, edición y render; no son todavía una biblioteca visual final.

Regeneración:

```bash
pnpm blender:assets
```

Fuente: `blender/generate_asset_library.py`.

Destino único: `apps/web/public/models`.

## Generación de escenas

### Planner determinista

Entrada:

- `occupants`: entero positivo.
- `style`: uno de los estilos del Workplace Design System.
- `id` y `name`: opcionales.

Salida:

- `scene`: escena v1 validada.
- `presetId`: tramo de planificación seleccionado.
- `style`: estilo efectivo.
- `estimatedAreaSqm`: área rectangular aproximada.

Reglas aplicadas actualmente:

- Un escritorio y una silla por persona.
- Un computador por cada dos puestos.
- Una sala por cada doce personas.
- Phone booths aproximados mediante `rack` a partir de once personas.
- Recepción, vegetación y perímetro básico.
- Cafetería y servidor para presets que los recomiendan.

La colocación actual usa una cuadrícula heurística. No resuelve colisiones, recorridos, puertas,
egress ni optimización geométrica.

### Generación por IA

`POST /api/scenes` usa IA únicamente cuando:

- el request contiene `prompt`; y
- existe `ANTHROPIC_API_KEY`.

En cualquier otro caso usa el planner determinista. Si la llamada desde el Lab falla, el cliente
también vuelve al planner.

Ejemplo:

```bash
curl -X POST http://localhost:3000/api/scenes \
  -H 'content-type: application/json' \
  --data '{"occupants":24,"style":"scandinavian","prompt":"recepción cálida para clientes"}'
```

Limitación actual: la rama IA recibe el prompt, pero no incorpora formalmente `occupants` y
`style` en un brief estructurado. Esto debe corregirse antes de comparar planner e IA.

## Editor web

Operaciones implementadas:

- Orbitar la cámara y seleccionar objetos.
- Arrastrar con snap de 0.5 m.
- Rotar y escalar.
- Duplicar y eliminar.
- Agregar cualquiera de los assets del catálogo.
- Deshacer y rehacer.
- Importar y exportar JSON validado.
- Guardar, abrir y eliminar escenas locales.

El estado del editor vive en una store Zustand creada por instancia. Cada mutación conserva una
copia anterior para `undo` y limpia el historial futuro.

### Persistencia actual

La galería usa Supabase Auth y las tablas `scene_projects`, `scene_revisions` y `render_jobs`.
Cada guardado posterior crea una revisión inmutable. Las consultas de servidor filtran por
`ownerId` y las tablas tienen RLS para acceso autenticado directo.

`localStorage` permanece únicamente como borrador de recuperación:

- Índice: `command-center:scene-index`.
- Escena: `command-center:scene:<scene-id>`.

### Readiness

El panel actual emite advertencias cuando:

- Falta el perímetro de oficina.
- Falta recepción.
- Hay menos sillas que escritorios.
- Hay menos salas que las recomendadas.
- Existen objetos fuera del perímetro aproximado.

Estas reglas ayudan a detectar errores evidentes. No equivalen a una validación normativa.

## Pipeline Blender

Comandos:

```bash
pnpm blender:validate
pnpm blender:render
```

`blender:validate` valida el JSON de prueba y confirma que cada asset referenciado exista.

`blender:render`:

1. Abre `blender/templates/base.blend`.
2. Lee `blender/scenes/starter-office.json`.
3. Importa los GLB desde `apps/web/public/models`.
4. Exporta `blender/output/starter-office.glb`.
5. Renderiza `blender/output/starter-office.png`.

Blender se resuelve desde `BLENDER_BIN`, el `PATH` o la ubicación estándar de macOS.

### Instancias compuestas

Cada `SceneObject` crea un root vacío. Todas las mallas superiores importadas desde su GLB quedan
parentadas bajo ese root preservando sus matrices locales; posición, rotación y escala se aplican
a la instancia completa. `pnpm blender:test` cubre esta regresión con un escritorio de cinco
mallas.

### Render jobs

El endpoint de proyectos crea jobs en estado `queued`. El worker local reclama un job de forma
atómica, lo cambia a `processing` y finaliza en `completed` o `failed`:

```bash
pnpm --filter @command-center/web render:worker
```

Los GLB y PNG generados quedan en `apps/web/public/renders/<job-id>/`.

## Verificación

Suite utilizada:

```bash
pnpm lint
pnpm test
pnpm build
pnpm blender:validate
pnpm blender:render
git diff --check
```

Último estado verificado:

- Lint global: correcto.
- Tests globales: correctos.
- Build global: correcto.
- Doce GLB importables por Blender.
- Escena JSON de prueba válida.
- Exportación GLB y render PNG producidos.
- Migración Prisma aplicada a Supabase.
- Flujo Auth → proyecto → revisión → render job → lectura → eliminación verificado.
- Worker Blender verificado con artefactos reales y limpieza del usuario temporal.

JSDOM imprime avisos conocidos por `HTMLCanvasElement.getContext` en pruebas de accesibilidad y
Three.js informa múltiples instancias durante algunos tests. Las suites terminan correctamente,
pero ambos avisos deben limpiarse para mejorar la señal del CI.

## Límites de producto

No implementado todavía:

- Organizaciones, equipos y roles más allá de propietario.
- Autosave y edición concurrente.
- Colisiones, circulación y optimización espacial real.
- Puertas, ventanas, muros editables y dimensiones de recinto.
- Validación reglamentaria por país o ciudad.
- Thumbnails y biblioteca visual de calidad final.
- Materiales aplicados desde los estilos de workplace.
- Worker persistente, cancelación y almacenamiento de resultados fuera del filesystem local.
- Costos, inventario de mobiliario o cantidades comerciales.
- Colaboración, comentarios o enlaces compartidos.

## Documentos relacionados

- Visión de dominio: `docs/vision/WORKPLACE_DESIGN_SYSTEM.md`
- Guía operativa: `docs/engineering/3d-office-pipeline.md`
- Próxima fase: `docs/04-sprints/SPRINT-0.7-SCENE-PROJECTS.md`
- Contrato original: `docs/superpowers/specs/2026-07-10-scene-schema-design.md`
- Registro de cambios: `memory/changelog.md`
