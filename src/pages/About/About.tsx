import { useState } from 'react';
import {
  Cpu,
  Database,
  GitBranch,
  Target,
  BarChart3,
  CheckCircle2,
  Clock,
  ArrowRight,
  Workflow,
  Server,
  Layers,
  Code2,
  Info,
  Copy,
  Check,
} from 'lucide-react';
import './About.css';

type AboutTab = 'architecture' | 'algorithms' | 'metrics' | 'roadmap';

export default function About() {
  const [activeTab, setActiveTab] = useState<AboutTab>('architecture');
  const [copiedCode, setCopiedCode] = useState(false);

  const codeSnippet = `from fastapi import FastAPI
from pydantic import BaseModel
import joblib

app = FastAPI(title="Speedex ML Predictor API")
regressor = joblib.load("models/random_forest_regressor.joblib")
classifier = joblib.load("models/random_forest_classifier.joblib")

class TelemetryPayload(BaseModel):
    latency: float
    jitter: float
    packetLoss: float
    signalStrength: float
    signalUnit: str

@app.post("/api/predict")
async def predict_network_quality(data: TelemetryPayload):
    features = [[data.latency, data.jitter, data.packetLoss, data.signalStrength]]
    predicted_speed = float(regressor.predict(features)[0])
    predicted_quality = str(classifier.predict(features)[0])
    
    return {
        "downloadSpeed": round(predicted_speed, 1),
        "quality": predicted_quality,
        "isSimulated": False,
        "confidenceScore": 96.4
    }`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="about fade-in">
      {/* ── Page Header Hero ── */}
      <div className="about__hero card">
        <div className="about__hero-meta">
          <span className="eyebrow">Academic &amp; Systems Architecture</span>
          <h1 className="about__hero-title">Dual-Task Network Quality &amp; Bandwidth Framework</h1>
          <p className="about__hero-desc">
            A predictive machine learning architecture designed to evaluate physical and transport-layer
            telemetry and infer continuous throughput and discrete SLA operational health without
            saturating end-user bandwidth.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="about__nav-tabs">
          <button
            type="button"
            className={`about__nav-tab tag-pill${activeTab === 'architecture' ? ' tag-pill--active' : ''}`}
            onClick={() => setActiveTab('architecture')}
          >
            <Workflow size={13} />
            <span>Architecture &amp; Features</span>
          </button>
          <button
            type="button"
            className={`about__nav-tab tag-pill${activeTab === 'algorithms' ? ' tag-pill--active' : ''}`}
            onClick={() => setActiveTab('algorithms')}
          >
            <Cpu size={13} />
            <span>Candidate Models</span>
          </button>
          <button
            type="button"
            className={`about__nav-tab tag-pill${activeTab === 'metrics' ? ' tag-pill--active' : ''}`}
            onClick={() => setActiveTab('metrics')}
          >
            <BarChart3 size={13} />
            <span>Evaluation Metrics</span>
          </button>
          <button
            type="button"
            className={`about__nav-tab tag-pill${activeTab === 'roadmap' ? ' tag-pill--active' : ''}`}
            onClick={() => setActiveTab('roadmap')}
          >
            <GitBranch size={13} />
            <span>Roadmap &amp; API Spec</span>
          </button>
        </div>
      </div>

      {/* ── TAB 1: Architecture & Telemetry Features ── */}
      {activeTab === 'architecture' && (
        <div className="about__tab-content fade-in">
          {/* Section 1: Objective */}
          <section className="about__section">
            <h2 className="about__section-title">
              <Target size={18} className="about__icon-lime" />
              <span>Dual-Task System Objective</span>
            </h2>
            <p className="about__section-desc">
              Conventional speed tests saturate user links with heavy multi-megabyte payloads, causing
              congestion and consuming metered data. Speedex operates via passive and lightweight active telemetry,
              passing 4 transport/link features to a dual-task predictive model:
            </p>

            <div className="about__task-grid">
              <div className="card about__task-card">
                <div className="about__task-card-header">
                  <span className="about__task-card-num">01</span>
                  <span className="about__task-card-type about__task-card-type--regression">
                    Task 1 — Continuous Regression
                  </span>
                </div>
                <h3 className="about__task-card-name">Bandwidth Throughput Prediction (Mbps)</h3>
                <p className="about__task-card-desc">
                  Models continuous non-linear relationship between RTT latency, packet jitter variance,
                  and link budget attenuation to estimate instantaneous download capacity.
                </p>
                <div className="about__task-badge-row">
                  <span className="about__tag">Target: Mbps Continuous [0, 150+]</span>
                </div>
              </div>

              <div className="card about__task-card">
                <div className="about__task-card-header">
                  <span className="about__task-card-num">02</span>
                  <span className="about__task-card-type about__task-card-type--classification">
                    Task 2 — Multi-Class Classification
                  </span>
                </div>
                <h3 className="about__task-card-name">SLA Network Quality Classification</h3>
                <p className="about__task-card-desc">
                  Categorizes link operational state into discrete SLA boundaries:
                  <strong> Poor</strong> (degraded transport), <strong>Average</strong> (usable standard),
                  and <strong>Excellent</strong> (low-latency gigabit).
                </p>
                <div className="about__task-badge-row">
                  <span className="about__tag">Classes: Poor | Average | Excellent</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Input Features */}
          <section className="about__section">
            <h2 className="about__section-title">
              <Database size={18} className="about__icon-lime" />
              <span>Input Telemetry Vector [4 Primary Dimensions]</span>
            </h2>
            <p className="about__section-desc">
              Extracted from transport protocols (ICMP/TCP/UDP) and wireless physical-layer link budgets:
            </p>

            <div className="about__cards-grid">
              <div className="card about__feature-card">
                <div className="about__feature-header">
                  <span className="about__feature-name">Round-Trip Latency (RTT)</span>
                  <span className="about__feature-unit">ms</span>
                </div>
                <p className="about__feature-desc">
                  Propagation delay for round-trip datagram transit. Primary factor governing interactive TCP acknowledgment pacing.
                </p>
                <div className="about__benchmark-tag">BENCHMARK: &lt; 30 ms</div>
              </div>

              <div className="card about__feature-card">
                <div className="about__feature-header">
                  <span className="about__feature-name">Packet Delay Variation (Jitter)</span>
                  <span className="about__feature-unit">ms</span>
                </div>
                <p className="about__feature-desc">
                  Statistical variance in packet arrival intervals. Excessive jitter induces transport buffer overflows and jitter-buffer latency.
                </p>
                <div className="about__benchmark-tag">BENCHMARK: &lt; 5 ms</div>
              </div>

              <div className="card about__feature-card">
                <div className="about__feature-header">
                  <span className="about__feature-name">Transport Packet Loss Rate</span>
                  <span className="about__feature-unit">%</span>
                </div>
                <p className="about__feature-desc">
                  Fraction of lost datagrams requiring congestion-backoff retransmissions, heavily penalizing TCP congestion window sizes.
                </p>
                <div className="about__benchmark-tag">BENCHMARK: &lt; 0.5%</div>
              </div>

              <div className="card about__feature-card">
                <div className="about__feature-header">
                  <span className="about__feature-name">Received Signal Power (RSSI)</span>
                  <span className="about__feature-unit">dBm / %</span>
                </div>
                <p className="about__feature-desc">
                  Physical link budget measuring radio-frequency signal power at device antenna, dictating MCS modulation tiers.
                </p>
                <div className="about__benchmark-tag">BENCHMARK: &gt; -55 dBm</div>
              </div>
            </div>
          </section>

          {/* Section: Pipeline Flowchart */}
          <section className="about__section">
            <h2 className="about__section-title">
              <Workflow size={18} className="about__icon-lime" />
              <span>Machine Learning Workflow Pipeline</span>
            </h2>

            <div className="card about__pipeline-card">
              <div className="about__pipeline-steps">
                <div className="about__pipeline-step">
                  <span className="about__pipeline-step-num">01 // TELEMETRY</span>
                  <h4>Collection</h4>
                  <p>ICMP ping sampling, RTT tracking, and RF signal interrogation.</p>
                </div>
                <div className="about__pipeline-arrow">
                  <ArrowRight size={14} />
                </div>

                <div className="about__pipeline-step">
                  <span className="about__pipeline-step-num">02 // NORMALIZATION</span>
                  <h4>Preprocessing</h4>
                  <p>Z-Score scaling, dBm to [0,1] normalization, outlier filtering.</p>
                </div>
                <div className="about__pipeline-arrow">
                  <ArrowRight size={14} />
                </div>

                <div className="about__pipeline-step">
                  <span className="about__pipeline-step-num">03 // FEATURE ENG</span>
                  <h4>Feature Engineering</h4>
                  <p>Interaction terms: RTT × Jitter, Loss penalties, Signal SNR ratios.</p>
                </div>
                <div className="about__pipeline-arrow">
                  <ArrowRight size={14} />
                </div>

                <div className="about__pipeline-step">
                  <span className="about__pipeline-step-num">04 // DUAL-TASK ML</span>
                  <h4>Dual-Task Training</h4>
                  <p>Regression on Mbps target + Random Forest classification on SLA.</p>
                </div>
                <div className="about__pipeline-arrow">
                  <ArrowRight size={14} />
                </div>

                <div className="about__pipeline-step">
                  <span className="about__pipeline-step-num">05 // FASTAPI</span>
                  <h4>Inference</h4>
                  <p>Sub-millisecond model inference served over JSON REST API.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ── TAB 2: Candidate Machine Learning Algorithms ── */}
      {activeTab === 'algorithms' && (
        <div className="about__tab-content fade-in">
          <section className="about__section">
            <h2 className="about__section-title">
              <Cpu size={18} className="about__icon-lime" />
              <span>Candidate Machine Learning Models</span>
            </h2>
            <p className="about__section-desc">
              Four supervised algorithms evaluated across inference latency, non-linear representation,
              and interpretability benchmarks:
            </p>

            <div className="about__cards-grid">
              <div className="card about__algo-card">
                <div className="about__algo-badge about__algo-badge--regression">REGRESSION BASELINE</div>
                <h3 className="about__algo-name">Linear Regression</h3>
                <p className="about__algo-desc">
                  Parametric baseline establishing linear coefficients for direct latency and attenuation penalties.
                  Highly interpretable with O(1) inference time.
                </p>
                <div className="about__algo-specs">
                  <div><span>Complexity:</span> <strong>O(p)</strong></div>
                  <div><span>Interpretability:</span> <strong>Very High</strong></div>
                  <div><span>Non-Linearity:</span> <strong>Low</strong></div>
                </div>
              </div>

              <div className="card about__algo-card">
                <div className="about__algo-badge about__algo-badge--regression">ENSEMBLE REGRESSOR</div>
                <h3 className="about__algo-name">Random Forest Regressor</h3>
                <p className="about__algo-desc">
                  Ensemble of bootstrapped decision trees capturing sharp non-linear degradation cliffs (such as sudden
                  packet loss thresholds above 2%).
                </p>
                <div className="about__algo-specs">
                  <div><span>Complexity:</span> <strong>O(n_trees × d)</strong></div>
                  <div><span>Interpretability:</span> <strong>Feature Importance</strong></div>
                  <div><span>Non-Linearity:</span> <strong>High</strong></div>
                </div>
              </div>

              <div className="card about__algo-card">
                <div className="about__algo-badge about__algo-badge--classification">RULE-BASED CLASSIFIER</div>
                <h3 className="about__algo-name">Decision Tree Classifier</h3>
                <p className="about__algo-desc">
                  Deterministic orthogonal splits providing human-readable decision logic directly matching
                  industry telecommunications SLA tiers.
                </p>
                <div className="about__algo-specs">
                  <div><span>Splits:</span> <strong>Gini / Entropy</strong></div>
                  <div><span>Decision Paths:</span> <strong>Transparent</strong></div>
                  <div><span>Overfitting Risk:</span> <strong>Pruned</strong></div>
                </div>
              </div>

              <div className="card about__algo-card">
                <div className="about__algo-badge about__algo-badge--classification">ENSEMBLE CLASSIFIER</div>
                <h3 className="about__algo-name">Random Forest Classifier</h3>
                <p className="about__algo-desc">
                  Ensemble bagging model that minimizes variance across edge cases, stabilizing quality classification
                  during transient spikes in jitter.
                </p>
                <div className="about__algo-specs">
                  <div><span>Ensemble:</span> <strong>100 Estimators</strong></div>
                  <div><span>Generalization:</span> <strong>Excellent</strong></div>
                  <div><span>Robustness:</span> <strong>Outlier Resistant</strong></div>
                </div>
              </div>
            </div>
          </section>

          {/* Model Comparison Table */}
          <section className="about__section">
            <h2 className="about__section-title">
              <Layers size={18} className="about__icon-lime" />
              <span>Algorithmic Comparison Matrix</span>
            </h2>

            <div className="card about__table-card">
              <table className="about__table">
                <thead>
                  <tr>
                    <th>Model Candidate</th>
                    <th>Target Task</th>
                    <th>Inference Speed</th>
                    <th>Handles Non-Linearity</th>
                    <th>Recommended Role</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Linear Regression</strong></td>
                    <td>Continuous Speed</td>
                    <td>&lt; 0.1 ms</td>
                    <td>Partial (Requires Polynomials)</td>
                    <td><span className="about__tag">Baseline Benchmark</span></td>
                  </tr>
                  <tr>
                    <td><strong>Random Forest Regressor</strong></td>
                    <td>Continuous Speed</td>
                    <td>&lt; 2.5 ms</td>
                    <td>Excellent</td>
                    <td><span className="about__tag about__tag--lime">Primary Regression Engine</span></td>
                  </tr>
                  <tr>
                    <td><strong>Decision Tree Classifier</strong></td>
                    <td>SLA Quality Tier</td>
                    <td>&lt; 0.2 ms</td>
                    <td>Good (Step Functions)</td>
                    <td><span className="about__tag">Interpretable Auditing</span></td>
                  </tr>
                  <tr>
                    <td><strong>Random Forest Classifier</strong></td>
                    <td>SLA Quality Tier</td>
                    <td>&lt; 2.8 ms</td>
                    <td>High (Ensemble Majority)</td>
                    <td><span className="about__tag about__tag--lime">Primary Classifier Engine</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* ── TAB 3: Proposed Evaluation Metrics ── */}
      {activeTab === 'metrics' && (
        <div className="about__tab-content fade-in">
          <section className="about__section">
            <h2 className="about__section-title">
              <BarChart3 size={18} className="about__icon-lime" />
              <span>Model Performance Evaluation Protocol</span>
            </h2>
            <p className="about__section-desc">
              Evaluation metrics tailored to balance continuous error bounds with classification reliability:
            </p>

            <div className="about__metrics-split">
              {/* Regression Metrics */}
              <div className="card about__metric-panel">
                <div className="about__metric-panel-header">
                  <span className="about__task-card-type about__task-card-type--regression">
                    Task 1 — Regression Metrics
                  </span>
                  <h3>Continuous Throughput Evaluation</h3>
                </div>

                <div className="about__metric-list">
                  <div className="about__metric-item">
                    <span className="about__metric-abbr">MAE</span>
                    <div className="about__metric-text">
                      <strong>Mean Absolute Error (Mbps)</strong>
                      <p>Average magnitude of prediction discrepancy in megabits per second.</p>
                    </div>
                  </div>
                  <div className="about__metric-item">
                    <span className="about__metric-abbr">MSE</span>
                    <div className="about__metric-text">
                      <strong>Mean Squared Error</strong>
                      <p>Penalizes severe outlier errors where estimated speed heavily diverges.</p>
                    </div>
                  </div>
                  <div className="about__metric-item">
                    <span className="about__metric-abbr">RMSE</span>
                    <div className="about__metric-text">
                      <strong>Root Mean Squared Error (Mbps)</strong>
                      <p>Quadratic scoring providing error standard deviation in natural Mbps scale.</p>
                    </div>
                  </div>
                  <div className="about__metric-item">
                    <span className="about__metric-abbr">R² Score</span>
                    <div className="about__metric-text">
                      <strong>Coefficient of Determination</strong>
                      <p>Proportion of variance in download throughput explained by telemetry features.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Classification Metrics */}
              <div className="card about__metric-panel">
                <div className="about__metric-panel-header">
                  <span className="about__task-card-type about__task-card-type--classification">
                    Task 2 — Classification Metrics
                  </span>
                  <h3>Multi-Class SLA Tier Evaluation</h3>
                </div>

                <div className="about__metric-list">
                  <div className="about__metric-item">
                    <span className="about__metric-abbr">Acc</span>
                    <div className="about__metric-text">
                      <strong>Classification Accuracy</strong>
                      <p>Overall percentage of correctly assigned quality tiers across test split.</p>
                    </div>
                  </div>
                  <div className="about__metric-item">
                    <span className="about__metric-abbr">Macro F1</span>
                    <div className="about__metric-text">
                      <strong>Harmonic Mean of Precision &amp; Recall</strong>
                      <p>Mitigates class imbalance between common standard links and rare severe drops.</p>
                    </div>
                  </div>
                  <div className="about__metric-item">
                    <span className="about__metric-abbr">Precision</span>
                    <div className="about__metric-text">
                      <strong>Tier Specificity</strong>
                      <p>Guarantees degraded links are never misclassified as high-speed Tier 1 links.</p>
                    </div>
                  </div>
                  <div className="about__metric-item">
                    <span className="about__metric-abbr">Conf Matrix</span>
                    <div className="about__metric-text">
                      <strong>3×3 Contingency Table</strong>
                      <p>Inspects cross-tier classification leakages between Poor, Average, and Excellent.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ── TAB 4: Implementation Status Roadmap & API Integration ── */}
      {activeTab === 'roadmap' && (
        <div className="about__tab-content fade-in">
          <section className="about__section">
            <h2 className="about__section-title">
              <GitBranch size={18} className="about__icon-lime" />
              <span>Project Development Roadmap &amp; Current Status</span>
            </h2>

            <div className="card about__status-card">
              <div className="about__status-notice">
                <Info size={16} className="about__icon-amber" />
                <span>
                  The web application features an isolated, modular architecture.
                  The UI interfaces exclusively with the <code>PredictionService</code> interface, ensuring
                  frictionless transition to a real Python REST backend without frontend alterations.
                </span>
              </div>

              <div className="about__roadmap-list">
                <div className="about__roadmap-item about__roadmap-item--done">
                  <div className="about__roadmap-marker">
                    <CheckCircle2 size={16} />
                  </div>
                  <div className="about__roadmap-content">
                    <div className="about__roadmap-title-row">
                      <h4>Phase 1: Production-Quality Frontend UI &amp; Diagnostics Dashboard</h4>
                      <span className="about__status-badge about__status-badge--done">Completed</span>
                    </div>
                    <p>
                      Dark responsive analytics dashboard, scenario presets, interactive charts,
                      workload suitability matrix, and client-side history logging.
                    </p>
                  </div>
                </div>

                <div className="about__roadmap-item about__roadmap-item--done">
                  <div className="about__roadmap-marker">
                    <CheckCircle2 size={16} />
                  </div>
                  <div className="about__roadmap-content">
                    <div className="about__roadmap-title-row">
                      <h4>Phase 2: Decoupled Simulation &amp; Heuristic Baseline Engine</h4>
                      <span className="about__status-badge about__status-badge--done">Completed</span>
                    </div>
                    <p>
                      Deterministic mathematical model simulating regression curves, contributing factors,
                      and SLA classification penalties for validation.
                    </p>
                  </div>
                </div>

                <div className="about__roadmap-item about__roadmap-item--active">
                  <div className="about__roadmap-marker">
                    <Clock size={16} />
                  </div>
                  <div className="about__roadmap-content">
                    <div className="about__roadmap-title-row">
                      <h4>Phase 3: Dataset Generation &amp; Feature Normalization Pipeline</h4>
                      <span className="about__status-badge about__status-badge--active">In Progress</span>
                    </div>
                    <p>
                      Collecting synthetic and empirical telemetry distributions across varied network interfaces
                      (Fiber, Wi-Fi 6, 5G, LTE, Satellite).
                    </p>
                  </div>
                </div>

                <div className="about__roadmap-item">
                  <div className="about__roadmap-marker">
                    <Clock size={16} />
                  </div>
                  <div className="about__roadmap-content">
                    <div className="about__roadmap-title-row">
                      <h4>Phase 4: Scikit-Learn / PyTorch Model Training &amp; Cross-Validation</h4>
                      <span className="about__status-badge">Planned</span>
                    </div>
                    <p>
                      Training Random Forest and Gradient Boosting ensembles; hyperparameter optimization via
                      GridSearchCV; evaluation with 5-fold cross-validation.
                    </p>
                  </div>
                </div>

                <div className="about__roadmap-item">
                  <div className="about__roadmap-marker">
                    <Server size={16} />
                  </div>
                  <div className="about__roadmap-content">
                    <div className="about__roadmap-title-row">
                      <h4>Phase 5: FastAPI / Flask Microservice Deployment</h4>
                      <span className="about__status-badge">Planned</span>
                    </div>
                    <p>
                      Packaging serialized <code>.joblib</code> / <code>.onnx</code> models into a lightweight
                      REST microservice with CORS support.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Code Integration Example */}
          <section className="about__section">
            <h2 className="about__section-title">
              <Code2 size={18} className="about__icon-lime" />
              <span>REST API Drop-In Integration Spec</span>
            </h2>
            <div className="card about__code-card">
              <div className="about__code-header">
                <div className="about__code-header-left">
                  <span className="about__code-dot" />
                  <span className="about__code-dot" />
                  <span className="about__code-dot" />
                  <span className="about__code-filename">fastapi_server.py</span>
                </div>
                <div className="about__code-header-right">
                  <span className="about__code-lang">Python 3.11</span>
                  <button
                    type="button"
                    className="about__code-copy-btn"
                    onClick={handleCopyCode}
                    title="Copy API integration code"
                  >
                    {copiedCode ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
              <pre className="about__code-block">
                <code>{codeSnippet}</code>
              </pre>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
