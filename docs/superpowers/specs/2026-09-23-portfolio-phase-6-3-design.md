# Portafolio - Fase 6.3: identidad de los cuatro casos

Estado: objetivo aprobado por Daniel con "aplica a los 4" y especificacion aprobada con "listo empieza" el 23 de septiembre de 2026. Plan de implementacion pendiente de revision.

## Intencion

Hacer que Kliniu, L'ORIGINE, 4U Studio Academy y Drokex se sientan como cuatro trabajos distintos dentro de un portafolio coherente, y que una visita breve explique la participacion de Daniel sin confundir renders conceptuales con interfaces publicadas ni inventar resultados.

Exito: en el primer viewport de cada caso se identifican el proyecto, su naturaleza, la participacion documentada y el camino para explorar evidencia real; la portada no tapa el inicio de la seccion siguiente en 1440x1000, 1920x1080, 390x844 y 320x568. Las transiciones de fase 6.2, foco y navegacion siguen funcionando.

## Diagnostico

- Los cuatro casos ya tienen una estructura editorial propia. L'ORIGINE, Academy y Drokex usan renders Blender de apertura y escenas interactivas mas abajo; Kliniu abre con una captura real del sitio.
- La participacion esta descrita en secciones posteriores, no siempre disponible al primer vistazo. Los renders conceptuales y la evidencia del producto deben conservar una separacion clara.
- Drokex declara propiedad no confirmada. No mostrar cifras comerciales, premios o autoria exclusiva sin fuente.
- Ya existe una transicion nativa entre casos. Rehacerla o agregar otro canvas en la portada aumentaria costo y fragilidad sin resolver el problema principal.

## Alternativas

1. **Pulido editorial sobre casos existentes (recomendada).** Componer mejor las aperturas, adelantar contexto verificable, animar solo capas visuales y ajustar mobile. Reutiliza renders y escenas 3D existentes; bajo riesgo de rendimiento.
2. **Cuatro heroes WebGL nuevos.** Mas profundidad interactiva pero cuatro canvases adicionales, carga y complejidad de salida. No recomendado para esta fase.
3. **Cuatro renders Blender nuevos.** Posible si los actuales fallan en composicion, pero no hay evidencia de esa necesidad; requiere otra fase de produccion y QA de assets.

## Direccion visual

- **Kliniu:** conservar la captura real como pieza principal. Presentar el titulo y una introduccion B2B precisa; la captura entra con un recorte corto, sin escalar o deformar la interfaz. Acentos teal discretos y superficies blancas.
- **L'ORIGINE:** usar la galeria blanca existente como portada inmersiva; revelar marca y estructura tipografica con ritmo mas pausado. La evidencia publicada permanece claramente separada del render conceptual.
- **4U Studio Academy:** aprovechar la sala musical Blender existente y una composicion de titulos que respete instrumentos y punto focal. Movimiento leve de profundidad, no sonido automatico.
- **Drokex:** mantener la lectura de plataforma/directorio; acento lima muy medido y narrativa de red. La participacion se formula como rol documentado en CV, con propiedad no confirmada visible antes de cualquier afirmacion de impacto.

Las cuatro aperturas comparten un patron de informacion, no una plantilla visual identica: categoria, titulo, problema o funcion de la plataforma, participacion verificable y enlace claro a la evidencia. El H1 sigue siendo el nombre del proyecto. No se introducen porcentajes, testimonios, premios ni numeros no documentados.

## Movimiento y continuidad

- Entrada breve de tipografia y media (aprox. 350-600 ms) al montar cada caso, una sola vez. Usar transform/opacity o clip-path donde no distorsione el render; no animar layout ni bloquear clics.
- Parallax muy leve solo donde la composicion lo soporte y solo con puntero fino; evitar seguimiento continuo en movil. La escena 3D interactiva existente sigue en su seccion, con su opt-in y fallback actuales.
- Respetar `prefers-reduced-motion`, pantalla sin API de View Transitions y la transicion de fase 6.2. Al cambiar de caso, el efecto nuevo no compite con el barrido direccional.
- El final de cada caso conserva Anterior/Siguiente. Una pista visual del proyecto siguiente puede reutilizar su miniatura existente, sin precargar un nuevo canvas ni alargar el cambio de 440 ms.

## Mobile y accesibilidad

- No superponer H1, informacion de rol, controles y objeto central en 390x844 o 320x568. El encabezado y las acciones de salida siempre accesibles; la siguiente seccion asoma en el primer viewport.
- Minimo de 44 px para controles, foco visible, texto legible sobre imagen, `alt` que distingue render conceptual de captura real. La portada no crea una segunda jerarquia de navegacion.
- Los textos largos se adaptan con ancho y saltos de linea; no se reduce fuente segun ancho de viewport ni se usa letter-spacing negativo.

## Contratos de contenido

- Fuente primaria para el rol y estado: `apps/web/data/projects/*` y evidencia ya publicada en los casos. Si una afirmacion no se puede corroborar, omitirla o marcarla como no documentada.
- En Drokex, mantener la nota de propiedad no confirmada cerca del resumen de participacion. Los renders siguen rotulados como conceptuales.
- No modificar sitios externos, bases de datos, cuentas, contenidos de marca ni datos de proyecto para fabricar un caso mas convincente.

## Superficie prevista

Los cuatro archivos `*-case.tsx` y sus CSS Modules son propietarios de las portadas y cierres. Un componente compartido pequeño para el resumen de participacion solo si evita duplicacion real sin aplanar su identidad. `ExperienceGate` y `globals.css` de fase 6.2 se tocan solo ante un conflicto comprobado. Sin nuevas dependencias ni cambios a los modelos 3D por defecto.

## Validacion requerida

1. Pruebas de contenido y accesibilidad para los cuatro casos: H1, rol, nota de atribucion de Drokex, enlaces, orden de foco y movimiento reducido.
2. Chrome real: capturas del primer viewport y el cierre en 1440x1000, 1920x1080, 390x844 y 320x568; verificar contraste, ausencia de desbordes/solapes, imagen no vacia y pista de la siguiente seccion.
3. Regresion de entrada/retorno de la ciudad, navegacion Anterior/Siguiente, 3D opt-in movil, suite completa, TypeScript, ESLint y `git diff --check`. Documentar limites; mantener servidor local.

## No incluido

Nuevos renders Blender, cuatro escenas WebGL nuevas, sonido, scroll secuestrado, analytics, backend, cifras inventadas, cambios a repositorios de marcas, provisioning, deploy, commit o push. Cualquier expansion se propone como otra fase, no se asume aqui.

## Siguiente aprobacion

Daniel revisa esta especificacion. Tras su visto bueno se redacta y revisa el plan de implementacion detallado. Solo entonces empieza codigo de producto.
