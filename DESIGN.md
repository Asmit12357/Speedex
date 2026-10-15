---
version: "2.0"
name: "Speedex — Osmo Supply Creative-Developer Design System"
description: >
  An authoritative design system specification for Speedex modeled after the award-winning
  Osmo Supply (osmo.supply) creative developer platform by Dennis Snellenberg and Ilja van Eck.
  It unifies high-contrast monochrome tones with vibrant accents (Electric Lime, Neon Coral,
  Cyber Cyan, Violet), tracked monospace eyebrows, bold tight-grotesque display headings,
  architectural 1px hairline borders, pill-shaped interactive elements, signature rolling text
  hover states, and smooth cubic-bezier motion curves.

tokens:
  colors:
    # ── Dark Theme (Default) ──
    dark:
      canvas: "#0e0d0d"
      canvas-subtle: "#151313"
      surface: "#1b1919"
      surface-elevated: "#232020"
      surface-hover: "#2a2626"
      border: "#2e2a2a"
      border-subtle: "rgba(255, 255, 255, 0.08)"
      border-strong: "#454040"
      ink-primary: "#ffffff"
      ink-secondary: "#b3adad"
      ink-muted: "#7c7575"
      ink-dim: "#524d4d"
      electric: "#c7ff00"       # High-energy Osmo primary CTA
      electric-text: "#0e0d0d"  # Text on electric
      coral: "#ff5c47"          # Warning / degraded link state
      cyan: "#00e5ff"           # Telemetry / download throughput
      emerald: "#10b981"        # Healthy SLA / online node
      violet: "#9d65ff"         # Model inference / secondary accent
      glow-electric: "rgba(199, 255, 0, 0.22)"
      glow-cyan: "rgba(0, 229, 255, 0.2)"
      glow-coral: "rgba(255, 92, 71, 0.2)"

    # ── Light Theme ──
    light:
      canvas: "#f7f6f2"
      canvas-subtle: "#eeece6"
      surface: "#ffffff"
      surface-elevated: "#f4f2ec"
      surface-hover: "#eae7df"
      border: "#ddd9cf"
      border-subtle: "rgba(0, 0, 0, 0.06)"
      border-strong: "#b8b2a4"
      ink-primary: "#141313"
      ink-secondary: "#4a4545"
      ink-muted: "#7d7676"
      ink-dim: "#a39b9b"
      electric: "#0e0d0d"       # Inverted solid black pill on light
      electric-text: "#ffffff"
      coral: "#e03e29"
      cyan: "#0091b3"
      emerald: "#088c5e"
      violet: "#703cdb"
      glow-electric: "rgba(0, 0, 0, 0.08)"
      glow-cyan: "rgba(0, 145, 179, 0.12)"
      glow-coral: "rgba(224, 62, 41, 0.12)"

  typography:
    font-display: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    font-body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    font-mono: "'JetBrains Mono', 'Haffer Mono', ui-monospace, SFMono-Regular, monospace"
    weights:
      normal: 400
      medium: 500
      semibold: 600
      bold: 700
      black: 800
    letterSpacing:
      tighter: "-0.04em"
      tight: "-0.025em"
      normal: "0em"
      wide: "0.05em"
      tracked: "0.12em"

  spacing:
    1: "4px"
    2: "8px"
    3: "12px"
    4: "16px"
    5: "20px"
    6: "24px"
    8: "32px"
    10: "40px"
    12: "48px"
    16: "64px"

  radius:
    xs: "4px"
    sm: "6px"
    md: "10px"
    lg: "16px"
    pill: "9999px"

  motion:
    cubic-default: "cubic-bezier(0.625, 0.05, 0, 1)"
    cubic-bounce: "cubic-bezier(0.175, 0.885, 0.32, 1.275)"
    duration-fast: "150ms"
    duration-normal: "300ms"
    duration-smooth: "600ms"
---

# Speedex — Osmo Supply Design System Specification

## 1. Visual Philosophy & Atmosphere
Speedex combines high-performance machine learning diagnostics with the refined, award-winning creative developer aesthetic of **Osmo Supply** (`osmo.supply`).

* **Editorial Brutalism meets Precision Engineering**: Stark, confident typography paired with surgical hairline borders (`1px solid var(--border)`).
* **Restrained Foundations with High-Voltage Moments**: Monochromatic canvas and surface layering punctuated by **Electric Lime (`#c7ff00`)** accents, **Cyber Cyan**, and **Neon Coral** for instant visual impact.
* **Continuous Motion & Micro-interactions**: Smooth pill hover rollovers, live animated marquees, and tactile button feedback using Osmo's signature easing curve `cubic-bezier(0.625, 0.05, 0, 1)`.
* **Zero Generic AI Tropes**: No soft floating purple blobs, no cartoonish drop shadows, no nested rounded cards inside rounded cards. Everything is sharp, functional, and calibrated.

