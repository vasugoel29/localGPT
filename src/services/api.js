const API_BASE = import.meta.env.VITE_OLLAMA_API_BASE || 'http://127.0.0.1:11434/api';

/**
 * Fetch available Ollama models.
 * @returns {Promise<Array<{name: string}>>}
 */
export async function fetchModels() {
  const res = await fetch(`${API_BASE}/tags`);
  if (!res.ok) throw new Error('Failed to fetch models');
  const data = await res.json();
  return data.models || [];
}

/**
 * Stream a chat response natively from Ollama.
 *
 * @param {string} model
 * @param {Array<{role: string, content: string}>} messages
 * @param {(token: string) => void} onToken   - called per token
 * @param {(metadata: object) => void} onDone  - called when stream ends
 * @param {(error: string) => void} onError
 * @param {AbortSignal} [signal]
 */
export async function streamChat(model, messages, onToken, onDone, onError, signal) {
  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages, stream: true }),
      signal,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      onError(errData.error || `Ollama responded with ${res.status}`);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let metadata = {};

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // keep incomplete line in buffer

      for (const line of lines) {
        if (!line.trim()) continue;

        try {
          const parsed = JSON.parse(line);
          
          if (parsed.error) {
            onError(parsed.error);
            return;
          }

          if (parsed.message?.content) {
            onToken(parsed.message.content);
          }

          if (parsed.done) {
            metadata = {
              total_duration: parsed.total_duration,
              eval_count: parsed.eval_count,
              eval_duration: parsed.eval_duration,
            };
            onDone(metadata);
            return;
          }
        } catch {
          // skip malformed
        }
      }
    }

    // Process any remaining buffer just in case
    if (buffer.trim()) {
      try {
        const parsed = JSON.parse(buffer);
        if (parsed.error) {
          onError(parsed.error);
          return;
        }
        if (parsed.message?.content) onToken(parsed.message.content);
        if (parsed.done) {
          metadata = {
            total_duration: parsed.total_duration,
            eval_count: parsed.eval_count,
            eval_duration: parsed.eval_duration,
          };
          onDone(metadata);
          return;
        }
      } catch {
        // ignore
      }
    }

    console.warn('[streamChat] Stream ended without a done flag');
    onDone(null);
  } catch (err) {
    if (err.name === 'AbortError') return;
    onError(err.message || String(err));
  }
}
