# Despliegue — Alfa Postventa 90

## Vercel

### Prerequisitos
- Cuenta en Vercel
- Repositorio en GitHub (público o privado)

### Pasos
1. Conectar el repositorio a Vercel desde el dashboard
2. Configurar variables de entorno:
   - `DATABASE_URL` — Connection string de Neon PostgreSQL
   - `NEXT_PUBLIC_APP_URL` — URL del despliegue (ej: https://alfa-postventa-90.vercel.app)
3. El framework se detecta automáticamente como Next.js
4. Build command: `npm run build`
5. Output: `.next`
6. Node.js: 20.x

### Post-despliegue
1. Ejecutar migraciones: `npm run db:migrate` (localmente con DATABASE_URL configurado)
2. Ejecutar seed: `npm run db:seed` (localmente)
3. Verificar health: GET /api/health
4. Verificar landing: GET /

### CI/CD
Los despliegues se activan automáticamente al hacer push a `main`.
