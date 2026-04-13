// Scrubbed error logging: emits error class + message but never the payload,
// stack, or cause chain that might carry user code, prompts, or PII.

export function logApiError(tag: string, err: unknown): void {
  if (err instanceof Error) {
    console.error(`[${tag}]`, { name: err.name, message: err.message });
    return;
  }
  console.error(`[${tag}]`, { name: 'Unknown', message: String(err).slice(0, 200) });
}
