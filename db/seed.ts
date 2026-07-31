import * as dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { sql } from 'drizzle-orm';
import * as crypto from 'crypto';

import {
  demoSessions,
  demoRequests,
  trackingEvents,
  statusHistory,
  feedback,
} from './schema';

dotenv.config({ path: '.env.local' });

// ─── Configuración ──────────────────────────────────────────────────────────

const TOTAL_SESSIONS = 50;

// Distribución de embudo (porcentajes acumulados)
const FUNNEL = {
  journeyStarted: 1.0, // 100%
  processSelected: 0.87, // ~87%
  requirementsConfirmed: 0.80, // ~80%
  formStarted: 0.77, // ~77%
  consentGiven: 0.70, // ~70%
  requestFiled: 0.70, // ~70%
};

const VIEWPORTS = ['360x800', '390x844', '768x1024', '1024x768', '1280x720', '1440x900', '1920x1080'];

const USER_AGENTS = [
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
  'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/120.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 Safari/17.0',
  'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
];

const STATUS_SEQUENCE = ['radicado', 'en_validacion', 'procesado', 'finalizado'] as const;

const STATUS_DESCRIPTIONS: Record<string, string> = {
  radicado: 'Solicitud radicada exitosamente',
  en_validacion: 'Solicitud en proceso de validación documental',
  procesado: 'Solicitud procesada y cambios aplicados',
  finalizado: 'Proceso completado satisfactoriamente',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(daysAgo: number): Date {
  const now = new Date();
  const offset = Math.random() * daysAgo * 24 * 60 * 60 * 1000;
  return new Date(now.getTime() - offset);
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

function generateTrackingCode(date: Date, seq: number): string {
  return `DEMO-ALFA-${formatDate(date)}-${String(seq).padStart(4, '0')}`;
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

// ─── Seed principal ──────────────────────────────────────────────────────────

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('❌ DATABASE_URL no está configurada en .env.local');
    process.exit(1);
  }

  const client = neon(url);
  const db = drizzle(client);

  console.log('🌱 Iniciando seed de datos sintéticos...\n');

  // ─── 1. Limpiar datos existentes (en orden por FK) ───────────────────────
  console.log('🗑️  Limpiando datos existentes...');
  await db.delete(feedback);
  await db.delete(statusHistory);
  await db.delete(trackingEvents);
  await db.delete(demoRequests);
  await db.delete(demoSessions);
  console.log('   ✓ Tablas limpiadas\n');

  // ─── 2. Crear sesiones ───────────────────────────────────────────────────
  console.log(`📋 Creando ${TOTAL_SESSIONS} sesiones demo...`);

  const sessions: { id: string; startedAt: Date }[] = [];

  for (let i = 0; i < TOTAL_SESSIONS; i++) {
    const id = crypto.randomUUID();
    const startedAt = randomDate(30);
    const durationMinutes = randomInt(2, 25);
    const endedAt = addMinutes(startedAt, durationMinutes);

    await db.insert(demoSessions).values({
      id,
      startedAt,
      endedAt,
      userAgent: randomItem(USER_AGENTS),
      viewport: randomItem(VIEWPORTS),
      referrer: i % 3 === 0 ? 'https://seguros-alfa.com.co' : null,
    });

    sessions.push({ id, startedAt });
  }

  console.log(`   ✓ ${sessions.length} sesiones creadas\n`);

  // ─── 3. Crear tracking events por sesión (embudo) ────────────────────────
  console.log('📊 Creando eventos de tracking (distribución de embudo)...');

  let totalEvents = 0;
  const sessionsWithRequest: { sessionId: string; startedAt: Date }[] = [];

  for (let i = 0; i < sessions.length; i++) {
    const session = sessions[i];
    let eventTime = new Date(session.startedAt);
    const events: {
      id: string;
      sessionId: string;
      eventType: string;
      step: string | null;
      metadata: Record<string, unknown> | null;
      createdAt: Date;
    }[] = [];

    // journey_started — 100%
    events.push({
      id: crypto.randomUUID(),
      sessionId: session.id,
      eventType: 'journey_started',
      step: 'inicio',
      metadata: { source: 'prototipo' },
      createdAt: eventTime,
    });

    // process_selected — ~87%
    if (i / sessions.length < FUNNEL.processSelected) {
      eventTime = addMinutes(eventTime, randomInt(1, 3));
      events.push({
        id: crypto.randomUUID(),
        sessionId: session.id,
        eventType: 'process_selected',
        step: 'seleccion',
        metadata: { process: 'actualizacion_datos_contacto' },
        createdAt: eventTime,
      });
    } else {
      continue;
    }

    // requirements_confirmed — ~80%
    if (i / sessions.length < FUNNEL.requirementsConfirmed) {
      eventTime = addMinutes(eventTime, randomInt(1, 2));
      events.push({
        id: crypto.randomUUID(),
        sessionId: session.id,
        eventType: 'requirements_confirmed',
        step: 'requisitos',
        metadata: null,
        createdAt: eventTime,
      });
    } else {
      continue;
    }

    // form_started + form_step_changed — ~77%
    if (i / sessions.length < FUNNEL.formStarted) {
      eventTime = addMinutes(eventTime, randomInt(1, 2));
      events.push({
        id: crypto.randomUUID(),
        sessionId: session.id,
        eventType: 'form_started',
        step: 'formulario',
        metadata: null,
        createdAt: eventTime,
      });

      // Simulate form step changes (2-4 steps)
      const steps = randomInt(2, 4);
      for (let s = 1; s <= steps; s++) {
        eventTime = addMinutes(eventTime, randomInt(1, 3));
        events.push({
          id: crypto.randomUUID(),
          sessionId: session.id,
          eventType: 'form_step_changed',
          step: `formulario_paso_${s}`,
          metadata: { fromStep: s - 1, toStep: s },
          createdAt: eventTime,
        });
      }
    } else {
      continue;
    }

    // consent_given + request_filed — ~70%
    if (i / sessions.length < FUNNEL.requestFiled) {
      eventTime = addMinutes(eventTime, randomInt(1, 2));
      events.push({
        id: crypto.randomUUID(),
        sessionId: session.id,
        eventType: 'consent_given',
        step: 'revision',
        metadata: null,
        createdAt: eventTime,
      });

      eventTime = addMinutes(eventTime, randomInt(1, 2));
      events.push({
        id: crypto.randomUUID(),
        sessionId: session.id,
        eventType: 'request_filed',
        step: 'confirmacion',
        metadata: null,
        createdAt: eventTime,
      });

      sessionsWithRequest.push({ sessionId: session.id, startedAt: session.startedAt });
    }

    // Insert events for this session
    for (const event of events) {
      await db.insert(trackingEvents).values(event);
    }
    totalEvents += events.length;
  }

  console.log(`   ✓ ${totalEvents} eventos creados`);
  console.log(`   ✓ ${sessionsWithRequest.length} sesiones alcanzaron request_filed\n`);

  // ─── 4. Crear demo_requests para sesiones con request_filed ──────────────
  console.log(`📝 Creando ${sessionsWithRequest.length} solicitudes demo...`);

  const requests: { id: string; trackingCode: string; sessionId: string; filedAt: Date }[] = [];

  for (let i = 0; i < sessionsWithRequest.length; i++) {
    const { sessionId, startedAt } = sessionsWithRequest[i];
    const filedAt = addMinutes(startedAt, randomInt(10, 20));
    const id = crypto.randomUUID();
    const trackingCode = generateTrackingCode(filedAt, i + 1);
    const clientNum = i + 1;

    await db.insert(demoRequests).values({
      id,
      sessionId,
      trackingCode,
      status: 'radicado',
      formData: {
        tipoDocumento: 'CC',
        numeroDocumento: `***${String(randomInt(1000, 9999))}`,
        numeroPóliza: `POL-${randomInt(100000, 999999)}`,
        nombreCompleto: `Cliente Demo ${clientNum}`,
        email: `demo${clientNum}@ejemplo.com`,
        telefono: `300123450${String(clientNum).padStart(2, '0')}`,
        nuevoEmail: `nuevo.demo${clientNum}@ejemplo.com`,
        nuevoTelefono: `310987650${String(clientNum).padStart(2, '0')}`,
        motivo: 'Cambio de línea telefónica y correo electrónico',
      },
      filedAt,
      updatedAt: filedAt,
    });

    requests.push({ id, trackingCode, sessionId, filedAt });
  }

  console.log(`   ✓ ${requests.length} solicitudes creadas\n`);

  // ─── 5. Crear status_history para cada solicitud ─────────────────────────
  console.log('📈 Creando historial de estados...');

  let totalStatusEntries = 0;

  for (let i = 0; i < requests.length; i++) {
    const request = requests[i];
    let statusTime = new Date(request.filedAt);
    const ratio = i / requests.length;

    // Todos empiezan con "radicado"
    await db.insert(statusHistory).values({
      id: crypto.randomUUID(),
      requestId: request.id,
      status: 'radicado',
      description: STATUS_DESCRIPTIONS.radicado,
      changedAt: statusTime,
    });
    totalStatusEntries++;

    // ~80% progresan a "en_validacion"
    if (ratio < 0.80) {
      statusTime = addHours(statusTime, randomInt(1, 24));
      await db.insert(statusHistory).values({
        id: crypto.randomUUID(),
        requestId: request.id,
        status: 'en_validacion',
        description: STATUS_DESCRIPTIONS.en_validacion,
        changedAt: statusTime,
      });
      totalStatusEntries++;

      // Update request status
      await db
        .update(demoRequests)
        .set({ status: 'en_validacion', updatedAt: statusTime })
        .where(sql`${demoRequests.id} = ${request.id}`);
    } else {
      continue;
    }

    // ~60% progresan a "procesado"
    if (ratio < 0.60) {
      statusTime = addHours(statusTime, randomInt(24, 72));
      await db.insert(statusHistory).values({
        id: crypto.randomUUID(),
        requestId: request.id,
        status: 'procesado',
        description: STATUS_DESCRIPTIONS.procesado,
        changedAt: statusTime,
      });
      totalStatusEntries++;

      await db
        .update(demoRequests)
        .set({ status: 'procesado', updatedAt: statusTime })
        .where(sql`${demoRequests.id} = ${request.id}`);
    } else {
      continue;
    }

    // ~40% progresan a "finalizado"
    if (ratio < 0.40) {
      statusTime = addHours(statusTime, randomInt(12, 48));
      await db.insert(statusHistory).values({
        id: crypto.randomUUID(),
        requestId: request.id,
        status: 'finalizado',
        description: STATUS_DESCRIPTIONS.finalizado,
        changedAt: statusTime,
      });
      totalStatusEntries++;

      await db
        .update(demoRequests)
        .set({ status: 'finalizado', updatedAt: statusTime })
        .where(sql`${demoRequests.id} = ${request.id}`);
    }
  }

  console.log(`   ✓ ${totalStatusEntries} entradas de historial creadas\n`);

  // ─── 6. Crear feedback para ~60% de solicitudes ──────────────────────────
  const feedbackCount = Math.round(requests.length * 0.6);
  console.log(`⭐ Creando ${feedbackCount} registros de feedback CES...`);

  const comments = [
    'Muy fácil de usar, me gustó la experiencia.',
    'El proceso fue claro y rápido.',
    'Pude actualizar mis datos sin problemas.',
    'Mucho mejor que el formulario PDF anterior.',
    'La guía paso a paso fue muy útil.',
    null,
    null,
    null,
  ];

  for (let i = 0; i < feedbackCount; i++) {
    const request = requests[i];
    // CES scores: mostly 4-5, some 3
    const cesScore = Math.random() < 0.7 ? 5 : Math.random() < 0.7 ? 4 : 3;

    await db.insert(feedback).values({
      id: crypto.randomUUID(),
      requestId: request.id,
      trackingCode: request.trackingCode,
      cesScore,
      comment: randomItem(comments),
      createdAt: addHours(request.filedAt, randomInt(1, 48)),
    });
  }

  console.log(`   ✓ ${feedbackCount} registros de feedback creados\n`);

  // ─── Resumen ─────────────────────────────────────────────────────────────
  console.log('═══════════════════════════════════════════════');
  console.log('✅ Seed completado exitosamente');
  console.log('═══════════════════════════════════════════════');
  console.log(`   Sesiones:           ${sessions.length}`);
  console.log(`   Eventos:            ${totalEvents}`);
  console.log(`   Solicitudes:        ${requests.length}`);
  console.log(`   Historial estados:  ${totalStatusEntries}`);
  console.log(`   Feedback:           ${feedbackCount}`);
  console.log('═══════════════════════════════════════════════\n');

  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Error durante el seed:', err);
  process.exit(1);
});
