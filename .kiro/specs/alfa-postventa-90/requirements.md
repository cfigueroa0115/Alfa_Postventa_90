# Requirements Document

## Introduction

Alfa Postventa 90 es un prototipo web de autogestión postventa digital para Seguros Alfa. Su propósito es demostrar cómo transformar procesos postventa dependientes de formularios PDF en una experiencia digital guiada, validada, medible y trazable. El prototipo implementa de punta a punta el proceso prioritario "Actualización de datos de contacto", desde la orientación inicial hasta el cierre y medición de experiencia.

Este prototipo constituye una prueba de concepto para la posición de "Especializado de Negocio y Funcional en Canales Digitales" y se despliega en Vercel con persistencia en Neon PostgreSQL.

## Glossary

- **Sistema**: El prototipo web Alfa Postventa 90
- **Asegurado**: Titular de una póliza de Seguros Alfa que necesita actualizar sus datos de contacto
- **Selector_Guiado**: Componente que orienta al asegurado hacia el proceso correcto según su necesidad
- **Checklist_Requisitos**: Pantalla que presenta los requisitos previos y tiempo estimado antes de iniciar un trámite
- **Formulario_Wizard**: Formulario multi-paso con indicador de progreso para captura de datos
- **Radicado**: Código único de seguimiento generado al radicar una solicitud (formato DEMO-ALFA-YYYYMMDD-XXXX)
- **CES**: Customer Effort Score, métrica de esfuerzo percibido por el usuario
- **Dashboard_Métricas**: Panel que muestra indicadores clave del embudo de conversión y experiencia
- **Sesión_Demo**: Registro anónimo de una visita al prototipo
- **Evento_Tracking**: Registro de una acción del usuario durante el recorrido
- **Timeline_Estado**: Visualización cronológica del progreso de una solicitud
- **Borrador**: Datos parciales guardados en localStorage y/o Neon para permitir retomar el formulario
- **Validación_Servidor**: Verificación de datos en el backend antes de crear la solicitud
- **Landing_Ejecutiva**: Página principal que presenta el problema, la solución y el recorrido visual

## Requirements

### Requerimiento 1: Landing Ejecutiva

**Historia de Usuario:** Como evaluador de negocio, quiero ver una presentación ejecutiva del prototipo en la página principal, para comprender rápidamente el problema que resuelve y la propuesta de valor.

#### Criterios de Aceptación

1. WHEN el usuario accede a la ruta `/`, THE Sistema SHALL renderizar la Landing_Ejecutiva con hero, bloques de problema, principios de solución, beneficios, recorrido visual y footer.
2. THE Landing_Ejecutiva SHALL mostrar un bloque hero con título, descripción y botones CTA que dirijan a `/prototipo` y `/presentacion`.
3. THE Landing_Ejecutiva SHALL mostrar un bloque de problema que describa la dependencia de PDF, baja tasa de finalización, reproceso, falta de trazabilidad y abandono.
4. THE Landing_Ejecutiva SHALL mostrar un bloque de principios de solución con 5 pasos del proceso digital.
5. THE Landing_Ejecutiva SHALL mostrar un bloque de beneficios del enfoque digital.
6. THE Landing_Ejecutiva SHALL mostrar un recorrido visual del flujo completo del prototipo.
7. THE Landing_Ejecutiva SHALL mostrar un footer con disclaimer de prototipo conceptual, nombre del autor (Carlos Alberto Figueroa Martínez) y fecha (julio 2026).
8. THE Sistema SHALL mostrar un banner o indicador visible de "Prototipo conceptual" en todas las páginas incluyendo la landing.

### Requerimiento 2: Inicio del Recorrido

**Historia de Usuario:** Como asegurado, quiero una pantalla de bienvenida que me oriente sobre el proceso digital, para saber qué esperar antes de comenzar.

#### Criterios de Aceptación

1. WHEN el usuario accede a `/prototipo`, THE Sistema SHALL mostrar una pantalla de orientación con descripción del flujo, tiempo estimado y botón para continuar al Selector_Guiado.
2. WHEN el usuario hace clic en el botón de continuar, THE Sistema SHALL crear una Sesión_Demo en la base de datos y registrar un Evento_Tracking de tipo "journey_started".
3. THE Sistema SHALL navegar al usuario a `/prototipo/seleccion` tras registrar la sesión.

### Requerimiento 3: Selector Guiado de Procesos

