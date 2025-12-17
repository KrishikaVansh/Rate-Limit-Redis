/**
 * @file src/config/redis.ts
 *
 * @description
 * This module is responsible for configuring and managing the Redis client
 * used across the application.
 *
 * It initializes a Redis client using the official `redis` package and
 * reads the Redis connection URL from environment variables.
 *
 * The Redis client is used by other modules (e.g., rate limiting middleware)
 * to store shared, persistent data such as request counters.
 *
 * A separate `connectRedis` function is exported to explicitly establish
 * the connection during application startup, ensuring the Redis client
 * is connected before being used by other components.
 */

import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// Create the client instance
export const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
export const connectRedis = async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
        console.log('Connected to Redis');
    }
};