/** Shared display helpers. */

/** Gauge scale tops out at 1 Gbps; log scale so 20 Mbps and 900 Mbps both read clearly. */
export const GAUGE_MAX_MBPS = 1000;

export function gaugeFraction(mbps: number): number {
  if (!Number.isFinite(mbps) || mbps <= 0) return 0;
  return Math.min(1, Math.log10(1 + mbps) / Math.log10(1 + GAUGE_MAX_MBPS));
}

/** 1 decimal under 100, whole numbers above, so the readout width stays steady. */
export function formatMbps(mbps: number | undefined): string {
  if (mbps === undefined || !Number.isFinite(mbps)) return '—';
  return mbps >= 100 ? String(Math.round(mbps)) : mbps.toFixed(1);
}

export function formatMs(ms: number | undefined): string {
  if (ms === undefined || !Number.isFinite(ms)) return '—';
  return ms >= 100 ? String(Math.round(ms)) : ms.toFixed(1);
}

export function formatDuration(ms: number): string {
  return `${(ms / 1000).toFixed(1)} s`;
}

export function timeAgo(iso: string, now = Date.now()): string {
  const seconds = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