**Historia de Usuario:** Como asegurado, quiero seleccionar mi trámite de una lista guiada, para encontrar el proceso correcto sin necesidad de conocer nomenclatura interna.

#### Criterios de Aceptación

1. WHEN el usuario accede a `/prototipo/seleccion`, THE Selector_Guiado SHALL mostrar 3 opciones de trámite postventa con título, descripción breve e ícono.
2. THE Selector_Guiado SHALL marcar "Actualización de datos de contacto" como opción funcional activa.
3. THE Selector_Guiado SHALL marcar las otras 2 opciones con etiqueta "Próxima oleada" y estado deshabilitado.
4. WHEN el usuario selecciona "Actualización de datos de contacto", THE Sistema SHALL registrar un Evento_Tracking de tipo "process_selected" y navegar a `/prototipo/requisitos`.
5. IF el usuario intenta seleccionar una opción marcada como "Próxima oleada", THEN THE Sistema SHALL mostrar un mensaje informativo indicando que el proceso estará disponible en futuras iteraciones.

### Requerimiento 4: Checklist de Requisitos Previos

**Historia de Usuario:** Como asegurado, quiero ver los requisitos y el tiempo estimado antes de empezar el formulario, para prepararme y evitar interrupciones.

#### Criterios de Aceptación

1. WHEN el usuario accede a `/prototipo/requisitos`, THE Checklist_Requisitos SHALL mostrar el tiempo estimado del trámite, la lista de documentos o datos necesarios y un botón de confirmación.
2. WHEN el usuario confirma que tiene los requisitos, THE Sistema SHALL registrar un Evento_Tracking de tipo "requirements_confirmed" y navegar a `/prototipo/formulario`.
3. THE Checklist_Requisitos SHALL indicar visualmente cada ítem requerido (número de póliza, documento de identidad, nuevo teléfono, nuevo correo electrónico).

### Requerimiento 5: Formulario Wizard Multi-paso

**Historia de Usuario:** Como asegurado, quiero completar mis datos en un formulario guiado paso a paso, para no sentirme abrumado por un formulario extenso.

#### Criterios de Aceptación

1. WHEN el usuario accede a `/prototipo/formulario`, THE Formulario_Wizard SHALL mostrar un formulario dividido en pasos con indicador de progreso visible.
2. THE Formulario_Wizard SHALL pre-cargar datos demo ficticios (números de documento enmascarados, referencias de póliza ficticias) para facilitar la demostración.
3. THE Formulario_Wizard SHALL validar cada campo en tiempo real según las reglas de validación definidas.
4. WHEN el usuario completa un paso y hace clic en continuar, THE Formulario_Wizard SHALL validar todos los campos del paso actual antes de avanzar al siguiente.
5. IF algún campo del paso actual no cumple las validaciones, THEN THE Formulario_Wizard SHALL mostrar mensajes de error claros junto a cada campo inválido y prevenir el avance.
6. WHEN el usuario avanza o retrocede entre pasos, THE Sistema SHALL registrar un Evento_Tracking de tipo "form_step_changed" con el número de paso.
7. THE Formulario_Wizard SHALL guardar automáticamente el borrador en localStorage tras cada cambio de campo.
8. THE Formulario_Wizard SHALL persistir el borrador en Neon periódicamente para permitir recuperación entre dispositivos.
9. WHEN el usuario regresa al formulario con un borrador existente, THE Formulario_Wizard SHALL ofrecer restaurar los datos guardados.

### Requerimiento 6: Validaciones de Campos

**Historia de Usuario:** Como asegurado, quiero recibir retroalimentación inmediata cuando cometo un error en el formulario, para corregirlo antes de enviar.

#### Criterios de Aceptación

1. THE Formulario_Wizard SHALL validar que los campos de correo electrónico contengan formato válido y que ambos campos de correo coincidan (confirmación).
2. THE Formulario_Wizard SHALL validar que el campo de teléfono cumpla formato colombiano (10 dígitos, inicia con 3).
3. THE Formulario_Wizard SHALL validar que todos los campos obligatorios estén completados antes de permitir avance.
4. THE Formulario_Wizard SHALL validar que los campos de texto no excedan la longitud máxima definida.
5. THE Formulario_Wizard SHALL sanitizar todos los campos de texto para prevenir inyección XSS.
6. THE Sistema SHALL aplicar las mismas validaciones con Zod tanto en cliente como en servidor.
7. IF un campo falla la validación, THEN THE Formulario_Wizard SHALL mostrar un mensaje de error descriptivo en español, en lenguaje no técnico, junto al campo correspondiente.

