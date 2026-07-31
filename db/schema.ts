import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  jsonb,
  integer,
  text,
  index,
  check,
} from 'drizzle-orm/pg-core';
import { relations, sql, type InferSelectModel, type InferInsertModel } from 'drizzle-orm';

// ─── Tabla: demo_sessions ────────────────────────────────────────────────────
// Registra sesiones anónimas de demostración del prototipo.

export const demoSessions = pgTable(
  'demo_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    endedAt: timestamp('ended_at', { withTimezone: true }),
    userAgent: varchar('user_agent', { length: 512 }),
    viewport: varchar('viewport', { length: 20 }),
    referrer: varchar('referrer', { length: 512 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    startedAtIdx: index('idx_sessions_started_at').on(table.startedAt),
  })
);

// ─── Tabla: demo_requests ────────────────────────────────────────────────────
// Almacena las solicitudes de actualización de datos radicadas.

export const demoRequests = pgTable(
  'demo_requests',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => demoSessions.id),
    trackingCode: varchar('tracking_code', { length: 25 }).notNull().unique(),
    status: varchar('status', { length: 20 }).notNull().default('radicado'),
    formData: jsonb('form_data').notNull(),
    draftData: jsonb('draft_data'),
    filedAt: timestamp('filed_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    trackingCodeIdx: index('idx_requests_tracking_code').on(table.trackingCode),
    sessionIdIdx: index('idx_requests_session_id').on(table.sessionId),
    statusCheck: check(
      'chk_requests_status',
      sql`${table.status} IN ('radicado', 'en_validacion', 'procesado', 'finalizado')`
    ),
  })
);

// ─── Tabla: tracking_events ──────────────────────────────────────────────────
// Registra eventos anónimos de interacción durante el recorrido.

export const trackingEvents = pgTable(
  'tracking_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => demoSessions.id),
    eventType: varchar('event_type', { length: 50 }).notNull(),
    step: varchar('step', { length: 50 }),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    sessionIdIdx: index('idx_events_session_id').on(table.sessionId),
    eventTypeIdx: index('idx_events_type').on(table.eventType),
    createdAtIdx: index('idx_events_created_at').on(table.createdAt),
  })
);

// ─── Tabla: status_history ───────────────────────────────────────────────────
// Historial de cambios de estado de una solicitud para la timeline.

export const statusHistory = pgTable(
  'status_history',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    requestId: uuid('request_id')
      .notNull()
      .references(() => demoRequests.id),
    status: varchar('status', { length: 20 }).notNull(),
    description: varchar('description', { length: 255 }),
    changedAt: timestamp('changed_at', { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    requestIdIdx: index('idx_status_history_request_id').on(table.requestId),
    changedAtIdx: index('idx_status_history_changed_at').on(table.changedAt),
  })
);

// ─── Tabla: feedback ─────────────────────────────────────────────────────────
// Calificaciones CES (Customer Effort Score) asociadas a solicitudes.

export const feedback = pgTable(
  'feedback',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    requestId: uuid('request_id')
      .notNull()
      .references(() => demoRequests.id),
    trackingCode: varchar('tracking_code', { length: 25 }).notNull(),
    cesScore: integer('ces_score').notNull(),
    comment: text('comment'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    requestIdIdx: index('idx_feedback_request_id').on(table.requestId),
    trackingCodeIdx: index('idx_feedback_tracking_code').on(table.trackingCode),
    cesScoreCheck: check(
      'chk_feedback_ces_score',
      sql`${table.cesScore} >= 1 AND ${table.cesScore} <= 7`
    ),
  })
);

// ─── Relations ───────────────────────────────────────────────────────────────

export const demoSessionsRelations = relations(demoSessions, ({ many }) => ({
  requests: many(demoRequests),
  events: many(trackingEvents),
}));

export const demoRequestsRelations = relations(demoRequests, ({ one, many }) => ({
  session: one(demoSessions, {
    fields: [demoRequests.sessionId],
    references: [demoSessions.id],
  }),
  statusHistory: many(statusHistory),
  feedback: many(feedback),
}));

export const trackingEventsRelations = relations(trackingEvents, ({ one }) => ({
  session: one(demoSessions, {
    fields: [trackingEvents.sessionId],
    references: [demoSessions.id],
  }),
}));

export const statusHistoryRelations = relations(statusHistory, ({ one }) => ({
  request: one(demoRequests, {
    fields: [statusHistory.requestId],
    references: [demoRequests.id],
  }),
}));

export const feedbackRelations = relations(feedback, ({ one }) => ({
  request: one(demoRequests, {
    fields: [feedback.requestId],
    references: [demoRequests.id],
  }),
}));

// ─── Inferred Types ──────────────────────────────────────────────────────────

// demo_sessions
export type DemoSession = InferSelectModel<typeof demoSessions>;
export type NewDemoSession = InferInsertModel<typeof demoSessions>;

// demo_requests
export type DemoRequest = InferSelectModel<typeof demoRequests>;
export type NewDemoRequest = InferInsertModel<typeof demoRequests>;

// tracking_events
export type TrackingEvent = InferSelectModel<typeof trackingEvents>;
export type NewTrackingEvent = InferInsertModel<typeof trackingEvents>;

// status_history
export type StatusHistoryEntry = InferSelectModel<typeof statusHistory>;
export type NewStatusHistoryEntry = InferInsertModel<typeof statusHistory>;

// feedback
export type Feedback = InferSelectModel<typeof feedback>;
export type NewFeedback = InferInsertModel<typeof feedback>;
