import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { handleAiRequest, handleAiHealth } from './src/server/openrouter';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '1mb' }));

// OpenRouter Free-Only AI endpoints
app.post('/api/ai', handleAiRequest);
app.get('/api/ai/health', handleAiHealth);

// In-app Search Console Performance Mock / First-party Data API
app.get('/api/analytics/demand-summary', (req, res) => {
  res.json({
    status: 'ok',
    connectedGsc: false,
    message: 'Google Search Console is not yet authenticated for first-party data.',
    observedInternalSearches: 420,
    topCategories: ['Finance', 'Fitness & Gym', 'Construction & Tiles', 'Salary & Tax', 'Student Tools'],
  });
});

async function startServer() {
  if (isProd) {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SmartTools Hub] Server running on http://0.0.0.0:${PORT} (Mode: ${isProd ? 'production' : 'development'})`);
    console.log(`[OpenRouter Policy] Strict FREE-ONLY active (Primary: openrouter/free)`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
