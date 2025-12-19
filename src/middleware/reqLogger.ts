import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Request Logging Middleware
 * --------------------------
 * Intercepts incoming requests and outgoing responses to log full transaction details.
 * * Key Features:
 * 1. Timing: Calculates exact request duration (latency).
 * 2. Response Capture: Monkey-patches `res.send` to capture the response body before it's streamed to the client.
 * 3. Conditional Logging: Categorizes logs as INFO or ERROR based on HTTP status codes.
 * * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express Next function
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    // 1. Capture the original send function reference
    const originalSend = res.send;
    let responseBody: any;

    /**
     * Override (Monkey Patch) res.send
     * --------------------------------
     * We wrap the native Express send method to intercept the response body.
     * This allows us to log what we sent to the user without altering the logic.
     */
    res.send = function (body): Response {
        responseBody = body; // Store a copy of the body for logging
        return originalSend.call(this, body); // Hand control back to the original function
    };

    /**
     * Event Listener: 'finish'
     * ------------------------
     * Triggered when the response headers and body have been fully handed off to the OS.
     * This is the safest place to log the final state of the transaction.
     */
    res.on('finish', () => {
        const duration = Date.now() - start;
        
        // Safe JSON Parsing: Ensure we don't crash if the body is raw text or HTML
        let parsedBody = responseBody;
        try {
            if (typeof responseBody === 'string') {
                parsedBody = JSON.parse(responseBody);
            }
        } catch (e) {
            // Body was not JSON; retain original format
            parsedBody = responseBody;
        }

        // Construct the structured log object
        const logData = {
            request: {
                method: req.method,
                url: req.originalUrl,
                ip: req.ip || req['ip'], // Bracket notation to bypass strict TS checks if needed
                headers: req.headers,
            },
            response: {
                status: res.statusCode,
                duration: `${duration}ms`,
                body: parsedBody
            }
        };

        // Categorize Log Level based on HTTP Status Code
        // 4xx and 5xx are logged as errors; everything else is info.
        if (res.statusCode >= 400) {
            logger.error(logData);
        } else {
            logger.info(logData);
        }
    });

    next();
};