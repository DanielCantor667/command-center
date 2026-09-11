# Command Center

Command Center es un sistema de evidencia explorable de la ingeniería de Daniel.

## Status

Portafolio en revisión local: cuatro sitios publicados con evidencia visual, fichas de proyectos y ciudad 3D.

Estado y límites: [roadmap activo](ROADMAP.md) y [auditoría de evidencia](docs/product/project-evidence-audit.md).

## Repository Philosophy

Command Center is built as a professional software product, organized like a modern engineering organization (Vercel, Linear, Stripe, Shopify). Every folder has a single responsibility. Everything is designed to scale.

## Repository Structure

```text
command-center/
├── .github/          CI workflows, issue and PR templates
├── apps/             Deployable applications
├── packages/         Shared libraries (UI, config, eslint-config, tsconfig)
├── docs/             Product, design, engineering, content, and sprint documentation
├── memory/           Project changelog, decisions, future plans, technical debt
├── prompts/          Reusable AI prompt templates
├── specs/            Feature and system specifications
├── design/           Figma files, references, wireframes, assets
├── decisions/         Architecture Decision Records (ADRs)
├── benchmarks/       Performance benchmarks (lighthouse, bundle, fps, memory)
├── playground/       Scratch space for experimentation
├── experiments/      Exploratory prototypes
├── scripts/          Repository automation scripts
└── tools/            Internal developer tooling
```

## Organización del repositorio

- **apps/** — Aplicaciones desplegables.
- **packages/** — Código compartido entre apps (UI, config, eslint-config, tsconfig).
- **docs/** — Documentación para humanos: product, design, engineering, content, sprints y templates.
- **specs/** — Especificaciones funcionales antes de implementar.
- **decisions/** — Architecture Decision Records (ADR).
- **memory/** — Contexto vivo del proyecto (changelog, decisiones, deuda técnica, ideas futuras).
- **prompts/** — Prompts reutilizables para IA.
- **benchmarks/** — Métricas de rendimiento (lighthouse, bundle, fps, memory).
- **scripts/** — Scripts de automatización del repositorio.
- **tools/** — Herramientas internas de desarrollo.

## Roadmap

See `ROADMAP.md`.

## License

MIT — see `LICENSE`.
