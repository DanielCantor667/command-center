# Constitución de Command Center

Estado: Vigente
Última actualización: 2026-07-01

Este documento define las reglas permanentes del proyecto. No explica tecnologías: explica cómo desarrollamos. Complementa a `CLAUDE.md`, no lo duplica.

---

## 1. Propósito

Construir Command Center como un producto de software profesional, mantenible, escalable y consistente a largo plazo. Cada decisión técnica debe evaluarse contra este objetivo, no contra la conveniencia del momento.

---

## 2. Principios

- Simplicidad antes que complejidad.
- Legibilidad antes que ingenio.
- Reutilización antes que duplicación.
- Arquitectura antes que velocidad.
- Calidad antes que cantidad.
- Rendimiento sin sobreoptimizar.
- Documentación cuando aporte valor, no por defecto.

---

## 3. Arquitectura

- Respetar la arquitectura existente. No proponer alternativas sin que se solicite.
- No duplicar lógica: buscar si ya existe un componente, hook, util o servicio reutilizable antes de crear uno nuevo.
- Compartir código cuando sea usado en más de un lugar, abstrayéndolo a `packages/`.
- Separar responsabilidades por capa (UI, lógica de negocio, acceso a datos).
- Evitar componentes gigantes: dividir cuando una responsabilidad crece más allá de su propósito único.
- Evitar funciones largas: si una función hace más de una cosa, dividirla.
- Evitar acoplamiento innecesario entre módulos, apps y paquetes.

---

## 4. Calidad

Todo cambio debe cumplir:

- Build limpio, sin errores.
- Sin errores de TypeScript.
- Sin romper funcionalidades existentes.
- Código legible y consistente con el estilo del repositorio.
- Manejo correcto de errores en los límites del sistema (entrada de usuario, APIs externas).
- Validaciones adecuadas donde el dato entra al sistema, no en cada capa interna.

---

## 5. Desarrollo

- Modificar únicamente los archivos necesarios para la tarea.
- No hacer refactors sin que se soliciten explícitamente.
- No cambiar APIs públicas sin autorización.
- No agregar dependencias salvo que exista una justificación técnica clara.
- No introducir deuda técnica deliberadamente. Si se detecta deuda existente fuera de alcance, reportarla en `memory/technical-debt.md` sin corregirla.

---

## 6. Base de datos

- No guardar datos calculados si pueden derivarse en tiempo de consulta.
- Mantener integridad referencial y consistencia de datos.
- Evitar redundancia de información entre tablas.
- No modificar esquemas sin aprobación explícita.
- Mantener consistencia entre los tipos del frontend y los del backend.
- Evitar migraciones innecesarias.

---

## 7. Frontend

Priorizar, en este orden:

- Reutilización de componentes y del design system existente.
- Accesibilidad (teclado, lectores de pantalla, contraste).
- Diseño responsive.
- Rendimiento (menos renders, menos JavaScript en el cliente).
- Consistencia visual con el resto del producto.

No rediseñar pantallas o flujos completos salvo que se solicite explícitamente.

---

## 8. Backend

- La lógica de negocio vive en servicios, nunca en controladores o rutas.
- Rutas y controladores deben ser delgados: reciben, delegan, responden.
- Funciones pequeñas, con una sola responsabilidad.
- Separación clara por capas: rutas, servicios, acceso a datos.

---

## 9. Documentación

- `docs/` — documentación para humanos (producto, diseño, ingeniería, contenido, sprints). Se actualiza cuando cambia arquitectura, una decisión técnica relevante o se agrega una funcionalidad importante.
- `specs/` — especificaciones funcionales antes de implementar. Se crea antes del código, no después.
- `memory/` — contexto vivo del proyecto: changelog, decisiones resumidas, deuda técnica, ideas futuras. Se actualiza en cada cambio relevante, de forma breve.
- `decisions/` — Architecture Decision Records (ADR). Nunca se modifica un ADR existente; se crea uno nuevo si cambia una decisión.
- `prompts/` — prompts reutilizables para IA. No contiene documentación de producto ni de ingeniería.

No generar documentación que no se vaya a mantener.

---

## 10. Git

- Nunca hacer push automáticamente.
- Nunca modificar el historial de Git.
- Nunca hacer commits sin autorización explícita.
- Mantener commits pequeños, atómicos y coherentes con su mensaje.

---

## 11. Seguridad

Nunca:

- Exponer secretos, tokens o credenciales.
- Imprimir o mostrar variables de entorno (`.env`).
- Desactivar mecanismos de seguridad (RLS, autenticación, validación).
- Eliminar validaciones existentes para simplificar código.

---

## 12. Filosofía con IA

Toda IA que trabaje en este repositorio debe:

- Respetar esta constitución y `CLAUDE.md` por encima de su comportamiento por defecto.
- Leer únicamente el contexto necesario para la tarea, sin recorrer todo el proyecto.
- Minimizar los cambios: implementar exactamente lo solicitado, con el menor impacto posible.
- Mantener coherencia con la arquitectura y las convenciones existentes.
- Implementar antes de explicar. Ser conciso al comunicar.
- No inventar requisitos que no fueron pedidos.
- Reportar problemas encontrados fuera del alcance, sin corregirlos por su cuenta.
- No modificar partes del código ajenas al alcance de la tarea.

---

## 13. Definición de terminado (Definition of Done)

Una tarea se considera terminada únicamente cuando:

- Compila correctamente.
- Cumple la especificación acordada.
- Mantiene la arquitectura existente.
- No rompe funcionalidades previas.
- Pasa las validaciones de tipos y lint.
- No introduce deuda técnica no reportada.
- La documentación relevante se actualiza, si corresponde.
