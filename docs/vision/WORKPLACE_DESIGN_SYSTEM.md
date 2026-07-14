# WORKPLACE DESIGN SYSTEM

> Knowledge base for corporate office scene generation. v1 covers corporate/tech office typologies.

---

# Status

Approved

Version

1.0

Owner

Daniel Cantor

---

# Purpose

Este documento describe el conocimiento arquitectónico y funcional de los espacios de oficina corporativa que Command Center puede generar: qué módulos existen, cómo se relacionan entre sí, qué materiales y estilos están disponibles, y qué reglas espaciales aproximadas rigen su distribución.

> Este documento (y el paquete `@command-center/workplace-design-system` que lo codifica) contiene únicamente conocimiento de dominio. No implementa algoritmos de planificación, generación de escenas, renderizado ni integración con IA. Todas las funciones expuestas son deterministas, de solo lectura y derivadas de los registros declarativos.

Es la base de conocimiento que usará el futuro Scene Planner para convertir un requisito de negocio ("oficina para 60 personas") en una distribución espacial con sentido arquitectónico.

---

# Módulos arquitectónicos

14 módulos, agrupados en 5 categorías. `reception`, `waiting_area`, `open_workspace` y `meeting_room` son los únicos **requeridos** — la oficina mínima viable. El resto son **opcionales**, incluidos según tamaño/tipo de empresa.

| Módulo | Categoría | Prioridad | Área |
|---|---|---|---|
| Reception | arrival | required | 20 m² |
| Waiting Area | arrival | required | 15 m² |
| Open Workspace | work | required | 6 m²/persona |
| Private Office | work | optional | 10 m² |
| Meeting Room | meeting | required | 8 m² (mínimo; ver tiers en Reglas Espaciales) |
| Phone Booth | meeting | optional | 2 m² |
| Collaboration Area | work | optional | 20 m² |
| Cafeteria | amenity | optional | 1.8 m²/persona |
| Break Room | amenity | optional | 15 m² |
| Print Area | support | optional | 6 m² |
| Server Room | support | optional | 10 m² |
| Storage | support | optional | 10 m² |
| Executive Office | work | optional | 20 m² |
| Training Room | meeting | optional | 2 m²/persona |

---

# Relaciones entre módulos

El grafo de adyacencia evita que el Planner coloque módulos incompatibles uno junto al otro (ej. nunca Reception junto a Server Room).

| Módulo | Adyacente a | Evitar junto a |
|---|---|---|
| Reception | Waiting Area | Server Room, Storage |
| Waiting Area | Reception, Open Workspace | Server Room |
| Open Workspace | Waiting Area, Collaboration Area, Meeting Room, Print Area | Server Room |
| Private Office | Open Workspace | Cafeteria, Break Room |
| Meeting Room | Open Workspace, Collaboration Area | Server Room, Storage |
| Phone Booth | Open Workspace, Collaboration Area | — |
| Collaboration Area | Open Workspace, Meeting Room | Server Room |
| Cafeteria | Break Room | Server Room, Private Office, Executive Office |
| Break Room | Cafeteria, Open Workspace | Server Room, Executive Office |
| Print Area | Open Workspace | Cafeteria |
| Server Room | Storage | Break Room, Meeting Room, Cafeteria, Reception, Waiting Area |
| Storage | Server Room, Print Area | Reception, Executive Office |
| Executive Office | Private Office | Server Room, Storage, Print Area, Cafeteria |
| Training Room | Collaboration Area | Server Room |

---

# Materiales

4 familias, 4 opciones cada una — pocas, bien elegidas, no 200 texturas.

| Familia | Opciones |
|---|---|
| Floor | Concrete, Wood, Carpet, Stone |
| Walls | White Paint, Gray Paint, Wood Panels, Glass |
| Furniture | Oak, Walnut, Black Metal, White Metal |
| Fabric | Gray, Blue, Green, Black |

La compatibilidad estilo↔material se deriva de la paleta de cada estilo (ver abajo) — no es una lista mantenida a mano, así que nunca queda desincronizada.

---

# Estilos (v1: tipologías corporativas/tech)

No son solo estéticos — cada uno implica una densidad espacial distinta, que cambia por completo la distribución del layout.

| Estilo | Paleta (floor/wall/furniture/fabric) | Densidad | Mood |
|---|---|---|---|
| Corporate Standard | Carpet / Gray Paint / Black Metal / Gray | medium | professional, neutral, reliable |
| Tech Startup | Concrete / White Paint / Black Metal / Green | high | energetic, open, casual |
| Executive Premium | Wood / Wood Panels / Walnut / Black | low | premium, quiet, refined |
| Minimal | Concrete / White Paint / White Metal / Gray | low | clean, uncluttered, bright |
| Scandinavian | Wood / White Paint / Oak / Green | medium | warm, natural, light |
| Creative Studio | Wood / Gray Paint / Black Metal / Blue | high | playful, expressive, flexible |

Tipologías adicionales (banca/legal/logística/hospitality) quedan para v2.

---

# Reglas espaciales

> Estos valores son heurísticos de diseño corporativo y no sustituyen normativa técnica ni regulaciones locales (código de construcción, accesibilidad, seguridad contra incendios). Sirven para que el Planner genere escenas con sentido espacial, no para certificar un espacio real.

**Circulation** — pasillo principal 1.5 m, pasillo secundario 1.0 m, radio de giro mínimo 1.5 m.

**Furniture** — separación entre escritorios 1.2 m, espacio libre de silla 0.75 m, distancia al monitor 0.6 m.

**Meeting** — chica: 2-4 personas / 8 m². mediana: 5-8 personas / 16 m². grande: 9-16 personas / 30 m².

**Accessibility** — ancho mínimo de puerta 0.9 m, radio de giro silla de ruedas 1.5 m, espacio libre de escritorio accesible 1.5 m.

**Safety** — ancho mínimo salida de emergencia 1.1 m, distancia máxima a salida 30 m, separación mínima entre extintores 25 m.

**Planning** — las reglas que el Planner consultará constantemente en lugar de tener lógica hardcodeada: máximo 60 personas por Open Workspace antes de dividir, 1 Meeting Room cada 12 personas, 1 Executive Office cada 25 personas, 1 Phone Booth cada 15 personas, 1 Break Room cada 30 personas.

---

# Presets de planificación

Cuatro tramos por cantidad de personas, cada uno con un set base de módulos recomendados y un estilo sugerido (no vinculante) — el Planner consulta el preset en vez de calcular todo desde cero.

| Preset | Personas | Módulos recomendados | Estilo sugerido |
|---|---|---|---|
| Small Office | 1–10 | Reception, Waiting Area, Open Workspace, Meeting Room, Break Room | Tech Startup |
| Medium Office | 11–40 | + Phone Booth, Print Area, Private Office | Corporate Standard |
| Large Office | 41–120 | + Collaboration Area, Cafeteria, Server Room, Storage | Corporate Standard |
| Enterprise | 121+ | + Executive Office, Training Room | Executive Premium |

---

# Arquitectura del sistema

```
Workplace Design System
        │
        ▼
   Scene Planner
        │
        ▼
  Scene Generator
        │
        ▼
   Scene Schema
        │
   ┌────┴────┐
   ▼         ▼
Scene Builder  Blender
```

La dependencia es de una sola dirección: nada aguas arriba del Workplace Design System importa de lo que está aguas abajo.

---

Owner

Command Center

Maintainer

Daniel Cantor
