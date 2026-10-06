import { kbConfig } from './config.js';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

export class LlmUnavailableError extends Error {}

/**
 * Transcripts contain customer data and may not leave the machine (Zig policy).
 * Refuse any non-local endpoint unless KB_ALLOW_REMOTE_LLM=yes was set deliberately.
 */
export function assertLocalEndpoint(): void {
  if (kbConfig.llm.provider === 'mock') return;
  const host = new URL(kbConfig.llm.baseUrl).hostname;
  if (LOCAL_HOSTS.has(host) || kbConfig.llm.allowRemote) return;
  throw new LlmUnavailableError(
    `KB_LLM_URL wijst naar ${host}. Transcripten bevatten klantgegevens en worden alleen naar een ` +
    'lokaal model gestuurd. Zet KB_ALLOW_REMOTE_LLM=yes alleen als dit expliciet is toegestaan.',
  );
}

/** Verifies Ollama runs and the model is pulled, with an actionable message otherwise. */
export async function checkLlm(): Promise<void> {
  assertLocalEndpoint();
  if (kbConfig.llm.provider === 'mock') return;
  let tags: { models?: { name: string }[] };
  try {
    const res = await fetch(`${kbConfig.llm.baseUrl}/api/tags`, { signal: AbortSignal.timeout(5000) });
    tags = await res.json() as typeof tags;
  } catch {
    throw new LlmUnavailableError(
      `Geen lokaal taalmodel bereikbaar op ${kbConfig.llm.baseUrl}. Installeer en start Ollama:\n` +
      `  brew install ollama && brew services start ollama\n  ollama pull ${kbConfig.llm.model}`,
    );
  }
  const want = kbConfig.llm.model.includes(':') ? kbConfig.llm.model : `${kbConfig.llm.model}:latest`;
  if (!tags.models?.some(m => m.name === want)) {
    throw new LlmUnavailableError(`Model ${kbConfig.llm.model} ontbreekt. Haal het op met: ollama pull ${kbConfig.llm.model}`);
  }
}

/** One chat turn constrained to a JSON schema (Ollama structured outputs). */
export async function chatJson<T>(system: string, user: string, schema: object, mock: T): Promise<T> {
  if (kbConfig.llm.provider === 'mock') return mock;
  let lastError: unknown;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(`${kbConfig.llm.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: kbConfig.llm.model,
          stream: false,
          format: schema,
          options: { temperature: 0.2, num_ctx: kbConfig.llm.contextTokens },
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
        }),
      });
      if (!res.ok) throw new Error(`Ollama ${res.status}: ${(await res.text()).slice(0, 200)}`);
      const data = await res.json() as { message?: { content?: string } };
      return JSON.parse(data.message?.content ?? '') as T;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}
