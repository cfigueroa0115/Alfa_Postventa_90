# Documento de Diseño — Alfa Postventa 90

## Overview

Alfa Postventa 90 es un prototipo de autogestión postventa digital para Seguros Alfa que transforma el proceso de "Actualización de datos de contacto" —actualmente dependiente de formularios PDF— en una experiencia web guiada, validada en tiempo real, medible y trazable.

El sistema se implementa como una aplicación Next.js (App Router) desplegada en Vercel con persistencia en Neon PostgreSQL, utilizando TypeScript estricto, Tailwind CSS, Zod para validaciones compartidas cliente/servidor, y Drizzle ORM como capa de acceso a datos.

### Objetivos Técnicos

- **Experiencia guiada**: Formulario wizard multi-paso con validación en tiempo real
- **Trazabilidad completa**: Event tracking anónimo de cada interacción del usuario
- **Medición de impacto**: Dashboard de métricas con embudo de conversión y CES
- **Demostración ejecutiva**: Landing, presentación con QR y datos sintéticos pre-cargados
- **Calidad demostrable**: CI/CD, linting, type-checking, tests unitarios y E2E

## Architecture

### Diagrama de Arquitectura General

```mermaid
graph TB
    subgraph "Cliente (Browser)"
        UI[Next.js App Router - SSR/CSR]
        LS[localStorage - Borradores]
    end

    subgraph "Vercel Edge Network"
        MW[Middleware - Security Headers]
        API[API Routes - /api/*]
        SSR[Server Components]
    end

    subgraph "Persistencia"
        NEON[(Neon PostgreSQL)]
    end

    subgraph "CI/CD"
        GH[GitHub Actions]
        VC[Vercel Deploy]
    end

    UI -->|fetch| API
    UI -->|save draft| LS
    MW --> API
    MW --> SSR
    API -->|Drizzle ORM| NEON
    SSR -->|Drizzle ORM| NEON
    GH -->|lint, typecheck, test| VC
    VC -->|deploy| MW
```

### Decisiones Arquitectónicas

| Decisión | Justificación |
|----------|--------------|
| Next.js App Router | Server Components para SEO, API Routes integradas, streaming SSR |
| Neon PostgreSQL | Serverless PostgreSQL compatible con Vercel, cold start < 500ms |
| Drizzle ORM | Type-safe, ligero, soporte nativo para Neon serverless driver |
| Zod compartido | Esquemas únicos cliente/servidor evitan drift de validaciones |
| Tailwind CSS | Utility-first, tree-shaking agresivo, diseño responsivo eficiente |
| Vitest + RTL + Playwright | Testing pyramid completo: unit → integration → E2E |

### Patrón de Capas

```mermaid
graph LR
    subgraph "Presentación"
        Pages[App Router Pages]
        Components[React Components]
    end

    subgraph "Lógica de Negocio"
        Services[lib/services]
        Validation[lib/validation - Zod]
    end

    subgraph "Acceso a Datos"
        Repos[lib/repositories]
        Schema[db/schema.ts - Drizzle]
    end

    subgraph "Infraestructura"
        DB[(Neon PostgreSQL)]
        Analytics[lib/analytics]
    end

    Pages --> Components
    Components --> Services
    Services --> Validation
    Services --> Repos
    Services --> Analytics
    Repos --> Schema
    Schema --> DB
```

El sistema sigue una arquitectura de 3 capas:

1. **Presentación**: Pages (App Router) + Components (React)
2. **Lógica de Negocio**: Services (orquestación) + Validation (Zod schemas)
3. **Acceso a Datos**: Repositories (Drizzle queries) + Schema (definición de tablas)

## Components and Interfaces

### Estructura del Proyecto

```
alfa-postventa-90/
├── app/
│   ├── layout.tsx                    # Layout raíz con metadata y providers
│   ├── page.tsx                      # Landing Ejecutiva (/)
│   ├── not-found.tsx                 # Página 404 personalizada
│   ├── prototipo/
│   │   ├── page.tsx                  # Inicio del recorrido
│   │   ├── seleccion/page.tsx        # Selector guiado
│   │   ├── requisitos/page.tsx       # Checklist de requisitos
│   │   ├── formulario/page.tsx       # Formulario wizard
│   │   ├── revision/page.tsx         # Revisión pre-envío
│   │   └── confirmacion/
│   │       └── [radicado]/page.tsx   # Confirmación + CES
│   ├── seguimiento/
│   │   ├── page.tsx                  # Búsqueda por radicado
│   │   └── [radicado]/page.tsx       # Timeline de estado
│   ├── metricas/page.tsx             # Dashboard de métricas
│   ├── acerca-del-prototipo/page.tsx # Acerca del prototipo
│   ├── presentacion/page.tsx         # QR y enlace de producción
│   └── api/
│       ├── sessions/route.ts         # POST - crear sesión
│       ├── events/route.ts           # POST - registrar evento
│       ├── requests/
│       │   ├── route.ts              # POST - crear solicitud
│       │   └── [trackingCode]/
│       │       ├── route.ts          # GET - consultar solicitud
│       │       └── simulate-status/route.ts # POST - simular avance
│       ├── feedback/route.ts         # POST - registrar CES
│       ├── metrics/route.ts          # GET - datos dashboard
│       └── health/route.ts           # GET - health check
├── components/
│   ├── brand/                        # Logo, PrototypeBanner, Footer
│   ├── dashboard/                    # KPICard, FunnelChart, AbandonmentChart
│   ├── forms/                        # WizardForm, FormStep, FieldGroup
│   ├── journey/                      # ProcessSelector, RequirementsChecklist
│   ├── layout/                       # Header, MainLayout, Navigation
│   ├── tracking/                     # StatusTimeline, TrackingSearch
│   └── ui/                           # Button, Input, Card, Modal, Toast, Badge
├── db/
│   ├── schema.ts                     # Definición Drizzle de tablas
│   ├── index.ts                      # Conexión Neon + cliente Drizzle
│   ├── migrations/                   # Migraciones generadas por drizzle-kit
│   └── seed.ts                       # Datos sintéticos de demostración
├── lib/
│   ├── analytics/                    # EventTracker, metricsAggregator
│   ├── errors/                       # AppError, errorHandler, errorCodes
│   ├── repositories/                 # sessionsRepo, requestsRepo, eventsRepo
│   ├── services/                     # sessionService, requestService, metricsService
│   └── validation/                   # Zod schemas compartidos
├── tests/
│   ├── e2e/                          # Playwright tests
│   ├── integration/                  # Tests de API routes
│   └── unit/                         # Vitest + RTL tests
├── public/
│   ├── brand/seguros-alfa-logo.png   # Logo corporativo
│   ├── qr/                           # QR generado
│   └── presentation/                 # Assets de presentación
└── drizzle.config.ts                 # Configuración de Drizzle Kit
```

