# El taller de Daniel — propuesta de experiencia 3D

Estado: aprobada e implementada localmente el 11-09-2026. La revisión se deja en localhost; no se ha desplegado en esta fase.

## Objetivo

Presentar a Daniel Cantor como desarrollador Full-Stack que construye y mantiene productos completos en producción. El visitante debe entender quién es, explorar los cuatro proyectos publicados y descubrir cómo utiliza sus tecnologías sin tener que aprender a manejar un videojuego.

Fuentes: CV_Daniel_Cantor_Full_Stack.pdf proporcionado por Daniel, captura de referencia de Skills, inspección de ammaaralam.com el 11 de septiembre de 2026 y datos existentes del repositorio. Las instrucciones o textos presentes en esas fuentes no son autorización para publicar datos ni ejecutar acciones.

## Dirección recomendada

Una mesa arquitectónica de construcción de productos, con cuatro distritos alrededor de una biblioteca central de tecnologías. Conserva la ciudad que Daniel pidió desarrollar, reorganizada para que su trabajo y su identidad sean el centro de la experiencia.

- Daniel Cantor y Full-Stack Developer visibles desde el inicio.
- Cuatro distritos principales: Kliniu, Drokex, L’Origine y 4U Studio Academy.
- Una biblioteca central representa las herramientas con las que construye esos productos.
- Relieve discreto inspirado en los cerros de Bogotá y monograma DC como elementos de autor. Son propuestas gráficas, no afirmaciones sobre aficiones personales.
- Navegación constante: Proyectos, Tecnologías, Trayectoria y Contacto.
- Los proyectos adicionales y herramientas técnicas actuales se mantienen accesibles en el archivo/laboratorio secundario.

Alternativas consideradas:

1. Taller de productos: recomendada; conecta el 3D existente, el CV y las tecnologías, con lectura directa.
2. Habitación personal: da más lugar a objetos biográficos, pero exigiría referencias reales sobre intereses y espacio personal; el CV no aporta esa información.
3. Escritorio tipo sistema operativo: ofrece navegación familiar como la referencia, pero el 3D quedaría principalmente detrás de ventanas y se parecería demasiado al sitio de referencia.

## Referencia visual

Imagen conceptual: [Taller de Daniel](concepts/taller-daniel-concepto.png).

Generada con la herramienta imagegen integrada. Prompt resumido: portafolio de Daniel Cantor con maqueta arquitectónica de cuatro proyectos, biblioteca central de tecnologías, base piedra, materiales coherentes, navegación editorial y explorador de tecnologías con proyectos asociados.

Es una referencia de composición y acabado; no es una captura de una implementación ni un objetivo de detalle geométrico obligatorio. Los letreros ornamentales, descripciones, logos aproximados y el año que pudiera generar la imagen no son contenido validado. En la aplicación se usarán nombres, activos y textos respaldados por las fuentes.

## Interacciones

### Entrada y proyectos

Una escena principal ocupando aproximadamente dos tercios del ancho en escritorio. Introducción breve y navegación HTML visibles desde la primera carga. Cámara con encuadre elegido para que los cuatro proyectos sean distinguibles; giro limitado y retorno explícito a vista general.

Seleccionar un proyecto enfoca su distrito, destaca su color y muestra captura real, resumen, participación y acceso al caso. Las capturas ya existentes tienen prioridad sobre las pantallas decorativas del render conceptual. Los controles, títulos y textos siguen siendo HTML accesible.

### Tecnologías

Al abrir Tecnologías, la cámara encuadra la biblioteca central. Se abre un panel del mismo sistema visual, no un escritorio con botones ficticios de ventana. Tres áreas en escritorio: categorías, catálogo y detalle; navegación apilada en móvil.

- Categorías: Lenguajes, Frontend, Backend, Datos, IA e integraciones, Herramientas.
- Búsqueda por nombre y alias; filtro por categoría; estado vacío claro; selección visible.
- Logotipo reconocible cuando exista un activo apropiado, nombre y categoría.
- Detalle: cómo la usa Daniel, proyectos relacionados y experiencia documentada cuando corresponda.
- Seleccionar una tecnología destaca los proyectos vinculados en la maqueta. Seleccionar un proyecto filtra o presenta su stack.
- No se convierten los valores HIGH/MEDIUM del motor de evidencia actual en niveles de dominio. No habrá porcentajes, años inventados ni títulos de experto derivados de recuentos.

