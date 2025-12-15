import express from 'express';
import { connectRedis } from './config/redis';
import { createApiRateLimiter } from './middleware/apiRateLimit'; 

const app = express();
const PORT = 3000;

async function start() {
    try {
        await connectRedis();
        app.use(createApiRateLimiter());

        app.get('/', (req, res) => {
            res.send('Welcome to the API!');
        });

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('Failed to start server:', error);
    }
}

start();