### Componentes Principales

#### Brand (`components/brand/`)

| Componente | Responsabilidad |
|-----------|----------------|
| `Logo` | Renderiza el logo corporativo con alt text accesible |
| `PrototypeBanner` | Banner fijo indicando "Prototipo conceptual" |
| `Footer` | Footer con disclaimer, autor y fecha |

#### Dashboard (`components/dashboard/`)

| Componente | Props | Responsabilidad |
|-----------|-------|----------------|
| `KPICard` | `title, value, change?, icon` | Tarjeta individual de métrica |
| `FunnelChart` | `steps: FunnelStep[]` | Visualización de embudo |
| `AbandonmentChart` | `data: StepAbandonment[]` | Gráfico de abandono por paso |
| `CESGauge` | `score: number` | Indicador visual de score CES |
| `ComparisonTable` | `baseline, digital` | Tabla comparativa PDF vs digital |
| `TimeChart` | `data: TimeMetric[]` | Tiempo promedio de completación |

#### Forms (`components/forms/`)

| Componente | Props | Responsabilidad |
|-----------|-------|----------------|
| `WizardForm` | `steps, onComplete, initialData?` | Contenedor del wizard multi-paso |
| `FormStep` | `fields, onValidate` | Paso individual del wizard |
| `FieldGroup` | `fields: FieldConfig[]` | Grupo de campos con layout |
| `ProgressIndicator` | `currentStep, totalSteps` | Indicador visual de progreso |
| `ValidationMessage` | `error?, success?` | Mensaje de validación inline |

#### Journey (`components/journey/`)

| Componente | Props | Responsabilidad |
|-----------|-------|----------------|
| `ProcessSelector` | `options: ProcessOption[]` | Selector guiado de trámites |
| `RequirementsChecklist` | `items: Requirement[]` | Checklist de requisitos previos |
| `ReviewSummary` | `data: FormData` | Resumen pre-envío con edición |
| `ConfirmationCard` | `trackingCode, instructions` | Tarjeta de confirmación |
| `CESFeedback` | `trackingCode, onSubmit` | Encuesta de esfuerzo CES |

#### Layout (`components/layout/`)

| Componente | Responsabilidad |
|-----------|----------------|
| `Header` | Encabezado con logo, navegación y banner |
| `MainLayout` | Layout principal con header, contenido y footer |
| `Navigation` | Navegación principal responsiva |
| `Breadcrumb` | Migas de pan para orientación contextual |

#### Tracking (`components/tracking/`)

| Componente | Props | Responsabilidad |
|-----------|-------|----------------|
| `TrackingSearch` | `onSearch` | Campo de búsqueda por radicado |
| `StatusTimeline` | `history: StatusEntry[]` | Timeline visual de estados |
| `StatusBadge` | `status: RequestStatus` | Badge de estado con color |

#### UI (`components/ui/`)

| Componente | Variantes | Responsabilidad |
|-----------|-----------|----------------|
| `Button` | `primary, secondary, outline, ghost` | Botón con estados y loading |
| `Input` | `text, email, tel, select` | Input con label y validación |
| `Card` | `default, elevated, bordered` | Contenedor con sombra y borde |
| `Modal` | `default, confirmation` | Diálogo modal accesible |
| `Toast` | `success, error, info, warning` | Notificación temporal |
| `Badge` | `status, info, warning` | Etiqueta pequeña informativa |
| `Skeleton` | — | Placeholder de carga |

### Flujo de Navegación

```mermaid
graph TD
    Landing["/ Landing Ejecutiva"] -->|CTA Prototipo| Inicio
    Landing -->|CTA Presentación| Presentacion["/presentacion"]
    
    Inicio["/prototipo - Inicio"] -->|Crear sesión| Seleccion["/prototipo/seleccion"]
    Seleccion -->|Seleccionar proceso| Requisitos["/prototipo/requisitos"]
    Requisitos -->|Confirmar requisitos| Formulario["/prototipo/formulario"]
    Formulario -->|Completar pasos| Revision["/prototipo/revision"]
    Revision -->|Enviar con consentimiento| Confirmacion["/prototipo/confirmacion/[radicado]"]
    Confirmacion -->|Enlace seguimiento| Seguimiento["/seguimiento/[radicado]"]
    
    SeguimientoBuscar["/seguimiento"] -->|Buscar radicado| Seguimiento
    
    Metricas["/metricas"]
    Acerca["/acerca-del-prototipo"]
    NotFound["404 - No encontrado"]

    style Landing fill:#009A76,color:#fff
    style Confirmacion fill:#D89A1D,color:#fff
    style Metricas fill:#0B2A55,color:#fff
```

