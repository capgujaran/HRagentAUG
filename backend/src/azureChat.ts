import { AzureOpenAI } from 'openai';
import '@azure/openai/types';

export interface HistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

export const SYSTEM_PROMPT = `You are PeopleHub's HR assistant. Help employees only with HR topics, specifically leave, payroll, benefits, and workplace policies. Give clear, concise, practical guidance. Do not invent personal employment data or policy details that were not provided. When a question requires a personal decision or confidential case review, recommend contacting People & Culture. If the user asks about anything outside HR, politely redirect them back to leave, payroll, benefits, or policies.`;

const MOCK_REPLY = 'Demo mode: I can help with leave, payroll, benefits, and HR policies. Your Azure OpenAI connection is not configured yet, so please check the relevant PeopleHub page or contact People & Culture for a personal case.';

function isConfigured(value: string | undefined) {
  return Boolean(value && !value.includes('your-') && !value.includes('replace-with'));
}

export function hasAzureConfiguration() {
  return isConfigured(process.env.AZURE_OPENAI_ENDPOINT)
    && isConfigured(process.env.AZURE_OPENAI_API_KEY)
    && isConfigured(process.env.AZURE_OPENAI_DEPLOYMENT);
}

export async function createHrReply(message: string, history: HistoryItem[]) {
  if (!hasAzureConfiguration()) return MOCK_REPLY;

  const endpoint = process.env.AZURE_OPENAI_ENDPOINT!;
  const apiKey = process.env.AZURE_OPENAI_API_KEY!;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT!;
  const client = new AzureOpenAI({
    endpoint,
    apiKey,
    deployment,
    apiVersion: '2024-10-21',
  });

  const safeHistory = history.slice(-12).map((item) => ({
    role: item.role,
    content: item.content.slice(0, 4_000),
  }));
  const completion = await client.chat.completions.create({
    model: deployment,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...safeHistory,
      { role: 'user', content: message },
    ],
    temperature: 0.25,
    max_tokens: 500,
  });

  return completion.choices[0]?.message?.content?.trim()
    || 'I could not create a response. Please try again or contact People & Culture.';
}