### Requerimiento 7: Revisión Pre-envío

**Historia de Usuario:** Como asegurado, quiero revisar todos mis datos antes de enviar la solicitud, para confirmar que la información es correcta.

#### Criterios de Aceptación

1. WHEN el usuario completa todos los pasos del formulario, THE Sistema SHALL navegar a `/prototipo/revision` mostrando un resumen de todos los datos capturados.
2. THE Sistema SHALL permitir al usuario editar cualquier sección desde la pantalla de revisión, regresando al paso correspondiente del Formulario_Wizard.
3. THE Sistema SHALL mostrar un checkbox de consentimiento que el usuario debe marcar antes de enviar.
4. WHEN el usuario marca el consentimiento y hace clic en enviar, THE Sistema SHALL registrar un Evento_Tracking de tipo "consent_given" y proceder con la radicación.
5. IF el usuario no marca el consentimiento, THEN THE Sistema SHALL mantener deshabilitado el botón de envío.

### Requerimiento 8: Radicación y Confirmación

**Historia de Usuario:** Como asegurado, quiero recibir un código de seguimiento al enviar mi solicitud, para poder consultar el estado después.

#### Criterios de Aceptación

1. WHEN el usuario confirma el envío, THE Sistema SHALL ejecutar Validación_Servidor con Zod sobre todos los datos del formulario.
2. IF la Validación_Servidor falla, THEN THE Sistema SHALL retornar errores descriptivos y mostrarlos al usuario sin perder los datos ingresados.
3. WHEN la Validación_Servidor es exitosa, THE Sistema SHALL crear un registro en demo_requests con un Radicado en formato DEMO-ALFA-YYYYMMDD-XXXX donde XXXX es un consecutivo de 4 dígitos.
4. WHEN la solicitud se crea exitosamente, THE Sistema SHALL registrar un Evento_Tracking de tipo "request_filed" y navegar a `/prototipo/confirmacion/[radicado]`.
5. THE Sistema SHALL mostrar en la pantalla de confirmación: el código de Radicado, instrucciones de seguimiento, un botón para copiar el código y un enlace al seguimiento.
6. THE Sistema SHALL crear un registro inicial en status_history con estado "Radicado" y timestamp.

### Requerimiento 9: Seguimiento de Estado

**Historia de Usuario:** Como asegurado, quiero consultar el estado de mi solicitud con mi código de radicado, para saber en qué etapa se encuentra sin llamar al call center.

#### Criterios de Aceptación

1. WHEN el usuario accede a `/seguimiento`, THE Sistema SHALL mostrar un campo de búsqueda para ingresar el código de Radicado.
2. WHEN el usuario ingresa un Radicado válido y busca, THE Sistema SHALL navegar a `/seguimiento/[radicado]` mostrando la Timeline_Estado con todos los estados registrados.
3. THE Timeline_Estado SHALL mostrar la progresión: Radicado → En validación → Procesado → Finalizado, destacando el estado actual.
4. IF el usuario ingresa un Radicado que no existe, THEN THE Sistema SHALL mostrar un mensaje indicando que no se encontró la solicitud.
5. THE Sistema SHALL registrar un Evento_Tracking de tipo "tracking_consulted" al realizar una consulta de seguimiento.

### Requerimiento 10: Simulación de Avance de Estado

**Historia de Usuario:** Como evaluador de negocio, quiero poder simular el avance de estados de una solicitud, para demostrar el flujo completo de seguimiento.

#### Criterios de Aceptación

1. WHEN se invoca POST `/api/requests/[trackingCode]/simulate-status`, THE Sistema SHALL avanzar el estado de la solicitud al siguiente en la secuencia definida.
2. THE Sistema SHALL crear un nuevo registro en status_history con el estado siguiente y timestamp actual.
3. IF la solicitud ya se encuentra en estado "Finalizado", THEN THE Sistema SHALL retornar un error indicando que no hay más estados por avanzar.
4. THE Sistema SHALL registrar un Evento_Tracking de tipo "status_simulated" al ejecutar la simulación.

### Requerimiento 11: Medición de Experiencia (CES)

**Historia de Usuario:** Como asegurado, quiero calificar qué tan fácil fue el proceso, para que la empresa pueda mejorar la experiencia.

