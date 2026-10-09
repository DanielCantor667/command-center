# Kliniu - Fase 2: del plano al producto

Alcance aprobado en la conversacion: Kliniu exclusivamente, evolucion del showroom
Blender y caso editorial con la secuencia plano, espacio y aplicacion real.

## Implementacion

- [x] Versionar showroom v4: conservar geometria y capas v3; mejorar materiales,
  herrajes y luz. Exportar GLB y renders de espacio y plano desde Blender.
- [x] Caso Kliniu propio: identidad grande, captura real como destino de la
  transicion existente, secciones editoriales sin tarjetas decorativas.
- [x] Secuencia accesible Plano / Espacio / Producto: mismo modelo en Three.js,
  plano con aristas, materiales PBR y captura real. Controles por teclado,
  movimiento reducido, renders de respaldo y activacion 3D voluntaria en movil.
- [x] Seleccionar decisiones contrastadas con el codigo local de Kliniu, sin
  metricas inventadas ni publicar detalles privados del panel.
- [x] Vitest, TypeScript, ESLint y Chrome real en escritorio/movil. Comprobar
  canvas no vacio, cambios visuales, navegacion, fallback y entrada Fase 1.

## Limites

Sin dependencias nuevas, sonido, otras marcas, infraestructura, commit o deploy.
No modificar el repositorio Kliniu. Preservar trabajo previo sin revertirlo.
No secuestrar scroll. Canvas bajo demanda y limitado a su seccion visible.
Las maquetas representan una interpretacion del catalogo, no un local construido.

## Arquitectura

PortfolioCase deriva Kliniu a un componente especifico; los demas siguen iguales.
El visor aislado carga R3F solo al activarse y usa el GLB v4, compartido con la
ciudad. Los materiales clonados y aristas propias se liberan al desmontar.
La captura principal mantiene el nombre de View Transition kliniu-surface.

Verificacion: docs/product/portfolio-3d-evidence/kliniu-phase-2-validation.md.
