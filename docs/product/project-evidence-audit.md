# Auditoría de evidencia de proyectos

Fecha: 10 de septiembre de 2026. Alcance: lectura de registros, código de Command Center, package.json de Drokex/L’Origine/4U y navegación pública de los cuatro dominios facilitados por Daniel. No se probaron operaciones privadas, pagos, ventas, permisos ni resultados de negocio de esos sitios.

VERIFIED significa comprobado dentro de este alcance; PARTIAL significa que existe una fuente pero no basta para confirmar todo el campo; MISSING significa que no se encontró evidencia en las fuentes auditadas.

Los seis registros originales conservan su orden. Drokex se añade al final por autorización del usuario. `academy.ts` tiene ID `4ustudio-academy`: el distrito `academy` debe resolver a ese ID.

## Fuentes actuales

- `site-verification.json`: URL original/final, respuesta HTTP, título y encabezados del navegador, con fecha de captura.
- `apps/web/public/projects/*`: ocho capturas públicas. L’Origine escritorio muestra productos; las otras vistas muestran la portada. Cookies opcionales rechazadas donde se ofrecía esa elección.
- `../drokex/package.json`, `../drokex/app/page.js`, `../drokex/app/directorio/`, `../drokex/docs/superpowers/specs/2026-08-18-home-responsive-design.md`: stack, rutas y requisito responsive. `git log` empieza el 17 de abril de 2026; se usa como fecha del primer registro, no fecha de lanzamiento.
- `../l origine/package.json`, `../l origine/src/lib/db.ts`, `../l origine/src/lib/customer-auth.ts`, `../l origine/src/app/api/`: corrigen la descripción antigua sin base de datos. La ficha distingue presencia en código de validación funcional.
- `../4ustudio/package.json`: dependencias actuales. La descripción detallada de operaciones sigue siendo histórica y requiere auditoría privada aparte.
- `apps/web/data/projects/*.ts`: contenido editorial heredado. Su existencia no prueba rendimiento, impacto o autoría exclusiva.

## command-center

Fuente base: `apps/web/data/projects/command-center.ts`. Repositorio local asociado: `../command-center`.

| Campo | Estado | Evidencia / hueco |
| --- | --- | --- |
| identity | VERIFIED | ID `command-center`, slug y nombre presentes en `command-center.ts`; unicidad cubierta por pruebas del repositorio. |
| overview | PARTIAL | El registro `command-center.ts` contiene el campo; no se revalidó todo su contenido contra el producto actual. |
| status | PARTIAL | El registro `command-center.ts` contiene el campo; no se revalidó todo su contenido contra el producto actual. |
| visibility | VERIFIED | Registro marcado public; se verifica el indicador, no permisos sobre información de terceros. |
| technologies | PARTIAL | El registro `command-center.ts` contiene el campo; no se revalidó todo su contenido contra el producto actual. |
| architecture | PARTIAL | El registro `command-center.ts` contiene el campo; no se revalidó todo su contenido contra el producto actual. |
| features | PARTIAL | El registro `command-center.ts` contiene el campo; no se revalidó todo su contenido contra el producto actual. |
| challenges | PARTIAL | El registro `command-center.ts` contiene el campo; no se revalidó todo su contenido contra el producto actual. |
| engineeringDecisions | PARTIAL | El registro `command-center.ts` contiene el campo; no se revalidó todo su contenido contra el producto actual. |
| lessonsLearned | PARTIAL | El registro `command-center.ts` contiene el campo; no se revalidó todo su contenido contra el producto actual. |
| metrics | MISSING | No se encontró evidencia fechada suficiente en las fuentes auditadas. Campos numéricos establecidos en null; no se publican cifras históricas como actuales. |
| media | MISSING | No se encontró evidencia en las fuentes auditadas para una URL live verificada o capturas de este caso. |
| repository | PARTIAL | URL declarada en el registro; accesibilidad pública del repositorio no revalidada. |
| live | MISSING | No se encontró evidencia en las fuentes auditadas para una URL live verificada o capturas de este caso. |
| documentation | MISSING | No se encontró evidencia de URL pública de documentación en las fuentes auditadas. |
| relationships | VERIFIED | Las referencias solo apuntan a IDs existentes; Drokex no añade conexiones editoriales sin fuente. Validación en tests de proyectos/grafo. |

