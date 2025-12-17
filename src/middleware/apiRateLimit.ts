/**
 * @file src/middleware/apiRateLimit.ts
 *
 * @description
 * This middleware implements rate limiting using the `express-rate-limit`
 * library with a Redis-backed store.
 *
 * The limiter applies rate limits based on:
 * 1. API Key (if the `x-api-key` header is present)
 * 2. Client IP address (fallback when API key is not provided)
 *
 * A Redis store is used instead of the default in-memory store to ensure
 * that rate-limit counters persist across server restarts and can be shared
 * across multiple server instances in a distributed environment.
 *
 * Rate limiting behavior:
 * - Requests with a valid API key are limited to 100 requests per 15 minutes.
 * - Requests without an API key are limited to 10 requests per 15 minutes
 *   based on the client's IP address.
 *
 * Key generation:
 * - API key–based requests use the format: `apikey:<api-key>`
 * - IP-based requests use the format: `ip:<client-ip>`
 *
 * This middleware should be instantiated once during application startup
 * and reused for all incoming requests.
 */


import { rateLimit } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { Request } from 'express';
import { redisClient } from '../config/redis';
export const createApiRateLimiter = () => {
    return rateLimit({
        windowMs: 15 * 60 * 1000, 
        standardHeaders: true,
        legacyHeaders: false,

       
        store: new RedisStore({
            sendCommand: (...args: string[]) => redisClient.sendCommand(args),
            prefix: 'rl:',
        }),

        keyGenerator: (req: Request): string => {
            const apiKey = req.headers['x-api-key'];
            return apiKey && typeof apiKey === 'string' 
                ? `apikey:${apiKey}`  
                : `ip:${req.ip}`;
        },

     
        max: (req: Request) => {
            if (req.headers['x-api-key']) return 100;  // api key max limit 100 in 15 miniutes
            return 10;  //ip max limit 10 in 15 miniutes if fallback to ip
        },

        message: { 
            status: 429, 
            error: 'Too many requests. Please try again later.' 
        }
    });
};

