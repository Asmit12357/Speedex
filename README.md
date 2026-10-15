# Speedex

A network diagnostics dashboard. It runs a real speed test in the browser against
Cloudflare's edge, grades the result, and keeps a local history. A prediction model
that estimates speed from passive signals (latency, jitter, loss, signal strength) is
in development. Until it ships, the Analyzer page uses a built-in heuristic and labels
its output as an estimate.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173 and press **Run speed test**. No keys or backend needed.

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm test` | Unit tests (Vitest) |
| `npm run lint` | Oxlint |
| `npm run build` | Type-check and production build |

## How measurement works

The live test uses [`@cloudflare/speedtest`](https://github.com/cloudflare/speedtest)
(MIT) against `speed.cloudflare.com`. It measures download, upload, idle latency,
jitter and latency under load, and Cloudflare's AIM ratings for streaming, gaming and
video calls.

- **Quick** (default) caps requests at 10 MB, roughly 30 MB in total.
- **Full** runs Cloudflare's own sequence and can use more than 1 GB on fast links.
- Results stay in your browser. The app turns off the library's default upload of
  results to Cloudflare (`logAimApiUrl: null`).
- **Packet loss** needs a TURN relay, so it's off unless you set `VITE_TURN_CREDS_URL`
  (see `.env.example`).
- **Signal strength** can't be read by browsers. It's only an optional input for the
  estimate.

## Plugging in the model

Everything goes through one interface, `PredictionService` in `src/types`. The
implementation is picked in `src/services/predictionService.ts`:

- `VITE_PREDICTION_API_URL` unset → heuristic estimate (`src/services/heuristicModel.ts`)
- set → `POST <url>/predict`. If the API fails, the app falls back to the estimate and
  shows a notice.

For local development, run the model server on port 8000 and put this in `.env.local`:

```bash
VITE_PREDICTION_API_URL=/api
```

The Vite dev server proxies `/api/*` to `http://localhost:8000/*` (override it with
`MODEL_API_TARGET`), so you don't need CORS headers.

### Request

```json
POST /predict
{
  "latency": 24,
  "jitter": 3.1,
  "packetLoss": 0.2,
  "signalStrength": -45,
  "signalUnit": "dBm"
}
```

Units: latency and jitter in ms, packetLoss in percent (0–100), signalStrength in dBm
(-100–0) or percent (0–100), as given by `signalUnit`.

### Response

```json
{
  "downloadSpeed": 58.4,
  "quality": "Excellent",
  "uploadSpeed": 21.6,
  "confidenceScore": 94,
  "explanation": "Optional plain-language summary.",
  "factors": [
    { "label": "Latency", "value": "24 ms", "impact": "positive", "benchmark": "< 30 ms" }
  ]
}
```

Only `downloadSpeed` (Mbps) and `quality` (`"Poor" | "Average" | "Excellent"`) are
required. If `uploadSpeed`, `explanation` or `factors` are missing, the app fills them in
locally. `confidenceScore` (0–100) appears in the UI only when the model sends it.

A minimal FastAPI stub that satisfies the contract:

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Features(BaseModel):
    latency: float
    jitter: float
    packetLoss: float
    signalStrength: float
    signalUnit: str

@app.post("/predict")
def predict(f: Features):
    speed = model.predict(...)  # your model here
    return {"downloadSpeed": speed, "quality": "Average"}
```

## Project layout

```
src/
  services/
    speedTestService.ts   Cloudflare test runner (lazy-loaded library)
    edgeInfo.ts           Which Cloudflare data center you hit
    measuredResult.ts     Grades live measurements
    heuristicModel.ts     Stand-in estimator until the model ships
    predictionService.ts  Picks model API vs. heuristic
  hooks/                  useSpeedTest, useAnalysis (history), useTheme
  pages/                  Overview, SpeedTest, Analyzer, Results, History, About
```

The visual system (tokens, type and motion) is described in `DESIGN.md`.
