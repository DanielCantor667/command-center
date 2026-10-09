# Kliniu - recorrido guiado

Fase aprobada por Daniel: conectar el showroom existente con evidencia del producto.

1. Tres puntos sincronizados entre la maqueta y controles HTML: catalogo, compra y arquitectura.
2. Catalogo y compra muestran capturas reales ya obtenidas del sitio publico. Compra describe cantidades, cotizacion y WhatsApp; no simula un pago.
3. Arquitectura muestra un esquema editorial del stack comprobado en el repositorio local, no una captura ficticia de administracion.
4. Mantener acceso al caso, sitio y contacto. El contenido sigue accesible sin WebGL.
5. Ajustar encuadre movil e iluminacion nocturna, sin cambiar los modelos Blender aprobados.
6. Verificar estados y navegacion con Vitest y navegador real en escritorio y movil, incluyendo movimiento reducido y ausencia de WebGL.

Direccion visual: conservar tipografia y fondo del portafolio; acento turquesa Kliniu, iconos lucide, controles de 44px, contenido sin tarjetas anidadas, imagen completa con proporcion estable. La maqueta sigue siendo protagonista.

Fuera de alcance: otros recorridos, nuevas integraciones, cambios en Kliniu, despliegue y provisionamiento.

Fuentes: capturas `docs/product/portfolio-3d-evidence/kliniu-reference-{desktop,product}.png`; repositorio Kliniu `package.json`, `lib/prisma.ts`, `lib/products.ts`.