## kliniu

Fuente base: `apps/web/data/projects/kliniu.ts`. Repositorio local asociado: `../kliniu`.

| Campo | Estado | Evidencia / hueco |
| --- | --- | --- |
| identity | VERIFIED | ID `kliniu`, slug y nombre presentes en `kliniu.ts`; unicidad cubierta por pruebas del repositorio. |
| overview | PARTIAL | El registro `kliniu.ts` contiene el campo; no se revalidó todo su contenido contra el producto actual. |
| status | VERIFIED | Sitio público responde y renderiza; production se limita a presencia pública, no certifica operaciones internas. |
| visibility | VERIFIED | Visibilidad pública autorizada por Daniel para los cuatro sitios; los restantes mantienen el indicador editorial existente. |
| technologies | PARTIAL | El registro `kliniu.ts` contiene el campo; no se revalidó todo su contenido contra el producto actual. |
| architecture | PARTIAL | El registro `kliniu.ts` contiene el campo; no se revalidó todo su contenido contra el producto actual. |
| features | PARTIAL | El registro `kliniu.ts` contiene el campo; no se revalidó todo su contenido contra el producto actual. |
| challenges | PARTIAL | El registro `kliniu.ts` contiene el campo; no se revalidó todo su contenido contra el producto actual. |
| engineeringDecisions | PARTIAL | El registro `kliniu.ts` contiene el campo; no se revalidó todo su contenido contra el producto actual. |
| lessonsLearned | PARTIAL | El registro `kliniu.ts` contiene el campo; no se revalidó todo su contenido contra el producto actual. |
| metrics | MISSING | No se encontró evidencia fechada suficiente en las fuentes auditadas. Campos numéricos establecidos en null; no se publican cifras históricas como actuales. |
| media | VERIFIED | Sitio cargado en navegador y capturas desktop/mobile en `site-verification.json` y `apps/web/public/projects/`. |
| repository | MISSING | No se encontró evidencia de enlace público autorizado en las fuentes auditadas. |
| live | VERIFIED | Sitio cargado en navegador y capturas desktop/mobile en `site-verification.json` y `apps/web/public/projects/`. |
| documentation | MISSING | No se encontró evidencia de URL pública de documentación en las fuentes auditadas. |
| relationships | VERIFIED | Las referencias solo apuntan a IDs existentes; Drokex no añade conexiones editoriales sin fuente. Validación en tests de proyectos/grafo. |

## vevi

Fuente base: `apps/web/data/projects/vevi.ts`. Repositorio local asociado: `../red-social`.

