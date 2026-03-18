import React from 'react';
import './Home.css';

export default function Home() {
  return (
    <div className="home-container">
      <div className="home-content">
        <div className="logo">📹</div>
        <h1>Bonse Hub Connect</h1>
        <p className="subtitle">Video Consultation Platform</p>

        <div className="status-grid">
          <div className="status-item">
            <div className="status-icon ready">✓</div>
            <span>Jitsi React SDK Integration</span>
          </div>
          <div className="status-item">
            <div className="status-icon ready">✓</div>
            <span>JWT Token Authentication</span>
          </div>
          <div className="status-item">
            <div className="status-icon ready">✓</div>
            <span>Real-time Video Consultations</span>
          </div>
          <div className="status-item">
            <div className="status-icon ready">✓</div>
            <span>Session Tracking Enabled</span>
          </div>
        </div>

        <div className="info-box">
          <strong>Welcome to Bonse Hub Connect</strong>
          <p>
            This platform powers secure video consultations between healthcare
            providers and patients. Users are automatically redirected from the
            mobile app to begin their consultation.
          </p>
        </div>

        <div className="features">
          <div className="feature">
            <div className="feature-icon">🔒</div>
            <h3>Secure</h3>
            <p>JWT-authenticated video calls</p>
          </div>
          <div className="feature">
            <div className="feature-icon">⚡</div>
            <h3>Fast</h3>
            <p>Low-latency video streaming</p>
          </div>
          <div className="feature">
            <div className="feature-icon">📱</div>
            <h3>Mobile Ready</h3>
            <p>Works on all devices</p>
          </div>
          <div className="feature">
            <div className="feature-icon">📊</div>
            <h3>Tracked</h3>
            <p>Full session analytics</p>
          </div>
        </div>

        <div className="tech-stack">
          <h3>Built With</h3>
          <div className="tech-badges">
            <span className="badge">React 18</span>
            <span className="badge">Jitsi React SDK</span>
            <span className="badge">JWT Auth</span>
            <span className="badge">Vite</span>
          </div>
        </div>
      </div>
    </div>
  );
}
