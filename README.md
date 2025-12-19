Node.js Rate Limiter with Redis (TypeScript)

A robust, production-ready Rate Limiter implementation using Node.js, Express, TypeScript, and Redis.

This server dynamically handles rate limiting strategies:
- Anonymous Users: Rate limited by IP address (Strict limit).
- Authenticated Users: Rate limited by API Key (Higher limit).
- Distributed State: Uses Redis to maintain counters across server restarts and multiple instances.

Features

- Dual Strategy: Automatically switches between IP-based and API Key-based limiting.
- Redis Backed: State is persisted in Redis, solving the server restart memory loss problem.
- TypeScript: Fully typed codebase for reliability.

Prerequisites

- Node.js (v14 or higher)
- Redis (Must be running locally or reachable via URL)

Installation

1. Clone the repository
   git clone https://github.com/KrishikaVansh/Rate-Limit-Redis.git
   cd Rate-Limit-Redis

2. Install Dependencies
   npm install

3. Configure Environment
   Create a .env file in the root directory:
   PORT=3000
   REDIS_URL=redis://localhost:6379

Running the Server

1. Start Redis
Make sure your Redis server is running before starting the Node application.

# Mac/Linux or WSL
redis-server

# Windows
redis-cli ping  # Should return PONG

2. Start Application

# Development Mode
npx ts-node src/server.ts

Folder Structure

src/
├── config/
│   └── redis.ts         # Redis connection singleton
├── middleware/
│   └── apiRateLimit.ts  # Rate limit logic & configuration
└── server.ts            # Application entry point