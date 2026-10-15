/** Preset link profiles for the Analyzer. Illustrative values, not measurements. */

import type { NetworkInput, NetworkScenario } from '../types';

/** Demo input values for quick testing */
export const DEMO_VALUES: NetworkInput = {
  latency: 24,
  jitter: 3,
  packetLoss: 0.2,
  signalStrength: -45,
  signalUnit: 'dBm',
  testServer: 'Ashburn, VA (Edge Node 04)',
};

/** Pre-configured realistic network scenarios for immediate testing */
export const PRESET_SCENARIOS: NetworkScenario[] = [
  {
    id: 'fiber-gigabit',
    name: 'Fiber Gigabit (High Speed)',
    description: 'Ultra-low latency symmetric fiber connection with zero jitter.',
    icon: 'Zap',
    category: 'Broadband',
    values: {
      latency: 8,
      jitter: 0.8,
      packetLoss: 0.0,
      signalStrength: -38,
      signalUnit: 'dBm',
      testServer: 'New York Metro (Fiber PoP)',
    },
  },
  {
    id: 'office-wifi',
    name: 'Office Wi-Fi 6 (Standard)',
    description: 'Corporate wireless network with balanced throughput and low interference.',
    icon: 'Wifi',
    category: 'Wireless',
    values: {
      latency: 22,
      jitter: 2.8,
      packetLoss: 0.1,
      signalStrength: -52,
      signalUnit: 'dBm',
      testServer: 'Chicago, IL (Cloudflare Gateway)',
    },
  },
  {
    id: 'mobile-5g',
    name: '5G Mobile Cellular',
    description: 'Modern cellular tower connection with high speed but moderate jitter.',
    icon: 'Signal',
    category: 'Cellular',
    values: {
      latency: 38,
      jitter: 7.5,
      packetLoss: 0.8,
      signalStrength: -68,
      signalUnit: 'dBm',
      testServer: 'Dallas, TX (Cellular Edge)',
    },
  },
  {
    id: 'congested-cafe',
    name: 'Crowded Public Café',
    description: 'Degraded link with high interference and RF packet collision.',
    icon: 'AlertTriangle',
    category: 'Degraded',
    values: {
      latency: 94,
      jitter: 26.0,
      packetLoss: 4.8,
      signalStrength: -82,
      signalUnit: 'dBm',
      testServer: 'Seattle, WA (Public Hotspot)',
    },
  },
  {
    id: 'satellite-link',
    name: 'Satellite / Geo-Orbit',
    description: 'High propagation delay link with high physical distance overhead.',
    icon: 'Radio',
    category: 'Satellite',
    values: {
      latency: 220,
      jitter: 18.5,
      packetLoss: 1.8,
      signalStrength: -74,
      signalUnit: 'dBm',
      testServer: 'LEO Constellation Downlink',
    },
  },
];
