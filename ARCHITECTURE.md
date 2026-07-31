# Arquitectura — Alfa Postventa 90

## Capas

1. **Presentación**: Next.js App Router + React Components + Tailwind CSS
2. **Lógica de Negocio**: Services + Zod Validation + State Machine
3. **Acceso a Datos**: Repositories + Drizzle ORM + Neon PostgreSQL

## Flujo de una Solicitud

1. Cliente crea sesión (POST /api/sessions)
2. Eventos de tracking se registran en cada paso (POST /api/events)
3. Al completar el formulario, se radica (POST /api/requests)
4. Se genera código de seguimiento DEMO-ALFA-YYYYMMDD-XXXX
5. Estado consultable vía GET /api/requests/[trackingCode]
6. Avance simulable vía POST /api/requests/[trackingCode]/simulate-status

## Modelo de Datos

5 tablas: demo_sessions, demo_requests, tracking_events, status_history, feedback

## Despliegue

- Vercel: hosting + Edge Functions
- Neon: PostgreSQL serverless
- GitHub Actions: CI/CD pipeline
