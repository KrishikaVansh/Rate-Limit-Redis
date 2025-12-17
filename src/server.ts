/**
 * @file src/server.ts
 *
 * @description
 * This is the main entry point of the Express application.
 *
 * Responsibilities:
 * - Load environment variables
 * - Establish a Redis connection before handling requests
 * - Register global middleware (rate limiting)
 * - Define application routes
 * - Start the HTTP server
 *
 * The API rate limiter is applied globally to all incoming requests
 * to protect the server from abuse and excessive traffic.
 */


import express from 'express';
import dotenv from 'dotenv';
import { connectRedis } from './config/redis';
import { createApiRateLimiter } from './middleware/apiRateLimit';


dotenv.config();
const app = express();

async function start() {
    try {
        await connectRedis();
       app.use(createApiRateLimiter());


        app.get('/', (req, res) => {
            res.send('Welcome to the API!');
        });

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('Failed to start server:', error);
    }
}

start();