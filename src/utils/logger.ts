// src/utils/logger.ts
import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, printf } = format;

/**
 * Custom Log Format
 * -----------------
 * Formats log entries into a human-readable, indented JSON structure.
 */
const prettyJson = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]:\n${JSON.stringify(message, null, 4)}\n------------------------------------------------`;
});

/**
 * Log Rotation Configuration
 * --------------------------
 * Defines how logs are rotated and archived.
 * - filename: Pattern for the log file name (%DATE% is replaced auto).
 * - datePattern: The frequency of rotation (YYYY-MM-DD = Daily).
 * - zippedArchive: Compresses old logs to .gzip to save space.
 * - maxSize: If a single file exceeds this size, it rotates immediately.
 * - maxFiles: How long to keep logs before deleting them (e.g., '14d' = 14 days).
 */
const fileRotateTransport = new DailyRotateFile({
    filename: 'logs/server-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m', // Rotate if file size exceeds 20 MB
    maxFiles: '14d', // Auto-delete logs older than 14 days
});

/**
 * Logger Instance (Winston)
 * -------------------------
 * Centralized logging configuration with rotation strategy.
 */
export const logger = createLogger({
    level: 'info',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        prettyJson
    ),
    transports: [
        // 1. Daily Rotate File: Handles storage and cleanup
        fileRotateTransport,
        
        // 2. Console: For real-time monitoring in terminal/AWS CloudWatch
        new transports.Console()
    ]
});