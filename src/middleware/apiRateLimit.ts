import { rateLimit } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { Request } from 'express';
import { redisClient } from '../config/redis';
import { ipKeyGenerator } from 'express-rate-limit';
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

     
        limit: (req: Request) => {
            if (req.headers['x-api-key']) return 100; 
            return 10;
        },

        message: { 
            status: 429, 
            error: 'Too many requests. Please try again later.' 
        }
    });
};