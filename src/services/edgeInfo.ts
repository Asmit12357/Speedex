import type { EdgeLocation } from '../types';

/**
 * Cloudflare's trace endpoint is CORS-readable and names the serving data
 * center. (The `colo`/`city` headers on speed test responses aren't exposed
 * to browsers, so we can't read them there.)
 */
const TRACE_URL = 'https://speed.cloudflare.com/cdn-cgi/trace';

/** Parses the `key=value` lines of a /cdn-cgi/trace response. */
export function parseTrace(text: string): EdgeLocation | undefined {
  const fields = new Map<string, string>();
  for (const line of text.split('\n')) {
    const eq = line.indexOf('=');
    if (eq > 0) fields.set(line.slice(0, eq).trim(), line.slice(eq + 1).trim());
  }
  const colo = fields.get('colo');
  if (!colo) return undefined;
  const loc = fields.get('loc');
  return { colo, country: loc && loc !== 'XX' ? loc : undefined };
}

/** Which Cloudflare data center this browser reaches. A ~200-byte request. */
export async function fetchEdgeLocation(signal?: AbortSignal): Promise<EdgeLocation | undefined> {
  const res = await fetch(TRACE_URL, { cache: 'no-store', signal });
  if (!res.ok) return undefined;
  return parseTrace(await res.text());
}

let regionNames: Intl.DisplayNames | null | undefined;

function countryName(code: string): string {
  if (regionNames === undefined) {
    try {
      regionNames = new Intl.DisplayNames(undefined, { type: 'region' });
    } catch {
      regionNames = null;
    }
  }
  try {
    return regionNames?.of(code) ?? code;
  } catch {
    return code;
  }
}

/** "DEL · India" */
export function formatEdge(edge: EdgeLocation): string {
  const where = edge.city ?? (edge.country ? countryName(edge.country) : undefined);
  return where ? `${edge.colo} · ${where}` : edge.colo;
}
