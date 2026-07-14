# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [Unreleased]

### Added

### Changed

### Fixed

#### TECH-001

Resolved Tailwind CSS v4 monorepo content detection.

Added explicit `@source` directive to `packages/config/tailwind.css`.

Result:

- Design System utilities generated correctly.
- Dashboard visual language restored.
- No architectural changes.

Ver [ADR-005](decisions/ADR-005-tailwind-v4-monorepo.md).

### Removed

---

## [0.1.0] - 2026-07-01

### Added

- Estructura inicial del monorepo con Turborepo.
- Carpetas base: apps, packages, docs, specs, decisions, memory, prompts, benchmarks, scripts, tools.
- Documentación fundacional: CLAUDE.md, CONSTITUTION.md, ROADMAP.md, README.md.
- Archivos de contexto vivo en memory/ (changelog, decisiones, deuda técnica, futuro).
