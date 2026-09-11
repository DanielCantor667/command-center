# Contrato del producto

Command Center es un sistema de evidencia explorable de la ingeniería de Daniel.

| Superficie | Puede mostrar | No puede generar | Fuente |
| --- | --- | --- | --- |
| Experience / City | Identidad y entradas a casos; vistas reales | Proyectos o métricas propios | PROJECTS, PUBLIC_PROFILE; CITY_ASSETS solo aporta geometría |
| Projects | Propósito, rol, tecnología, capturas, decisiones, enlaces | Claims sin fuente, resultados supuestos | PROJECTS |
| Knowledge | Relaciones entre proyectos y tecnologías | Relaciones sin origen | Grafo derivado de registros |
| Evidence | Trazabilidad de capacidades | Credenciales o pruebas de rendimiento | Motor derivado; no verificación externa automática |
| Mission | Trayectoria documentada | Fechas o hitos inventados | MILESTONES, con limitaciones en auditoría |
| Profile / Communication | Identidad y canales profesionales | Resultados ni autoría no confirmados | PUBLIC_PROFILE |

## Integridad

- Cada afirmación técnica necesita fuente. Una dependencia en package.json prueba presencia, no dominio experto ni uso correcto.
- Las métricas son mediciones con fuente y fecha o null. El recuento de decisiones representa registros editoriales, no impacto comercial.
- Los enlaces live solo se muestran cuando existen. Capturas: archivos locales públicos con origen y fecha; sin sesiones privadas.
- La ciudad es mejora visual. Los botones y fichas son accesibles sin WebGL.
- Los seis GLB históricos conservan identidad. Drokex usa geometría procedural hasta tener un asset propio.
- Los proyectos sin URL siguen siendo casos documentados, no productos públicos verificados.
- Una ficha abre su evidencia antes de la lista; el visitante puede continuar, volver a ciudad o contactar.