| Campo | Estado | Evidencia / hueco |
| --- | --- | --- |
| identity | VERIFIED | ID `vevi`, slug y nombre presentes en `vevi.ts`; unicidad cubierta por pruebas del repositorio. |
| overview | PARTIAL | El registro `vevi.ts` contiene el campo; no se revalidó todo su contenido contra el producto actual. |
| status | PARTIAL | El registro `vevi.ts` contiene el campo; no se revalidó todo su contenido contra el producto actual. |
| visibility | VERIFIED | Registro marcado public; se verifica el indicador, no permisos sobre información de terceros. |
| technologies | PARTIAL | El registro `vevi.ts` contiene el campo; no se revalidó todo su contenido contra el producto actual. |
| architecture | PARTIAL | El registro `vevi.ts` contiene el campo; no se revalidó todo su contenido contra el producto actual. |
| features | PARTIAL | El registro `vevi.ts` contiene el campo; no se revalidó todo su contenido contra el producto actual. |
| challenges | PARTIAL | El registro `vevi.ts` contiene el campo; no se revalidó todo su contenido contra el producto actual. |
| engineeringDecisions | PARTIAL | El registro `vevi.ts` contiene el campo; no se revalidó todo su contenido contra el producto actual. |
| lessonsLearned | PARTIAL | El registro `vevi.ts` contiene el campo; no se revalidó todo su contenido contra el producto actual. |
| metrics | MISSING | No se encontró evidencia fechada suficiente en las fuentes auditadas. Campos numéricos establecidos en null; no se publican cifras históricas como actuales. |
| media | MISSING | No se encontró evidencia en las fuentes auditadas para una URL live verificada o capturas de este caso. |
| repository | MISSING | No se encontró evidencia de enlace público autorizado en las fuentes auditadas. |
| live | MISSING | No se encontró evidencia en las fuentes auditadas para una URL live verificada o capturas de este caso. |
| documentation | MISSING | No se encontró evidencia de URL pública de documentación en las fuentes auditadas. |
| relationships | VERIFIED | Las referencias solo apuntan a IDs existentes; Drokex no añade conexiones editoriales sin fuente. Validación en tests de proyectos/grafo. |

## intranet-ess

Fuente base: `apps/web/data/projects/intranet-ess.ts`. Repositorio local asociado: `../intranet`.

| Campo | Estado | Evidencia / hueco |
| --- | --- | --- |
| identity | VERIFIED | ID `intranet-ess`, slug y nombre presentes en `intranet-ess.ts`; unicidad cubierta por pruebas del repositorio. |
| overview | PARTIAL | El registro `intranet-ess.ts` contiene el campo; no se revalidó todo su contenido contra el producto actual. |
| status | PARTIAL | El registro `intranet-ess.ts` contiene el campo; no se revalidó todo su contenido contra el producto actual. |
| visibility | VERIFIED | Registro marcado public; se verifica el indicador, no permisos sobre información de terceros. |
| technologies | PARTIAL | El registro `intranet-ess.ts` contiene el campo; no se revalidó todo su contenido contra el producto actual. |
| architecture | PARTIAL | El registro `intranet-ess.ts` contiene el campo; no se revalidó todo su contenido contra el producto actual. |
| features | PARTIAL | El registro `intranet-ess.ts` contiene el campo; no se revalidó todo su contenido contra el producto actual. |
| challenges | PARTIAL | El registro `intranet-ess.ts` contiene el campo; no se revalidó todo su contenido contra el producto actual. |
| engineeringDecisions | PARTIAL | El registro `intranet-ess.ts` contiene el campo; no se revalidó todo su contenido contra el producto actual. |
| lessonsLearned | PARTIAL | El registro `intranet-ess.ts` contiene el campo; no se revalidó todo su contenido contra el producto actual. |
| metrics | MISSING | No se encontró evidencia fechada suficiente en las fuentes auditadas. Campos numéricos establecidos en null; no se publican cifras históricas como actuales. |
| media | MISSING | No se encontró evidencia en las fuentes auditadas para una URL live verificada o capturas de este caso. |
| repository | PARTIAL | URL declarada en el registro; accesibilidad pública del repositorio no revalidada. |
| live | MISSING | No se encontró evidencia en las fuentes auditadas para una URL live verificada o capturas de este caso. |
| documentation | MISSING | No se encontró evidencia de URL pública de documentación en las fuentes auditadas. |
| relationships | VERIFIED | Las referencias solo apuntan a IDs existentes; Drokex no añade conexiones editoriales sin fuente. Validación en tests de proyectos/grafo. |

## lorigine

Fuente base: `apps/web/data/projects/lorigine.ts`. Repositorio local asociado: `../l origine`.