---

## 2. Color System & Semantic Tokens

| Role | Dark Token | Light Token | Purpose & Context |
| :--- | :--- | :--- | :--- |
| **Canvas** | `#0e0d0d` | `#f7f6f2` | Base background; deep studio black in dark, warm paper in light. |
| **Surface** | `#1b1919` | `#ffffff` | Primary card surfaces and container cards. |
| **Surface Hover** | `#2a2626` | `#eae7df` | Subtle lift state for interactive cards and list items. |
| **Hairline Border** | `#2e2a2a` | `#ddd9cf` | 1px boundary lines creating architectural structure. |
| **Electric Lime** | `#c7ff00` | `#0e0d0d` | Primary CTA, active badges, and live diagnostic highlight. |
| **Cyber Cyan** | `#00e5ff` | `#0091b3` | Download throughput telemetry, active charts, and live streams. |
| **Neon Coral** | `#ff5c47` | `#e03e29` | Jitter/packet loss warnings, offline state, degraded SLA. |
| **Emerald Node** | `#10b981` | `#088c5e` | Excellent SLA tier, online link state, verified node. |
| **Violet Pulse** | `#9d65ff` | `#703cdb` | Machine learning engine badge, model parameter badges. |

---

## 3. Typography Architecture

* **Display Headers (`font-display`)**: Tight negative tracking (`letter-spacing: -0.035em` to `-0.02em`), bold/black weights (700/800), sentence case or headline case without trailing punctuation.
* **Eyebrows & Technical Labels (`font-mono`)**: Technical monospace font stack (`JetBrains Mono`), uppercase (`text-transform: uppercase`), wide tracking (`letter-spacing: 0.12em`), small font size (`11px` - `12px`).
* **Numeric Telemetry (`font-mono`)**: Tabular numerals (`font-variant-numeric: tabular-nums`) so numbers never jitter or shift during live polling and test transitions.
* **Body & Explanations (`font-body`)**: Clean, high-legibility sans-serif with comfortable line height (`1.55` - `1.65`).

---

## 4. Key Component Patterns

### 4.1 Enterprise Telemetry Header Bar
* Minimalist, purposeful navigation header with dynamic breadcrumb navigation (`Speedex / Network Intelligence`).
* Real-time network link beacon (`Online · 1 Gbps Link`), connected Edge PoP indicator (`FRA-01 (18ms)`), and UTC workstation clock.
* Zero distracting marquee tickers or ticker-tape banners.

### 4.2 Precision Enterprise Action Buttons
* High-precision button geometry (`border-radius: var(--radius-sm)`).
* Tactile interaction: subtle active press `transform: scale(0.985)`, subtle inset highlights, and clean focus rings.
* Single, accessible semantic labels with clear loading spinners — no duplicated screen-reader spam or unnatural rolling translateY tricks.

### 4.3 Metric Cards & Dynamic Telemetry Gauges
* Clean card surfaces with 1px hairline boundary lines (`1px solid var(--border-color)`).
* Dynamic health gauge that computes real ITU-T Y.1541 score from actual latency, jitter, and packet loss measurements.
* No garish 2px neon stripes or exaggerated blur glows.

### 4.4 Calibrated Link Profile Selector
* Quick-access profile pills (Fiber Gigabit, High-Speed Broadband, Starlink LEO, Degraded 4G/LTE) with clear telemetry specs.
* High-contrast active state indicators.

---

## 5. Anti-AI Guardrails (Do's and Don'ts)

* **DO** use `1px solid var(--border-color)` for borders rather than heavy drop shadows or neon stripes.
* **DO** use meaningful semantic icons with explicit functional purpose.
* **DO** respect dark/light theme switching through semantic variables.
* **DO** keep numbers tabular (`font-variant-numeric: tabular-nums`) so live polling is rock-solid.
* **DON'T** introduce arbitrary `✦` 4-pointed stars or decorative sparkle tropes.
* **DON'T** use ticker-tape marquee banners under the navigation bar.
* **DON'T** use duplicated label rollover hacks (`btn-rolling`) that break accessibility.
* **DON'T** create static, fake workflow steppers that never respond to user interaction.
* **DON'T** expose internal mock jargon (e.g. "FastAPI Stub") to end users in the UI.