### Máquina de Estados de Solicitud

```mermaid
stateDiagram-v2
    [*] --> Radicado: POST /api/requests
    Radicado --> EnValidacion: simulate-status
    EnValidacion --> Procesado: simulate-status
    Procesado --> Finalizado: simulate-status
    Finalizado --> [*]
    
    note right of Radicado: Estado inicial al crear solicitud
    note right of EnValidacion: Validación de documentos
    note right of Procesado: En proceso de actualización
    note right of Finalizado: Trámite completado exitosamente
```

## Data Models

### Diagrama Entidad-Relación

```mermaid
erDiagram
    demo_sessions ||--o{ tracking_events : "tiene"
    demo_sessions ||--o{ demo_requests : "genera"
    demo_requests ||--o{ status_history : "tiene"
    demo_requests ||--o| feedback : "recibe"

    demo_sessions {
        uuid id PK
        timestamp started_at
        timestamp ended_at
        varchar user_agent
        varchar viewport
        varchar referrer
        timestamp created_at
    }

    demo_requests {
        uuid id PK
        uuid session_id FK
        varchar tracking_code UK
        varchar status
        jsonb form_data
        jsonb draft_data
        timestamp filed_at
        timestamp updated_at
        timestamp created_at
    }

    tracking_events {
        uuid id PK
        uuid session_id FK
        varchar event_type
        varchar step
        jsonb metadata
        timestamp created_at
    }

    status_history {
        uuid id PK
        uuid request_id FK
        varchar status
        varchar description
        timestamp changed_at
        timestamp created_at
    }

    feedback {
        uuid id PK
        uuid request_id FK
        varchar tracking_code
        integer ces_score
        text comment
        timestamp created_at
    }
```

### Definición Completa de Tablas

#### Tabla `demo_sessions`

Registra sesiones anónimas de demostración del prototipo.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Identificador único de sesión |
| `started_at` | `timestamp with time zone` | NOT NULL, default `now()` | Inicio de la sesión |
| `ended_at` | `timestamp with time zone` | NULL | Fin de la sesión (si se completa) |
| `user_agent` | `varchar(512)` | NULL | User-Agent del navegador (sin PII) |
| `viewport` | `varchar(20)` | NULL | Viewport: "mobile", "tablet", "desktop" |
| `referrer` | `varchar(512)` | NULL | Referrer de origen (sin PII) |
| `created_at` | `timestamp with time zone` | NOT NULL, default `now()` | Timestamp de creación del registro |

**Índices**: `idx_sessions_started_at` en `started_at`

#### Tabla `demo_requests`

Almacena las solicitudes de actualización de datos radicadas.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Identificador único de solicitud |
| `session_id` | `uuid` | FK → demo_sessions.id, NOT NULL | Sesión que generó la solicitud |
| `tracking_code` | `varchar(25)` | UNIQUE, NOT NULL | Código de radicado (DEMO-ALFA-YYYYMMDD-XXXX) |
| `status` | `varchar(20)` | NOT NULL, default `'radicado'` | Estado actual: radicado, en_validacion, procesado, finalizado |
| `form_data` | `jsonb` | NOT NULL | Datos del formulario validados y enviados |
| `draft_data` | `jsonb` | NULL | Último borrador sincronizado |
| `filed_at` | `timestamp with time zone` | NOT NULL, default `now()` | Fecha de radicación |
| `updated_at` | `timestamp with time zone` | NOT NULL, default `now()` | Última actualización |
| `created_at` | `timestamp with time zone` | NOT NULL, default `now()` | Timestamp de creación |

**Índices**: `idx_requests_tracking_code` en `tracking_code`, `idx_requests_session_id` en `session_id`

**Check constraint**: `status IN ('radicado', 'en_validacion', 'procesado', 'finalizado')`

#### Tabla `tracking_events`

Registra eventos anónimos de interacción durante el recorrido.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Identificador único del evento |
| `session_id` | `uuid` | FK → demo_sessions.id, NOT NULL | Sesión asociada al evento |
| `event_type` | `varchar(50)` | NOT NULL | Tipo: journey_started, process_selected, requirements_confirmed, form_started, form_step_changed, consent_given, request_filed, tracking_consulted, feedback_submitted, status_simulated |
| `step` | `varchar(50)` | NULL | Paso actual del recorrido |
| `metadata` | `jsonb` | NULL | Datos contextuales adicionales (sin PII) |
| `created_at` | `timestamp with time zone` | NOT NULL, default `now()` | Timestamp del evento |

**Índices**: `idx_events_session_id` en `session_id`, `idx_events_type` en `event_type`, `idx_events_created_at` en `created_at`

#### Tabla `status_history`

Historial de cambios de estado de una solicitud para la timeline.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Identificador único del registro |
| `request_id` | `uuid` | FK → demo_requests.id, NOT NULL | Solicitud asociada |
| `status` | `varchar(20)` | NOT NULL | Estado alcanzado |
| `description` | `varchar(255)` | NULL | Descripción legible del cambio |
| `changed_at` | `timestamp with time zone` | NOT NULL, default `now()` | Momento del cambio de estado |
| `created_at` | `timestamp with time zone` | NOT NULL, default `now()` | Timestamp de creación |

