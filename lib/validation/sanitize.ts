/**
 * Módulo de sanitización para prevención de XSS
 * Funciona en entornos server-side sin dependencia del DOM
 */

// Patrones peligrosos que deben eliminarse
const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /on\w+\s*=\s*["'][^"']*["']/gi,
  /on\w+\s*=\s*[^\s>]*/gi,
  /javascript\s*:/gi,
  /vbscript\s*:/gi,
  /data\s*:\s*text\/html/gi,
  /<\s*embed\b[^>]*>/gi,
  /<\s*object\b[^>]*>/gi,
  /<\s*link\b[^>]*>/gi,
  /<\s*meta\b[^>]*>/gi,
  /<\s*style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
];

// Patrones de tags HTML que deben eliminarse
const HTML_TAG_PATTERN = /<[^>]*>/g;

/**
 * Sanitiza una cadena de texto eliminando contenido potencialmente peligroso.
 * Remueve tags HTML, scripts, event handlers y URIs peligrosas.
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';

  let sanitized = input;

  // Eliminar patrones peligrosos
  for (const pattern of DANGEROUS_PATTERNS) {
    sanitized = sanitized.replace(pattern, '');
  }

  // Eliminar cualquier tag HTML restante
  sanitized = sanitized.replace(HTML_TAG_PATTERN, '');

  // Eliminar caracteres de control (excepto newline y tab)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  return sanitized.trim();
}

/**
 * Sanitiza un objeto de metadata para tracking events.
 * Asegura que no contenga funciones, prototypes ni datos sensibles.
 */
export function sanitizeMetadata(metadata: unknown): Record<string, unknown> | undefined {
  if (!metadata || typeof metadata !== 'object') return undefined;

  try {
    // Serializar y deserializar elimina funciones y prototypes
    const serialized = JSON.stringify(metadata);

    // Limitar tamaño a 1024 caracteres
    if (serialized.length > 1024) {
      return { _truncated: true, _originalLength: serialized.length };
    }

    const parsed = JSON.parse(serialized) as Record<string, unknown>;

    // Sanitizar valores string dentro del metadata
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === 'string') {
        sanitized[sanitizeInput(key)] = sanitizeInput(value);
      } else {
        sanitized[sanitizeInput(key)] = value;
      }
    }

    return sanitized;
  } catch {
    return undefined;
  }
}

/**
 * Sanitiza todos los campos string de un objeto de formulario.
 */
export function sanitizeFormData<T extends Record<string, unknown>>(data: T): T {
  const sanitized = { ...data };

  for (const [key, value] of Object.entries(sanitized)) {
    if (typeof value === 'string') {
      (sanitized as Record<string, unknown>)[key] = sanitizeInput(value);
    }
  }

  return sanitized;
}
