/**
 * Runtime configuration, read from Vite env vars (see .env.example).
 * Everything is optional: with no env set the app runs entirely in the
 * browser against Cloudflare's public speed test endpoints.
 */

function readEnv(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export const config = {
  /** Model API base URL. Unset → built-in heuristic estimate. */
  predictionApiUrl: readEnv(import.meta.env.VITE_PREDICTION_API_URL),
  /** Endpoint returning `{ username, credential }` for Cloudflare TURN. Unset → no packet loss test. */
  turnCredsUrl: readEnv(import.meta.env.VITE_TURN_CREDS_URL),
  /** TURN server URI, only used together with turnCredsUrl. */
  turnServerUri: readEnv(import.meta.env.VITE_TURN_SERVER_URI) ?? 'turn.cloudflare.com:3478',
} as const;
