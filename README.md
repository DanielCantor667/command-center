# Command Center

Un sistema de evidencia explorable de la ingeniería de Daniel.

Command Center permite descubrir productos construidos por Daniel, las decisiones que los
sustentan y las tecnologías, patrones y aprendizajes que se conectan entre ellos. La ciudad 3D
es una puerta de descubrimiento visual; el workspace aporta profundidad y consulta sobre la
misma evidencia.

No es un CRM, una plataforma de campañas, ventas, inventario, ERP ni una plataforma operativa
para proyectos de clientes. La definición activa y las responsabilidades de cada superficie se
mantienen en la [especificación de Product Clarity](docs/superpowers/specs/2026-08-11-command-center-product-clarity-design.md).

## Status

Sprint 1 — Product Clarity.

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

Consulta [ROADMAP.md](ROADMAP.md). El contexto documental anterior se conserva en el
[registro histórico de referencias](docs/product/documentation-reference-register.md).

## License

MIT — see `LICENSE`.
