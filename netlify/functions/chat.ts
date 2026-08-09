import OpenAI, { AzureOpenAI } from 'openai';
import '@azure/openai/types';

interface HistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatPayload {
  message?: unknown;
  history?: unknown;
}

const SYSTEM_PROMPT = `You are PeopleHub's HR assistant. Help employees only with HR topics, specifically leave, payroll, benefits, and workplace policies. Give clear, concise, practical guidance. Do not invent personal employment data or policy details that were not provided. When a question requires a personal decision or confidential case review, recommend contacting People & Culture. If the user asks about anything outside HR, politely redirect them back to leave, payroll, benefits, or policies.`;

const MOCK_REPLY = 'Demo mode: I can help with leave, payroll, benefits, and HR policies. Your Azure OpenAI connection is unavailable or not configured yet, so please check the relevant PeopleHub page or contact People & Culture for a personal case.';

function isConfigured(value: string | undefined) {
  return Boolean(value && !value.includes('your-') && !value.includes('replace-with'));
}

function json(body: object, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function createAzureClient(endpoint: string, apiKey: string, deployment: string) {
  const endpointUrl = new URL(endpoint);
  if (endpointUrl.hostname.endsWith('.services.ai.azure.com')) {
    return new OpenAI({
      baseURL: `${endpointUrl.origin}/openai/v1`,
      apiKey,
    });
  }

  return new AzureOpenAI({
    endpoint: endpointUrl.origin,
    apiKey,
    deployment,
    apiVersion: '2024-10-21',
  });
}

export default async function handler(request: Request) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  let payload: ChatPayload;
  try {
    payload = await request.json() as ChatPayload;
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const message = typeof payload.message === 'string' ? payload.message.trim() : '';
  const history = Array.isArray(payload.history)
    ? payload.history.filter((item): item is HistoryItem => (
      Boolean(item)
      && typeof item === 'object'
      && 'role' in item
      && 'content' in item
      && (item.role === 'user' || item.role === 'assistant')
      && typeof item.content === 'string'
    ))
    : [];

  if (!message) return json({ error: 'message is required' }, 400);
  if (message.length > 4_000) return json({ error: 'message must be 4,000 characters or fewer' }, 400);

  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
  if (!isConfigured(endpoint) || !isConfigured(apiKey) || !isConfigured(deployment)) {
    return json({ reply: MOCK_REPLY });
  }

  try {
    const client = createAzureClient(endpoint!, apiKey!, deployment!);
    const safeHistory = history.slice(-12).map((item) => ({
      role: item.role,
      content: item.content.slice(0, 4_000),
    }));
    const completion = await client.chat.completions.create({
      model: deployment!,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...safeHistory,
        { role: 'user', content: message },
      ],
      max_completion_tokens: 5_000,
      reasoning_effort: 'low',
    });
    const reply = completion.choices[0]?.message?.content?.trim()
      || 'I could not create a response. Please try again or contact People & Culture.';
    return json({ reply });
  } catch (error) {
    console.error('Azure OpenAI is unreachable; using demo mode:', error instanceof Error ? error.message : error);
    return json({ reply: MOCK_REPLY });
  }
}
