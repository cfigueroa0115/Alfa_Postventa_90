import { z } from 'zod';

// ─── Teléfono colombiano ─────────────────────────────────────────────────────
// Exactamente 10 dígitos, comienza con 3 (RN-003)
export const colombianPhoneSchema = z
  .string()
  .min(1, 'El número de teléfono es obligatorio')
  .regex(/^3\d{9}$/, 'El teléfono debe tener 10 dígitos y comenzar con 3');

// ─── Email ───────────────────────────────────────────────────────────────────
export const emailSchema = z
  .string()
  .min(1, 'El correo electrónico es obligatorio')
  .max(254, 'El correo no puede exceder 254 caracteres')
  .email('Formato de correo electrónico inválido');

// ─── Formulario de actualización de datos de contacto ────────────────────────
export const updateContactFormSchema = z
  .object({
    documentType: z.enum(['CC', 'CE', 'NIT', 'PP'], {
      errorMap: () => ({ message: 'Seleccione un tipo de documento válido' }),
    }),
    documentNumber: z
      .string()
      .min(1, 'El número de documento es obligatorio')
      .max(20, 'El número de documento no puede exceder 20 caracteres'),
    policyReference: z
      .string()
      .min(1, 'La referencia de póliza es obligatoria')
      .max(30, 'La referencia de póliza no puede exceder 30 caracteres'),
    fullName: z
      .string()
      .min(1, 'El nombre completo es obligatorio')
      .max(100, 'El nombre no puede exceder 100 caracteres'),
    currentEmail: z.string().optional(),
    currentPhone: z.string().optional(),
    newEmail: emailSchema,
    confirmEmail: emailSchema,
    newPhone: colombianPhoneSchema,
    city: z
      .string()
      .min(1, 'La ciudad es obligatoria')
      .max(100, 'La ciudad no puede exceder 100 caracteres'),
    contactPreference: z.enum(['email', 'telefono', 'ambos'], {
      errorMap: () => ({ message: 'Seleccione una preferencia de contacto válida' }),
    }),
  })
  .refine(
    (data) => data.newEmail.toLowerCase() === data.confirmEmail.toLowerCase(),
    {
      message: 'Los correos electrónicos no coinciden',
      path: ['confirmEmail'],
    }
  );

// ─── Evento de tracking ──────────────────────────────────────────────────────
export const validEventTypes = [
  'journey_started',
  'process_selected',
  'requirements_confirmed',
  'form_started',
  'form_step_changed',
  'consent_given',
  'request_filed',
  'tracking_consulted',
  'feedback_submitted',
  'status_simulated',
] as const;

export const trackingEventSchema = z.object({
  sessionId: z.string().uuid('ID de sesión inválido'),
  eventType: z.enum(validEventTypes, {
    errorMap: () => ({ message: 'Tipo de evento no reconocido' }),
  }),
  step: z.string().max(50, 'El paso no puede exceder 50 caracteres').optional(),
  metadata: z.record(z.unknown()).optional(),
});

// ─── Feedback CES ────────────────────────────────────────────────────────────
export const feedbackSchema = z.object({
  trackingCode: z
    .string()
    .regex(/^DEMO-ALFA-\d{8}-\d{4}$/, 'Código de radicado inválido'),
  cesScore: z
    .number()
    .int('La calificación debe ser un número entero')
    .min(1, 'La calificación mínima es 1')
    .max(5, 'La calificación máxima es 5'),
  comment: z
    .string()
    .max(1000, 'El comentario no puede exceder 1000 caracteres')
    .optional(),
});

// ─── Crear sesión ────────────────────────────────────────────────────────────
export const createSessionSchema = z.object({
  userAgent: z.string().max(512).optional(),
  viewport: z.enum(['mobile', 'tablet', 'desktop']).optional(),
  referrer: z.string().max(512).optional(),
});

// ─── Crear solicitud (datos enviados desde revisión) ─────────────────────────
export const createRequestSchema = z.object({
  sessionId: z.string().uuid('ID de sesión inválido'),
  formData: updateContactFormSchema,
});

// ─── Tipos inferidos ─────────────────────────────────────────────────────────
export type UpdateContactFormData = z.infer<typeof updateContactFormSchema>;
export type TrackingEventInput = z.infer<typeof trackingEventSchema>;
export type FeedbackInput = z.infer<typeof feedbackSchema>;
export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export type EventType = (typeof validEventTypes)[number];
