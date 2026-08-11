# Modelo de producto de Command Center

Command Center es un sistema de evidencia explorable de la ingeniería de Daniel. No es un sistema operativo para los negocios de sus clientes ni una aplicación de CRM.

El recorrido de consulta va de descubrimiento a profundidad:

```text
Experience / Engineering City -> Projects -> Knowledge + Evidence -> Mission + Profile
```

Cada superficie responde una pregunta distinta. Deben compartir referencias a la misma fuente, no copiar ni reinterpretar el contenido de otra superficie.

## Contrato de superficies

| Superficie | Puede mostrar | No puede generar | Fuente |
| --- | --- | --- | --- |
| Experience / Engineering City | La promesa del producto, identidad visual de proyectos, entradas a proyectos o módulos y un acceso alternativo si WebGL no está disponible. | Un dossier propio de ciudad, detalles editoriales que ya pertenecen a Projects, métricas, resultados o enlaces públicos no verificados. | Referencias de proyectos desde `PROJECTS`; disponibilidad de rutas y enlaces verificados. |
| Projects | El dossier completo: propósito, estado, visibilidad, alcance, stack, media permitida, retos, decisiones, lecciones y enlaces verificados. | Datos que no estén soportados por `PROJECTS` o evidencia relacionada; un CTA público cuando falta `links.live`. | `PROJECTS` y Evidence relacionado. |
| Knowledge | Tecnologías, patrones, decisiones, retos y lecciones conectados entre proyectos. | Relaciones entre nodos sin un proyecto, decisión o fuente que las sostenga; una copia del dossier editorial del proyecto. | Knowledge Graph trazable a `PROJECTS`, decisiones y fuentes existentes. |
| Evidence | Fuentes, decisiones, resultados y relaciones que permiten comprobar una afirmación. | Evidencia sintética, resultados sin respaldo o relaciones sin trazabilidad. | Proyecto, decisión o fuente existente con referencia verificable. |
| Mission | Trayectoria, evolución y lecciones que atraviesan proyectos. | Hitos, fechas, resultados o eventos no sustentados por un proyecto, decisión o fuente existente. | Proyectos y Evidence relacionados. |
| Profile | Identidad profesional, principios y contexto de Daniel sustentados por su trabajo. | Claims profesionales sin respaldo, biografía que sustituya evidencia o afirmaciones de capacidades sin referencias. | Datos de perfil respaldados por proyectos, decisiones, Evidence o fuentes existentes. |

## Reglas de integridad

- `PROJECTS` es la fuente de verdad de cada proyecto. Una superficie consumidora referencia sus datos; no mantiene una versión paralela.
- Una métrica es real o es `null`. La ausencia se representa como ausencia, nunca como un valor de relleno.
- `links.live` es opcional. Si no existe o no fue verificado, no se muestra un CTA público.
- Los proyectos privados pueden aparecer solo con información no confidencial suficiente. Los detalles restringidos se omiten.
- Toda relación de Knowledge o Evidence conserva un vínculo hacia el proyecto, la decisión o la fuente que la respalda.
- La ciudad es discovery y Projects es profundidad: abrir un proyecto desde Experience debe conducir al dossier, no a un duplicado.

## Estándar para afirmaciones y decisiones

Una decisión solo puede publicarse con sus tres partes y una fuente trazable:

| Campo | Regla |
| --- | --- |
| Decisión | Describe qué se eligió, sin atribuir intención no documentada. |
| Contexto | Explica el problema o la restricción usando información de la fuente. |
| Resultado | Registra el efecto conocido; si no existe evidencia, se declara la ausencia. |
| Fuente | Enlaza al proyecto, registro de decisión, repositorio, documento o evidencia existente. |

No se publican los claims “experto”, “escalable” o “alto rendimiento”, ni números sin prueba. Una afirmación de capacidad debe apuntar a evidencia concreta y verificable.

## Aplicación del contrato

Antes de publicar un dato, la superficie responsable debe comprobar:

1. Que responde a la pregunta de esa superficie y no duplica el dossier de Projects.
2. Que la fuente existe, es accesible para la audiencia prevista y respalda el dato mostrado.
3. Que una relación, métrica, resultado o hito puede rastrearse hasta su origen.
4. Que la ausencia de evidencia se muestra como ausencia, sin sustituirla por contenido inventado.
