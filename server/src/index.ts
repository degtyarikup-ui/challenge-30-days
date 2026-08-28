import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initDatabase } from './db.js';
import { apiRouter } from './routes.js';
import { initTelegramBot } from './bot.js';
import { initCronJobs } from './cron.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Database & Tables
initDatabase();

// Initialize CRON schedules
initCronJobs();

// Initialize Telegram Bot
initTelegramBot();

// API Routes
app.use('/api', apiRouter);

// Serve static frontend files if built
const clientDist = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер челленджа запущен на http://localhost:${PORT}`);
  console.log(`📡 API доступен по адресу http://localhost:${PORT}/api/state`);
});
