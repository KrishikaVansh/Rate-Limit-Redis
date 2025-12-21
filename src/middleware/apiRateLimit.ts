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
import ipaddr from 'ipaddr.js';
import { redisClient } from '../config/redis';

function getIpRateLimitKey(ip: string): string {
    const addr = ipaddr.process(ip); // handles IPv4-mapped IPv6

    if (addr.kind() === 'ipv4') {
        return `ipv4:${addr.toString()}`;
    }

    const [network] = ipaddr.parseCIDR(`${addr.toString()}/64`);
    return `ipv6:${network.toString()}/64`;
}

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

            if (apiKey && typeof apiKey === 'string') {
                return `apikey:${apiKey}`;
            }

            const ip = req.ip ?? '0.0.0.0';
            return `ip:${getIpRateLimitKey(ip)}`;
        },
        validate:{
            keyGeneratorIpFallback:false

        },
        

        max: (req: Request) => {
            if (req.headers['x-api-key']) return 100;
            return 10;
        },

        message: "429: Too many requests, please try again later.",
    });
};
