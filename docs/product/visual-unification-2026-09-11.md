# Unificación visual — 11 de septiembre de 2026

Alcance aprobado: extender el lenguaje de la ciudad a las fichas y al laboratorio, con navegación coherente y continuidad del 3D.

## Implementación

- Paleta compartida papel/piedra, tinta y verde; colores de cada proyecto centralizados.
- Cabecera del laboratorio con Daniel Cantor y Taller digital, retorno a la ciudad y sección actual.
- Se reemplazaron los fondos oscuros, neón y brillos del shell anterior. El laboratorio utiliza la misma presentación clara que las fichas; se retiró su selector de tema independiente.
- Navegación lateral en escritorio y lista horizontal desplazable en móvil, con selección visible.
- Jerarquía de títulos, paneles, bordes y espaciados alineada con el portafolio. Nombres principales en español.
- Las fichas permiten abrir y cerrar el distrito en 3D, reutilizando el cargador y las escenas de la ciudad. En móvil, el cargador mantiene la activación explícita. El canvas se desmonta al cerrar.
- Cuadrículas de Capacidades adaptadas a una columna en móvil para evitar desbordamientos.

## Verificación en navegador

Playwright contra el servidor local en el puerto 3002:

- Recorrido por El taller, Perfil, Proyectos, Bitácora, Análisis, Capacidades, Laboratorio 3D y Contacto a 1440 y 390 px.
- Navegación de los ocho apartados a 320 px, comprobando también el ancho del contenido del workspace, sin desbordamiento horizontal.
- Apertura y cierre de la maqueta en la ficha de Kliniu, montaje y desmontaje del canvas.
- Navegación directa entre fichas y retorno desde la identidad de cabecera.
- Sin errores de JavaScript en el recorrido probado.

Las pruebas cubren presentación y navegación; no se ejecutaron generación remota, guardado en nube ni renderizado de pago. Cambios locales, pendientes de commit y despliegue.
