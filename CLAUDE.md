# CLAUDE.md

## Project

Command Center — The Operating System of a Software Engineer.

## Mission

Build Command Center as a professional software product, organized like a modern engineering organization, not a personal portfolio repository.

## Engineering Philosophy

Engineering before aesthetics. Simplicity over cleverness. Consistency over creativity. Every decision must be scalable and maintainable.

## Note

Detailed engineering rules, conventions, and agent instructions will be added in future sprints.

# CLAUDE.md

# Proyecto

Este repositorio utiliza Turborepo y sigue una arquitectura modular.

Objetivos:

- Código limpio.
- Bajo acoplamiento.
- Alta mantenibilidad.
- Escalable.
- Consistencia en todo el proyecto.
- Documentación antes que implementación cuando aplique.

---

# Idioma

- Responde siempre en español.
- Mantén nombres de variables, funciones, clases, componentes y tecnologías en inglés.
- No traduzcas términos técnicos.
- Escribe de forma clara y directa.

---

# Comportamiento

- Implementa antes de explicar.
- Sé conciso.
- No hagas planes largos salvo que se soliciten.
- No inventes requisitos.
- No cambies funcionalidades no relacionadas.
- No hagas refactors innecesarios.
- No simplifiques lógica sin autorización.
- Mantén compatibilidad con el código existente.

---

# Filosofía del proyecto

Siempre priorizar:

1. Simplicidad.
2. Legibilidad.
3. Reutilización.
4. Escalabilidad.
5. Rendimiento.
6. Accesibilidad.

Evitar:

- Código duplicado.
- Componentes gigantes.
- Funciones largas.
- Dependencias innecesarias.
- Sobreingeniería.

---

# Arquitectura

Respetar siempre la arquitectura existente.

Antes de crear:

- componente
- hook
- helper
- util
- servicio
- contexto
- tipo

buscar si ya existe uno reutilizable.

No duplicar lógica.

Si una funcionalidad será usada en múltiples lugares, abstraerla.

---

# Organización del repositorio

## apps/

Aplicaciones desplegables.

## packages/

Código compartido.

## docs/

Documentación para humanos.

## specs/

Especificaciones funcionales antes del código.

## decisions/

Architecture Decision Records (ADR).

Nunca modificar un ADR existente.
Crear uno nuevo si cambia una decisión importante.

## memory/

Contexto del proyecto.

Actualizar cuando exista:

- deuda técnica
- cambios importantes
- decisiones relevantes

## prompts/

Prompts reutilizables para IA.

---

# Desarrollo

Modificar únicamente los archivos necesarios.

Evitar:

- mover archivos sin motivo
- renombrar componentes innecesariamente
- cambiar APIs existentes sin solicitarlo

No agregar dependencias salvo que exista una justificación técnica.

---

# Calidad

Todo cambio debe:

- compilar
- respetar TypeScript
- respetar ESLint
- no romper funcionalidades existentes

Si detectas un bug relacionado con la tarea:

- corrígelo
- repórtalo

Si es ajeno al alcance:

- no modificarlo
- dejarlo reportado

---

# Frontend

Priorizar:

- componentes existentes
- Tailwind existente
- Design System existente

Mantener:

- responsive
- accesibilidad
- consistencia visual
- rendimiento

No rediseñar pantallas completas salvo que se solicite.

---

# Backend

Mantener:

- separación por capas
- servicios pequeños
- funciones reutilizables

No colocar lógica de negocio en controladores o rutas.

---

# Base de datos

No modificar esquemas sin autorización.

Evitar migraciones innecesarias.

No guardar datos calculados si pueden derivarse.

Mantener integridad y consistencia.

---

# Supabase

Mantener RLS seguras.

Nunca desactivar seguridad.

Nunca mostrar secretos.

No imprimir variables de entorno.

---

# Git

Nunca hacer commit automáticamente.

Nunca hacer push.

Solo preparar cambios cuando se solicite.

No modificar historial Git.

---

# Documentación

Actualizar documentación únicamente cuando:

- cambie arquitectura
- cambie una decisión técnica
- cambie una especificación
- se agregue una funcionalidad importante

No generar documentación innecesaria.

---

# Rendimiento

Priorizar:

- menos código
- menos renders
- menos consultas
- menos dependencias
- menos contexto

Evitar optimizaciones prematuras.

---

# Uso de contexto

Leer únicamente los archivos necesarios.

No recorrer todo el proyecto.

No abrir directorios completos si una búsqueda puntual es suficiente.

No cargar contexto innecesario.

---

# Herramientas

Evitar crear subagentes salvo que sea estrictamente necesario.

Evitar análisis masivos.

Resolver localmente siempre que sea posible.

Usar la solución más simple.

---

# Formato de respuesta

Responder siempre usando:

## Cambios realizados

- ...

## Archivos modificados

- ...

## Verificación

- Build
- Lint
- Tests

## Pendientes

- ...

Mantener respuestas cortas.

---

# Seguridad

Nunca mostrar:

- .env
- tokens
- claves
- secretos
- credenciales

Referirse únicamente al nombre de la variable.

---

# Regla principal

Haz exactamente lo solicitado.

Con la menor cantidad posible de cambios.

Con la menor cantidad posible de contexto.

Manteniendo la calidad, la arquitectura y la consistencia del proyecto.