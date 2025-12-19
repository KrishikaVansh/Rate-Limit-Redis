import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf } = format;

const prettyJson = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]:\n${JSON.stringify(message, null, 4)}\n------------------------------------------------`;
});

/**
 * Logger Instance (Winston)
 * -------------------------
 * Centralized logging configuration for the application.
 * * Strategy:
 * 1. File Transport: Persists all logs to 'server.log' for audit trails.
 * 2. Console Transport: Outputs logs to stdout for container/cloud logging services (e.g., AWS CloudWatch).
 * * Format:
 * - Timestamps are ISO standard (YYYY-MM-DD HH:mm:ss).
 * - Uses the custom 'prettyJson' format defined above.
 */
export const logger = createLogger({
    level: 'info', // Captures 'info', 'warn', and 'error' levels
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        prettyJson
    ),
    transports: [
        new transports.File({ filename: 'server.log' }),
        new transports.Console()
    ]
});