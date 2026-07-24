# Sprint 0.8: 3D Studio Experience

## Estado

Implementado y verificado el 2026-07-24.

## Objetivo

Convertir el vertical slice técnico de oficinas 3D en una experiencia coherente de producto:
jerarquía visual clara, controles legibles, edición espacial sin duplicar geometría y acceso
directo al ciclo proyecto → revisión → render.

## Resultado

- El módulo se presenta como **3D Office Studio**, con contexto del preset, área y activos.
- El brief agrupa capacidad, estilo, instrucción opcional y generación en una sola franja.
- Canvas, toolbar, catálogo, inspector, readiness y galería comparten tokens semánticos.
- El rail derecho mantiene catálogo y propiedades visibles sin comprimir el editor.
- La carcasa arquitectónica se dibuja una sola vez; el asset lógico `office` ya no duplica muros.
- Cámara, transparencia de paredes y profundidad se ajustaron para leer mejor el espacio.
- La interfaz se adapta a escritorio y viewport compacto sin desbordamiento horizontal.

## Validación funcional

La prueba manual automatizada en navegador cubrió:

1. Abrir el Lab y generar una escena.
2. Añadir un activo desde la biblioteca.
3. Seleccionarlo y verificar el inspector.
4. Autenticarse con un usuario temporal de Supabase.
5. Crear un proyecto y una segunda revisión.
6. Encolar un render y procesarlo con:

   ```bash
   pnpm --filter @command-center/web render:worker
   ```

7. Confirmar los enlaces PNG y GLB del job completado.
8. Eliminar el usuario y los datos temporales de QA.

También deben pasar `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm blender:test`,
`pnpm blender:validate` y `git diff --check`.

## Decisiones de interfaz

- Los espacios usan la escala real del design system, cuya unidad base es un píxel.
- Colores y bordes usan tokens (`panel`, `surface`, `accent`, `text`) para conservar temas.
- Las acciones primarias tienen una sola zona de énfasis; estados y metadatos usan chips.
- El editor prioriza el canvas y mueve herramientas secundarias a un rail de 320 px.
- La geometría procedural queda como fallback visual; los GLB siguen siendo la fuente compartida
  para web y Blender.

## Siguiente fase recomendada

La base de producto está lista. La siguiente fase debería hacer el sistema utilizable fuera del
entorno local:

1. Mover PNG y GLB a Supabase Storage o almacenamiento S3 compatible.
2. Ejecutar el worker Blender como proceso persistente con reintentos, timeout y cancelación.
3. Añadir muros, puertas, ventanas y dimensiones paramétricas.
4. Implementar circulación, colisiones y métricas espaciales accionables.
5. Incorporar organizaciones, permisos y enlaces compartidos de sólo lectura.

Storage y worker persistente son la prioridad: eliminan la dependencia del filesystem y del
comando manual sin cambiar el contrato actual de `RenderJob`.
