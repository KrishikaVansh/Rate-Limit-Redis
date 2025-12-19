import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, printf } = format;

// Custom Pretty Print Format
const prettyJson = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]:\n${JSON.stringify(message, null, 4)}\n------------------------------------------------`;
});

/**
 * 1. General Transport (Info + Errors)
 * ------------------------------------
 * Logs everything happening in the system.
 * Retention: 14 Days.
 */
const combinedRotateTransport = new DailyRotateFile({
    filename: 'logs/application-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d', // Keep general logs for 2 weeks
});

/**
 * 2. Error Transport (Errors ONLY)
 * --------------------------------
 * Logs only failed requests (4xx, 5xx) and system crashes.
 * Retention: 30 Days (Longer retention for debugging).
 */
const errorRotateTransport = new DailyRotateFile({
    level: 'error', // <--- Crucial: Only accepts 'error' level logs
    filename: 'logs/error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d', // Keep error logs for 1 month
});

/**
 * Logger Instance
 */
export const logger = createLogger({
    level: 'info', // Default level
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        prettyJson
    ),
    transports: [
        combinedRotateTransport, // Write to application log
        errorRotateTransport,    // Write to error log
        //new transports.Console() // Write to terminal
    ]
});