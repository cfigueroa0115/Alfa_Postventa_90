# Seguridad — Alfa Postventa 90

## Medidas Implementadas

### Encabezados HTTP
- Content-Security-Policy
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()

### Validación y Sanitización
- Esquemas Zod compartidos cliente/servidor
- Sanitización de inputs con eliminación de HTML/scripts
- Queries parametrizadas via Drizzle ORM (prevención SQL injection)

### Privacidad
- Todos los datos son sintéticos o ficticios
- No se almacena PII real en ninguna tabla
- Logging estructurado libre de datos personales
- robots.txt con Disallow + meta noindex

### No Implementado (Fuera de Alcance del Prototipo)
- Autenticación real (OAuth, SSO)
- Rate limiting
- CSRF tokens (no hay cookies de sesión)
- Encriptación de datos en reposo
- Monitoreo de intrusiones

## Contacto
Este es un prototipo conceptual. No reportar vulnerabilidades a Seguros Alfa.
