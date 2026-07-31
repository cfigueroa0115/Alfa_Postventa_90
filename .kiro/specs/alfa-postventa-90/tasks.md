# Implementation Plan: Alfa Postventa 90

## Overview

Implementación incremental de un prototipo de autogestión postventa digital para Seguros Alfa utilizando Next.js App Router, TypeScript estricto, Tailwind CSS, Neon PostgreSQL con Drizzle ORM, validaciones Zod compartidas, y testing con Vitest + fast-check + Playwright.

## Tasks

- [x] 1. Scaffolding del proyecto y configuración base
  - [x] 1.1 Inicializar proyecto Next.js con TypeScript estricto y Tailwind CSS
    - Ejecutar `npx create-next-app@latest` con App Router y TypeScript
    - Configurar `tsconfig.json` con `strict: true` y path aliases
    - Configurar `tailwind.config.ts` con la paleta corporativa (#009A76, #0B2A55, #D89A1D, #F7F9FC)
    - Configurar ESLint y Prettier con reglas para TypeScript/React
    - _Requirements: 22.1, 22.2, 21.1_

  - [x] 1.2 Instalar dependencias del proyecto
    - Instalar: `zod`, `drizzle-orm`, `@neondatabase/serverless`, `dompurify`
    - Instalar dev: `drizzle-kit`, `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `fast-check`, `@playwright/test`, `jsdom`
    - Configurar scripts npm: `test`, `test:e2e`, `lint`, `typecheck`, `build`, `db:generate`, `db:migrate`, `db:seed`
    - _Requirements: 22.4, 22.5_

  - [x] 1.3 Configurar Vitest y Playwright
    - Crear `vitest.config.ts` con entorno jsdom y path aliases
    - Crear `playwright.config.ts` con proyectos chromium, firefox y webkit
    - Crear estructura de carpetas `tests/unit/`, `tests/integration/`, `tests/e2e/`
    - _Requirements: 22.5_

  - [x] 1.4 Configurar Drizzle Kit y conexión a Neon
    - Crear `drizzle.config.ts` apuntando a `db/schema.ts`
    - Crear `db/index.ts` con cliente Drizzle + Neon serverless driver
    - Crear archivo `.env.local.example` con variables `DATABASE_URL` y `NEXT_PUBLIC_BASE_URL`
    - _Requirements: 22.4_

- [x] 2. Capa de base de datos — esquema, migraciones y seed
  - [x] 2.1 Definir esquema Drizzle completo en `db/schema.ts`
    - Crear tablas: `demo_sessions`, `demo_requests`, `tracking_events`, `status_history`, `feedback`
    - Definir relaciones, índices, constraints (CHECK en status y ces_score)
    - Exportar tipos inferidos para uso en servicios
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7_

  - [x] 2.2 Generar y aplicar migraciones iniciales
    - Ejecutar `drizzle-kit generate` para crear migración SQL
    - Crear script `db:migrate` para aplicar migraciones con Neon
    - Verificar que las tablas se crean correctamente
    - _Requirements: 22.4_

  - [x] 2.3 Crear script de seed con datos sintéticos
    - Crear `db/seed.ts` con sesiones, eventos, solicitudes, historial y feedback de demostración
    - Generar al menos 150 sesiones sintéticas con distribución realista de embudo
    - Generar solicitudes en distintos estados para demostrar timeline
    - Incluir scores CES variados para el dashboard
    - _Requirements: 12.8, 5.2_

- [x] 3. Esquemas de validación Zod y utilidades compartidas
  - [x] 3.1 Crear esquemas Zod compartidos en `lib/validation/schemas.ts`
    - Definir `updateContactFormSchema` con validación de email, teléfono colombiano, campos obligatorios y refinamiento de confirmación
    - Definir `trackingEventSchema`, `feedbackSchema`, `createSessionSchema`
    - Exportar tipos inferidos de cada esquema
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.6, 20.6_

  - [x] 3.2 Crear funciones de sanitización en `lib/validation/sanitize.ts`
    - Implementar función `sanitizeInput` que elimine tags HTML, scripts, event handlers y `javascript:` URIs
    - Implementar función `sanitizeMetadata` para validar JSON plano sin funciones ni prototypes
    - _Requirements: 6.5, 20.2_

  - [x] 3.3 Crear utilidades de generación de tracking code
    - Implementar función `generateTrackingCode(date, sequence)` que produzca formato `DEMO-ALFA-YYYYMMDD-XXXX`
    - Implementar función auxiliar para obtener siguiente consecutivo del día
    - _Requirements: 8.3_

  - [x] 3.4 Crear módulo de errores en `lib/errors/`
    - Implementar clase `AppError` con código, mensaje, statusCode y details
    - Definir enum `ErrorCode` con tipos: VALIDATION_ERROR, NOT_FOUND, STATE_TRANSITION_ERROR, DATABASE_ERROR, INTERNAL_ERROR
    - Implementar `errorHandler` para mapeo uniforme de errores a respuestas HTTP
    - _Requirements: 16.9_

  - [x] 3.5 Crear máquina de estados de solicitud
    - Implementar función `getNextStatus(currentStatus)` con la secuencia radicado→en_validacion→procesado→finalizado
    - Retornar error para estado "finalizado"
    - Exportar tipos `RequestStatus` y constantes de transición
    - _Requirements: 10.1, 10.3_

  - [ ]* 3.6 Escribir property tests para validación Zod
    - **Property 1: Validación Zod acepta datos válidos y rechaza inválidos**
    - **Validates: Requirements 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 8.1, 8.2**
    - Crear arbitraries para datos válidos e inválidos del formulario
    - Verificar con 100 iteraciones que datos válidos son aceptados y datos inválidos son rechazados

  - [ ]* 3.7 Escribir property test para sanitización
    - **Property 2: Sanitización elimina contenido ejecutable**
    - **Validates: Requirements 6.5, 20.2**
    - Crear arbitrary de strings con contenido HTML/JS inyectado
    - Verificar que la salida nunca contiene patrones ejecutables (`<script>`, `onclick`, `javascript:`)

  - [ ]* 3.8 Escribir property test para mensajes de error en español
    - **Property 3: Mensajes de error en español y descriptivos**
    - **Validates: Requirements 6.7, 16.9**
    - Crear arbitrary de datos de formulario inválidos
    - Verificar que cada mensaje de error es no vacío y no contiene términos técnicos en inglés

  - [ ]* 3.9 Escribir property test para formato de radicado
    - **Property 4: Formato de código de radicado**
    - **Validates: Requirements 8.3**
    - Crear arbitrary de fechas válidas y secuencias 1-9999
    - Verificar que la salida coincide con regex `^DEMO-ALFA-\d{8}-\d{4}$`

  - [ ]* 3.10 Escribir property test para máquina de estados
    - **Property 5: Máquina de estados — transición correcta**
    - **Validates: Requirements 10.1, 10.3**
    - Crear arbitrary de estados válidos (radicado, en_validacion, procesado)
    - Verificar transiciones correctas y error en estado finalizado

- [x] 4. Checkpoint — Validaciones y lógica de negocio
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Repositorios y servicios (capa de acceso a datos)
  - [x] 5.1 Crear repositorios en `lib/repositories/`
    - Implementar `sessionsRepo`: crear sesión, obtener por ID
    - Implementar `eventsRepo`: crear evento, obtener por sesión, contar por tipo
    - Implementar `requestsRepo`: crear solicitud, obtener por tracking code, actualizar estado, obtener siguiente consecutivo
    - Implementar `statusHistoryRepo`: crear entrada, obtener por request ID ordenado por timestamp
    - Implementar `feedbackRepo`: crear feedback, obtener por request ID, calcular promedios
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7_

  - [x] 5.2 Crear servicios en `lib/services/`
    - Implementar `sessionService`: orquestación de creación de sesión
    - Implementar `requestService`: validación, generación de tracking code, creación de solicitud con status_history inicial
    - Implementar `metricsService`: agregación de datos de embudo, cálculo de tasa de finalización, promedio CES, tiempo promedio
    - _Requirements: 8.3, 8.6, 12.1, 12.2, 12.5, 12.6_

  - [x] 5.3 Crear módulo de analytics en `lib/analytics/`
    - Implementar clase `EventTracker` con métodos `initialize()` y `track()`
    - Implementar `metricsAggregator` para combinar datos reales y sintéticos
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

  - [ ]* 5.4 Escribir property test para cálculos de métricas
    - **Property 7: Cálculos de métricas matemáticamente correctos**
    - **Validates: Requirements 12.2, 12.5, 12.6**
    - Crear arbitraries de conjuntos de sesiones y eventos
    - Verificar tasa de finalización entre 0 y 1, promedio CES entre 1 y 5, tiempo promedio correcto

  - [ ]* 5.5 Escribir property test para eventos libres de PII
    - **Property 8: Eventos y logs libres de PII**
    - **Validates: Requirements 15.5, 20.4**
    - Crear arbitrary de metadata con PII inyectado
    - Verificar que el registro almacenado no contiene patrones de emails, teléfonos ni documentos

- [x] 6. API Routes
  - [x] 6.1 Implementar POST `/api/sessions`
    - Validar body con `createSessionSchema`
    - Crear sesión en DB y retornar `sessionId` + `startedAt`
    - Retornar 201 en éxito, 400 en validación fallida
    - _Requirements: 16.1, 2.2_

  - [x] 6.2 Implementar POST `/api/events`
    - Validar body con `trackingEventSchema`
    - Sanitizar metadata para eliminar PII
    - Persistir evento en `tracking_events`
    - Retornar 201 con `eventId` + `createdAt`
    - _Requirements: 16.2, 15.1, 15.5_

  - [x] 6.3 Implementar POST `/api/requests`
    - Validar body con `updateContactFormSchema`
    - Sanitizar todos los campos de texto
    - Generar tracking code con formato `DEMO-ALFA-YYYYMMDD-XXXX`
    - Crear registro en `demo_requests` + entrada inicial en `status_history`
    - Registrar evento `request_filed`
    - Retornar 201 con `requestId`, `trackingCode`, `status`, `filedAt`
    - Retornar 400 con errores descriptivos si validación falla
    - _Requirements: 8.1, 8.2, 8.3, 8.6, 16.3_

  - [x] 6.4 Implementar GET `/api/requests/[trackingCode]`
    - Buscar solicitud por tracking code
    - Obtener timeline de `status_history` ordenada cronológicamente
    - Retornar 200 con solicitud + timeline, o 404 si no existe
    - _Requirements: 16.4, 9.2, 9.4_

  - [x] 6.5 Implementar POST `/api/requests/[trackingCode]/simulate-status`
    - Obtener estado actual de la solicitud
    - Aplicar transición con `getNextStatus()`
    - Crear registro en `status_history`
    - Registrar evento `status_simulated`
    - Retornar 200 con previous/new status, o 400 si ya finalizado
    - _Requirements: 16.5, 10.1, 10.2, 10.3, 10.4_

  - [x] 6.6 Implementar POST `/api/feedback`
    - Validar body con `feedbackSchema`
    - Verificar que el tracking code existe en `demo_requests`
    - Persistir feedback en tabla `feedback`
    - Registrar evento `feedback_submitted`
    - Retornar 201 con `feedbackId` + `createdAt`
    - _Requirements: 16.6, 11.2, 11.3_

  - [x] 6.7 Implementar GET `/api/metrics`
    - Calcular KPIs desde `tracking_events` agrupados por tipo
    - Calcular tasa de finalización, embudo, abandono por paso
    - Calcular promedio CES y tiempo promedio de completación
    - Combinar datos reales con sintéticos, marcar con `isSynthetic`
    - Retornar 200 con objeto completo de métricas
    - _Requirements: 16.7, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8, 12.9_

  - [x] 6.8 Implementar GET `/api/health`
    - Verificar conectividad a Neon PostgreSQL con query simple
    - Retornar 200 con status "ok" + timestamp + version si conectado
    - Retornar 503 con status "degraded" si falla la conexión
    - _Requirements: 16.8_

  - [ ]* 6.9 Escribir tests unitarios para API routes
    - Testear cada endpoint con datos válidos e inválidos
    - Testear respuestas 400 con mensajes en español
    - Testear 404 para radicados inexistentes
    - _Requirements: 16.9_

- [x] 7. Checkpoint — API y capa de datos
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Componentes UI base (brand, layout, primitivos)
  - [x] 8.1 Crear componentes de brand en `components/brand/`
    - Implementar `Logo` con imagen de `/public/brand/seguros-alfa-logo.png` y alt text accesible
    - Implementar `PrototypeBanner` con texto "Prototipo conceptual" fijo visible en todas las páginas
    - Implementar `Footer` con disclaimer, autor (Carlos Alberto Figueroa Martínez) y fecha (julio 2026)
    - _Requirements: 21.2, 1.7, 1.8_

  - [x] 8.2 Crear componentes UI primitivos en `components/ui/`
    - Implementar `Button` con variantes (primary, secondary, outline, ghost) y estados (hover, focus, loading, disabled)
    - Implementar `Input` con variantes (text, email, tel, select), label accesible y validación inline
    - Implementar `Card` con variantes (default, elevated, bordered)
    - Implementar `Modal` accesible con trap de foco
    - Implementar `Toast` con variantes (success, error, info, warning)
    - Implementar `Badge` con variantes (status, info, warning)
    - Implementar `Skeleton` para estados de carga
    - _Requirements: 21.3, 21.4, 18.2, 18.4_

  - [x] 8.3 Crear componentes de layout en `components/layout/`
    - Implementar `Header` con logo, navegación y PrototypeBanner
    - Implementar `MainLayout` con header, contenido principal y footer
    - Implementar `Navigation` responsiva con estados activos
    - Implementar `Breadcrumb` para orientación contextual
    - _Requirements: 21.2, 19.3, 18.5_

  - [x] 8.4 Crear layout raíz y providers en `app/layout.tsx`
    - Configurar metadata SEO con meta noindex
    - Configurar fuentes y estilos globales Tailwind
    - Envolver con MainLayout + PrototypeBanner
    - Configurar viewport y idioma español
    - _Requirements: 20.5, 22.7, 1.8_

- [ ] 9. Páginas del recorrido (journey)
  - [x] 9.1 Implementar Landing Ejecutiva en `app/page.tsx`
    - Crear sección hero con título, descripción y CTAs a `/prototipo` y `/presentacion`
    - Crear bloque de problema (PDF, baja finalización, reproceso, falta de trazabilidad, abandono)
    - Crear bloque de principios de solución con 5 pasos digitales
    - Crear bloque de beneficios del enfoque digital
    - Crear recorrido visual del flujo completo
    - Crear footer con disclaimer, autor y fecha
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [x] 9.2 Implementar página de inicio en `app/prototipo/page.tsx`
    - Mostrar pantalla de orientación con descripción del flujo y tiempo estimado
    - Implementar botón "Comenzar" que cree sesión vía POST `/api/sessions`
    - Registrar evento `journey_started` al crear sesión
    - Navegar a `/prototipo/seleccion` tras registro exitoso
    - Guardar `sessionId` en contexto/localStorage para uso posterior
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 9.3 Implementar selector guiado en `app/prototipo/seleccion/page.tsx`
    - Crear componente `ProcessSelector` con 3 opciones de trámite
    - Marcar "Actualización de datos de contacto" como activa
    - Marcar las otras 2 opciones como "Próxima oleada" y deshabilitadas
    - Al seleccionar opción activa: registrar evento `process_selected` y navegar a `/prototipo/requisitos`
    - Al intentar seleccionar opción deshabilitada: mostrar mensaje informativo
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 9.4 Implementar checklist de requisitos en `app/prototipo/requisitos/page.tsx`
    - Crear componente `RequirementsChecklist` con tiempo estimado y lista de requisitos
    - Mostrar ítems: número de póliza, documento de identidad, nuevo teléfono, nuevo correo
    - Implementar botón de confirmación que registre evento `requirements_confirmed`
    - Navegar a `/prototipo/formulario` tras confirmación
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 9.5 Implementar formulario wizard en `app/prototipo/formulario/page.tsx`
    - Crear componente `WizardForm` con pasos, indicador de progreso y navegación
    - Dividir formulario en pasos lógicos (datos de póliza, datos personales, nuevos datos de contacto, motivo)
    - Pre-cargar datos demo ficticios (documentos enmascarados, póliza ficticia)
    - Implementar validación en tiempo real campo por campo con Zod
    - Validar paso completo antes de permitir avance al siguiente
    - Mostrar mensajes de error en español junto a campos inválidos
    - Registrar evento `form_started` en primer render y `form_step_changed` al cambiar paso
    - Guardar borrador en localStorage tras cada cambio de campo
    - Implementar persistencia periódica de borrador en Neon vía draft_data
    - Ofrecer restaurar borrador si existe al entrar al formulario
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [ ]* 9.6 Escribir property test para persistencia de borrador
    - **Property 9: Persistencia de borrador en localStorage**
    - **Validates: Requirements 5.7**
    - Crear arbitrary de estados de formulario parciales y completos
    - Verificar que localStorage retorna exactamente los mismos valores tras guardar

  - [x] 9.7 Implementar página de revisión en `app/prototipo/revision/page.tsx`
    - Crear componente `ReviewSummary` mostrando todos los datos capturados
    - Permitir edición por sección regresando al paso correspondiente del wizard
    - Implementar checkbox de consentimiento obligatorio
    - Deshabilitar botón de envío hasta que se marque consentimiento
    - Registrar evento `consent_given` al marcar consentimiento
    - Al enviar: llamar POST `/api/requests` con datos validados
    - Si validación servidor falla: mostrar errores sin perder datos
    - Si exitoso: navegar a `/prototipo/confirmacion/[radicado]`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.4_

  - [x] 9.8 Implementar página de confirmación en `app/prototipo/confirmacion/[radicado]/page.tsx`
    - Crear componente `ConfirmationCard` con código de radicado, instrucciones y botón copiar
    - Mostrar enlace a `/seguimiento/[radicado]`
    - Implementar componente `CESFeedback` con escala 1-5 y comentario opcional
    - Permitir omitir encuesta CES sin bloquear acceso
    - Al enviar CES: llamar POST `/api/feedback`
    - _Requirements: 8.5, 11.1, 11.2, 11.3, 11.4_

- [x] 10. Páginas de seguimiento
  - [x] 10.1 Implementar búsqueda de seguimiento en `app/seguimiento/page.tsx`
    - Crear componente `TrackingSearch` con campo de búsqueda por radicado
    - Validar formato de radicado antes de buscar
    - Al buscar: navegar a `/seguimiento/[radicado]`
    - Registrar evento `tracking_consulted`
    - _Requirements: 9.1, 9.5_

  - [x] 10.2 Implementar timeline de estado en `app/seguimiento/[radicado]/page.tsx`
    - Llamar GET `/api/requests/[trackingCode]` para obtener datos
    - Crear componente `StatusTimeline` con progresión visual de estados
    - Destacar estado actual con `StatusBadge`
    - Mostrar botón "Simular avance" para demostración (llama simulate-status)
    - Mostrar mensaje amigable si radicado no existe (404)
    - _Requirements: 9.2, 9.3, 9.4, 10.1, 10.2, 10.3, 10.4_

  - [ ]* 10.3 Escribir property test para timeline cronológica
    - **Property 6: Timeline en orden cronológico**
    - **Validates: Requirements 9.3**
    - Crear arbitrary de registros de status_history con timestamps variados
    - Verificar que la función de renderizado ordena estrictamente por timestamp sin duplicados consecutivos

- [x] 11. Dashboard de métricas
  - [x] 11.1 Implementar página de métricas en `app/metricas/page.tsx`
    - Llamar GET `/api/metrics` para obtener datos agregados
    - Crear componentes: `KPICard`, `FunnelChart`, `AbandonmentChart`, `CESGauge`, `ComparisonTable`, `TimeChart`
    - Mostrar tarjetas KPI: sesiones, procesos seleccionados, requisitos confirmados, formularios iniciados, solicitudes radicadas
    - Mostrar tasa de finalización como métrica North Star
    - Mostrar visualización de embudo del recorrido
    - Mostrar gráfico de abandono por paso
    - Mostrar score CES promedio con gauge visual
    - Mostrar tiempo promedio de completación
    - Mostrar tabla comparativa proceso PDF vs digital
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8, 12.9_

- [x] 12. Checkpoint — Funcionalidad del recorrido completo
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Páginas informativas
  - [x] 13.1 Implementar página "Acerca del prototipo" en `app/acerca-del-prototipo/page.tsx`
    - Mostrar propósito, alcance, tecnologías utilizadas y limitaciones
    - Incluir disclaimer visible de prototipo conceptual
    - Mostrar arquitectura tecnológica (Next.js, Neon, Vercel, Drizzle, Zod, Tailwind)
    - _Requirements: 13.1, 13.2, 13.3_

  - [x] 13.2 Implementar página de presentación en `app/presentacion/page.tsx`
    - Generar código QR dinámico apuntando a `NEXT_PUBLIC_BASE_URL`
    - Mostrar enlace de producción como texto copiable
    - Optimizar layout para pantallas de proyección (tamaño grande, contraste alto)
    - _Requirements: 14.1, 14.2, 14.3_

  - [x] 13.3 Implementar página 404 personalizada en `app/not-found.tsx`
    - Mostrar mensaje amigable en español
    - Mantener identidad visual corporativa y PrototypeBanner
    - Incluir enlace para volver al inicio
    - _Requirements: 17.1, 17.2, 17.3_

- [x] 14. Seguridad, middleware y headers
  - [x] 14.1 Implementar middleware de seguridad en `middleware.ts`
    - Configurar Content-Security-Policy, X-Content-Type-Options (nosniff), X-Frame-Options (DENY)
    - Configurar Referrer-Policy (strict-origin-when-cross-origin), Permissions-Policy
    - Configurar X-DNS-Prefetch-Control, Strict-Transport-Security
    - Aplicar headers a todas las rutas
    - _Requirements: 20.1_

  - [x] 14.2 Configurar `robots.txt` y meta noindex
    - Crear `public/robots.txt` con Disallow para todas las rutas
    - Verificar que meta noindex está configurado en layout raíz
    - _Requirements: 20.5_

  - [x] 14.3 Implementar logging estructurado en `lib/errors/logger.ts`
    - Crear logger con niveles info, warn, error
    - Asegurar que nunca se incluya PII en logs (emails, teléfonos, documentos, nombres)
    - _Requirements: 20.4_

- [x] 15. Pase de accesibilidad y diseño responsivo
  - [x] 15.1 Auditoría y corrección de accesibilidad WCAG 2.2 AA
    - Verificar roles ARIA en formularios, modales y navegación
    - Asegurar navegación completa por teclado en todos los componentes interactivos
    - Verificar contraste mínimo 4.5:1 para texto normal y 3:1 para texto grande
    - Agregar indicadores de foco visibles en todos los elementos interactivos
    - Verificar estructura jerárquica de encabezados (h1-h6)
    - Implementar aria-live regions para errores de validación en formulario wizard
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6_

  - [x] 15.2 Verificar diseño responsivo mobile-first
    - Verificar breakpoints en 360px, 768px, 1024px y desktop
    - Asegurar tamaño mínimo de toque 44x44px en elementos interactivos móviles
    - Verificar adaptación de navegación, formularios y dashboard a cada breakpoint
    - _Requirements: 19.1, 19.2, 19.3_

- [x] 16. Checkpoint — Seguridad y accesibilidad
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 17. Tests E2E con Playwright
  - [ ]* 17.1 Escribir test E2E del flujo feliz completo
    - Landing → Inicio → Selección → Requisitos → Formulario → Revisión → Confirmación → Seguimiento
    - Verificar navegación correcta entre páginas y registro de eventos
    - _Requirements: 2.1, 2.2, 3.4, 4.2, 5.1, 7.4, 8.4, 9.2_

  - [ ]* 17.2 Escribir test E2E del flujo de seguimiento
    - Búsqueda por radicado → Timeline → Simulación de avance → Verificar nuevo estado
    - _Requirements: 9.1, 9.2, 9.3, 10.1, 10.2_

  - [ ]* 17.3 Escribir test E2E del flujo de métricas
    - Navegar a `/metricas` → Verificar carga de KPIs, embudo y gráficos
    - _Requirements: 12.1, 12.2, 12.3_

  - [ ]* 17.4 Escribir test E2E de validación de formulario
    - Formulario con datos inválidos → Verificar mensajes de error en español → Corregir → Avanzar
    - _Requirements: 5.4, 5.5, 6.1, 6.2, 6.7_

  - [ ]* 17.5 Escribir test E2E de página 404
    - Navegar a ruta inexistente → Verificar página 404 personalizada → Link a inicio
    - _Requirements: 17.1, 17.2, 17.3_

- [x] 18. Documentación del proyecto
  - [x] 18.1 Crear README.md completo
    - Descripción del proyecto, stack tecnológico, instrucciones de instalación
    - Comandos disponibles (dev, build, test, lint, typecheck, db:migrate, db:seed)
    - Variables de entorno necesarias
    - Estructura del proyecto
    - _Requirements: 22.5_

  - [x] 18.2 Crear documentación de seguridad y arquitectura
    - Crear `SECURITY.md` con políticas de seguridad implementadas
    - Crear `ARCHITECTURE.md` con diagrama de capas y decisiones técnicas
    - _Requirements: 20.1, 20.2, 20.3_

- [x] 19. CI/CD Pipeline con GitHub Actions
  - [x] 19.1 Crear workflow de GitHub Actions
    - Crear `.github/workflows/ci.yml` con jobs: lint, typecheck, test, build, e2e
    - Configurar Node.js 20, caché de npm, e instalación de Playwright
    - Configurar secrets para `DATABASE_URL`
    - _Requirements: 22.5, 22.6_

  - [x] 19.2 Configurar despliegue en Vercel
    - Crear `vercel.json` si es necesario para configuración de headers
    - Documentar variables de entorno requeridas en Vercel
    - Verificar que `npm run build` funciona exitosamente
    - _Requirements: 22.6, 19.4_

- [x] 20. Checkpoint final — Build, lint, typecheck y tests completos
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia requerimientos específicos para trazabilidad
- Los checkpoints aseguran validación incremental del proyecto
- Los property tests (fast-check) validan las 9 propiedades de correctitud del diseño
- Los tests unitarios validan ejemplos específicos y edge cases
- Los tests E2E con Playwright cubren los flujos principales de usuario
- La paleta corporativa es: verde #009A76, azul navy #0B2A55, dorado #D89A1D, fondo #F7F9FC
- Todos los mensajes de interfaz deben estar en español con lenguaje claro y no técnico

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["1.3", "1.4"] },
    { "id": 3, "tasks": ["2.1"] },
    { "id": 4, "tasks": ["2.2", "3.1", "3.4"] },
    { "id": 5, "tasks": ["2.3", "3.2", "3.3", "3.5"] },
    { "id": 6, "tasks": ["3.6", "3.7", "3.8", "3.9", "3.10"] },
    { "id": 7, "tasks": ["5.1"] },
    { "id": 8, "tasks": ["5.2", "5.3"] },
    { "id": 9, "tasks": ["5.4", "5.5", "6.1", "6.2"] },
    { "id": 10, "tasks": ["6.3", "6.4", "6.5", "6.6", "6.7", "6.8"] },
    { "id": 11, "tasks": ["6.9", "8.1", "8.2"] },
    { "id": 12, "tasks": ["8.3", "8.4"] },
    { "id": 13, "tasks": ["9.1", "13.1", "13.2", "13.3"] },
    { "id": 14, "tasks": ["9.2", "9.3", "9.4"] },
    { "id": 15, "tasks": ["9.5"] },
    { "id": 16, "tasks": ["9.6", "9.7"] },
    { "id": 17, "tasks": ["9.8", "10.1"] },
    { "id": 18, "tasks": ["10.2", "10.3", "11.1"] },
    { "id": 19, "tasks": ["14.1", "14.2", "14.3"] },
    { "id": 20, "tasks": ["15.1", "15.2"] },
    { "id": 21, "tasks": ["17.1", "17.2", "17.3", "17.4", "17.5"] },
    { "id": 22, "tasks": ["18.1", "18.2"] },
    { "id": 23, "tasks": ["19.1", "19.2"] }
  ]
}
```
