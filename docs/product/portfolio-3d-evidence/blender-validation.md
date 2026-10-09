# Blender: modelado e integracion

Fecha: 2026-09-14. Rama: codex/portfolio-realistic-modeling.

## Entregables

- Fuente reproducible: `blender/generate_realistic_workshop.py`.
- Fuente editable final: `blender/output/realistic-workshop/workshop-realistic-final.blend`.
- Render general Cycles de 1600 x 1200 y cuatro detalles de 1200 x 1000
  en `blender/output/realistic-workshop/`.
- Cinco GLB: cuatro pabellones y base con vegetacion, en
  `apps/web/public/models/workshop/`.
- Poster JPEG local: `apps/web/public/experience/workshop-blender-final.jpg`.

Se modelo, exporto y renderizo mediante el MCP de Blender 5.1.2. Se abrio
Blender y activo su servidor existente; no se instalaron servicios nuevos.
La escena original se conservo. Los edificios son conceptos de portafolio,
no representaciones documentales de sedes reales.

## Produccion

Pabellones con cristales, montantes, interiores amueblados, piano con teclas,
arquerias, cubierta industrial y vegetacion con hojas individuales. Materiales
PBR, biseles, iluminacion interior y render Cycles final con 96 muestras y denoising.
Las copias de exportacion agrupan geometria por material; las piezas originales
siguen separadas en Blender. Cada pabellon exporta 13 grupos de material.

Para reproducir mediante MCP: ejecutar el archivo con `runpy.run_path`, llamar
`build()`, `export_and_stage()`, renderizar con `bpy.ops.render.render(write_still=True)`
y luego `render_details()`. Los renders se ejecutaron con un timer de Blender
para mantener separada la solicitud del trabajo de renderizado.

La pasada de acabado `render_final()` guarda una fuente final y cinco imagenes
`*-cycles-final.png`. Ajusta contraste de luces y calcula el encuadre a partir
de los limites proyectados de cada edificio. Las tomas individuales ocultan
la escultura central y la vegetacion de otros distritos para evitar oclusiones.

## Verificacion

- Vitest: 4 pruebas de experience aprobadas.
- TypeScript: tsc --noEmit aprobado tras la integracion final.
- ESLint: los tres componentes de integracion sin errores.
- Playwright: 1440, 390 y 320 px; sin overflow horizontal.
- Seleccion desde maqueta y selector HTML, acercamiento y giro comprobados.
- Los bitmaps del canvas cambian al acercar y arrastrar.
- Poster cargado y activacion manual verificada en movil.
- Ultima pasada: cero pageerrors y cero respuestas HTTP fallidas.
- Capturas de escritorio, canvas enfocado y movil revisadas visualmente.

## Limites

El render de Cycles y WebGL no tienen la misma iluminacion. El microrelieve
procedural de Blender no esta horneado en los GLB. El resultado es una maqueta
arquitectonica mas detallada, no una replica fotorealista exacta del mockup IA.
Los renders y el .blend estan en una carpeta de salida ignorada por Git;
la fuente Python permite regenerarlos. No se hizo build de produccion,
commit, push ni despliegue.
