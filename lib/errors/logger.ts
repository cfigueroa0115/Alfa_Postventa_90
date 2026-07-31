type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  code?: string;
  timestamp: string;
  requestId?: string;
  metadata?: Record<string, unknown>;
}

function createEntry(level: LogLevel, message: string, metadata?: Record<string, unknown>): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    metadata,
  };
}

export const logger = {
  info(message: string, metadata?: Record<string, unknown>) {
    const entry = createEntry('info', message, metadata);
    if (process.env.NODE_ENV === 'production') {
      console.log(JSON.stringify(entry));
    } else {
      console.log(`[INFO] ${message}`, metadata || '');
    }
  },
  warn(message: string, metadata?: Record<string, unknown>) {
    const entry = createEntry('warn', message, metadata);
    if (process.env.NODE_ENV === 'production') {
      console.warn(JSON.stringify(entry));
    } else {
      console.warn(`[WARN] ${message}`, metadata || '');
    }
  },
  error(message: string, metadata?: Record<string, unknown>) {
    const entry = createEntry('error', message, metadata);
    if (process.env.NODE_ENV === 'production') {
      console.error(JSON.stringify(entry));
    } else {
      console.error(`[ERROR] ${message}`, metadata || '');
    }
  },
};