| Campo | Estado | Evidencia / hueco |
| --- | --- | --- |
| identity | VERIFIED | ID `lorigine`, slug y nombre presentes en `lorigine.ts`; unicidad cubierta por pruebas del repositorio. |
| overview | PARTIAL | El registro `lorigine.ts` contiene el campo; no se revalidó todo su contenido contra el producto actual. |
| status | VERIFIED | Sitio público responde y renderiza; production se limita a presencia pública, no certifica operaciones internas. |
| visibility | VERIFIED | Visibilidad pública autorizada por Daniel para los cuatro sitios; los restantes mantienen el indicador editorial existente. |
| technologies | PARTIAL | `../l origine/package.json` respalda dependencias principales; no valida los niveles de dominio declarados ni la totalidad de integraciones. |
| architecture | PARTIAL | El registro `lorigine.ts` contiene el campo; no se revalidó todo su contenido contra el producto actual. |
| features | PARTIAL | El registro `lorigine.ts` contiene el campo; no se revalidó todo su contenido contra el producto actual. |
| challenges | PARTIAL | El registro `lorigine.ts` contiene el campo; no se revalidó todo su contenido contra el producto actual. |
| engineeringDecisions | PARTIAL | El registro `lorigine.ts` contiene el campo; no se revalidó todo su contenido contra el producto actual. |
| lessonsLearned | PARTIAL | El registro `lorigine.ts` contiene el campo; no se revalidó todo su contenido contra el producto actual. |
| metrics | MISSING | No se encontró evidencia fechada suficiente en las fuentes auditadas. Campos numéricos establecidos en null; no se publican cifras históricas como actuales. |
| media | VERIFIED | Sitio cargado en navegador y capturas desktop/mobile en `site-verification.json` y `apps/web/public/projects/`. |
| repository | MISSING | No se encontró evidencia de enlace público autorizado en las fuentes auditadas. |
| live | VERIFIED | Sitio cargado en navegador y capturas desktop/mobile en `site-verification.json` y `apps/web/public/projects/`. |
| documentation | MISSING | No se encontró evidencia de URL pública de documentación en las fuentes auditadas. |
| relationships | VERIFIED | Las referencias solo apuntan a IDs existentes; Drokex no añade conexiones editoriales sin fuente. Validación en tests de proyectos/grafo. |

## 4ustudio-academy

Fuente base: `apps/web/data/projects/academy.ts`. Repositorio local asociado: `../4ustudio`.

| Campo | Estado | Evidencia / hueco |
| --- | --- | --- |
| identity | VERIFIED | ID `4ustudio-academy`, slug y nombre presentes en `academy.ts`; unicidad cubierta por pruebas del repositorio. |
| overview | PARTIAL | El registro `academy.ts` contiene el campo; no se revalidó todo su contenido contra el producto actual. |
| status | VERIFIED | Sitio público responde y renderiza; production se limita a presencia pública, no certifica operaciones internas. |
| visibility | VERIFIED | Visibilidad pública autorizada por Daniel para los cuatro sitios; los restantes mantienen el indicador editorial existente. |
| technologies | PARTIAL | `../4ustudio/package.json` respalda dependencias principales; no valida los niveles de dominio declarados ni la totalidad de integraciones. |
| architecture | PARTIAL | El registro `academy.ts` contiene el campo; no se revalidó todo su contenido contra el producto actual. |
| features | PARTIAL | El registro `academy.ts` contiene el campo; no se revalidó todo su contenido contra el producto actual. |
| challenges | PARTIAL | El registro `academy.ts` contiene el campo; no se revalidó todo su contenido contra el producto actual. |
| engineeringDecisions | PARTIAL | El registro `academy.ts` contiene el campo; no se revalidó todo su contenido contra el producto actual. |
| lessonsLearned | PARTIAL | El registro `academy.ts` contiene el campo; no se revalidó todo su contenido contra el producto actual. |
| metrics | MISSING | No se encontró evidencia fechada suficiente en las fuentes auditadas. Campos numéricos establecidos en null; no se publican cifras históricas como actuales. |
| media | VERIFIED | Sitio cargado en navegador y capturas desktop/mobile en `site-verification.json` y `apps/web/public/projects/`. |
| repository | MISSING | No se encontró evidencia de enlace público autorizado en las fuentes auditadas. |
| live | VERIFIED | Sitio cargado en navegador y capturas desktop/mobile en `site-verification.json` y `apps/web/public/projects/`. |
| documentation | MISSING | No se encontró evidencia de URL pública de documentación en las fuentes auditadas. |
| relationships | VERIFIED | Las referencias solo apuntan a IDs existentes; Drokex no añade conexiones editoriales sin fuente. Validación en tests de proyectos/grafo. |

