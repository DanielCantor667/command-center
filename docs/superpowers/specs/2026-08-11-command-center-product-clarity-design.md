# Sprint 1 — Product Clarity y fuente de verdad

## Estado

Propuesto y aprobado para iniciar. Esta es una fase de reinicio de producto: define el producto antes de modificar su interfaz, datos o experiencia 3D.

## Problema

Command Center conserva dos direcciones incompatibles:

- La visión vigente lo define como el sistema operativo/portafolio de un ingeniero de software: proyectos, decisiones, evidencia y aprendizaje explorables.
- `ROADMAP.md` y `PROJECT_CONTEXT.md` aún lo describen como un CRM con campañas, ventas e inventario.

Esa contradicción hace que no exista un criterio único para priorizar trabajo. La ciudad 3D, el workspace y los datos de proyectos pueden parecer productos separados aunque deben contar la misma historia.

## Decisión de producto

Command Center es un **sistema de evidencia explorable de la ingeniería de Daniel**. No administra la operación de L'Origine, 4U Studio, Kliniu ni otros proyectos.

Su objetivo es que un reclutador, cliente técnico o colega pueda responder tres preguntas:

1. ¿Qué productos ha construido Daniel y qué propósito cumplen?
2. ¿Cómo toma decisiones de ingeniería y producto?
3. ¿Qué tecnologías, patrones y aprendizajes se repiten o se conectan entre proyectos?

La ciudad 3D es una puerta de descubrimiento visual. El workspace aporta profundidad y consulta. Ninguna superficie debe duplicar datos ni convertirse en decoración sin una pregunta de usuario que resolver.

## Usuario y resultado esperado

| Usuario | Necesidad | Resultado esperado |
| --- | --- | --- |
| Reclutador o cliente | Comprender rápidamente alcance, calidad y resultados | Puede descubrir un proyecto, abrir su dossier y visitar una demo pública cuando exista. |
| Ingeniero | Evaluar razonamiento técnico | Puede rastrear tecnologías, decisiones, retos y lecciones hasta proyectos reales. |
| Daniel | Mantener una representación honesta de su trabajo | Actualiza una fuente de datos; las vistas reflejan datos reales o señalan ausencia de datos. |

## Modelo de experiencia

```text
Ciudad / experiencia pública
  Descubrir los proyectos y su identidad
             ↓
Projects
  Dossier: propósito, estado, stack, media, retos, decisiones y enlaces
             ↓
Knowledge + Evidence
  Conexiones verificables: tecnologías, patrones, decisiones y lecciones
             ↓
Mission + Profile
  Trayectoria e identidad profesional sustentadas por los mismos datos
```

### Responsabilidades por superficie

- **Experience / Engineering City:** explicar la promesa, invitar a descubrir y dar entrada a un proyecto o módulo. WebGL es mejora progresiva, no requisito de acceso.
- **Projects:** ser el dossier de cada proyecto. Muestra únicamente información soportada por `PROJECTS` y evidencia relacionada.
- **Knowledge y Evidence:** probar conexiones entre proyectos sin repetir el dossier editorial.
- **Mission y Profile:** dar contexto profesional; nunca reemplazar evidencia concreta por claims.

## Alcance del Sprint 1

Este sprint elimina ambigüedad, no añade una nueva interfaz de ciudad ni cambia el pipeline 3D existente.

1. Crear y mantener un registro de referencias documentales que clasifique el legado como vigente, histórico, contradictorio o necesitado de actualización.
2. Sustituir el roadmap heredado CRM por un roadmap de producto coherente con la visión aprobada.
3. Alinear `PROJECT_CONTEXT.md`, `README.md` y los documentos de visión con la misma definición de Command Center.
4. Documentar el contrato entre Experience, Projects, Knowledge/Evidence, Mission y Profile.
5. Auditar los seis registros de `PROJECTS` contra un checklist de campos de evidencia real:
   - estado y visibilidad;
   - resumen y alcance;
   - tecnologías;
   - media permitida;
   - decisiones, retos y lecciones;
   - URL pública solo si existe y se puede verificar.
6. Registrar huecos explícitamente. No se fabrican métricas, resultados, enlaces ni eventos de misión para llenar la interfaz.
7. Definir los criterios de entrada para Sprint 2: evidencia de proyectos y recorrido de descubrimiento.

## Fuera de alcance

- Cambiar el WIP de `CityNavigator`, GLB, Blender, LOD o renders.
- Implementar paneles, bandejas o navegación adicional en la ciudad.
- Añadir autenticación, CRM, campañas, ventas, inventario o una app móvil.
- Provisionar servicios externos o alterar datos de producción.
- Declarar que una demo está pública sin verificar la URL.

## Roadmap propuesto

| Fase | Objetivo | Entregable verificable |
| --- | --- | --- |
| Sprint 1 — Claridad | Un solo norte y una sola fuente de verdad | Documentación alineada + auditoría de datos de seis proyectos |
| Sprint 2 — Evidencia | Volver cada dossier confiable | Datos reales, media y enlaces validados por proyecto |
| Sprint 3 — Recorrido | Convertir la evidencia en una experiencia entendible | Ciudad como discovery y workspace como profundidad, con fallback accesible |
| Sprint 4 — Calidad pública | Publicar y aprender | Rendimiento, accesibilidad, SEO, analítica y feedback de usuarios |
| Evolución continua | Incorporar trabajo nuevo sin romper el modelo | Cada proyecto nuevo sigue el contrato de evidencia |

## Datos y reglas de integridad

- `PROJECTS` sigue siendo la fuente de verdad de cada proyecto.
- `links.live` es opcional; una interfaz no debe mostrar un CTA público si falta.
- Las métricas son reales o `null`; el diseño debe representar ausencia de datos de forma honesta.
- Todo dato de Mission, Knowledge o Evidence debe poder rastrearse a un proyecto, decisión o fuente existente.
- Los proyectos privados pueden aparecer si su información no confidencial es suficiente; los detalles restringidos se omiten, no se sustituyen por texto ficticio.

## Criterios de aceptación del Sprint 1

1. Existe un registro de referencias que conserva el legado y señala las fuentes contradictorias o necesitadas de actualización.
2. Ningún documento raíz presenta Command Center como CRM, plataforma de campañas, ventas o inventario.
3. Existe un roadmap activo de cuatro sprints con objetivos y entregables verificables.
4. Cada una de las seis entradas de `PROJECTS` tiene una evaluación escrita de completitud y huecos.
5. La relación ciudad → Projects → Knowledge/Evidence está documentada sin duplicación de responsabilidades.
6. Los cambios documentales no modifican el WIP de ciudad/Blender ni datos externos.

## Verificación

- Revisión de enlaces y referencias entre documentación.
- Validación del contrato de datos existente con las pruebas de `apps/web/data/projects` y los tests del grafo/evidencia que dependan de `PROJECTS`.
- Revisión humana de que el roadmap responde a la definición de producto aprobada.
