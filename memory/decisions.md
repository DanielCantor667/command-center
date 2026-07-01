# Decisiones de memoria

## Propósito

Este documento resume, en pocas líneas, las decisiones técnicas importantes tomadas a lo largo del proyecto. Sirve como índice rápido de contexto para humanos e IA.

Los ADR completos, con su análisis, alternativas consideradas y consecuencias, viven en `decisions/`. Este archivo no los reemplaza: los resume y enlaza. Ante cualquier duda sobre el detalle de una decisión, consultar el ADR correspondiente.

## Formato sugerido

```
## AAAA-MM-DD — Título de la decisión

Resumen en una o dos líneas. Ver decisions/ADR-XXX.
```

---

## 2026-07-01 — Estructura del monorepo

Se adoptó Turborepo con arquitectura modular (apps/packages) como base del proyecto. Ver `decisions/ADR-001-project.md` y `decisions/ADR-002-architecture.md`.
