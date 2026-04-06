import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { supabase } from '../config/supabase.js';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const DEFAULT_MODEL = env.OPENROUTER_DEFAULT_MODEL;
const MAX_RETRIES = 3;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const createHeaders = () => ({
  Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
  'Content-Type': 'application/json',
  'HTTP-Referer': 'http://localhost',
  'X-Title': 'School Management AI Suite',
});

const parseCompletionResponse = async (response) => {
  const json = await response.json();
  const content = json?.choices?.[0]?.message?.content;
  if (!content) {
    throw new ApiError(502, 'AI provider returned invalid response');
  }
  return {
    content,
    usage: {
      promptTokens: json?.usage?.prompt_tokens ?? 0,
      completionTokens: json?.usage?.completion_tokens ?? 0,
      totalTokens: json?.usage?.total_tokens ?? 0,
    },
  };
};

const requestCompletion = async ({ messages, model, stream = false }) => {
  let attempt = 0;
  while (attempt <= MAX_RETRIES) {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({
        model: model || DEFAULT_MODEL,
        messages,
        stream,
      }),
    });

    if (response.status === 429 && attempt < MAX_RETRIES) {
      const delay = 2 ** attempt * 500;
      await wait(delay);
      attempt += 1;
      continue;
    }

    if (!response.ok) {
      const providerError = await response.text();
      throw new ApiError(502, 'AI provider request failed', {
        status: response.status,
        providerError,
      });
    }

    return response;
  }

  throw new ApiError(429, 'AI provider rate limit exceeded after retries');
};

export const logAICall = async ({ userId, feature, subject, prompt, response, usage, model }) => {
  await supabase.from('ai_interactions').insert({
    user_id: userId,
    feature,
    subject,
    prompt,
    response,
    prompt_tokens: usage?.promptTokens ?? 0,
    completion_tokens: usage?.completionTokens ?? 0,
    total_tokens: usage?.totalTokens ?? 0,
    model: model || DEFAULT_MODEL,
  });
};

export const completeWithOpenRouter = async ({ messages, model, metadata }) => {
  const response = await requestCompletion({ messages, model, stream: false });
  const parsed = await parseCompletionResponse(response);

  await logAICall({
    ...metadata,
    response: parsed.content,
    usage: parsed.usage,
    model: model || DEFAULT_MODEL,
  });

  return parsed;
};

export const streamWithOpenRouter = async ({ req, res, messages, model, metadata }) => {
  const response = await requestCompletion({ messages, model, stream: true });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullResponse = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);

    const lines = chunk.split('\n').filter((line) => line.startsWith('data: '));
    for (const line of lines) {
      const raw = line.replace(/^data:\s*/, '');
      if (raw === '[DONE]') continue;
      try {
        const parsed = JSON.parse(raw);
        const delta = parsed?.choices?.[0]?.delta?.content ?? '';
        if (!delta) continue;
        fullResponse += delta;
        res.write(`data: ${JSON.stringify({ token: delta })}\n\n`);
      } catch {
        // Ignore malformed provider chunks.
      }
    }
  }

  await logAICall({
    ...metadata,
    response: fullResponse,
    usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
    model: model || DEFAULT_MODEL,
  });

  res.write('data: [DONE]\n\n');
  res.end();

  req.on('close', () => {
    res.end();
  });
};
