import React, { useState, useRef, useEffect } from 'react'

// Trap code challenges: broken code + solution for each trap type
const TRAP_CHALLENGES = {
  infinite_loop: {
    brokenCode: 'while(1) {\n    // ติดอยู่ในลูปนี้ตลอดไป...\n    process();\n    // ขาด break condition!\n}',
    task: 'เพิ่ม break condition เพื่อหลุดออกจาก Infinite Loop',
    solution: 'while(1) {\n    process();\n    if(done) break;\n}',
    keyTokens: ['break', 'if'],
    placeholder: '// เพิ่ม break; หรือเงื่อนไข if(done) break; เพื่อหลุดออก',
  },
  logic_bomb: {
    brokenCode: 'if (x = 0) {\n    // Logic Bomb!\n    explode();\n}',
    task: 'แก้เครื่องหมาย = (Assign) ให้เป็น == (Comparison) เพื่อหยุด Logic Bomb',
    solution: 'if (x == 0) {\n    explode();\n}',
    keyTokens: ['=='],
    placeholder: '// แก้ x = 0 ให้กลายเป็น x == 0',
  },
  voltage_spike: {
    brokenCode: 'int volt = readSensor();\n// ไม่มีการตรวจสอบค่าก่อนใช้\nrunSystem(volt);',
    task: 'เพิ่มการตรวจสอบค่า voltage ก่อน runSystem() เพื่อกัน Voltage Spike',
    solution: 'int volt = readSensor();\nif(volt >= 0 && volt <= MAX_VOLT) {\n    runSystem(volt);\n}',
    keyTokens: ['if', 'runsystem'],
    placeholder: '// เพิ่ม if(volt >= 0 && volt <= MAX_VOLT) ก่อน runSystem(volt)',
  },
}