#### Criterios de Aceptación

1. WHEN la solicitud se radica exitosamente, THE Sistema SHALL mostrar una encuesta CES preguntando el nivel de esfuerzo percibido en escala de 1 a 5.
2. WHEN el usuario envía la calificación CES, THE Sistema SHALL persistir el feedback en la tabla feedback asociado al Radicado.
3. THE Sistema SHALL registrar un Evento_Tracking de tipo "feedback_submitted" con el score proporcionado.
4. THE Sistema SHALL permitir al usuario omitir la encuesta CES sin bloquear el acceso a la confirmación.

### Requerimiento 12: Dashboard de Métricas

**Historia de Usuario:** Como evaluador de negocio, quiero ver un panel de métricas del prototipo, para evaluar el impacto potencial de la digitalización.

#### Criterios de Aceptación

1. WHEN el usuario accede a `/metricas`, THE Dashboard_Métricas SHALL mostrar tarjetas KPI con: sesiones iniciadas, procesos seleccionados, requisitos confirmados, formularios iniciados y solicitudes radicadas.
2. THE Dashboard_Métricas SHALL mostrar la tasa de finalización como métrica North Star.
3. THE Dashboard_Métricas SHALL mostrar una visualización de embudo (funnel) del recorrido completo.
4. THE Dashboard_Métricas SHALL mostrar un gráfico de abandono por paso.
5. THE Dashboard_Métricas SHALL mostrar el score CES promedio.
6. THE Dashboard_Métricas SHALL mostrar tiempo promedio de completación.
7. THE Dashboard_Métricas SHALL mostrar una comparación ilustrativa entre línea base (proceso PDF) y prototipo digital.
8. THE Dashboard_Métricas SHALL combinar datos reales de eventos anónimos con datos sintéticos para demostración.
9. THE Sistema SHALL servir los datos de métricas a través de GET `/api/metrics`.

### Requerimiento 13: Página Acerca del Prototipo

**Historia de Usuario:** Como evaluador de negocio, quiero entender el contexto, alcance y limitaciones del prototipo, para evaluar adecuadamente la propuesta.

#### Criterios de Aceptación

1. WHEN el usuario accede a `/acerca-del-prototipo`, THE Sistema SHALL mostrar información sobre el propósito, alcance, tecnologías utilizadas y limitaciones del prototipo.
2. THE Sistema SHALL incluir un disclaimer visible indicando que es un prototipo conceptual sin datos reales de clientes.
3. THE Sistema SHALL mostrar la arquitectura tecnológica utilizada (Next.js, Neon, Vercel, Drizzle, Zod, Tailwind).

### Requerimiento 14: Página de Presentación y QR

**Historia de Usuario:** Como autor del prototipo, quiero una página con código QR y enlace a la URL de producción, para facilitar el acceso durante presentaciones presenciales.

#### Criterios de Aceptación

1. WHEN el usuario accede a `/presentacion`, THE Sistema SHALL mostrar un código QR generado dinámicamente que apunte a la URL de producción del prototipo.
2. THE Sistema SHALL mostrar el enlace de producción como texto copiable junto al código QR.
3. THE Sistema SHALL optimizar la página para visualización en pantallas de proyección.

### Requerimiento 15: Seguimiento de Eventos (Event Tracking)

**Historia de Usuario:** Como sistema, quiero registrar cada acción relevante del usuario durante el recorrido, para alimentar el dashboard de métricas con datos reales.

#### Criterios de Aceptación

1. THE Sistema SHALL registrar eventos anónimos en la tabla tracking_events a través de POST `/api/events`.
2. THE Sistema SHALL asociar cada evento a una Sesión_Demo mediante session_id.
3. THE Sistema SHALL capturar como mínimo: tipo de evento, timestamp, metadata contextual y paso actual del recorrido.
4. THE Sistema SHALL registrar eventos para: journey_started, process_selected, requirements_confirmed, form_started, form_step_changed, consent_given, request_filed, tracking_consulted, feedback_submitted, status_simulated.
5. THE Sistema SHALL evitar registrar cualquier dato personal identificable (PII) en los eventos.

### Requerimiento 16: API REST y Health Check

**Historia de Usuario:** Como sistema, quiero exponer endpoints REST bien definidos, para separar la lógica de negocio de la presentación y facilitar monitoreo.

