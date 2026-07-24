# Sprint 0.7: Scene Projects

## Estado

Implementado el 2026-07-24. La migración se aplicó al proyecto Supabase y el flujo completo se
verificó con usuarios temporales eliminados al terminar la prueba.

## Objetivo

Convertir el vertical slice local en un flujo de proyecto durable: una persona puede crear una
escena, seguir editándola después, conservar versiones y solicitar un render reproducible sin
depender de `localStorage`.

Esta es la siguiente fase recomendada porque resuelve el mayor riesgo actual: el producto genera
contenido útil, pero ese contenido todavía no tiene identidad, persistencia ni trazabilidad.

## Resultado esperado

Al terminar el sprint:

- Una escena pertenece a un proyecto persistente.
- Guardar crea revisiones recuperables.
- El editor conoce si existen cambios sin guardar.
- API y Blender consumen una revisión explícita.
- El ensamblado Blender transforma correctamente todos los nodos de cada GLB.
- El usuario puede descargar el JSON, GLB y PNG asociados a la misma revisión.

La estrategia de guardado elegida es explícita: **Guardar proyecto** crea el proyecto y
**Nueva revisión** conserva cada estado posterior. `Save draft` mantiene una copia de recuperación
en `localStorage`.

## Alcance

### 1. Corregir instancias Blender

- Crear un root vacío por cada `SceneObject`.
- Importar todas las mallas del GLB como hijas de ese root.
- Aplicar posición, rotación y escala al root.
- Preservar transformaciones locales internas.
- Añadir una prueba headless con un asset compuesto.

Esta tarea es P0: evita que escritorios, sillas y otros modelos compuestos se separen al moverlos.

Estado: completado y cubierto por `pnpm blender:test`.

### 2. Modelo de datos

Entidades mínimas:

```text
SceneProject
  id
  name
  ownerId
  currentRevisionId
  createdAt
  updatedAt

SceneRevision
  id
  projectId
  revisionNumber
  sceneVersion
  sceneJson
  createdBy
  createdAt

RenderJob
  id
  revisionId
  status
  glbPath
  pngPath
  error
  createdAt
  completedAt
```

`sceneJson` se valida con `sceneSchema` al escribir y al leer. `SceneRevision` es inmutable.

Estado: completado mediante Prisma y RLS en
`prisma/migrations/20260724162000_scene_projects`.

### 3. API

Endpoints propuestos:

| Método | Ruta | Resultado |
|---|---|---|
| `POST` | `/api/scene-projects` | Crear proyecto y revisión inicial |
| `GET` | `/api/scene-projects` | Listar proyectos visibles |
| `GET` | `/api/scene-projects/:id` | Proyecto y revisión actual |
| `POST` | `/api/scene-projects/:id/revisions` | Guardar nueva revisión |
| `GET` | `/api/scene-projects/:id/revisions` | Listar historial |
| `POST` | `/api/scene-projects/:id/render-jobs` | Solicitar render de una revisión |
| `GET` | `/api/render-jobs/:id` | Consultar estado y artefactos |

No se actualizan revisiones existentes mediante `PUT`; una modificación produce otra revisión.

Estado: completado. Todas las rutas requieren un bearer token validado por Supabase.

### 4. Editor

- Reemplazar la galería de `localStorage` por proyectos del servidor.
- Mantener `localStorage` sólo como borrador de recuperación.
- Mostrar `Guardado`, `Cambios sin guardar`, `Guardando` y `Error`.
- Implementar autosave con debounce o guardado explícito; elegir uno y documentarlo.
- Abrir una revisión histórica en modo lectura.
- Crear una nueva revisión desde una versión anterior.

Estado: completado mediante guardado explícito, historial recuperable y borrador local.

### 5. Brief estructurado para IA

El generador debe recibir:

```text
occupants + style + userPrompt + planningPreset + spatialRules
```

La respuesta continúa validándose con `sceneSchema`. El fallback determinista debe ser visible en
la UI y registrarse en la revisión.

Estado: completado. La API construye el brief con capacidad, estilo, preset, área y reglas.

### 6. Render reproducible

- Un job referencia un `revisionId`, nunca el estado mutable del editor.
- Registrar versión de Blender y hash del catálogo de assets.
- Guardar GLB y PNG bajo un path estable por proyecto/revisión/job.
- Reportar errores de validación o assets ausentes sin producir artefactos parciales como éxito.

Estado: completado para desarrollo local. El worker procesa un job por ejecución:

```bash
pnpm --filter @command-center/web render:worker
```

Los artefactos se publican bajo `/renders/<job-id>/` y no se versionan en Git.

## Fuera de alcance

- Edición multiusuario en tiempo real.
- Facturación o cuotas.
- Validación legal de accesibilidad y evacuación.
- Modelado paramétrico de paredes, puertas y ventanas.
- Biblioteca de mobiliario comercial.
- Render farm distribuida.

## Orden de implementación

1. Corregir parenting del importador Blender y añadir la prueba.
2. Definir schema de persistencia y migración.
3. Implementar repositorio y API de proyectos/revisiones.
4. Conectar la galería y el guardado del editor.
5. Implementar brief estructurado de IA.
6. Crear el contrato de render jobs y un worker local.
7. Añadir pruebas E2E del flujo completo.

## Criterios de aceptación

- Cerrar y abrir el navegador no pierde un proyecto guardado.
- Dos guardados crean revisiones distintas y ambas pueden recuperarse.
- JSON inválido nunca se persiste.
- Un usuario no puede leer o renderizar proyectos ajenos.
- Un asset GLB con varias mallas conserva su forma al trasladarse, rotarse y escalarse en Blender.
- Un render siempre identifica la revisión exacta que utilizó.
- Fallar un render deja un estado `failed` con un error útil.
- El flujo crear → editar → guardar → reabrir → renderizar pasa en E2E.
- Lint, tests, build y render headless pasan en CI.

## Decisiones requeridas antes de empezar

1. **Identidad:** Supabase Auth, proveedor existente o modo single-user temporal.
2. **Persistencia:** Postgres/Supabase es la opción natural por las dependencias actuales.
3. **Artefactos:** Supabase Storage, S3 compatible o almacenamiento local sólo para desarrollo.
4. **Ejecución Blender:** worker local inicialmente o servicio aislado desde el primer sprint.

Recomendación: Supabase Auth + Postgres + Storage, con un worker Blender local desacoplado por el
contrato `RenderJob`. Así se valida el producto sin introducir todavía infraestructura distribuida.

## Métricas de salida

- Cero pérdida de proyectos guardados en pruebas.
- 100% de revisiones válidas contra `Scene` v1.
- Render de la escena de referencia reproducible en una instalación limpia.
- Tiempo de guardado p95 menor a 500 ms en desarrollo local.
- Errores de render observables y trazables por job.
