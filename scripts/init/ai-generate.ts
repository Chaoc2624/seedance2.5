import type { TemplateDefinition } from './templates';
import type { ProductInfo } from './prompt-builder';
import { buildPrompt } from './prompt-builder';

export interface GeneratedContent {
  en: Record<string, any>;
  zh: Record<string, any>;
}

export type ProgressEvent =
  | { type: 'connecting' }
  | { type: 'streaming'; chars: number }
  | { type: 'stream-done'; chars: number }
  | { type: 'parsing' };

/**
 * Call an OpenAI-compatible API to generate landing page content.
 *
 * Supports OpenRouter, OpenAI, Deepseek, and any compatible endpoint.
 * Configure via env: LANDING_AI_API_KEY + LANDING_AI_BASE_URL +
 * LANDING_AI_MODEL (or OPENROUTER_* / OPENAI_* fallbacks).
 *
 * When `onProgress` is supplied, uses OpenAI-style SSE streaming so the
 * caller can reflect incremental progress (char count) in the terminal.
 */
export async function generateContent(
  product: ProductInfo,
  template: TemplateDefinition,
  onProgress?: (event: ProgressEvent) => void
): Promise<GeneratedContent> {
  const apiKey =
    process.env.LANDING_AI_API_KEY ||
    process.env.OPENROUTER_API_KEY ||
    process.env.OPENAI_API_KEY ||
    '';
  const baseUrl =
    process.env.LANDING_AI_BASE_URL ||
    process.env.OPENROUTER_BASE_URL ||
    process.env.OPENAI_BASE_URL ||
    'https://api.moonshot.cn/v1';
  const model = process.env.LANDING_AI_MODEL || 'moonshot-v1-8k';

  if (!apiKey) {
    throw new Error(
      'No API key found. Set LANDING_AI_API_KEY (or OPENROUTER_API_KEY / OPENAI_API_KEY) in your .env file.'
    );
  }

  const { system, user } = buildPrompt(product, template);
  const useStreaming = typeof onProgress === 'function';

  onProgress?.({ type: 'connecting' });

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.7,
      max_tokens: 8000,
      stream: useStreaming,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API request failed (${response.status}): ${text}`);
  }

  let content = '';
  if (useStreaming && response.body) {
    content = await consumeSseStream(response.body, onProgress);
  } else {
    const data = await response.json();
    content = data.choices?.[0]?.message?.content ?? '';
  }

  if (!content) {
    throw new Error('Empty response from AI API');
  }

  onProgress?.({ type: 'stream-done', chars: content.length });
  onProgress?.({ type: 'parsing' });

  const jsonStr = content
    .replace(/^```(?:json)?\s*/m, '')
    .replace(/\s*```\s*$/m, '')
    .trim();

  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed.en || !parsed.zh) {
      throw new Error('Response missing "en" or "zh" keys');
    }
    return parsed as GeneratedContent;
  } catch (e: any) {
    throw new Error(
      `Failed to parse AI response as JSON: ${e.message}\n\nRaw response head:\n${content.slice(0, 500)}`
    );
  }
}

async function consumeSseStream(
  body: ReadableStream<Uint8Array>,
  onProgress: (event: ProgressEvent) => void
): Promise<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let content = '';
  let lastReportedChars = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let boundary = buffer.indexOf('\n\n');
      while (boundary >= 0) {
        const event = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        boundary = buffer.indexOf('\n\n');

        for (const rawLine of event.split('\n')) {
          const line = rawLine.trim();
          if (!line.startsWith('data:')) continue;
          const data = line.slice(5).trim();
          if (!data || data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            const delta: string =
              parsed.choices?.[0]?.delta?.content ??
              parsed.choices?.[0]?.message?.content ??
              '';
            if (delta) {
              content += delta;
              if (content.length - lastReportedChars >= 50) {
                lastReportedChars = content.length;
                onProgress({ type: 'streaming', chars: content.length });
              }
            }
          } catch {
            // tolerate keep-alive chunks and malformed data lines
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  // final nudge in case we never crossed the 50-char threshold at the end
  if (content.length !== lastReportedChars) {
    onProgress({ type: 'streaming', chars: content.length });
  }
  return content;
}
