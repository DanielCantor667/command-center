# Capabilities Module

Presentation layer over the Evidence Engine.

## Philosophy

Capabilities are demonstrated. Never claimed.

Every capability shown is derived from engineering evidence. Nothing is manually written.

## Data Flow

```
Evidence Engine (domain/evidence) → getEvidence() → CapabilitiesModule
```

The module consumes the Evidence Repository only. No business logic. No duplicated data.

## Layout

1. Capability Overview — summary metrics and confidence distribution
2. Capability Groups — grid of inferred capabilities with evidence counts
3. Technology Profile — per-technology breakdowns
4. Architecture Experience — per-pattern evidence aggregation
5. Learning Profile — lessons grouped by category
6. Statistics — aggregate metrics

## Component Hierarchy

```
CapabilitiesModule
├── CapabilityOverview
├── CapabilityGroup
│   └── CapabilityCard[]
├── TechnologyProfile
├── ArchitectureProfile
├── LearningProfile
├── Statistics
└── EmptyState
```

## State

No global state. No business logic. No duplicated calculations.

`useMemo` caches the Evidence Engine result across renders.

## Future Extension Points

- Analytics integration
- Search and filtering
- AI Assistant integration
- Command Palette actions
- Career Timeline integration
