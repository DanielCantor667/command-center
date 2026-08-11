# Registro de referencias documentales

Este registro conserva el contexto del repositorio sin tratarlo como definición activa del producto. La clasificación se obtuvo revisando las coincidencias de la búsqueda documental del Sprint 1; coincidencias por lenguaje técnico genérico no se consideran una dirección de producto heredada.

| Documento | Referencia | Clasificación | Acción en Sprint 1 | Razón |
| --- | --- | --- | --- | --- |
| `ROADMAP.md` | Nota de estado y fases 2–5: CRM, campañas, ventas e inventario | contradictoria | Sustituir en la tarea de roadmap y mantener este registro como trazabilidad | Es un documento raíz que propone una línea de producto incompatible con la decisión aprobada. |
| `PROJECT_CONTEXT.md` | Definición de plataforma operativa y secciones CRM, Campaigns, Sales e Inventory | contradictoria | Alinear en la tarea de contexto y mantener este registro como trazabilidad | Es un documento raíz que presenta el producto como operación de negocio, contrario al sistema de evidencia de ingeniería. |
| `memory/technical-debt.md` | Deuda que plantea decidir si la línea 3D reemplaza, precede o convive con CRM | necesita actualización | Reescribir la deuda cuando se alineen los documentos raíz | La decisión de producto ya está aprobada; la pregunta abierta conserva ambigüedad. |
| `CHANGELOG.md` | Entrada de paquete de diseño de oficinas corporativas | histórica | Preservar sin cambiar | Registra una entrega pasada; no define el producto actual. |
| `docs/04-sprints/SPRINT-0.6-DASHBOARD-FOUNDATION.md` | Sprint de dashboard previo | histórica | Preservar sin cambiar | Es evidencia de una fase anterior y no una definición de producto vigente. |
| `docs/04-sprints/SPRINT-0.7-SCENE-PROJECTS.md` | Terminología de ocupantes y planificación espacial | histórica | Preservar sin cambiar | Documenta una fase anterior del trabajo de escena. |
| `docs/superpowers/plans/2026-07-01-design-system-core.md` | Plan del sistema de diseño anterior | histórica | Preservar sin cambiar | Es un plan ejecutado o anterior, no una guía activa de producto. |
| `docs/superpowers/specs/2026-07-14-workplace-design-system-design.md` | Spec de diseño de oficinas y nivel Enterprise | histórica | Preservar sin cambiar | Conserva el alcance de una iniciativa anterior. |
| `docs/vision/WORKPLACE_DESIGN_SYSTEM.md` | Vocabulario de planificación de oficinas | histórica | Preservar sin cambiar | Es documentación de un subsistema histórico, no la definición de Command Center. |
| `docs/engineering/backend.md` | Ejemplo `campaignService` | necesita actualización | Registrar para sustituir el ejemplo en la alineación documental | El ejemplo de dominio arrastra terminología de campañas sin ser una regla arquitectónica necesaria. |
| `docs/engineering/api.md` | Rutas de ejemplo `/campaigns` y eventos de campañas | necesita actualización | Registrar para sustituir los ejemplos en la alineación documental | Los ejemplos de API arrastran una entidad de un producto descartado. |
| `docs/engineering/3d-office-system.md` | Clientes, operaciones e inventario como límites del sistema de oficinas | vigente | Preservar sin cambiar | Define límites técnicos del subsistema y no presenta Command Center como CRM. |
| `docs/engineering/testing.md` | Operaciones core de negocio | vigente | Preservar sin cambiar | Es una regla de estrategia de pruebas con vocabulario genérico. |
| `docs/content/CONTENT_STRATEGY.md` | Prohibición de embudo de ventas y lenguaje comercial | vigente | Preservar sin cambiar | Refuerza la posición editorial no comercial que coincide con el producto aprobado. |
| `specs/foundation.md` | CRM como ejemplo genérico de una pantalla o flujo | histórica | Preservar sin cambiar | Es una especificación fundacional anterior; no afirma que Command Center sea CRM. |
| `docs/superpowers/specs/2026-08-11-command-center-product-clarity-design.md` | Referencias explícitas al CRM heredado y a su exclusión | vigente | Usar como fuente de decisión durante el Sprint 1 | Explica la contradicción, fija el reinicio de producto y excluye esa línea del alcance. |

## Regla de uso

La documentación raíz y cualquier guía activa deben expresar Command Center como sistema de evidencia explorable de la ingeniería de Daniel. Los changelogs, ADR, sprints y specs anteriores se conservan como historia; no se reinterpretan como dirección de producto actual.
