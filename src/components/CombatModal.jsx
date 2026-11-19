import React, { useState, useRef, useEffect } from 'react'

export default function CombatModal({ activeCombat, player, onDebug }) {
  const [userCode, setUserCode] = useState('')
  const [result, setResult] = useState(null) // null | 'correct' | 'wrong'
  const [shake, setShake] = useState(false)
  const [hintVisible, setHintVisible] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const textareaRef = useRef(null)

  // Reset state when enemy changes
  useEffect(() => {
    setUserCode('')
    setResult(null)
    setShake(false)
    setHintVisible(false)
    setAttempts(0)
    setTimeout(() => textareaRef.current?.focus(), 100)
  }, [activeCombat?.enemy?.id])

  if (!activeCombat) return null
  const { enemy, type } = activeCombat

  // Normalize code for comparison (strip comments & whitespace)
  function normalize(str) {
    return str
      .replace(/\/\/.*/g, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase()
  }

  function checkAnswer() {
    const solution = enemy.solution || ''
    const userNorm = normalize(userCode)
    const solNorm = normalize(solution)

    // Extract key tokens from solution (skip short keywords)
    const skipWords = new Set(['int','char','void','return','if','for','while','else','do','struct','typedef','include','define','null','new','true','false','the','a'])
    const keyTokens = solNorm
      .split(/[\s;,(){}[\]<>*&=!+\-/%#"'\\]+/)
      .filter(t => t.length > 1 && !skipWords.has(t))

    if (keyTokens.length === 0) return userNorm.length >= 3

    const matchCount = keyTokens.filter(token => userNorm.includes(token)).length
    const matchRatio = matchCount / keyTokens.length

    // Need 60%+ match of key tokens
    return matchRatio >= 0.6 && userNorm.length >= Math.max(3, solNorm.length * 0.25)
  }

  function handleSubmit() {
    if (!userCode.trim() || result === 'correct') return
    const correct = checkAnswer()
    setAttempts(a => a + 1)

    if (correct) {
      setResult('correct')
      setTimeout(() => onDebug('code_correct'), 1200)
    } else {
      setResult('wrong')
      setShake(true)
      setTimeout(() => { setShake(false); setResult(null) }, 900)
      setTimeout(() => onDebug('code_wrong'), 950)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Tab') {
      e.preventDefault()
      const start = e.target.selectionStart
      const end = e.target.selectionEnd
      const newVal = userCode.substring(0, start) + '    ' + userCode.substring(end)
      setUserCode(newVal)
      setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = start + 4 }, 0)
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit()
    }
  }

  const isExpert = Array.isArray(enemy.expertHero)
    ? enemy.expertHero.includes(player.id)
    : enemy.expertHero === player.id

  const badgeLabel =
    type === 'boss' ? '👑 BOSS BATTLE' :
    type === 'miniboss' ? '⚔️ RUNTIME WARDEN' : '🐛 BUG ENCOUNTER'

  return (
    <div className="combat-modal-overlay">
      <div className={`combat-modal code-challenge-modal ${shake ? 'shake-modal' : ''}`}>

        {/* Header */}
        <div className="combat-modal-header">
          <div className="combat-badge-type">{badgeLabel}</div>
          <h2 className="combat-enemy-title">{enemy.name}</h2>
          <div className="combat-enemy-sub">{enemy.type || enemy.sub}</div>
          {isExpert && (
            <div className="expert-badge">⭐ {player.name} เป็น Expert สายตรง — ได้คะแนนพิเศษ!</div>
          )}
        </div>

        {/* Two-column layout */}
        <div className="code-challenge-columns">

          {/* LEFT — broken code + instructions */}
          <div className="code-challenge-left">
            <div className="code-challenge-label">🔴 โค้ดที่พัง (Broken Code)</div>
            <div className="combat-code-container">
              <div className="code-header">
                <span className="dot red" /><span className="dot yellow" /><span className="dot green" />
                <span className="code-title">broken_code.c</span>
              </div>
              <pre className="combat-code-pre"><code>{enemy.code}</code></pre>
            </div>

            <div className="combat-details-box" style={{ marginTop: '8px' }}>
              <div className="combat-guide">
                <strong>🎯 วิธีแก้ไข:</strong><br />
                {enemy.howToDefeat || 'แก้ไขโค้ดให้ถูกต้องแล้วกด Submit'}
              </div>
              {enemy.penalty && (
                <div className="combat-penalty-warning" style={{ marginTop: '8px' }}>
                  💀 <strong>บทลงโทษถ้าผิด:</strong> {enemy.penalty}
                </div>
              )}
            </div>

            <button
              className="btn-hint-toggle"
              onClick={() => setHintVisible(v => !v)}
            >
              {hintVisible ? '🙈 ซ่อน Hint' : `💡 ดู Hint${attempts < 2 ? ` (ลองแก้ ${attempts} ครั้งแล้ว)` : ' (พิมพ์ผิดหลายครั้งแล้ว)'}`}
            </button>

            {hintVisible && (
              <div className="hint-box">
                <div className="hint-label">📌 เฉลย (Solution):</div>
                <pre className="hint-code">{enemy.solution}</pre>
                <div className="hint-warning">ℹ️ การดู Hint ไม่มีบทลงโทษ</div>
              </div>
            )}
          </div>

          {/* RIGHT — code editor */}
          <div className="code-challenge-right">
            <div className="code-challenge-label">🟢 พิมพ์โค้ดแก้ไขที่นี่ (fix.c)</div>

            <div className={`code-editor-wrapper ${result === 'correct' ? 'editor-correct' : result === 'wrong' ? 'editor-wrong' : ''}`}>
              <div className="code-editor-topbar">
                <span className="dot red" /><span className="dot yellow" /><span className="dot green" />
                <span className="code-title">fix.c &nbsp;·&nbsp; Ctrl+Enter = Submit</span>
              </div>
              <div className="line-numbers-wrapper">
                <div className="line-numbers">
                  {(userCode || ' ').split('\n').map((_, i) => (
                    <div key={i} className="line-num">{i + 1}</div>
                  ))}
                </div>
                <textarea
                  ref={textareaRef}
                  className="code-textarea"
                  value={userCode}
                  onChange={e => { setUserCode(e.target.value); setResult(null) }}
                  onKeyDown={handleKeyDown}
                  placeholder={'// พิมพ์โค้ดที่แก้ไขแล้วที่นี่\n// Tab = เว้นวรรค · Ctrl+Enter = Submit'}
                  spellCheck={false}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  rows={9}
                />
              </div>
            </div>

            {result === 'correct' && (
              <div className="result-banner result-correct">
                ✅ Compile Successful! โค้ดถูกต้อง — กำลังเอาชนะ {enemy.name}...
              </div>
            )}
            {result === 'wrong' && (
              <div className="result-banner result-wrong">
                ❌ Compile Error! โค้ดผิดพลาด — โดนบทลงโทษ!
              </div>
            )}

            <div className="attempts-tracker">
              พยายามแล้ว: <span className={attempts >= 3 ? 'red-text' : 'yellow-text'}>{attempts} ครั้ง</span>
              {attempts >= 2 && <span style={{ marginLeft: '8px', color: 'var(--accent-cyan)' }}>← กด Hint ได้เลย!</span>}
            </div>

            <button
              className="btn btn-submit-code"
              onClick={handleSubmit}
              disabled={!userCode.trim() || result === 'correct'}
            >
              <span>⚡</span>
              <div>
                <strong>gcc fix.c &amp;&amp; ./fix</strong>
                <div className="btn-subtext">กด Submit เพื่อ Compile โค้ด · Ctrl+Enter</div>
              </div>
            </button>
          </div>
        </div>

        {/* Bottom stats bar */}
        <div className="combat-stats-bar">
          <span>❤️ HP: {player.hp}/{player.maxHp}</span>
          <span>🔵 Focus: {player.focus}/{player.maxFocus}</span>
          <span>⚡ Actions: {player.actionsLeft}</span>
          {type === 'miniboss' && <span style={{ color: 'var(--accent-cyan)' }}>🔑 แก้ถูกจะได้ Permission Key!</span>}
          {type === 'boss' && <span style={{ color: 'var(--accent-yellow)' }}>👑 แก้ถูก = ชนะเกม!</span>}
        </div>
      </div>
    </div>
  )
}
