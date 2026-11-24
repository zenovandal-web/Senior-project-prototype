import React, { useRef, useEffect } from 'react'

export default function EventTerminal({ logs, bugCount, maxBugs, keys, keysRequired, onNewGame }) {
  const terminalRef = useRef(null)

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = 0
    }
  }, [logs])

  return (
    <div className="event-terminal-container">
      {/* Status Bar */}
      <div className="terminal-status-header">
        <div className="gauge-item">
          <span className="gauge-label">🐛 STACK OVERFLOW GAUGE</span>
          <span className="gauge-value">{bugCount} / {maxBugs} Bugs</span>
        </div>

        <div className="gauge-item">
          <span className="gauge-label">🔑 PERMISSION KEYS</span>
          <span className="gauge-value">{keys} / {keysRequired}</span>
        </div>

        <button className="btn btn-reset-small" onClick={onNewGame} title="เริ่มเกมใหม่">
          🔄 New Game
        </button>
      </div>

      {/* Terminal Output */}
      <div className="terminal-log-output" ref={terminalRef}>
        {logs.map((log, index) => {
          let lineClass = 'log-line'
          if (log.includes('CRASH') || log.includes('GAME OVER') || log.includes('💀')) lineClass += ' log-danger'
          else if (log.includes('VICTORY') || log.includes('✅') || log.includes('🎉')) lineClass += ' log-success'
          else if (log.includes('🚨') || log.includes('⚠️')) lineClass += ' log-warn'
          else if (log.includes('✨') || log.includes('🎁')) lineClass += ' log-loot'

          return (
            <div key={index} className={lineClass}>
              {log}
            </div>
          )
        })}
      </div>
    </div>
  )
}
