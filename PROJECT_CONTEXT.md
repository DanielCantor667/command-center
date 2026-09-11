# Contexto del proyecto

Este documento es el punto de entrada para cualquier IA o desarrollador nuevo en Command Center. Resume el proyecto; no reemplaza `CLAUDE.md`, `CONSTITUTION.md` ni la documentación en `docs/`, `specs/`, `decisions/` o `memory/`.

---

## 1. ¿Qué es este proyecto?

Command Center es un sistema de evidencia explorable de la ingeniería de Daniel. La ciudad permite descubrir proyectos; las fichas muestran propósito, evidencia, decisiones y enlaces públicos. El workspace permite profundizar en las conexiones entre proyectos.

---

## 2. Objetivos

- Explicar qué productos ha construido Daniel y cómo toma decisiones.
- Mostrar sitios reales, capturas y fuentes verificables.
- Permitir un recorrido accesible desde la ciudad hasta el contacto.
- Mantener PROJECTS como fuente única y representar ausencia de datos.

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

**Foundation**
Estado: Completado

**Authentication**
Estado: Pendiente

**CRM**
Estado: Pendiente

**Campaigns**
Estado: Pendiente

**Sales**
Estado: Pendiente

**Inventory**
Estado: Pendiente

**Analytics**
Estado: Pendiente

**AI**
Estado: Pendiente

**Mobile**
Estado: Pendiente

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