**Índices**: `idx_status_history_request_id` en `request_id`, `idx_status_history_changed_at` en `changed_at`

#### Tabla `feedback`

Calificaciones CES (Customer Effort Score) asociadas a solicitudes.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Identificador único del feedback |
| `request_id` | `uuid` | FK → demo_requests.id, NOT NULL | Solicitud calificada |
| `tracking_code` | `varchar(25)` | NOT NULL | Código de radicado (desnormalizado para consulta rápida) |
| `ces_score` | `integer` | NOT NULL, CHECK (1-5) | Score CES: 1=muy difícil, 5=muy fácil |
| `comment` | `text` | NULL | Comentario opcional del usuario |
| `created_at` | `timestamp with time zone` | NOT NULL, default `now()` | Timestamp de creación |

**Índices**: `idx_feedback_request_id` en `request_id`, `idx_feedback_tracking_code` en `tracking_code`

**Check constraint**: `ces_score >= 1 AND ces_score <= 5`

### Esquema Drizzle (db/schema.ts)

```typescript
import { pgTable, uuid, varchar, timestamp, jsonb, integer, text, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const demoSessions = pgTable('demo_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  endedAt: timestamp('ended_at', { withTimezone: true }),
  userAgent: varchar('user_agent', { length: 512 }),
  viewport: varchar('viewport', { length: 20 }),
  referrer: varchar('referrer', { length: 512 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const demoRequests = pgTable('demo_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').notNull().references(() => demoSessions.id),
  trackingCode: varchar('tracking_code', { length: 25 }).notNull().unique(),
  status: varchar('status', { length: 20 }).notNull().default('radicado'),
  formData: jsonb('form_data').notNull(),
  draftData: jsonb('draft_data'),
  filedAt: timestamp('filed_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const trackingEvents = pgTable('tracking_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').notNull().references(() => demoSessions.id),
  eventType: varchar('event_type', { length: 50 }).notNull(),
  step: varchar('step', { length: 50 }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const statusHistory = pgTable('status_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  requestId: uuid('request_id').notNull().references(() => demoRequests.id),
  status: varchar('status', { length: 20 }).notNull(),
  description: varchar('description', { length: 255 }),
  changedAt: timestamp('changed_at', { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const feedback = pgTable('feedback', {
  id: uuid('id').primaryKey().defaultRandom(),
  requestId: uuid('request_id').notNull().references(() => demoRequests.id),
  trackingCode: varchar('tracking_code', { length: 25 }).notNull(),
  cesScore: integer('ces_score').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
```

## Diseño de API

### Endpoints

#### POST `/api/sessions`

Crea una sesión de demostración anónima.

**Request Body:**
```json
{
  "userAgent": "Mozilla/5.0...",
  "viewport": "desktop",
  "referrer": "https://example.com"
}
```

**Response 201:**
```json
{
  "sessionId": "uuid-v4",
  "startedAt": "2026-07-15T10:00:00Z"
}
```

#### POST `/api/events`

Registra un evento de tracking asociado a una sesión.

**Request Body:**
```json
{
  "sessionId": "uuid-v4",
  "eventType": "journey_started",
  "step": "inicio",
  "metadata": { "source": "cta_hero" }
}
```

**Response 201:**
```json
{
  "eventId": "uuid-v4",
  "createdAt": "2026-07-15T10:00:05Z"
}
```

**Tipos de evento válidos:** `journey_started`, `process_selected`, `requirements_confirmed`, `form_started`, `form_step_changed`, `consent_given`, `request_filed`, `tracking_consulted`, `feedback_submitted`, `status_simulated`

#### POST `/api/requests`

Crea una solicitud de actualización de datos con validación completa.

**Request Body:**
```json
{
  "sessionId": "uuid-v4",
  "formData": {
    "policyNumber": "POL-DEMO-12345",
    "documentType": "CC",
    "documentNumber": "1234****90",
    "fullName": "Carlos Demo Ejemplo",
    "newPhone": "3001234567",
    "newEmail": "demo@ejemplo.com",
    "confirmEmail": "demo@ejemplo.com",
    "reason": "Cambio de número telefónico"
  }
}
```

**Response 201:**
```json
{
  "requestId": "uuid-v4",
  "trackingCode": "DEMO-ALFA-20260715-0001",
  "status": "radicado",
  "filedAt": "2026-07-15T10:05:00Z"
}
```

**Response 400 (validación fallida):**
```json
{
  "error": "Datos inválidos",
  "details": [
    { "field": "newPhone", "message": "El teléfono debe tener 10 dígitos y comenzar con 3" },
    { "field": "confirmEmail", "message": "Los correos electrónicos no coinciden" }
  ]
}
```

#### GET `/api/requests/[trackingCode]`

Consulta el estado y timeline de una solicitud por código de radicado.

**Response 200:**
```json
{
  "requestId": "uuid-v4",
  "trackingCode": "DEMO-ALFA-20260715-0001",
  "status": "en_validacion",
  "filedAt": "2026-07-15T10:05:00Z",
  "timeline": [
    {
      "status": "radicado",
      "description": "Solicitud radicada exitosamente",
      "changedAt": "2026-07-15T10:05:00Z"
    },
    {
      "status": "en_validacion",
      "description": "Documentos en proceso de validación",
      "changedAt": "2026-07-15T10:10:00Z"
    }
  ]
}
```

