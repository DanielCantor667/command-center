# Changelog de memoria

## Propósito

Este documento registra únicamente cambios importantes del proyecto: los que afectan arquitectura, decisiones técnicas, o el rumbo del producto. No reemplaza al `CHANGELOG.md` de la raíz, que sigue el formato Keep a Changelog para releases. Aquí se registra contexto, no versiones.

No registrar aquí cambios menores, correcciones triviales o trabajo en progreso.

## Formato sugerido

```
## AAAA-MM-DD — Título breve del cambio

Qué cambió y por qué. Dos o tres líneas como máximo.
```

---

## 2026-07-01 — Fundación del repositorio

Se estableció la estructura inicial del monorepo (apps, packages, docs, specs, decisions, memory, prompts, benchmarks, scripts, tools) y la documentación base del proyecto (CLAUDE.md, CONSTITUTION.md, ROADMAP.md).

## 2026-07-01 — Sprint 0.1: bootstrap técnico (Foundation)

Se implementó `specs/foundation.md`: `apps/web` (Next.js + TypeScript + Tailwind CSS) consumiendo `packages/tsconfig`, `packages/eslint-config`, `packages/config` y `packages/ui` vía workspace. Se agregó configuración inicial de Prisma (`prisma/schema.prisma`, sin modelos) y del cliente de Supabase, sin conexión real todavía. Build, lint y tests verificados en verde.
