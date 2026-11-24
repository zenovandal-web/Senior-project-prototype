import React, { useState } from 'react'
import {
  HEROES_DATA,
  GOBLINS_DATA,
  MINIBOSSES_DATA,
  BOSSES_DATA,
  LOOT_CARDS,
  HEADER_SPELLS
} from '../game/gameData'

export default function RulebookView({ onSelectPlayMode }) {
  const [reviveTab, setReviveTab] = useState(0)
  const [monsterTab, setMonsterTab] = useState('goblins')
  const [itemTab, setItemTab] = useState('loot')

  const charactersList = Object.values(HEROES_DATA)

  return (
    <div className="rulebook-view-wrapper">
      {/* Hero Welcome */}
      <section className="section hero-section container" style={{ minHeight: 'auto', paddingBottom: '40px' }}>
        <div className="hero-content">
          <div className="hero-tag">// Senior Project — C-Code: The Compiler's Dungeon</div>
          <h1 className="hero-title">
            <span className="title-c">C</span>
            <span className="title-dash">-</span>
            <span className="title-code">Code</span>
            <br />
            <span className="title-sub">The Compiler's Dungeon Rulebook</span>
          </h1>
          <p className="hero-desc">
            คู่มือกฎกติกา ข้อมูลตัวละคร บั๊กมอนสเตอร์ บอสใหญ่ ไอเทม และเวทมนตร์ภาษา C ฉบับสมบูรณ์
          </p>
          <div className="hero-btns">
            <button className="btn btn-primary" onClick={onSelectPlayMode}>
              🎮 สลับไปที่โหมดเล่นเกม (Play Game)
            </button>
            <a href="#rules-content" className="btn btn-outline">
              📖 เลื่อนอ่านกฎกติกา
            </a>
          </div>
        </div>
      </section>

      {/* Rules Section */}
      <section id="rules-content" className="section rules-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title"><span className="code-comment">/*</span> กฎการเล่น (Rulebook) <span className="code-comment">*/</span></h2>
            <p className="section-sub">Turn Structure · Debugging Mechanics · Termination Conditions</p>
          </div>

          {/* Setup */}
          <div className="rules-block">
            <div className="rules-step-num">01</div>
            <div className="rules-step-content">
              <h3>การเตรียมการ <span className="en">(Setup)</span></h3>
              <ul className="rules-list">
                <li><span className="icon">🗺️</span><div><strong>สร้างแผนที่:</strong> วางไทล์คว่ำหน้าขนาด 7×7 โดยมี <code>Boot Sector</code> (ทางเข้า) อยู่ขอบ และ <code>CPU Core</code> (บอส) อยู่ตรงกลาง</div></li>
                <li><span className="icon">🧑‍💻</span><div><strong>เตรียมตัวละคร:</strong> เลือก Hero — Int Crusader, Pointer Assassin, Const Archmage, Recursive Ranger — รับ HP/Focus เริ่มต้น วางหมากที่ Boot Sector</div></li>
                <li><span className="icon">🃏</span><div><strong>กองการ์ด:</strong> แยกกอง Goblins (Bugs), Minions (Mini Boss), Loot, และ Header Files (Spells)</div></li>
                <li><span className="icon">🛡️</span><div><strong>Stack Overflow Limit:</strong> บั๊กล้นระบบได้ไม่เกิน <strong className="highlight">10 ตัว</strong></div></li>
              </ul>
            </div>
          </div>

          {/* Turn Structure */}
          <div className="rules-block">
            <div className="rules-step-num">02</div>
            <div className="rules-step-content">
              <h3>ลำดับการเล่น <span className="en">(Turn Structure)</span></h3>
              <div className="phase-cards">
                <div className="phase-card phase-action">
                  <div className="phase-num">Phase 1</div>
                  <div className="phase-name">Action Phase (เฟสลงมือ)</div>
                  <div className="phase-actions">
                    <div className="action-item"><code>MOVE</code> เดิน 1–2 ช่องตามค่าความเร็ว (Agility)</div>
                    <div className="action-item"><code>SEARCH</code> สำรวจห้องสมบัติเพื่อหา Loot / Spells</div>
                    <div className="action-item"><code>DEBUG</code> ต่อสู้/แก้โค้ด ตามเงื่อนไขของศัตรู</div>
                    <div className="action-item"><code>REST</code> จ่าย 1 Action เพื่อฟื้น 1 HP หรือ 1 Focus</div>
                  </div>
                  <div className="phase-note">ผู้เล่นมี 2 Actions ต่อเทิร์น (ทำซ้ำได้)</div>
                </div>

                <div className="phase-card phase-power">
                  <div className="phase-num">Phase 2</div>
                  <div className="phase-name">Power Phase (เฟสพลัง)</div>
                  <div className="phase-actions">
                    <div className="action-item"><code>#include</code> ร่าย Header Files โดยจ่าย Focus</div>
                    <div className="action-item"><code>EQUIP</code> สวมใส่หรือเปลี่ยนไอเทม Loot</div>
                  </div>
                  <div className="phase-note">ไม่เสีย Action เมื่อร่ายสเปลหรือเปลี่ยนไอเทม</div>
                </div>

                <div className="phase-card phase-compiler">
                  <div className="phase-num">Phase 3</div>
                  <div className="phase-name">System / Enemy Phase (เฟสศัตรู)</div>
                  <div className="phase-actions">
                    <div className="action-item">👾 Enemy Attack: ศัตรูในห้องจะโจมตีผู้เล่น</div>
                    <div className="action-item">🐛 Spawn Bug: เกิดบั๊กใหม่บนแผนที่ทุกๆ 2 รอบ</div>
                  </div>
                  <div className="phase-note">เกิดขึ้นหลังผู้เล่นทุกคนเล่นครบ (จบ 1 Round)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Debug Mechanics */}
          <div className="rules-block">
            <div className="rules-step-num">03</div>
            <div className="rules-step-content">
              <h3>กฎการแก้โค้ด <span className="en">(The Debugging Mechanics)</span></h3>
              <div className="debug-grid">
                <div className="debug-card expert">
                  <div className="debug-label">ตรงสาย (Expert)</div>
                  <div className="debug-cost">จ่าย 1 Focus</div>
                  <div className="debug-desc">แก้ไขจุดผิดได้ทันที 1 จุด (CP) สำเร็จ 100% พร้อมรับโบนัส Focus</div>
                </div>
                <div className="debug-card novice">
                  <div className="debug-label">ไม่ตรงสาย (Novice)</div>
                  <div className="debug-cost">Code Challenge</div>
                  <div className="debug-desc">แก้ไขโค้ดภาษา C ให้ถูกต้อง หากพิมพ์ผิดครบ 3 ครั้งจะเกิด System Crash</div>
                </div>
                <div className="debug-card shared">
                  <div className="debug-label">The Shared Memory (การช่วยเพื่อน)</div>
                  <div className="debug-cost">จ่าย 1 Focus</div>
                  <div className="debug-desc">หากอยู่ห้องติดกัน สามารถส่งไอเทมหรือช่วยให้คำใบ้แก่เพื่อนได้</div>
                </div>
              </div>
            </div>
          </div>

          {/* Boss Unlock */}
          <div className="rules-block">
            <div className="rules-step-num">04</div>
            <div className="rules-step-content">
              <h3>การเปิดห้องบอส <span className="en">(Unlocking the CPU Core)</span></h3>
              <div className="boss-unlock-steps">
                <div className="unlock-step"><span className="step-icon">🗡️</span><div>กำจัด Mini Boss ในห้อง Gateway เพื่อรับ <code>Permission Key</code></div></div>
                <div className="unlock-arrow">→</div>
                <div className="unlock-step"><span className="step-icon">🔑</span><div>รวบรวม Key ให้ครบตามจำนวนที่กำหนด</div></div>
                <div className="unlock-arrow">→</div>
                <div className="unlock-step"><span className="step-icon">🚪</span><div>ห้องบอสตรงกลางเปิดออก! บอสหลักตื่นขึ้นพร้อมเข้าสู่การต่อสู้ชี้ชะตา</div></div>
              </div>
            </div>
          </div>

          {/* Win/Lose */}
          <div className="rules-block">
            <div className="rules-step-num">05</div>
            <div className="rules-step-content">
              <h3>เงื่อนไขการแพ้-ชนะ <span className="en">(Termination Conditions)</span></h3>
              <div className="result-cards">
                <div className="result-card win">
                  <div className="result-icon">✅</div>
                  <div className="result-title"><code>return 0;</code> — ชัยชนะ</div>
                  <div className="result-desc">กำจัด Boss ใหญ่ได้สำเร็จ (ลด HP จนหมด + แก้โค้ด Checkpoint ครบทุกจุด)</div>
                </div>
                <div className="result-card lose">
                  <div className="result-icon">💥</div>
                  <div className="result-title"><code>Segmentation Fault</code> — ความพ่ายแพ้</div>
                  <ul className="result-list">
                    <li>System Crash: ผู้เล่นทุกคน HP หมด (เครื่องดับทุกคน)</li>
                    <li>Stack Overflow: ก๊อบลิน (Bugs) โผล่มาบนกระดานจนล้นเกิน 10 ตัว</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Recovery */}
          <div className="rules-block">
            <div className="rules-step-num">06</div>
            <div className="rules-step-content">
              <h3>การฟื้นคืนชีพ <span className="en">(How to Recover)</span></h3>
              <div className="revive-tabs">
                {['วิธีที่ 1: Hard Reset', 'วิธีที่ 2: Patch โดยเพื่อน', 'วิธีที่ 3: The Boot Sector'].map((t, idx) => (
                  <button
                    key={idx}
                    className={`revive-tab ${reviveTab === idx ? 'active' : ''}`}
                    onClick={() => setReviveTab(idx)}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="revive-panels">
                {reviveTab === 0 && (
                  <div className="revive-panel active">
                    <h4>🔄 วิธีที่ 1: การใช้คำสั่ง "Hard Reset" (ฟื้นด้วยตัวเอง)</h4>
                    <p><strong>เงื่อนไข:</strong> เสียทั้ง 2 Actions ในเทิร์นนั้น</p>
                    <p><strong>ผลลัพธ์:</strong> ฟื้นคืน HP กลับมาที่ ครึ่งหนึ่งของ Max HP และฟื้น Focus 2 หน่วย</p>
                    <p className="warn">⚠️ ตัวละครจะยังคงอยู่ที่เดิม หากห้องนั้นมีศัตรูอยู่อาจโดนโจมตีซ้ำได้</p>
                  </div>
                )}
                {reviveTab === 1 && (
                  <div className="revive-panel active">
                    <h4>🤝 วิธีที่ 2: ให้เพื่อนช่วย "Patch" (ฟื้นโดยเพื่อน)</h4>
                    <p><strong>เงื่อนไข:</strong> เพื่อนร่วมทีมเดินมาที่ห้องเดียวกันหรือห้องติดกัน ใช้ 1 Action และร่าย <code>#include &lt;stdlib.h&gt;</code></p>
                    <p><strong>ผลลัพธ์:</strong> ตัวละครที่ล้มอยู่จะฟื้น HP และเริ่มเล่นต่อได้ทันที</p>
                    <p className="tip">💡 หากเพื่อนมีไอเทม "Jumper Cable" จะชุบชีวิตได้โดยไม่ต้องใช้ Focus!</p>
                  </div>
                )}
                {reviveTab === 2 && (
                  <div className="revive-panel active">
                    <h4>🏠 วิธีที่ 3: กลับไปที่ "The Boot Sector" (ฟื้นที่จุดเริ่มต้น)</h4>
                    <p><strong>เงื่อนไข:</strong> ตัวละครกลับมาที่ห้องแรก (0x0000) ใช้ความสามารถของห้อง Boot Sector</p>
                    <p><strong>ผลลัพธ์:</strong> ใช้ 1 Action เพื่อ "Re-compile" จะฟื้น HP และ Focus เต็มจำนวนทันที!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Characters Showcase */}
      <section className="section characters-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title"><span className="code-comment">/*</span> ตัวละครทั้ง 4 สาย <span className="code-comment">*/</span></h2>
            <p className="section-sub">Character Sheets · Stats · Unique Skills · Trap Masteries</p>
          </div>
          <div className="char-grid">
            {charactersList.map(c => (
              <div key={c.id} className="char-card">
                <div className={`char-bg-pattern ${c.pattern}`} />
                <div className="char-type-badge">{c.sub}</div>
                <div className="char-avatar">{c.avatar}</div>
                <h3 className="char-name">{c.name}</h3>
                <div className="char-code"><code>{c.codeSignature}</code></div>
                
                <div className="char-stats">
                  <div className="stat-row">
                    <span className="stat-name">HP</span>
                    <div className="stat-bar"><div className="stat-fill hp" style={{ width: `${(c.maxHp / 10) * 100}%` }} /></div>
                    <span className="stat-val">{c.maxHp}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-name">Focus</span>
                    <div className="stat-bar"><div className="stat-fill focus" style={{ width: `${(c.maxFocus / 10) * 100}%` }} /></div>
                    <span className="stat-val">{c.maxFocus}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-name">Defense</span>
                    <div className="stat-bar"><div className="stat-fill def" style={{ width: `${(c.defense / 4) * 100}%` }} /></div>
                    <span className="stat-val">{c.defense}</span>
                  </div>
                </div>

                <div className="char-skill-box">
                  <div className="skill-label">{c.skillIcon} Skill: {c.skillName} ({c.skillCost} Focus)</div>
                  <p>{c.skillDesc}</p>
                </div>

                <div className="char-strength">
                  <span className="green-text">✅ ถนัด:</span> {c.expertTypes.join(', ')} (1 Focus)
                </div>
                <div className="char-weakness">
                  <span className="red-text">❌ จุดอ่อน:</span> {c.weaknessTypes.join(', ')}
                </div>
                <div className="char-weakness" style={{ marginTop: '4px', color: '#ffbd2e' }}>
                  <span>🛡️ สกิลแก้กับดัก:</span> {c.trapSpecial}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Monsters Encyclopedia */}
      <section className="section monsters-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title"><span className="code-comment">/*</span> สารานุกรมบั๊ก &amp; บอส <span className="code-comment">*/</span></h2>
            <p className="section-sub">10 Goblins · 8 Mini Bosses · 6 CPU Core Bosses</p>
          </div>

          <div className="monster-tabs">
            <button className={`monster-tab ${monsterTab === 'goblins' ? 'active' : ''}`} onClick={() => setMonsterTab('goblins')}>
              🐛 Goblins (10)
            </button>
            <button className={`monster-tab ${monsterTab === 'miniboss' ? 'active' : ''}`} onClick={() => setMonsterTab('miniboss')}>
              ⚔️ Mini Boss (8)
            </button>
            <button className={`monster-tab ${monsterTab === 'boss' ? 'active' : ''}`} onClick={() => setMonsterTab('boss')}>
              🐉 Big Boss (6)
            </button>
          </div>

          {monsterTab === 'goblins' && (
            <div className="monster-panel active">
              <div className="monster-grid">
                {GOBLINS_DATA.map(g => (
                  <div key={g.id} className="monster-card goblin">
                    <div className="monster-num">{g.num}</div>
                    <h4>{g.name}</h4>
                    <div className="monster-bug">{g.type}</div>
                    <div className="monster-code"><code>{g.code}</code></div>
                    <div className="monster-how"><strong>วิธีแก้:</strong> {g.howToDefeat}</div>
                    <div className="monster-penalty">💀 <strong>Penalty:</strong> {g.penalty}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {monsterTab === 'miniboss' && (
            <div className="monster-panel active">
              <div className="monster-grid">
                {MINIBOSSES_DATA.map(m => (
                  <div key={m.id} className="monster-card miniboss">
                    <div className="monster-num">{m.num}</div>
                    <h4>{m.name}</h4>
                    <div className="monster-bug">{m.type}</div>
                    <div className="monster-code"><code>{m.code}</code></div>
                    <div className="monster-how"><strong>สายตรง/คอมโบ:</strong> {m.expertDesc}</div>
                    <div className="monster-how"><strong>เฉลย:</strong> <code>{m.solution}</code></div>
                    <div className="monster-penalty">💀 <strong>Penalty:</strong> {m.penalty}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {monsterTab === 'boss' && (
            <div className="monster-panel active">
              <div className="boss-grid">
                {BOSSES_DATA.map(b => (
                  <div key={b.id} className="boss-card">
                    <div className="boss-header">
                      <div className="boss-num">{b.num}</div>
                      <div className="boss-stats">HP: {b.hp} | DP: {b.dpCount} จุด</div>
                    </div>
                    <h3 className="boss-name">{b.name}</h3>
                    <div className="boss-subtitle">{b.sub}</div>
                    <div className="boss-code-block">
                      <div className="boss-code-label">โจทย์โค้ด:</div>
                      <pre><code>{b.code}</code></pre>
                    </div>
                    <div className="boss-attack">⚔️ <strong>การโจมตี:</strong> {b.attack}</div>
                    <div className="boss-steps">
                      {b.dpSteps.map(s => (
                        <div key={s.step} className="boss-step">
                          <span className="step-badge">จุดที่ {s.step}</span>
                          <span>{s.desc}</span>
                        </div>
                      ))}
                    </div>
                    <div className="boss-event">💥 <strong>{b.event}</strong></div>
                    <div className="boss-solution">
                      <pre><code>{b.solution}</code></pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Items & Spells */}
      <section className="section items-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title"><span className="code-comment">/*</span> ไอเทม &amp; สเปล <span className="code-comment">*/</span></h2>
            <p className="section-sub">20 Loot Cards · 10 Header File Spells</p>
          </div>

          <div className="items-tabs">
            <button className={`items-tab ${itemTab === 'loot' ? 'active' : ''}`} onClick={() => setItemTab('loot')}>
              📦 Loot Cards (20)
            </button>
            <button className={`items-tab ${itemTab === 'spells' ? 'active' : ''}`} onClick={() => setItemTab('spells')}>
              ✨ Header Spells (10)
            </button>
          </div>

          {itemTab === 'loot' && (
            <div className="items-panel active">
              <div className="items-grid">
                {LOOT_CARDS.map(item => (
                  <div key={item.id} className={`item-card ${item.consumable ? 'consumable' : ''}`}>
                    <div className="item-icon">{item.icon}</div>
                    <h4>{item.name}</h4>
                    <p>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {itemTab === 'spells' && (
            <div className="items-panel active">
              <div className="items-grid">
                {HEADER_SPELLS.map(spell => (
                  <div key={spell.id} className="item-card spell-card">
                    <div className="item-icon">{spell.icon}</div>
                    <h4><code>{spell.name}</code></h4>
                    <div className="spell-cost">{spell.cost} Focus · {spell.title}</div>
                    <p>{spell.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