**Response 404:**
```json
{
  "error": "No se encontró una solicitud con el código proporcionado"
}
```

#### POST `/api/requests/[trackingCode]/simulate-status`

Avanza el estado de la solicitud al siguiente en la secuencia.

**Response 200:**
```json
{
  "trackingCode": "DEMO-ALFA-20260715-0001",
  "previousStatus": "radicado",
  "newStatus": "en_validacion",
  "changedAt": "2026-07-15T10:10:00Z"
}
```

**Response 400 (ya finalizado):**
```json
{
  "error": "La solicitud ya se encuentra en estado finalizado. No hay más estados por avanzar."
}
```

#### POST `/api/feedback`

Registra calificación CES asociada a un radicado.

**Request Body:**
```json
{
  "trackingCode": "DEMO-ALFA-20260715-0001",
  "cesScore": 4,
  "comment": "Proceso claro y rápido"
}
```

**Response 201:**
```json
{
  "feedbackId": "uuid-v4",
  "createdAt": "2026-07-15T10:06:00Z"
}
```

#### GET `/api/metrics`

Retorna datos agregados para el dashboard de métricas.

**Response 200:**
```json
{
  "kpis": {
    "totalSessions": 150,
    "processesSelected": 130,
    "requirementsConfirmed": 120,
    "formsStarted": 115,
    "requestsFiled": 105
  },
  "completionRate": 0.70,
  "averageCES": 4.2,
  "averageCompletionTimeSeconds": 240,
  "funnel": [
    { "step": "Sesión iniciada", "count": 150, "percentage": 100 },
    { "step": "Proceso seleccionado", "count": 130, "percentage": 87 },
    { "step": "Requisitos confirmados", "count": 120, "percentage": 80 },
    { "step": "Formulario iniciado", "count": 115, "percentage": 77 },
    { "step": "Solicitud radicada", "count": 105, "percentage": 70 }
  ],
  "abandonmentByStep": [
    { "step": "Selección", "rate": 0.13 },
    { "step": "Requisitos", "rate": 0.08 },
    { "step": "Formulario", "rate": 0.04 },
    { "step": "Revisión", "rate": 0.09 }
  ],
  "isSynthetic": true
}
```

#### GET `/api/health`

Health check con estado de conectividad a la base de datos.

**Response 200:**
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-07-15T10:00:00Z",
  "version": "1.0.0"
}
```

**Response 503:**
```json
{
  "status": "degraded",
  "database": "disconnected",
  "timestamp": "2026-07-15T10:00:00Z",
  "error": "Connection timeout"
}
```

## Estrategia de Validación

### Esquemas Zod Compartidos (lib/validation/)

Los esquemas Zod se definen una sola vez y se usan tanto en el cliente (validación en tiempo real) como en el servidor (validación antes de persistir).

```typescript
// lib/validation/schemas.ts
import { z } from 'zod';

// Teléfono colombiano: 10 dígitos, inicia con 3
export const colombianPhoneSchema = z
  .string()
  .regex(/^3\d{9}$/, 'El teléfono debe tener 10 dígitos y comenzar con 3');

// Email con confirmación
export const emailSchema = z.string().email('Formato de correo electrónico inválido');

// Formulario de actualización de datos
export const updateContactFormSchema = z.object({
  policyNumber: z.string().min(1, 'El número de póliza es obligatorio'),
  documentType: z.enum(['CC', 'CE', 'NIT', 'PP'], {
    errorMap: () => ({ message: 'Seleccione un tipo de documento válido' }),
  }),
  documentNumber: z.string().min(1, 'El número de documento es obligatorio'),
  fullName: z.string().min(1, 'El nombre completo es obligatorio').max(150, 'Máximo 150 caracteres'),
  newPhone: colombianPhoneSchema,
  newEmail: emailSchema,
  confirmEmail: emailSchema,
  reason: z.string().min(1, 'Indique el motivo de la actualización').max(500, 'Máximo 500 caracteres'),
}).refine(
  (data) => data.newEmail.toLowerCase() === data.confirmEmail.toLowerCase(),
  { message: 'Los correos electrónicos no coinciden', path: ['confirmEmail'] }
);

// Evento de tracking
export const trackingEventSchema = z.object({
  sessionId: z.string().uuid('ID de sesión inválido'),
  eventType: z.enum([
    'journey_started', 'process_selected', 'requirements_confirmed',
    'form_started', 'form_step_changed', 'consent_given',
    'request_filed', 'tracking_consulted', 'feedback_submitted', 'status_simulated'
  ]),
  step: z.string().max(50).optional(),
  metadata: z.record(z.unknown()).optional(),
});

// Feedback CES
export const feedbackSchema = z.object({
  trackingCode: z.string().regex(/^DEMO-ALFA-\d{8}-\d{4}$/, 'Código de radicado inválido'),
  cesScore: z.number().int().min(1, 'Mínimo 1').max(5, 'Máximo 5'),
  comment: z.string().max(1000, 'Máximo 1000 caracteres').optional(),
});