#### Criterios de Aceptación

1. THE Sistema SHALL exponer POST `/api/sessions` para crear una Sesión_Demo y retornar un session_id.
2. THE Sistema SHALL exponer POST `/api/events` para registrar un Evento_Tracking asociado a una sesión.
3. THE Sistema SHALL exponer POST `/api/requests` para crear una solicitud validando datos con Zod y generando el Radicado.
4. THE Sistema SHALL exponer GET `/api/requests/[trackingCode]` para consultar el estado y timeline de una solicitud.
5. THE Sistema SHALL exponer POST `/api/requests/[trackingCode]/simulate-status` para avanzar el estado de una solicitud.
6. THE Sistema SHALL exponer POST `/api/feedback` para registrar la calificación CES asociada a un Radicado.
7. THE Sistema SHALL exponer GET `/api/metrics` para retornar los datos agregados del dashboard.
8. THE Sistema SHALL exponer GET `/api/health` que retorne estado 200 con información de conectividad a la base de datos.
9. IF una petición a cualquier endpoint contiene datos inválidos, THEN THE Sistema SHALL retornar un error HTTP 400 con descripción del problema en español.

### Requerimiento 17: Página 404 Personalizada

**Historia de Usuario:** Como asegurado, quiero ver una página amigable cuando accedo a una ruta inexistente, para no sentirme perdido y poder regresar al inicio.

#### Criterios de Aceptación

1. WHEN el usuario accede a una ruta no definida, THE Sistema SHALL mostrar una página 404 personalizada con mensaje amigable en español y enlace para volver al inicio.
2. THE Sistema SHALL mantener la identidad visual corporativa en la página 404.
3. THE Sistema SHALL mantener visible el disclaimer de "Prototipo conceptual" en la página 404.

### Requerimiento 18: Accesibilidad WCAG 2.2 AA

**Historia de Usuario:** Como asegurado con diversidad funcional, quiero que el prototipo sea accesible, para poder completar mi trámite sin barreras.

#### Criterios de Aceptación

1. THE Sistema SHALL cumplir con los criterios de conformidad WCAG 2.2 nivel AA en todas las páginas.
2. THE Sistema SHALL utilizar roles ARIA apropiados, etiquetas accesibles en formularios y navegación por teclado funcional.
3. THE Sistema SHALL mantener contraste mínimo de 4.5:1 para texto normal y 3:1 para texto grande.
4. THE Sistema SHALL proporcionar indicadores de foco visibles en todos los elementos interactivos.
5. THE Sistema SHALL estructurar el contenido con encabezados jerárquicos correctos (h1-h6).
6. THE Formulario_Wizard SHALL anunciar errores de validación a tecnologías de asistencia mediante aria-live regions.

### Requerimiento 19: Diseño Responsivo Mobile-First

**Historia de Usuario:** Como asegurado, quiero acceder al prototipo desde mi teléfono móvil, para gestionar mi trámite desde cualquier lugar.

#### Criterios de Aceptación

1. THE Sistema SHALL implementar diseño mobile-first con breakpoints en 360px, 768px, 1024px y desktop.
2. THE Sistema SHALL garantizar que todos los elementos interactivos tengan tamaño mínimo de toque de 44x44px en dispositivos móviles.
3. THE Sistema SHALL adaptar la navegación, formularios y dashboard a cada breakpoint sin pérdida de funcionalidad.
4. THE Sistema SHALL cargar en menos de 3 segundos en conexión 3G simulada.

### Requerimiento 20: Seguridad y Privacidad

**Historia de Usuario:** Como evaluador técnico, quiero que el prototipo demuestre buenas prácticas de seguridad, para validar que el enfoque es viable en producción.

#### Criterios de Aceptación

1. THE Sistema SHALL configurar encabezados de seguridad HTTP: Content-Security-Policy, X-Content-Type-Options (nosniff), Referrer-Policy (strict-origin-when-cross-origin) y Permissions-Policy.
2. THE Sistema SHALL sanitizar todas las entradas de usuario para prevenir XSS.
3. THE Sistema SHALL evitar almacenar datos personales reales; todos los datos son sintéticos, ficticios o enmascarados.
4. THE Sistema SHALL implementar logging estructurado sin incluir PII en los registros.
5. THE Sistema SHALL configurar robots.txt denegando indexación y aplicar meta tag noindex en páginas sensibles.
6. THE Sistema SHALL validar con Zod tanto en cliente como en servidor, rechazando datos que no cumplan el schema.

