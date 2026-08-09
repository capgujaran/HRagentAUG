import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHrReply, type HistoryItem } from './azureChat.js';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '../.env'), override: false });

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json({ limit: '64kb' }));

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.post('/api/chat', async (request, response) => {
  const message = typeof request.body?.message === 'string' ? request.body.message.trim() : '';
  const history = Array.isArray(request.body?.history)
    ? request.body.history.filter((item: HistoryItem) => (
      item
      && (item.role === 'user' || item.role === 'assistant')
      && typeof item.content === 'string'
    )) as HistoryItem[]
    : [];

  if (!message) {
    response.status(400).json({ error: 'message is required' });
    return;
  }
  if (message.length > 4_000) {
    response.status(400).json({ error: 'message must be 4,000 characters or fewer' });
    return;
  }

  try {
    const reply = await createHrReply(message, history);
    response.json({ reply });
  } catch (error) {
    console.error('Azure OpenAI chat request failed:', error instanceof Error ? error.message : error);
    response.status(502).json({ error: 'The HR assistant is temporarily unavailable.' });
  }
});

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const frontendDirectory = path.resolve(currentDirectory, '../../frontend/dist');
if (existsSync(frontendDirectory)) {
  app.use(express.static(frontendDirectory));
  app.get('*', (_request, response) => response.sendFile(path.join(frontendDirectory, 'index.html')));
}

app.listen(port, () => {
  console.log(`PeopleHub API listening on http://localhost:${port}`);
});