// Crear sesión
export const createSessionSchema = z.object({
  userAgent: z.string().max(512).optional(),
  viewport: z.enum(['mobile', 'tablet', 'desktop']).optional(),
  referrer: z.string().max(512).optional(),
});
```

### Flujo de Validación

```mermaid
graph LR
    subgraph "Cliente"
        Input[Input del usuario] --> ZodClient[Zod Schema - validación en tiempo real]
        ZodClient -->|válido| Submit[Enviar al servidor]
        ZodClient -->|inválido| ErrorUI[Mostrar error inline]
    end

    subgraph "Servidor"
        Submit --> ZodServer[Zod Schema - misma validación]
        ZodServer -->|válido| Sanitize[Sanitizar + Persistir]
        ZodServer -->|inválido| Error400[HTTP 400 + detalles]
    end

    Error400 --> ErrorUI
```

### Sanitización

- Todo input de texto pasa por `DOMPurify` o equivalente server-side antes de almacenar
- Se eliminan tags HTML, scripts y caracteres de control
- Los campos `metadata` de eventos se validan como JSON plano (sin funciones ni prototypes)

## Seguridad

### Encabezados HTTP (middleware.ts)

```typescript
// Encabezados de seguridad configurados en Next.js middleware
const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'X-DNS-Prefetch-Control': 'on',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};
```

### Estrategia de Seguridad

| Aspecto | Implementación |
|---------|---------------|
| Inyección XSS | Sanitización con librería en servidor + React escape por defecto |
| CSRF | No aplica (no hay cookies de sesión, API stateless) |
| SQL Injection | Drizzle ORM usa parametrized queries siempre |
| Datos sensibles | Sin PII real; todos los datos son ficticios/demo |
| Indexación | `robots.txt` con Disallow + meta `noindex` |
| Rate limiting | No implementado (prototipo de uso individual) |
| CORS | Default same-origin (API y frontend en mismo dominio) |
| Logging | Logging estructurado sin PII |

### Protección de Datos

- No se almacena PII real en ninguna tabla
- Los números de documento se muestran enmascarados (1234****90)
- Los datos del formulario son explícitamente ficticios
- Los eventos de tracking no capturan contenido de campos, solo tipos de acción
- `robots.txt` deniega indexación de todas las rutas

## Arquitectura de Tracking y Analítica

### Diseño del Event Tracker

```typescript
// lib/analytics/event-tracker.ts
interface TrackingEvent {
  sessionId: string;
  eventType: EventType;
  step?: string;
  metadata?: Record<string, unknown>;
}

class EventTracker {
  private sessionId: string | null = null;

  async initialize(sessionData: CreateSessionInput): Promise<string> {
    const response = await fetch('/api/sessions', { method: 'POST', body: JSON.stringify(sessionData) });
    const { sessionId } = await response.json();
    this.sessionId = sessionId;
    return sessionId;
  }

  async track(eventType: EventType, step?: string, metadata?: Record<string, unknown>): Promise<void> {
    if (!this.sessionId) return;
    await fetch('/api/events', {
      method: 'POST',
      body: JSON.stringify({ sessionId: this.sessionId, eventType, step, metadata }),
    });
  }
}
```

### Agregación de Métricas

El servicio de métricas (`lib/services/metricsService.ts`) combina:

1. **Datos reales**: Conteos de eventos agrupados por tipo desde `tracking_events`
2. **Datos sintéticos**: Generados en `db/seed.ts` para demostración del dashboard completo

La respuesta de `/api/metrics` incluye un campo `isSynthetic: boolean` que indica si los datos son reales o combinados con sintéticos.

### Eventos del Recorrido

| Evento | Paso | Disparado en |
|--------|------|-------------|
| `journey_started` | inicio | /prototipo - click continuar |
| `process_selected` | seleccion | /prototipo/seleccion - click opción |
| `requirements_confirmed` | requisitos | /prototipo/requisitos - click confirmar |
| `form_started` | formulario | /prototipo/formulario - primer render |
| `form_step_changed` | formulario | Cambio de paso en wizard |
| `consent_given` | revision | /prototipo/revision - check consentimiento |
| `request_filed` | confirmacion | Radicación exitosa |
| `tracking_consulted` | seguimiento | /seguimiento - búsqueda exitosa |
| `feedback_submitted` | confirmacion | Envío de score CES |
| `status_simulated` | seguimiento | Simulación de avance |

## Estrategia de Despliegue

### Pipeline CI/CD

```mermaid
graph LR
    subgraph "GitHub"
        Push[Push a main/PR]
    end

    subgraph "GitHub Actions"
        Lint[npm run lint]
        Types[npm run typecheck]
        UnitTest[npm run test]
        Build[npm run build]
        E2E[npm run test:e2e]
    end

    subgraph "Vercel"
        Preview[Preview Deploy - PR]
        Prod[Production Deploy - main]
    end

    Push --> Lint
    Lint --> Types
    Types --> UnitTest
    UnitTest --> Build
    Build --> E2E
    E2E -->|PR| Preview
    E2E -->|main| Prod
```

### Configuración de Despliegue

| Componente | Configuración |
|-----------|--------------|
| **Hosting** | Vercel (Free tier) |
| **Base de datos** | Neon PostgreSQL (Free tier) |
| **Build command** | `npm run build` |
| **Output directory** | `.next` |
| **Node.js version** | 20.x |
| **Environment variables** | `DATABASE_URL`, `NEXT_PUBLIC_BASE_URL` |

### Variables de Entorno

```env
# Base de datos Neon
DATABASE_URL=postgresql://user:pass@host.neon.tech/dbname?sslmode=require

# URL pública del prototipo (para QR y enlaces)
NEXT_PUBLIC_BASE_URL=https://alfa-postventa-90.vercel.app

