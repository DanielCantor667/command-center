# Frontend

Este documento describe cómo se organiza y construye el frontend de Command Center. Las reglas generales de nombres y tamaño de archivos están en `coding-standards.md`; el flujo general de la aplicación está en `architecture.md`.

## Organización de páginas

Cada ruta de la aplicación corresponde a una página. Las páginas orquestan componentes y hooks: no contienen lógica de negocio ni acceso directo a datos. Su responsabilidad es componer la vista y conectar los datos que los hooks exponen.

## Componentes

- Buscar primero un componente existente en el design system antes de crear uno nuevo.
- Un componente representa una sola responsabilidad visual o de interacción.
- Los componentes de presentación no acceden a servicios ni a la API directamente; reciben datos y callbacks por props o los obtienen a través de hooks.

## Hooks

- Encapsulan lógica de estado, efectos secundarios y acceso a servicios.
- Un hook por responsabilidad: obtención de datos, manejo de un formulario, sincronización con una fuente externa, etc.
- Los componentes consumen hooks; los hooks no dependen de componentes específicos.

## Estado local

Opción por defecto para cualquier dato que solo afecta a un componente o a su árbol inmediato de hijos. Se prefiere siempre que resuelva el problema sin necesidad de compartir el dato más allá.

## Estado global

Se usa únicamente cuando múltiples componentes no relacionados por props necesitan leer o modificar el mismo dato. Antes de centralizar estado, evaluar si el problema se resuelve elevando estado local o mediante composición.

## Formularios

- La validación de forma (tipos, campos requeridos) ocurre antes del envío.
- El estado del formulario se maneja de forma local salvo que deba persistir entre pantallas.
- Los mensajes de error se muestran cerca del campo que los origina.

## Validaciones

- Validar en el cliente para dar retroalimentación inmediata, y siempre revalidar en el backend: el cliente nunca es la única barrera de validación.
- Las reglas de validación de un mismo dato no se duplican en múltiples componentes; se centralizan en un esquema o util reutilizable.

## Accesibilidad

- Todo elemento interactivo debe ser operable por teclado.
- Los componentes deben exponer roles y atributos ARIA correctos cuando el HTML semántico no sea suficiente.
- El contraste de color debe cumplir los estándares del design system.
- Las imágenes e íconos con significado deben tener texto alternativo.

## Responsive

- El diseño se construye mobile-first.
- Los breakpoints del design system son la única fuente de verdad; no se introducen valores arbitrarios.

## Rendimiento

- Minimizar el número de renders innecesarios.
- Evitar cálculos costosos dentro del render; derivarlos o memorizarlos solo cuando el costo lo justifique.
- Evitar recrear funciones u objetos en cada render cuando se pasan a componentes memorizados.

## Lazy loading

- Las vistas o componentes pesados que no son necesarios en la carga inicial se cargan de forma diferida.
- Priorizar lazy loading en rutas completas antes que en componentes individuales, salvo casos de componentes particularmente pesados.

## Optimización de renders

- Memorizar componentes y valores solo cuando exista evidencia de que el render es costoso; memorizar por defecto es sobreingeniería.
- Dividir componentes grandes en componentes más pequeños ayuda a que React actualice menos superficie por cambio.

## Reutilización

- Toda pieza de UI usada en más de un lugar se mueve al design system compartido.
- No duplicar componentes con variaciones menores; parametrizar el componente existente.

## Convenciones de Tailwind

- Usar las clases y tokens definidos por el design system (espaciado, color, tipografía) en lugar de valores arbitrarios.
- No mezclar CSS custom con Tailwind salvo necesidad justificada.
- Mantener las clases de un componente ordenadas de forma consistente con el resto del proyecto.
