import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Game Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#0a0d14',
          color: '#ff3366',
          fontFamily: 'monospace',
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          position: 'relative'
        }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '20px' }}>⚠️ System Crash / Runtime Error</h1>
          <pre style={{
            background: 'rgba(255,51,102,0.1)',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #ff3366',
            maxWidth: '800px',
            overflow: 'auto',
            color: '#fff'
          }}>
            {this.state.error?.toString()}
          </pre>
          <button
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            style={{
              marginTop: '20px',
              padding: '10px 24px',
              background: '#00ff88',
              color: '#0a0d14',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Hard Reset / Reboot
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

const rootEl = document.getElementById('root')
if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  )
} else {
  console.error('Element #root not found!')
}