## drokex

Fuente base: `apps/web/data/projects/drokex.ts`. Repositorio local asociado: `../drokex`.

| Campo | Estado | Evidencia / hueco |
| --- | --- | --- |
| identity | VERIFIED | ID `drokex`, slug y nombre presentes en `drokex.ts`; unicidad cubierta por pruebas del repositorio. |
| overview | PARTIAL | El registro `drokex.ts` contiene el campo; no se revalidó todo su contenido contra el producto actual. |
| status | VERIFIED | Sitio público responde y renderiza; production se limita a presencia pública, no certifica operaciones internas. |
| visibility | VERIFIED | Visibilidad pública autorizada por Daniel para los cuatro sitios; los restantes mantienen el indicador editorial existente. |
| technologies | PARTIAL | `../drokex/package.json` respalda dependencias principales; no valida los niveles de dominio declarados ni la totalidad de integraciones. |
| architecture | MISSING | No se encontró evidencia suficiente en las fuentes auditadas. Arrays vacíos; sin atribuir decisiones al autor. |
| features | PARTIAL | El registro `drokex.ts` contiene el campo; no se revalidó todo su contenido contra el producto actual. |
| challenges | PARTIAL | El registro `drokex.ts` contiene el campo; no se revalidó todo su contenido contra el producto actual. |
| engineeringDecisions | MISSING | No se encontró evidencia suficiente en las fuentes auditadas. Arrays vacíos; sin atribuir decisiones al autor. |
| lessonsLearned | MISSING | No se encontró evidencia suficiente en las fuentes auditadas. Arrays vacíos; sin atribuir decisiones al autor. |
| metrics | MISSING | No se encontró evidencia fechada suficiente en las fuentes auditadas. Campos numéricos establecidos en null; no se publican cifras históricas como actuales. |
| media | VERIFIED | Sitio cargado en navegador y capturas desktop/mobile en `site-verification.json` y `apps/web/public/projects/`. |
| repository | MISSING | No se encontró evidencia de enlace público autorizado en las fuentes auditadas. |
| live | VERIFIED | Sitio cargado en navegador y capturas desktop/mobile en `site-verification.json` y `apps/web/public/projects/`. |
| documentation | MISSING | No se encontró evidencia de URL pública de documentación en las fuentes auditadas. |
| relationships | VERIFIED | Las referencias solo apuntan a IDs existentes; Drokex no añade conexiones editoriales sin fuente. Validación en tests de proyectos/grafo. |

## Límites de esta revisión

- Drokex: rol y propiedad por confirmar. La ficha usa valores explícitos sin atribución de desarrollo completo.
- Decisiones, aprendizajes, niveles Expert y hitos heredados siguen siendo contenido editorial PARTIAL. La existencia de un grafo no los convierte en verificación independiente.
- Las métricas históricas sin fuente fechada se vacían. Los recuentos derivados de registros siguen disponibles como recuentos de contenido.
- Capturas corresponden a septiembre de 2026; no son vistas en tiempo real.
- La revisión funcional de Command Center se registra por separado en `review-validation.md`.