### Requerimiento 21: Identidad Visual Corporativa

**Historia de Usuario:** Como evaluador de negocio, quiero que el prototipo refleje una identidad visual corporativa profesional, para evaluar la viabilidad del diseño en un contexto empresarial.

#### Criterios de Aceptación

1. THE Sistema SHALL utilizar la paleta de colores corporativa: verde #009A76, azul navy #0B2A55, dorado #D89A1D y fondo #F7F9FC.
2. THE Sistema SHALL utilizar el logo corporativo ubicado en `/public/brand/seguros-alfa-logo.png` en el encabezado de todas las páginas.
3. THE Sistema SHALL implementar un diseño limpio con espaciado amplio, sombras sutiles y bordes redondeados moderados.
4. THE Sistema SHALL proporcionar estados visuales consistentes: hover, focus, loading, success y error en todos los componentes interactivos.
5. THE Sistema SHALL utilizar iconografía consistente y micro-interacciones discretas para mejorar la experiencia.

### Requerimiento 22: Stack Tecnológico y Calidad de Código

**Historia de Usuario:** Como evaluador técnico, quiero que el prototipo utilice tecnologías modernas con código de calidad verificable, para confirmar las competencias técnicas del autor.

#### Criterios de Aceptación

1. THE Sistema SHALL implementarse con Next.js App Router y TypeScript en modo estricto.
2. THE Sistema SHALL utilizar Tailwind CSS para estilos.
3. THE Sistema SHALL utilizar Zod para validaciones en cliente y servidor.
4. THE Sistema SHALL utilizar Neon PostgreSQL como base de datos con Drizzle ORM como capa de acceso.
5. THE Sistema SHALL pasar exitosamente los comandos: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run test:e2e` y `npm run build`.
6. THE Sistema SHALL desplegarse en Vercel con integración continua desde GitHub.
7. THE Sistema SHALL implementar todo el contenido de interfaz en idioma español con lenguaje claro y no técnico.

## Reglas de Negocio

1. **RN-001**: El formato de Radicado es `DEMO-ALFA-YYYYMMDD-XXXX` donde YYYY es el año, MM el mes, DD el día y XXXX un consecutivo de 4 dígitos rellenado con ceros.
2. **RN-002**: La secuencia de estados de una solicitud es estrictamente: Radicado → En validación → Procesado → Finalizado. No se permite retroceder ni saltar estados.
3. **RN-003**: Los teléfonos colombianos válidos tienen exactamente 10 dígitos y comienzan con el dígito 3.
4. **RN-004**: La confirmación de correo electrónico debe coincidir exactamente con el correo electrónico principal (case-insensitive).
5. **RN-005**: El consentimiento es obligatorio para radicar una solicitud. Sin consentimiento no se puede enviar.
6. **RN-006**: Todos los datos mostrados deben estar claramente identificados como ficticios o de demostración.
7. **RN-007**: La escala CES es de 1 (muy difícil) a 5 (muy fácil).
8. **RN-008**: La métrica North Star del prototipo es la tasa de finalización exitosa (solicitudes radicadas / sesiones iniciadas).
9. **RN-009**: Los borradores en localStorage se sincronizan a Neon para permitir recuperación entre sesiones.
10. **RN-010**: No se almacena PII real en ningún registro de eventos, logs o base de datos.

## Métricas de Éxito

| Métrica | Definición | Meta Ilustrativa |
|---------|-----------|------------------|
| Tasa de finalización | Solicitudes radicadas / Sesiones iniciadas | > 70% |
| Abandono por paso | Porcentaje de usuarios que abandonan en cada paso | < 15% por paso |
| Tiempo promedio | Tiempo desde inicio hasta radicación | < 5 minutos |
| Score CES | Promedio de calificación de esfuerzo (1-5) | > 4.0 |
| Errores de validación | Promedio de errores por sesión completada | < 2 |
| Uso canal asistido | Proporción que requiere canal asistido vs autogestión | < 20% |

## Supuestos

1. El prototipo se despliega en Vercel con dominio generado automáticamente.
2. La base de datos Neon está aprovisionada y accesible desde Vercel.
3. No se requiere autenticación real; el flujo simula un usuario ya identificado.
4. Los datos de demostración son pre-cargados y no representan clientes reales.
5. El evaluador tiene acceso a un navegador moderno (Chrome, Firefox, Safari, Edge últimas 2 versiones).
6. La conexión de red del evaluador permite cargas de página en tiempos razonables.
7. El prototipo no necesita manejar concurrencia alta; es una demostración individual.
8. Los datos sintéticos del dashboard ilustran el potencial pero no representan datos reales de operación.

## Riesgos

| ID | Riesgo | Probabilidad | Impacto | Mitigación |
|----|--------|-------------|---------|------------|
| R-001 | Latencia de Neon en cold start | Media | Medio | Implementar loading states y health check previo |
| R-002 | Confusión entre prototipo y sistema real | Baja | Alto | Disclaimer visible permanente + datos claramente ficticios |
| R-003 | Evaluador no completa el flujo por falta de contexto | Media | Alto | Datos pre-cargados + orientación clara en cada paso |
| R-004 | Problemas de accesibilidad no detectados | Media | Medio | Testing con herramientas automáticas (axe-core) + revisión manual |
| R-005 | Build falla por dependencias incompatibles | Baja | Alto | Lock file versionado + CI/CD con checks previos al deploy |
| R-006 | Pérdida de borrador por expiración de localStorage | Baja | Bajo | Persistencia dual localStorage + Neon |

## Restricciones

1. No se utilizan datos reales de clientes de ninguna aseguradora.
2. No se integran APIs de inteligencia artificial ni LLMs.
3. No se implementa autenticación real (OAuth, SSO, etc.).
4. No se utilizan servicios de analítica de terceros (Google Analytics, Mixpanel, etc.).
5. Todos los datos son sintéticos, enmascarados o claramente identificados como DEMO.
6. El prototipo debe permanecer claramente identificado como conceptual en todo momento.
7. El logo se ubica exclusivamente en `/public/brand/seguros-alfa-logo.png`.
8. El stack tecnológico está fijado: Next.js + TypeScript + Tailwind + Zod + Drizzle + Neon + Vercel.
9. El idioma de interfaz es exclusivamente español.
10. No se implementan notificaciones push, email ni SMS.

## Modelo de Datos

### Tablas

| Tabla | Propósito |
|-------|-----------|
| demo_sessions | Registro de sesiones anónimas de demostración |
| demo_requests | Solicitudes de actualización de datos radicadas |
| tracking_events | Eventos de interacción del usuario durante el recorrido |
| status_history | Historial de cambios de estado de una solicitud |
| feedback | Calificaciones CES asociadas a solicitudes |

## Matriz de Trazabilidad

| Req | Ruta Principal | API | Tabla(s) | Quick Win |
|-----|---------------|-----|----------|-----------|
| R1 | `/` | — | — | — |
| R2 | `/prototipo` | POST /api/sessions | demo_sessions | — |
| R3 | `/prototipo/seleccion` | POST /api/events | tracking_events | QW-1: Selector guiado |
| R4 | `/prototipo/requisitos` | POST /api/events | tracking_events | QW-2: Checklist previo |
| R5 | `/prototipo/formulario` | POST /api/events | tracking_events, demo_requests | — |
| R6 | `/prototipo/formulario` | — | — | QW-3: Mensajes claros de error |
| R7 | `/prototipo/revision` | POST /api/events | tracking_events | — |
| R8 | `/prototipo/confirmacion/[radicado]` | POST /api/requests | demo_requests, status_history | QW-4: Confirmación visible |
| R9 | `/seguimiento`, `/seguimiento/[radicado]` | GET /api/requests/[trackingCode] | demo_requests, status_history | QW-5: Seguimiento básico |
| R10 | — | POST /api/requests/[trackingCode]/simulate-status | status_history | — |
| R11 | `/prototipo/confirmacion/[radicado]` | POST /api/feedback | feedback | — |
| R12 | `/metricas` | GET /api/metrics | tracking_events, demo_sessions, feedback | — |
| R13 | `/acerca-del-prototipo` | — | — | — |
| R14 | `/presentacion` | — | — | — |
| R15 | — (transversal) | POST /api/events | tracking_events | — |
| R16 | — (transversal) | Todos los endpoints | Todas | — |
| R17 | 404 | — | — | — |
| R18 | Todas | — | — | — |
| R19 | Todas | — | — | — |
| R20 | Todas | — | — | — |
| R21 | Todas | — | — | — |
| R22 | — (infraestructura) | GET /api/health | — | — |