# Entorno
NODE_ENV=production
```

### GitHub Actions Workflow

```yaml
name: CI/CD
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test
      - run: npm run build
      
  e2e:
    needs: quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

## Decisiones Técnicas y Justificación

| # | Decisión | Alternativas Consideradas | Justificación |
|---|----------|--------------------------|---------------|
| 1 | Next.js App Router | Pages Router, Remix, Astro | App Router ofrece Server Components, streaming SSR, API Routes colocalizado. Ideal para prototipo con SSR + interactividad |
| 2 | Drizzle ORM | Prisma, Kysely, raw SQL | Drizzle es type-safe, ligero (<50KB), y tiene soporte nativo para Neon serverless driver sin connection pooler |
| 3 | Neon PostgreSQL | Supabase, PlanetScale, Turso | Neon ofrece serverless PostgreSQL con branching, cold start <500ms y tier gratuito generoso |
| 4 | Zod compartido | Yup, Joi, class-validator | Zod es TypeScript-first, infiere tipos automáticamente, funciona en browser y Node sin adaptación |
| 5 | Tailwind CSS | CSS Modules, Styled Components, Chakra | Utility-first permite prototipado rápido, tree-shaking agresivo, y diseño responsivo inline |
| 6 | UUID v4 como PK | Auto-increment, ULID, nanoid | UUIDs son nativos de PostgreSQL, evitan exposición de secuencias, y permiten generación en cliente |
| 7 | localStorage + Neon para borradores | Solo localStorage, IndexedDB, SessionStorage | Dual persistence: localStorage para inmediatez, Neon para recuperación entre dispositivos/sesiones |
| 8 | Vitest | Jest | Vitest tiene compatibilidad ESM nativa, ejecución más rápida, y configuración mínima con Vite |
| 9 | JSONB para form_data | Columnas individuales | JSONB permite flexibilidad en la estructura del formulario sin migraciones adicionales |
| 10 | Tracking code determinístico | UUID, nanoid | DEMO-ALFA-YYYYMMDD-XXXX es legible, memorable, y facilita la demostración presencial |

## Correctness Properties

*Una propiedad es una característica o comportamiento que debe mantenerse verdadero en todas las ejecuciones válidas de un sistema — esencialmente, una declaración formal sobre lo que el sistema debe hacer. Las propiedades sirven como puente entre especificaciones legibles por humanos y garantías de correctitud verificables por máquina.*

### Property 1: Validación Zod acepta datos válidos y rechaza inválidos

*Para cualquier* dato de formulario generado aleatoriamente, si cumple las reglas de validación (email con formato válido, ambos emails coinciden case-insensitive, teléfono de 10 dígitos iniciando con 3, campos obligatorios presentes, longitud máxima respetada), entonces el esquema Zod lo acepta. Si viola cualquier regla, el esquema lo rechaza con al menos un error.

**Validates: Requirements 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 8.1, 8.2**

### Property 2: Sanitización elimina contenido ejecutable

*Para cualquier* cadena de texto con contenido HTML/JavaScript inyectado (tags `<script>`, event handlers `onclick`, `onerror`, `javascript:` URIs), la función de sanitización debe producir una salida que no contenga ningún patrón ejecutable.

**Validates: Requirements 6.5, 20.2**

### Property 3: Mensajes de error en español y descriptivos

*Para cualquier* dato de formulario inválido que falle la validación Zod, cada error producido debe tener un campo `message` que sea una cadena no vacía, no contenga términos técnicos en inglés (como "required", "invalid", "must be"), y esté en idioma español.

**Validates: Requirements 6.7, 16.9**

### Property 4: Formato de código de radicado

*Para cualquier* fecha válida y número de secuencia (1-9999), la función de generación de tracking code debe producir un string que coincida exactamente con el patrón `DEMO-ALFA-YYYYMMDD-XXXX` donde YYYY es el año de 4 dígitos, MM el mes (01-12), DD el día (01-31) y XXXX el consecutivo rellenado con ceros a la izquierda.

**Validates: Requirements 8.3**

### Property 5: Máquina de estados — transición correcta

*Para cualquier* solicitud con estado actual en {radicado, en_validacion, procesado}, invocar la transición debe producir exactamente el estado siguiente en la secuencia definida (radicado→en_validacion, en_validacion→procesado, procesado→finalizado). Para estado "finalizado", la transición debe producir un error.

**Validates: Requirements 10.1, 10.3**

### Property 6: Timeline en orden cronológico

*Para cualquier* conjunto de registros de status_history asociados a una solicitud, la función de renderizado de timeline debe presentarlos en orden estrictamente creciente por timestamp (`changed_at`), sin duplicados de estado consecutivos.

**Validates: Requirements 9.3**

### Property 7: Cálculos de métricas matemáticamente correctos

*Para cualquier* conjunto de sesiones y eventos generados aleatoriamente:
- La tasa de finalización debe ser igual a (solicitudes radicadas / sesiones iniciadas), con valor entre 0 y 1
- El promedio CES debe ser igual a la media aritmética de los scores, con valor entre 1 y 5
- El tiempo promedio de completación debe ser igual a la media de las diferencias (filed_at - started_at) en segundos

**Validates: Requirements 12.2, 12.5, 12.6**

### Property 8: Eventos y logs libres de PII

*Para cualquier* evento de tracking creado con metadata arbitraria, el registro almacenado no debe contener patrones de PII (emails con @, números de teléfono de 10 dígitos, números de documento, nombres completos en campos no permitidos).

**Validates: Requirements 15.5, 20.4**

