# Contexto del proyecto

Este documento es el punto de entrada para cualquier IA o desarrollador nuevo en Command Center. Resume el proyecto; no reemplaza `CLAUDE.md`, `CONSTITUTION.md` ni la documentación en `docs/`, `specs/`, `decisions/` o `memory/`.

---

## 1. ¿Qué es este proyecto?

Command Center es un **sistema de evidencia explorable de la ingeniería de Daniel**. Permite que reclutadores, clientes técnicos y colegas descubran los productos que ha construido, entiendan sus decisiones de ingeniería y producto, y conecten tecnologías, patrones y aprendizajes entre proyectos.

La ciudad 3D abre el descubrimiento visual y el workspace aporta profundidad y consulta. Ambas superficies comparten la misma evidencia: no duplican datos ni existen como decoración sin una pregunta de usuario que resolver.

No es un CRM, una plataforma de campañas, ventas, inventario, ERP ni una plataforma operativa de proyectos de clientes. No administra la operación de L'Origine, 4U Studio, Kliniu ni otros proyectos.

---

## 2. Objetivos

- Hacer comprensible el propósito, alcance y estado de los productos construidos por Daniel.
- Mostrar decisiones, tecnologías, retos y lecciones con trazabilidad a proyectos reales.
- Mantener una representación honesta: los datos son reales o se señala explícitamente su ausencia.
- Construir sobre una arquitectura escalable, no sobre atajos temporales.
- Ofrecer una experiencia moderna y consistente en todo el producto.
- Mantener el código mantenible a largo plazo, no solo funcional hoy.

---

## 3. Stack tecnológico

- Next.js
- React
- TypeScript
- Turborepo
- Tailwind CSS
- Prisma
- PostgreSQL
- Supabase

---

## 4. Arquitectura

El proyecto es un monorepo gestionado con Turborepo. Las aplicaciones desplegables viven en `apps/` y el código compartido en `packages/`. Cada módulo de producto se construye de forma independiente, reutilizando lo común. La documentación y las especificaciones se escriben antes del código, no después. Detalle completo en `docs/engineering/architecture.md`.

---

## 5. Filosofía del proyecto

- Simplicidad antes que complejidad.
- Reutilización antes que duplicación.
- Consistencia en todo el proyecto.
- Documentación cuando aporta valor.
- Escalabilidad como criterio de diseño, no como ocurrencia posterior.
- Calidad antes que velocidad de entrega.
- Bajo acoplamiento entre módulos.

Detalle completo en `CONSTITUTION.md`.

---

## 6. Organización del repositorio

- **apps/** — Aplicaciones desplegables del producto.
- **packages/** — Código compartido entre apps (UI, config, lint, tipos).
- **docs/** — Documentación para humanos: producto, diseño, ingeniería, contenido, sprints.
- **specs/** — Especificaciones funcionales, escritas antes de implementar.
- **memory/** — Contexto vivo: changelog, decisiones, deuda técnica, ideas futuras.
- **decisions/** — Architecture Decision Records (ADR), historial permanente.
- **prompts/** — Prompts reutilizables para IA.
- **benchmarks/** — Mediciones de rendimiento del producto.
- **scripts/** — Automatización del repositorio.
- **tools/** — Herramientas internas de desarrollo.

---

## 7. Flujo de desarrollo

```
Idea
  ↓
Spec
  ↓
Aprobación
  ↓
Implementación
  ↓
Testing
  ↓
Documentación
  ↓
Changelog
```

---

## 8. Estado actual

**Sprint 1 — Product Clarity**
Estado: En curso. Alinea la documentación y la fuente de verdad antes de cambiar interfaz, datos o experiencia 3D.

Los siguientes pasos activos se describen en `ROADMAP.md`. El contexto anterior se conserva en el
[registro histórico de referencias](docs/product/documentation-reference-register.md), sin definir la dirección actual.

---

## 9. Documentación importante

**CLAUDE.md**
Cómo debe trabajar la IA en este repositorio.

**CONSTITUTION.md**
Reglas permanentes del proyecto.

**docs/engineering/**
Arquitectura técnica, estándares de código, frontend, backend, base de datos, API, deployment, testing.

**specs/**
Especificaciones funcionales antes de implementar.

**decisions/**
Architecture Decision Records (ADR).

**memory/**
Contexto vivo del proyecto.

**ROADMAP.md**
Plan general por fases.

**CHANGELOG.md**
Historial de cambios del producto.

---

## 10. Reglas para IA

- Leer únicamente el contexto necesario para la tarea.
- Respetar la arquitectura existente.
- No duplicar lógica.
- Implementar antes de explicar.
- No hacer cambios fuera del alcance solicitado.
- Respetar `CLAUDE.md`.
- Respetar `CONSTITUTION.md`.