export default function TrapModal({ activeTrap, player, onResolveTrap }) {
  const [userCode, setUserCode] = useState('')
  const [result, setResult] = useState(null) // null | 'correct' | 'wrong'
  const [shake, setShake] = useState(false)
  const [hintVisible, setHintVisible] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const textareaRef = useRef(null)

  useEffect(() => {
    setUserCode('')
    setResult(null)
    setShake(false)
    setHintVisible(false)
    setAttempts(0)
    setTimeout(() => textareaRef.current?.focus(), 100)
  }, [activeTrap?.trap?.id])

  if (!activeTrap) return null
  const { trap } = activeTrap
  const challenge = TRAP_CHALLENGES[trap.id] || {
    brokenCode: '// โค้ดที่พัง',
    task: 'แก้ไขโค้ดให้ถูกต้อง',
    solution: '// fixed',
    keyTokens: [],
    placeholder: '// พิมพ์โค้ดที่แก้ไขแล้ว',
  }

  const isExpert = player.id === trap.favored
  const isSemi = Array.isArray(trap.semiFavored) ? trap.semiFavored.includes(player.id) : trap.semiFavored === player.id

  function normalize(str) {
    return str
      .replace(/\/\/.*/g, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase()
  }

  function checkAnswer() {
    const userNorm = normalize(userCode)
    const { keyTokens } = challenge
    if (!keyTokens.length) return userNorm.length >= 3
    const matched = keyTokens.filter(t => userNorm.includes(t.toLowerCase()))
    return matched.length >= Math.ceil(keyTokens.length * 0.6)
  }

  function handleSubmit() {
    if (!userCode.trim() || result === 'correct') return
    const correct = checkAnswer()
    setAttempts(a => a + 1)

    if (correct) {
      setResult('correct')
      setTimeout(() => onResolveTrap('code_correct'), 1200)
    } else {
      setResult('wrong')
      setShake(true)
      setTimeout(() => { setShake(false); setResult(null) }, 900)
      setTimeout(() => onResolveTrap('code_wrong'), 950)
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
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="combat-modal-overlay">
      <div className={`combat-modal code-challenge-modal ${shake ? 'shake-modal' : ''}`}>

        <div className="combat-modal-header">
          <div className="combat-badge-type trap-badge">🚨 TRAP TRIGGERED</div>
          <h2 className="combat-enemy-title">{trap.name}</h2>
          <div className="combat-enemy-sub">{trap.stat} Check — แก้ไขโค้ดเพื่อหลุดจากกับดัก!</div>
          <div className="expert-badge" style={{ color: isExpert ? 'var(--accent-green)' : isSemi ? 'var(--accent-yellow)' : 'var(--text-muted)' }}>
            {isExpert ? '⭐ คุณเป็น Expert สายตรง — ได้คะแนนพิเศษ!' :
             isSemi ? '⚡ กึ่งสายตรง — มีความได้เปรียบ' :
             '⚠️ ไม่ตรงสาย — ต้องพยายามมากขึ้น'}
          </div>
        </div>

        <div className="code-challenge-columns">

          {/* LEFT — broken trap code */}
          <div className="code-challenge-left">
            <div className="code-challenge-label">🔴 โค้ดที่ทำให้ติดกับดัก</div>
            <div className="combat-code-container">
              <div className="code-header">
                <span className="dot red" /><span className="dot yellow" /><span className="dot green" />
                <span className="code-title">trap.c</span>
              </div>
              <pre className="combat-code-pre"><code>{challenge.brokenCode}</code></pre>
            </div>

            <div className="combat-details-box" style={{ marginTop: '8px' }}>
              <div className="combat-guide">
                <strong>🎯 วิธีหลุดกับดัก:</strong><br />
                {challenge.task}
              </div>
              <div className="combat-penalty-warning" style={{ marginTop: '8px' }}>
                💀 <strong>บทลงโทษถ้าผิด:</strong> {trap.desc}
              </div>
            </div>

            <button className="btn-hint-toggle" onClick={() => setHintVisible(v => !v)}>
              {hintVisible ? '🙈 ซ่อน Hint' : `💡 ดู Hint${attempts < 2 ? ` (ลองแก้ ${attempts} ครั้งแล้ว)` : ''}`}
            </button>
            {hintVisible && (
              <div className="hint-box">
                <div className="hint-label">📌 เฉลย (Solution):</div>
                <pre className="hint-code">{challenge.solution}</pre>
                <div className="hint-warning">ℹ️ การดู Hint ไม่มีบทลงโทษ</div>
              </div>
            )}
          </div>

          {/* RIGHT — editor */}
          <div className="code-challenge-right">
            <div className="code-challenge-label">🟢 พิมพ์โค้ดแก้ไขที่นี่ (fix_trap.c)</div>
            <div className={`code-editor-wrapper ${result === 'correct' ? 'editor-correct' : result === 'wrong' ? 'editor-wrong' : ''}`}>
              <div className="code-editor-topbar">
                <span className="dot red" /><span className="dot yellow" /><span className="dot green" />
                <span className="code-title">fix_trap.c · Ctrl+Enter = Submit</span>
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
                  placeholder={challenge.placeholder}
                  spellCheck={false}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  rows={9}
                />
              </div>
            </div>

            {result === 'correct' && (
              <div className="result-banner result-correct">✅ แก้ไขสำเร็จ! หลุดออกจากกับดักแล้ว!</div>
            )}
            {result === 'wrong' && (
              <div className="result-banner result-wrong">❌ โค้ดยังผิดอยู่ — โดนบทลงโทษ!</div>
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
                <strong>gcc fix_trap.c &amp;&amp; ./fix</strong>
                <div className="btn-subtext">Submit โค้ดแก้กับดัก · Ctrl+Enter</div>
              </div>
            </button>
          </div>
        </div>

        <div className="combat-stats-bar">
          <span>❤️ HP: {player.hp}/{player.maxHp}</span>
          <span>🔵 Focus: {player.focus}/{player.maxFocus}</span>
          <span>⚡ Actions: {player.actionsLeft}</span>
          <span style={{ color: 'var(--accent-yellow)' }}>🚨 แก้ถูก = ผ่านกับดักโดยไม่เสียอะไร!</span>
        </div>
      </div>
    </div>
  )
}