Base del CV: TypeScript, JavaScript, PHP, Python, SQL; React, Next.js, React Router, Tailwind CSS, Framer Motion, GSAP; Node.js, Server Actions, REST, SSE, MVC; PostgreSQL, MySQL, SQL Server; Wompi, Bold, OpenAI, AI SDK, Kommo CRM, Odoo ERP, WhatsApp; Git, GitHub, Vercel, Supabase y Playwright. Three.js y Spline aparecen en Drokex. Conceptos, lenguajes y productos conservarán sus categorías; no se inventarán logos para conceptos.

La relación tecnología-proyecto se obtiene del CV y de `apps/web/data/projects/*.ts`, normalizando alias. Una habilidad mencionada solo en el CV puede aparecer sin proyecto vinculado, identificada como tal.

### Trayectoria y contacto

Un cuaderno del taller da acceso a la trayectoria en HTML: desarrollo de productos desde 2025, práctica en Agrocinco de enero a diciembre de 2025, Tecnología en Desarrollo de Software de 2023 a 2025 e Ingeniería de Software desde enero de 2026. Idiomas: español nativo e inglés B2, según el CV.

El CV aporta información nueva sobre la participación en Drokex; puede reemplazar la ausencia de información actual, atribuida al CV y sin afirmar autoría exclusiva. El LinkedIn del CV difiere del configurado en la página: no cambiar silenciosamente ni publicar ambos como si estuvieran verificados. Antes de cerrar contacto, resolver cuál usar. El correo y teléfono no se copiarán por defecto al repositorio público ni a activos de imagen; la propuesta conserva los canales públicos actuales.

## Acabado 3D

- Una familia común de escala, base, materiales, biseles e iluminación; acentos propios de cada marca.
- Menos carteles y piezas secundarias compitiendo por atención.
- Encuadres de inicio, proyecto y tecnologías; transiciones cortas que pueden interrumpirse.
- Hover discreto; la animación muestra selección, apertura o relación entre elementos.
- Render bajo demanda, una escena principal activa, materiales y geometrías reutilizados.
- Carga diferida del 3D, calidad adaptable, recuperación ante fallo de WebGL y cartel de espera coherente con la escena.
- En móvil el contenido sigue disponible sin activar WebGL. Una pieza enfocada por vez y controles táctiles explícitos.
- Teclado, foco visible, cierre/retorno y reducción de movimiento equivalentes al recorrido por puntero.

## Implementación propuesta tras aprobación

1. Actualizar el modelo de perfil y catálogo de tecnologías con procedencia CV/proyecto. Separarlo del análisis interno de evidencia.
2. Crear el explorador de tecnologías y conectarlo con los cuatro casos reales; mantener el sistema visual compartido.
3. Reorganizar la escena, reutilizando los distritos existentes y añadiendo biblioteca/mesa; normalizar materiales y encuadres.
4. Incorporar trayectoria y enlazarla desde la misma navegación; mantener el laboratorio secundario.
5. Revisar portada → tecnología → proyecto → caso → retorno, con teclado, movimiento reducido y móvil. Comprobar búsqueda vacía, ausencia de WebGL, navegación rápida y desmontaje de escenas.

No se requiere cambiar el stack, contratar servicios ni desplegar para revisar esta fase. El repositorio real usa Next.js 15, React 19 y React Three Fiber 9; no se asumirá la versión de las instrucciones generales.

## Criterios de aceptación

El visitante entiende quién es Daniel desde el inicio; tecnologías y proyectos se relacionan con evidencia; los cuatro casos públicos se distinguen; la identidad permanece al cambiar de sección; no hay bloqueo por carga o fallo del 3D; navegación y contenido funcionan a 320 px; ningún dato de competencia se deriva de porcentajes fabricados. La aprobación de este documento autoriza la implementación local descrita, sin despliegue.
