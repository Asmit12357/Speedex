import { AlertTriangle } from 'lucide-react';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="header__left">
        <h1 className="header__title">Network Quality Predictor</h1>
        <span className="header__subtitle">
          Predict download speeds from network measurements
        </span>
      </div>

      <div className="header__right">
        <span className="demo-badge">
          <AlertTriangle size={12} />
          Demo Mode
        </span>
      </div>
    </header>
  );
}

export default Header;
