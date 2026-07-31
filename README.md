# Alfa Postventa 90

Prototipo de autogestión postventa digital para Seguros Alfa. Transforma el proceso de "Actualización de datos de contacto" —actualmente dependiente de formularios PDF— en una experiencia web guiada, validada en tiempo real, medible y trazable.

> **⚠️ Prototipo conceptual:** Este proyecto es una prueba de concepto. No utiliza datos reales de clientes ni se conecta a sistemas productivos de ninguna aseguradora. Todos los datos son sintéticos o ficticios.

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 14 (App Router) |
| Lenguaje | TypeScript (modo estricto) |
| Estilos | Tailwind CSS |
| Base de datos | Neon PostgreSQL (serverless) |
| ORM | Drizzle ORM |
| Validación | Zod (compartida cliente/servidor) |
| Testing unitario | Vitest + React Testing Library |
| Testing E2E | Playwright |
| Property testing | fast-check |
| Despliegue | Vercel |
| CI/CD | GitHub Actions |

---

## Requisitos Previos

- Node.js 20+ (LTS)
- npm 10+
- Cuenta en [Neon](https://neon.tech) con base de datos PostgreSQL aprovisionada
- (Opcional) Cuenta en Vercel para despliegue

---

## Instalación

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd alfa-postventa-90

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env.local
```

---

## Variables de Entorno

Crear un archivo `.env.local` con las siguientes variables:

```env
DATABASE_URL=postgresql://usuario:password@host/database?sslmode=require
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

## Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo (localhost:3000) |
| `npm run build` | Compilación de producción |
| `npm run start` | Servidor de producción |
| `npm run lint` | Análisis estático con ESLint |
| `npm run typecheck` | Verificación de tipos TypeScript |
| `npm run test` | Tests unitarios con Vitest |
| `npm run test:e2e` | Tests end-to-end con Playwright |
| `npm run db:generate` | Generar migraciones con Drizzle Kit |
| `npm run db:migrate` | Aplicar migraciones a Neon |
| `npm run db:seed` | Poblar base de datos con datos sintéticos |

---

## Estructura del Proyecto

```
alfa-postventa-90/
├── app/                    # Páginas y API routes (Next.js App Router)
│   ├── api/                # Endpoints REST
│   ├── prototipo/          # Flujo del recorrido guiado
│   ├── seguimiento/        # Consulta de estado por radicado
│   ├── metricas/           # Dashboard de métricas
│   └── ...
├── components/             # Componentes React reutilizables
│   ├── brand/              # Logo, banner, footer corporativo
│   ├── dashboard/          # Gráficos y KPIs
│   ├── forms/              # Formulario wizard
│   ├── journey/            # Selector, checklist, confirmación
│   ├── layout/             # Header, navegación, layout principal
│   ├── tracking/           # Timeline de estado
│   └── ui/                 # Primitivos (Button, Input, Card, etc.)
├── db/                     # Esquema Drizzle, migraciones y seed
├── lib/                    # Lógica de negocio
│   ├── analytics/          # Event tracking
│   ├── errors/             # Manejo de errores y logging
│   ├── repositories/       # Acceso a datos
│   ├── services/           # Orquestación de negocio
│   └── validation/         # Esquemas Zod y sanitización
├── tests/                  # Tests unitarios, integración y E2E
├── public/                 # Assets estáticos
└── .github/workflows/      # CI/CD con GitHub Actions
```

---

## Arquitectura

El proyecto sigue una arquitectura de **3 capas**:

1. **Presentación** — Pages (App Router) + Components (React + Tailwind)
2. **Lógica de Negocio** — Services (orquestación) + Validation (Zod schemas)
3. **Acceso a Datos** — Repositories (Drizzle queries) + Schema (definición de tablas)

Las validaciones Zod se comparten entre cliente y servidor para evitar drift. El event tracking registra interacciones anónimas sin PII para alimentar el dashboard de métricas.

---

## Despliegue

### Vercel + Neon

1. Conectar el repositorio a Vercel
2. Configurar las variables de entorno en el panel de Vercel:
   - `DATABASE_URL` — Connection string de Neon
   - `NEXT_PUBLIC_BASE_URL` — URL del despliegue en Vercel
3. El despliegue se ejecuta automáticamente en cada push a `main`

### CI/CD

El pipeline de GitHub Actions ejecuta en cada PR y push a `main`:
- `npm run lint` — Análisis estático
- `npm run typecheck` — Verificación de tipos
- `npm run test` — Tests unitarios
- `npm run build` — Compilación de producción

---

## Seguridad

- Encabezados HTTP de seguridad (CSP, X-Frame-Options, Referrer-Policy)
- Sanitización de inputs para prevención de XSS
- Validación Zod en cliente y servidor
- Drizzle ORM con queries parametrizadas (prevención SQL injection)
- `robots.txt` con Disallow + meta noindex
- Logging estructurado libre de PII
- Todos los datos son sintéticos — sin información personal real

---

## Limitaciones

- No implementa autenticación real (OAuth, SSO)
- No se integra con APIs de terceros ni LLMs
- No envía notificaciones (email, SMS, push)
- Los datos de métricas combinan datos reales del prototipo con datos sintéticos
- Diseñado para uso de demostración individual, no para alta concurrencia
- No se implementa rate limiting

---

## Autor

**Carlos Alberto Figueroa Martínez**

Prototipo desarrollado como prueba de concepto para la posición de Especializado de Negocio y Funcional en Canales Digitales.

---

## Fecha

Julio 2026
