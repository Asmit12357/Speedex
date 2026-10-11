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
} from 'lucide-react';
import './About.css';

export default function About() {
  return (
    <div className="about">
      <header>
        <h1 className="page-title">About the Project</h1>
        <p className="page-subtitle">
          Internet Speed & Network Quality Predictor — System Architecture & Proposal
        </p>
      </header>

      {/* Section 1: Objective */}
      <section className="about__section">
        <h2 className="about__section-title">
          <Target size={20} />
          Project Objective
        </h2>
        <p className="about__section-desc">
          This system proposes a dual-task machine-learning architecture to analyze
          raw network telemetry and reliably estimate connection throughput and overall
          stability without requiring heavy active bandwidth saturation tests.
        </p>

        <div className="about__task-grid">
          <div className="about__task-card">
            <span className="about__task-card-type about__task-card-type--regression">
              Task 1 — Regression
            </span>
            <h3 className="about__task-card-name">Download Speed Prediction</h3>
            <p className="about__task-card-desc">
              Predicts instantaneous continuous download speed (in Mbps) as a
              function of low-level network characteristics.
            </p>
          </div>

          <div className="about__task-card">
            <span className="about__task-card-type about__task-card-type--classification">
              Task 2 — Classification
            </span>
            <h3 className="about__task-card-name">Network Quality Classification</h3>
            <p className="about__task-card-desc">
              Categorizes network health into discrete operational tiers:
              <strong> Poor</strong>, <strong>Average</strong>, or <strong>Excellent</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Input Features */}
      <section className="about__section">
        <h2 className="about__section-title">
          <Database size={20} />
          Input Telemetry Features
        </h2>
        <p className="about__section-desc">
          The planned machine learning pipeline relies on four primary telemetry
          parameters captured at the transport and physical layer:
        </p>

        <div className="about__cards-grid">
          <div className="about__feature-card">
            <span className="about__feature-name">Latency</span>
            <span className="about__feature-unit">ms</span>
            <p className="about__feature-desc">
              Round-trip propagation delay (RTT). Crucial indicator of congestion and routing path length.
            </p>
          </div>

          <div className="about__feature-card">
            <span className="about__feature-name">Jitter</span>
            <span className="about__feature-unit">ms</span>
            <p className="about__feature-desc">
              Statistical variance in packet arrival intervals. Key metric for real-time traffic degradation.
            </p>
          </div>

          <div className="about__feature-card">
            <span className="about__feature-name">Packet Loss</span>
            <span className="about__feature-unit">%</span>
            <p className="about__feature-desc">
              Proportion of discarded or lost packets requiring retransmission, heavily penalizing TCP throughput.
            </p>
          </div>

          <div className="about__feature-card">
            <span className="about__feature-name">Signal Strength</span>
            <span className="about__feature-unit">dBm or %</span>
            <p className="about__feature-desc">
              Physical layer link budget (RSSI) measuring RF signal power across wireless interfaces.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Proposed Algorithms */}
      <section className="about__section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <h2 className="about__section-title" style={{ margin: 0 }}>
            <Cpu size={20} />
            Proposed Machine Learning Algorithms
          </h2>
          <span className="about__planned-badge">Planned Models</span>
        </div>
        <p className="about__section-desc">
          Multiple candidate models are being investigated to balance inference speed,
          interpretability, and predictive accuracy:
        </p>

        <div className="about__cards-grid">
          <div className="about__algo-card">
            <span className="about__algo-type about__algo-type--regression">Regression</span>
            <h3 className="about__algo-name">Linear Regression</h3>
            <p className="about__algo-desc">
              Serves as the interpretable baseline model to establish linear correlation benchmarks between network features and throughput.
            </p>
          </div>

          <div className="about__algo-card">
            <span className="about__algo-type about__algo-type--regression">Regression</span>
            <h3 className="about__algo-name">Random Forest Regressor</h3>
            <p className="about__algo-desc">
              Ensemble non-linear regressor designed to capture complex threshold effects and interaction terms across multi-factor inputs.
            </p>
          </div>

          <div className="about__algo-card">
            <span className="about__algo-type about__algo-type--classification">Classification</span>
            <h3 className="about__algo-name">Decision Tree Classifier</h3>
            <p className="about__algo-desc">
              Rule-based classification tree providing deterministic splits and transparent decision boundaries for SLA categorization.
            </p>
          </div>

          <div className="about__algo-card">
            <span className="about__algo-type about__algo-type--classification">Classification</span>
            <h3 className="about__algo-name">Random Forest Classifier</h3>
            <p className="about__algo-desc">
              Bagged ensemble classifier minimizing overfitting and improving classification generalization on edge condition variances.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: Proposed Evaluation Metrics */}
      <section className="about__section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <h2 className="about__section-title" style={{ margin: 0 }}>
            <BarChart3 size={20} />
            Proposed Evaluation Metrics
          </h2>
          <span className="about__planned-badge">Evaluation Protocol</span>
        </div>

        <div className="about__metric-group-title">Regression Task Metrics</div>
        <div className="about__metrics-table">
          <div className="about__metric-row">
            <span className="about__metric-name">MAE</span>
            <span className="about__metric-desc">
              Mean Absolute Error — Measures the average magnitude of prediction errors in Mbps.
            </span>
          </div>
          <div className="about__metric-row">
            <span className="about__metric-name">MSE</span>
            <span className="about__metric-desc">
              Mean Squared Error — Penalizes larger outlier prediction deviations more heavily.
            </span>
          </div>
          <div className="about__metric-row">
            <span className="about__metric-name">R² Score</span>
            <span className="about__metric-desc">
              Coefficient of Determination — Proportion of variance in speed explained by the model.
            </span>
          </div>
        </div>

        <div className="about__metric-group-title">Classification Task Metrics</div>
        <div className="about__metrics-table">
          <div className="about__metric-row">
            <span className="about__metric-name">Accuracy & F1-Score</span>
            <span className="about__metric-desc">
              Overall correctness and harmonic mean of precision/recall across class imbalances.
            </span>
          </div>
          <div className="about__metric-row">
            <span className="about__metric-name">Precision & Recall</span>
            <span className="about__metric-desc">
              Per-class specificity and sensitivity to prevent misclassifying poor connections as excellent.
            </span>
          </div>
          <div className="about__metric-row">
            <span className="about__metric-name">Confusion Matrix</span>
            <span className="about__metric-desc">
              Multi-class contingency table highlighting cross-tier boundary misclassifications.
            </span>
          </div>
        </div>
      </section>

      {/* Section 5: ML Workflow Pipeline */}
      <section className="about__section">
        <h2 className="about__section-title">
          <Workflow size={20} />
          Proposed ML Workflow Pipeline
        </h2>

        <div className="about__workflow">
          <div className="about__workflow-step">
            <span className="about__workflow-step-num">Step 1</span>
            <span className="about__workflow-step-name">Data Collection</span>
          </div>
          <div className="about__workflow-arrow">
            <ArrowRight size={18} />
          </div>

          <div className="about__workflow-step">
            <span className="about__workflow-step-num">Step 2</span>
            <span className="about__workflow-step-name">Preprocessing</span>
          </div>
          <div className="about__workflow-arrow">
            <ArrowRight size={18} />
          </div>

          <div className="about__workflow-step">
            <span className="about__workflow-step-num">Step 3</span>
            <span className="about__workflow-step-name">Label Generation</span>
          </div>
          <div className="about__workflow-arrow">
            <ArrowRight size={18} />
          </div>

          <div className="about__workflow-step">
            <span className="about__workflow-step-num">Step 4</span>
            <span className="about__workflow-step-name">Model Training</span>
          </div>
          <div className="about__workflow-arrow">
            <ArrowRight size={18} />
          </div>

          <div className="about__workflow-step">
            <span className="about__workflow-step-num">Step 5</span>
            <span className="about__workflow-step-name">Evaluation</span>
          </div>
        </div>
      </section>

      {/* Section 6: Current Project Status */}
      <section className="about__section">
        <h2 className="about__section-title">
          <GitBranch size={20} />
          Implementation Status & Architecture
        </h2>

        <div className="about__status-card">
          <div className="about__status-notice">
            The machine learning models are currently in active research and development.
            This application's UI is connected to an isolated client-side mock service
            that implements the standard <code>PredictionService</code> interface, allowing
            seamless plug-and-play integration with a future Python backend (Flask/FastAPI).
          </div>

          <ul className="about__status-list">
            <li className="about__status-item about__status-item--done">
              <CheckCircle2 size={16} />
              <span>Modern Frontend UI & Observability Dashboard</span>
            </li>
            <li className="about__status-item about__status-item--done">
              <CheckCircle2 size={16} />
              <span>Decoupled Mock Prediction Service with Validation</span>
            </li>
            <li className="about__status-item about__status-item--planned">
              <Clock size={16} />
              <span>Dataset Gathering & Feature Engineering Pipeline (In Progress)</span>
            </li>
            <li className="about__status-item about__status-item--planned">
              <Clock size={16} />
              <span>Model Training & Evaluation (Linear Regression, Random Forest)</span>
            </li>
            <li className="about__status-item about__status-item--planned">
              <Clock size={16} />
              <span>FastAPI / Flask Microservice Integration</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
