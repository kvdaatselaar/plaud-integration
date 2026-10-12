/**
 * Every network call gets a deadline unless it brings its own. Without one, a request that was open
 * when the Mac went to sleep (or the network dropped) can hang for hours, and while the daily run
 * hangs, launchd skips the next one.
 */
const DEFAULT_MS = Number(process.env.HTTP_TIMEOUT_SECONDS ?? 120) * 1000;

const original = globalThis.fetch;
globalThis.fetch = ((input: Parameters<typeof fetch>[0], init?: RequestInit) =>
  original(input, init?.signal ? init : { ...init, signal: AbortSignal.timeout(DEFAULT_MS) })) as typeof fetch;
