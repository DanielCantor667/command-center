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

## 2026-07-24 — Vertical slice de oficina 3D

Se conectó el conocimiento de workplace con un Scene Planner determinista, un Lab interactivo de React Three Fiber y una ruta de generación validada. El flujo permite crear, editar y persistir escenas de oficina desde la aplicación.

## 2026-07-24 — Editor espacial y flujo interoperable

El Lab incorporó plano arquitectónico, biblioteca de activos, inspector espacial, galería local e importación/exportación JSON validada. Se añadió una validación de escena y GLB previa a Blender que funciona sin la instalación de Blender.

## 2026-07-24 — Catálogo GLB compartido con Blender

El catálogo de doce activos se genera de forma reproducible con Blender y se carga directamente en el visor web. El mismo directorio de modelos sirve al render headless, eliminando la divergencia entre la escena del Lab y su exportación.

## 2026-07-24 — Sistema 3D documentado y siguiente fase definida

Se consolidaron arquitectura, contratos, operación, límites y deuda conocida del sistema de oficinas 3D. Sprint 0.7 propone proyectos persistentes, revisiones y render jobs, comenzando por corregir la transformación de assets compuestos en Blender.

## 2026-07-24 — Sprint 0.7: proyectos persistentes y render jobs

Supabase Auth, Prisma y RLS ahora respaldan proyectos con revisiones inmutables. El editor permite guardar, recuperar historial y solicitar renders; un worker local procesa la revisión exacta con Blender y publica GLB/PNG.

## 2026-07-24 — Sprint 0.8: experiencia 3D Office Studio

El Lab se convirtió en una experiencia de producto con jerarquía visual, editor y rail de herramientas coherentes, tokens semánticos y mejor lectura de la escena. El recorrido navegador → Supabase → revisión → worker Blender → PNG/GLB quedó verificado de extremo a extremo.

## 2026-07-24 — Command Center se convierte en una ciudad de conocimiento

La entrada principal pasó de un shell directo a una experiencia narrativa continua: ciudad central, distritos de proyectos, grafo, misión, analytics, evidencia y perfil. Los módulos existentes siguen disponibles mediante `ExperienceGate` y las métricas visuales se derivan de los dominios reales.
