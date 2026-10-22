import { rateLimiter } from './rate-limiter';

const NVIDIA_BASE_URL = process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1';
const NVIDIA_MODEL = process.env.NVIDIA_MODEL || 'nvidia/nemotron-3-ultra-550b-a55b';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionOptions {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  enableThinking?: boolean;
}

/**
 * Direct chat completion against NVIDIA NIM API
 */
export async function createChatCompletion({
  messages,
  temperature = 0.6,
  maxTokens = 4096,
  enableThinking = false,
}: ChatCompletionOptions): Promise<string> {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    throw new Error('NVIDIA_API_KEY is not configured in environment variables.');
  }

  // Throttle request to guarantee compliance with 40 RPM limit
  await rateLimiter.throttle();

  const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: NVIDIA_MODEL,
      messages,
      temperature,
      max_tokens: maxTokens,
      extra_body: {
        chat_template_kwargs: {
          enable_thinking: enableThinking,
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NVIDIA API Error [${response.status}]: ${errorText}`);
  }

  const data = await response.json();
  const choice = data.choices?.[0];
  return choice?.message?.content || '';
}

/**
 * Returns a readable stream from NVIDIA NIM API (Server-Sent Events)
 */
export async function createChatStream({
  messages,
  temperature = 0.6,
  maxTokens = 4096,
  enableThinking = false,
}: ChatCompletionOptions): Promise<ReadableStream<Uint8Array>> {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    throw new Error('NVIDIA_API_KEY is not configured in environment variables.');
  }

  await rateLimiter.throttle();

  const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: NVIDIA_MODEL,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
      extra_body: {
        chat_template_kwargs: {
          enable_thinking: enableThinking,
        },
      },
    }),
  });

  if (!response.ok || !response.body) {
    const errorText = await response.text();
    throw new Error(`NVIDIA API Stream Error [${response.status}]: ${errorText}`);
  }

  return response.body;
}
