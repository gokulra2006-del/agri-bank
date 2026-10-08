import React from 'react';
import { AlertTriangle, RotateCcw, RefreshCw } from 'lucide-react';
import { resetDemoData } from '../data/mockStore';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('AgriSahay Uncaught Boundary Error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    resetDemoData();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8fafc',
            padding: '2rem'
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '32rem',
              width: '100%',
              padding: '2rem',
              textAlign: 'center',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
            }}
            role="alert"
          >
            <div
              style={{
                width: '3.5rem',
                height: '3.5rem',
                borderRadius: '50%',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}
            >
              <AlertTriangle size={32} />
            </div>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
              System Recoverable Notice
            </h2>

            <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              AgriSahay encountered an unexpected state. Your local changes are safeguarded in your browser session.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={this.handleReload}>
                <RefreshCw size={15} />
                Reload Page
              </button>
              <button className="btn btn-secondary" onClick={this.handleReset}>
                <RotateCcw size={15} />
                Reset Demo Data
              </button>
            </div>

            {this.state.error && (
              <details style={{ marginTop: '1.5rem', textAlign: 'left', fontSize: '0.75rem', color: '#94a3b8' }}>
                <summary style={{ cursor: 'pointer', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Technical Diagnostic Details
                </summary>
                <pre
                  style={{
                    backgroundColor: '#f1f5f9',
                    padding: '0.75rem',
                    borderRadius: '0.375rem',
                    overflowX: 'auto',
                    color: '#334155'
                  }}
                >
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