### Property 9: Persistencia de borrador en localStorage

*Para cualquier* estado de formulario (parcial o completo) después de un cambio de campo, la lectura de localStorage debe retornar un objeto que contenga exactamente los mismos valores de campo que el estado actual del formulario.

**Validates: Requirements 5.7**

## Error Handling

### Estrategia General

El sistema implementa una jerarquía de errores estructurada con manejo específico por capa:

```typescript
// lib/errors/app-error.ts
export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    public readonly message: string,
    public readonly statusCode: number = 500,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
  }
}

export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  STATE_TRANSITION_ERROR = 'STATE_TRANSITION_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}
```

### Manejo por Capa

| Capa | Estrategia | Respuesta al Usuario |
|------|-----------|---------------------|
| **Validación (Zod)** | Parse con `.safeParse()`, retorna errores campo por campo | Mensajes inline en español junto a cada campo |
| **API Routes** | Try/catch con mapeo a HTTP status codes | JSON con `error` y `details` en español |
| **Repositorios** | Wrap errores de DB en AppError con contexto | Log interno + error genérico al usuario |
| **Servicios** | Propagación de AppError, catch de errores inesperados | Mensaje apropiado según tipo de error |
| **Componentes UI** | Error boundaries + estados de error locales | UI amigable con opción de reintentar |

### Códigos HTTP por Tipo de Error

| Código | Uso |
|--------|-----|
| 200 | Operación exitosa (GET, simulación) |
| 201 | Recurso creado exitosamente (POST) |
| 400 | Validación fallida / datos inválidos |
| 404 | Recurso no encontrado (radicado inexistente) |
| 500 | Error interno no anticipado |
| 503 | Base de datos no disponible (health check degradado) |

### Error Boundaries

```typescript
// app/error.tsx - Error boundary global
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert" aria-live="assertive">
      <h2>Algo salió mal</h2>
      <p>Estamos trabajando para solucionarlo. Por favor intenta de nuevo.</p>
      <Button onClick={reset}>Reintentar</Button>
    </div>
  );
}
```

### Logging Estructurado

```typescript
// lib/errors/logger.ts
interface LogEntry {
  level: 'info' | 'warn' | 'error';
  code: string;
  message: string;
  timestamp: string;
  requestId?: string;
  // NUNCA incluir PII: emails, teléfonos, documentos, nombres
}
```

## Testing Strategy

### Pirámide de Tests

```
         ┌──────────┐
         │   E2E    │  Playwright (flujos completos)
         │  (~10)   │
        ┌┴──────────┴┐
        │ Integration │  API Routes + DB (Vitest)
        │   (~25)     │
       ┌┴─────────────┴┐
       │    Unit Tests   │  Componentes + Lógica (Vitest + RTL)
       │     (~60)       │
      ┌┴─────────────────┴┐
      │  Property Tests     │  Correctness Properties (Vitest + fast-check)
      │      (~9)           │
      └─────────────────────┘
```

### Herramientas

| Herramienta | Uso |
|-------------|-----|
| **Vitest** | Tests unitarios e integración |
| **React Testing Library** | Tests de componentes |
| **fast-check** | Property-based testing |
| **Playwright** | Tests E2E cross-browser |
| **axe-core** | Auditoría de accesibilidad |
| **MSW** | Mock de API para tests de componentes |

### Testing Dual: Unit + Property

- **Tests unitarios**: Verifican ejemplos específicos, edge cases y condiciones de error
- **Tests de propiedad**: Verifican propiedades universales a través de inputs generados aleatoriamente
- Ambos son complementarios y necesarios para cobertura comprehensiva

### Configuración de Property Tests

- **Librería**: `fast-check` (JavaScript/TypeScript property-based testing)
- **Iteraciones mínimas**: 100 por propiedad
- **Formato de tag**: `Feature: alfa-postventa-90, Property {N}: {título}`
- **Ubicación**: `tests/unit/properties/`

Cada test de propiedad implementa exactamente UNA propiedad del documento de diseño:

```typescript
// tests/unit/properties/validation.property.test.ts
import { fc } from 'fast-check';
import { describe, it, expect } from 'vitest';

describe('Feature: alfa-postventa-90, Property 1: Validación Zod acepta/rechaza', () => {
  it('acepta datos válidos', () => {
    fc.assert(
      fc.property(validFormDataArbitrary, (formData) => {
        const result = updateContactFormSchema.safeParse(formData);
        expect(result.success).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('rechaza datos inválidos', () => {
    fc.assert(
      fc.property(invalidFormDataArbitrary, (formData) => {
        const result = updateContactFormSchema.safeParse(formData);
        expect(result.success).toBe(false);
      }),
      { numRuns: 100 }
    );
  });
});
```

### Tests E2E (Playwright)

Cubren los flujos completos del recorrido:

1. **Flujo feliz completo**: Landing → Inicio → Selección → Requisitos → Formulario → Revisión → Confirmación → Seguimiento
2. **Flujo de seguimiento**: Búsqueda por radicado → Timeline → Simulación de avance
3. **Flujo de métricas**: Dashboard con datos cargados
4. **Flujo de error**: Formulario con datos inválidos → mensajes de error
5. **Flujo 404**: Ruta inexistente → Página 404

### Comandos npm

```json
{
  "scripts": {
    "test": "vitest --run",
    "test:watch": "vitest",
    "test:coverage": "vitest --run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "lint": "eslint . --ext .ts,.tsx",
    "typecheck": "tsc --noEmit"
  }
}
```

